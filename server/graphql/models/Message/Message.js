const { sendEmail } = require('../../email')
const { ValidationError } = require('apollo-server-koa')
const client = require('postgres-tools')
const command = require('./message.psql')

const send = async (parent, { input }, context) => {
  let { MessageId } = await sendEmail(input)
    .catch(err => {
      throw err
    })
  let cmd = command({
    ...input,
    user: context.user,
    messageId: MessageId
  })
  console.log(cmd)
  let data = await client.query(cmd, { head: true }).catch(err => {
    console.log(err)
  })

  let { userId, threadId, ...rest } = data
  return {
    user: userId,
    thread: threadId,
    ...rest
  }
}

module.exports.send = send
