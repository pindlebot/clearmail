const fetch = require('node-fetch')
const parse = require('./util/parse-mail')
const handleAttachmentsIfNeeded = require('./util/handle-attachments')
const extractURLFromMessage = require('./util/extract-url')
// const command = require('./command')
const REGEX = /[\w\s,:<>\.@]+wrote:/g
const client = require('postgres-tools')

const handleMessage = async (message) => {
  const { receipt: { action: { objectKey } } } = message
  console.log(JSON.stringify(message))
  const decoded = await parse(objectKey)
  console.log(JSON.stringify(decoded))
  let lines = (decoded.text || decoded.html).split(/\r?\n/g)
  let snippet = null
  let index = 0
  let parts = []
  while (index < lines.length) {
    let line = lines[index]
    parts.push(line)
    if (REGEX.test(line)) {
      snippet = parts.join('\n')
      break
    }
    index++
  }

  if (decoded.from.value[0].address === 'no-reply-aws@amazon.com') {
    let url = extractURLFromMessage(decoded)
    if (url) {
      await fetch(url).then(resp => resp.text())
    }
  }

  let user
  try {
    // user = await client.query(`
    //  SELECT
    //    users.*,
    //    (
    //      SELECT messages.thread_id
    //      FROM messages
    //      WHERE messages.user_id = users.id
    //      AND messages.subject ILIKE '%${decoded.subject}%'
    //      AND messages.source @> '[{ "emailAddress": "${decoded.from.value[0].address}" }]'
    //    )
    //  FROM users
    //  WHERE email_address = '${decoded.to.value[0].address}'
    // `, {
    //  head: true
    // })
    user = await client.query(`
      SELECT 
        users.*,
        (
          SELECT messages.thread_id
          FROM messages
          WHERE messages.user_id = users.id
          AND messages.message_id = '${decoded.inReplyTo}'
        ) thread
      FROM users
      WHERE email_address = '${decoded.to.value[0].address}'
    `, { head: true })
  } catch (err) {
    console.error(err)
  }

  console.log(user)
  if (user && user.id) {
    let destination = JSON.stringify(
      decoded.to.value.map(({ address }) => ({ emailAddress: address }))
    )
    let source = JSON.stringify(
      decoded.from.value.map(({ address }) => ({ emailAddress: address }))
    )
    let thread = `'${user.thread}'` || 'NULL'
    let data = await client.query(`
      INSERT into messages (
        user_id,
        subject,
        text,
        html,
        snippet,
        message_id,
        thread_id,
        labels,
        destination,
        source
      )
      VALUES(
        '${user.id}',
        '${decoded.subject}',
        '${decoded.text}',
        '${Buffer.from(decoded.html).toString('base64')}',
        '${snippet}',
        '${decoded.messageId}',
        ${thread},
        '{INBOX}'::label[],
        '${destination}'::jsonb,
        '${source}'::jsonb
      )
      RETURNING *
    `, { head: true })

    let attachments = await handleAttachmentsIfNeeded(decoded.attachments, {
      userId: user.id,
      messageId: data.id
    })
    console.log(attachments)
  }
}

module.exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { Records } = event
  await Promise.all(
    Records.map(
      ({ Sns: { Message } }) => handleMessage(JSON.parse(Message))
    )
  )

  await client.checkout().then(x => x.release())
  callback(null, {})
}
