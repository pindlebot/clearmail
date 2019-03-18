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

  let thread = input.thread ? `'${input.thread}'` : 'NULL'
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
      '${context.user}',
      '${input.subject}',
      '${input.text}',
      '${input.html}',
      '${input.snippet}',
      '${messageId}',
      ${thread},
      '{SENT}'::label[],
      '${destination}'::jsonb,
      '${source}'::jsonb
    )
    RETURNING *
  `, { head: true })
  
  let { userId, threadId, ...rest } = data
  return {
    user: userId,
    thread: threadId,
    messageId,
    ...rest
  }
}

module.exports.send = send
