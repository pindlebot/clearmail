const AWS = require('aws-sdk')
const { AWS_REGION, AWS_BUCKET } = process.env
const s3 = new AWS.S3({ region: AWS_REGION || 'us-east-1' })
const { simpleParser } = require('mailparser')

async function parseMail (key) {
  let body
  try {
    const data = await s3.getObject({
      Key: key,
      Bucket: AWS_BUCKET
    }).promise()
    body = data.Body
  } catch (err) {
    return {}
  }
  let decoded
  try {
    decoded = await simpleParser(body.toString())
  } catch (err) {
    console.log(err)
    return {}
  }
  return decoded
}

module.exports = parseMail
