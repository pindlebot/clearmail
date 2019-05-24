const AWS = require('aws-sdk')
const { AWS_REGION, AWS_ACCOUNT_ID } = process.env

const sns = new AWS.SNS({ region: AWS_REGION })
const ses = new AWS.SES({ region: AWS_REGION })

const sendUserConfirmationEmail = async (user) => {
  return sns.publish({
    Message: JSON.stringify({
      emailAddress: user.emailAddress,
      variables: {
        href: 'http://clearmail.co'
      },
      templateType: 'confirmation'
    }),
    TopicArn: `arn:aws:sns:us-east-1:${AWS_ACCOUNT_ID}:clearmail-email`
  }).promise()
}

const sendOrderConfirmationEmail = (user) => {
  return sns.publish({
    Message: JSON.stringify({
      emailAddress: user.emailAddress,
      variables: {
        href: 'https://clearmail.co/account'
      },
      templateType: 'order'
    }),
    TopicArn:`arn:aws:sns:us-east-1:${AWS_ACCOUNT_ID}:clearmail-email`
  }).promise()
}

const sendEmail = ({
  destination,
  source,
  subject,
  html,
  text
}) => {
  const SourceArn = `arn:aws:ses:${AWS_REGION}:${AWS_ACCOUNT_ID}:identity/${source[0]}`
  return ses.sendEmail({
    Destination: {
      ToAddresses: destination
    },
    Message: {
      Body: {
        Html: {
          Data: Buffer.from(html, 'base64').toString('utf8'),
          Charset: 'utf8'
        },
        Text: {
          Data: text,
          Charset: 'utf8'
        }
      },
      Subject: {
        Data: subject,
        Charset: 'utf8'
      }
    },
    Source: source[0],
    ReplyToAddresses: [
      source[0]
    ],
    SourceArn: SourceArn
  }).promise()
    .catch(err => {
      throw err
    })
}

module.exports.sendUserConfirmationEmail = sendUserConfirmationEmail
module.exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail
module.exports.sendEmail = sendEmail
