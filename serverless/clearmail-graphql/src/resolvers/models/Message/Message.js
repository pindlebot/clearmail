const { sendEmail } = require('../../email')
const { ValidationError } = require('apollo-server-lambda')
const client = require('postgres-tools')

const send = async (parent, { input }, context) => {
  let { MessageId } = await sendEmail(input)
    .catch(err => {
      throw err
    })
  const from = JSON.stringify(
    input.from.map(emailAddress => ({ emailAddress }))
  )
  const messageId = `<${MessageId}@email.amazonses.com>`
  const recipients = input.to.map(emailAddress => `('${emailAddress}', '${context.user}')`).join(', ')
  const inClause = input.to.map(c => `'${c}'`).join(',')

  let thread = input.thread ? `'${input.thread}'` : 'NULL'
  const query = `
    WITH old_addresses AS (
      SELECT * FROM addresses WHERE email_address IN (${inClause})
    ),
    new_addresses AS (
      INSERT INTO addresses (email_address, user_id) SELECT ${recipients} ON CONFLICT (email_address) DO NOTHING RETURNING *
    ),
    merged_addresses AS (
      SELECT x.* FROM old_addresses x UNION SELECT y.* FROM new_addresses y
    ),
    insert_message AS (
      INSERT into messages (
        user_id,
        subject,
        text,
        html,
        snippet,
        message_id,
        labels
      )
      SELECT
        '${context.user}',
        '${input.subject}',
        '${input.text}',
        '${input.html}',
        '${input.snippet}',
        '${messageId}',
        '{SENT}'::label[]
      RETURNING *
    ),
    insert_messages_addresses AS (
      INSERT INTO
        messages_addresses(address_id, message_id, address_type)
      SELECT
        (SELECT id from merged_addresses),
        (SELECT id from insert_message),
        'TO'::address_type
      RETURNING *
    )
    SELECT
      insert_message.*,
      ARRAY(
        SELECT
          json_build_object(
            'emailAddress', merged_addresses.email_address,
            'id', merged_addresses.id,
            'name', merged_addresses.name,
            'user', merged_addresses.user_id
          )
      ) as to
    FROM
      insert_message,
      merged_addresses
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
