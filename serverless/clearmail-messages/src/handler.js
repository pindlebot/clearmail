const fetch = require('node-fetch')
const parse = require('./util/parse-mail')
const handleAttachmentsIfNeeded = require('./util/handle-attachments')
const extractURLFromMessage = require('./util/extract-url')
const REGEX = /[\w\s,:<>\.@]+wrote:/g
const client = require('postgres-tools')
const { SES_VERIFICATION_SENDER } = require('./fixtures')

const extractSnippet = (decoded) => {
  const lines = (decoded.text || decoded.html).split(/\r?\n/g)
  let snippet = null
  let index = 0
  const parts = []
  while (index < lines.length) {
    let line = lines[index]
    parts.push(line)
    if (REGEX.test(line)) {
      snippet = parts.join('\n')
      break
    }
    index++
  }
  return snippet
}

const verifyIfNeeded = async (decoded) => {
  if (decoded.from.value[0].address === SES_VERIFICATION_SENDER) {
    let url = extractURLFromMessage(decoded)
    if (url) {
      await fetch(url).then(resp => resp.text())
    }
  }
}

const getUser = async (decoded) => {
  let user
  try {
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
  return user
}

const insertMessage = (user, snippet, decoded) => {
  const destination = JSON.stringify(
    decoded.to.value.map(({ address }) => ({ emailAddress: address }))
  )
  const source = JSON.stringify(
    decoded.from.value.map(({ address }) => ({ emailAddress: address }))
  )
  const thread = user.threaad ? `'${user.thread}'` : 'NULL'
  // const query = `
  //   INSERT into messages (
  //     user_id,
  //     subject,
  //     text,
  //     html,
  //     snippet,
  //     message_id,
  //     thread_id,
  //     labels,
  //     destination,
  //     source
  //   )
  //   VALUES(
  //     '${user.id}',
  //     '${decoded.subject}',
  //     '${decoded.text}',
  //     '${Buffer.from(decoded.html).toString('base64')}',
  //     '${snippet}',
  //     '${decoded.messageId}',
  //     ${thread},
  //     '{INBOX}'::label[],
  //     '${destination}'::jsonb,
  //     '${source}'::jsonb
  //   )
  //   RETURNING *
  // `
  const recipients = decoded.from.value.map(c => `('${c.address}', '${user.id}')`).join(', ')
  const inClause = decoded.from.value.map(c => `'${c.address}'`).join(',')
  const query = `
    WITH old_recipients AS (
      SELECT * FROM addresses WHERE email_address IN (${inClause})
    ),
    new_recipients AS (
      INSERT INTO addresses (email_address, user_id) VALUES ${recipients} ON CONFLICT (email_address) DO NOTHING RETURNING *
    ),
    merged_recipients AS (
      SELECT x.* FROM old_recipients x UNION SELECT y.* FROM new_recipients y
    ),
    insert_message AS (
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
      SELECT
        '${user.id}',
        '${decoded.subject}',
        '${decoded.text}',
        '${Buffer.from(decoded.html).toString('base64')}',
        '${snippet}',
        '${decoded.messageId}',
        ${thread},
        '{INBOX}'::label[]
      RETURNING *
    ),
    insert_messages_recipients AS (
      INSERT INTO
        messages_recipients(recipient_id, message_id)
      SELECT
        (SELECT id from merged_recipients),
        (SELECT id from insert_message)
      RETURNING *
    )
    SELECT
      insert_message.*,
      ARRAY(
        SELECT
          json_build_object(
            'emailAddress', merged_recipients.email_address,
            'id', merged_recipients.id,
            'name', merged_recipients.name
          )
      ) as recipients
    FROM
      insert_message,
      merged_recipients
  `
  console.log(query)
  return client.query(query, { head: true })
}

const handleMessage = async (message) => {
  const { receipt: { action: { objectKey } } } = message
  const decoded = await parse(objectKey)
  const snippet = extractSnippet(decoded)
  await verifyIfNeeded(decoded)

  const user = await getUser(decoded)

  if (user && user.id) {
    const data = await insertMessage(user, snippet, decoded)

    const attachments = await handleAttachmentsIfNeeded(decoded.attachments, {
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
