const AWS = require('aws-sdk')
const client = require('postgres-tools')
const { AWS_BUCKET, AWS_REGION } = process.env

const s3 = new AWS.S3({ region: AWS_REGION })
const uuid = require('uuid/v4')

const genId = () => uuid()

async function handleAttachmentsIfNeeded (attachments, { userId, messageId }) {
  if (!attachments.length) {
    return []
  }
  const handleAttachment = async (attachment) => {
    let {
      checksum,
      content,
      filename,
      contentDisposition,
      contentType,
      size,
      type
    } = attachment
    let attachmentId = genId()
    let objectKey = `attachments/${userId}/${messageId}/${attachmentId}`
    await s3.putObject({
      Bucket: AWS_BUCKET,
      Key: objectKey,
      Body: content,
      ContentType: contentType,
      ContentDisposition: contentDisposition,
      Tagging: `user=${userId}&message=${messageId}&checksum=${checksum}&filename=${filename}`
    }).promise()
      .catch(console.log.bind(console))
    let command = `
      INSERT INTO attachments(
        message_id,
        user_id,
        checksum,
        object_key,
        content_type,
        filename,
        size,
        type,
        content_disposition
      )
      VALUES(
        uuid '${messageId}',
        uuid '${userId}',
        text '${checksum}',
        text '${objectKey}',
        text '${contentType}',
        text '${filename}',
        int '${size}',
        text '${type}',
        text '${contentType}'
      )
      RETURNING *
    `
    console.log(command)
    return client.query(command, { head: true })
  }
  await Promise.all(attachments.map(handleAttachment))
}

module.exports = handleAttachmentsIfNeeded
