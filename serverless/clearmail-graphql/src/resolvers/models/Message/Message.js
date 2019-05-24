const { sendEmail } = require('../../email')
const { ValidationError } = require('apollo-server-lambda')
const client = require('postgres-tools')

const send = async (parent, { input }, context) => {
  let { MessageId } = await sendEmail(input)
    .catch(err => {
      throw err
    })
  const destination = JSON.stringify(
    input.destination.map(emailAddress => ({ emailAddress }))
  )
  const source = JSON.stringify(
    input.source.map(emailAddress => ({ emailAddress }))
  )
  const messageId = `<${MessageId}@email.amazonses.com>`
  const recipients = input.destination.map(emailAddress => `('${emailAddress}', '${context.user}')`).join(', ')
  const inClause = input.destination.map(c => `'${c}'`).join(',')

  let thread = input.thread ? `'${input.thread}'` : 'NULL'
  const query = `
    WITH new_addresses AS (
      INSERT INTO addresses (email_address, user_id) VALUES ${recipients} ON CONFLICT (email_address) DO NOTHING RETURNING *
    ),
    insert_message AS (
      INSERT into messages (
        user_id,
        subject,
        text,
        html,
        snippet,
        message_id,
        labels,
        thread_id,
        source,
        destination
      )
      SELECT
        '${context.user}',
        '${input.subject}',
        '${input.text}',
        '${input.html}',
        '${input.snippet}',
        '${messageId}',
        '{SENT}'::label[],
        ${thread},
        '${source}'::jsonb,
        '${destination}'::jsonb
      RETURNING *
    )
    SELECT
      insert_message.*
    FROM
      insert_message
  `
  console.log(query)
  const data = await client.query(query, { head: true })
  const { userId, threadId, ...rest } = data

  return {
    user: userId,
    thread: threadId,
    messageId,
    ...rest
  }
}

module.exports.send = send
