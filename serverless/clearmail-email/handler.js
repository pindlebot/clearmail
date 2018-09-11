const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const read = promisify(fs.readFile)
const AWS = require('aws-sdk')

const { AWS_REGION, SOURCE_EMAIL, SOURCE_EMAIL_ARN, WEBSITE, ADDRESS } = process.env

const ses = new AWS.SES({ region: AWS_REGION || 'us-east-1' })

const TEMPLATES = {
  reset: {
    file: 'reset.html',
    variables: {
      subject: 'ClearMail - Reset Password',
      text: '',
      site: WEBSITE,
      address: ADDRESS
    }
  },
  confirmation: {
    file: 'confirmation.html',
    variables: {
      subject: 'Welcome to ClearMail',
      text: '',
      site: WEBSITE,
      address: ADDRESS
    }
  },
  order: {
    file: 'order.html',
    variables: {
      subject: 'ClearMail Order Receipt',
      text: '',
      content: '',
      site: WEBSITE,
      address: ADDRESS
    }
  }
}

async function loadTemplate (variables = {}, { templateType }) {
  let template = TEMPLATES[templateType]
  let params = {
    ...variables,
    site: process.env.WEBSITE,
    address: process.env.MAILING_ADDRESS
  }
  const file = path.join(__dirname, './templates/', template.file)
  let html = await read(file, { encoding: 'utf8' })
  html = Object.keys(params).reduce((acc, key) => {
    let value = params[key]
    if (typeof value !== 'string') {
      return acc
    }
    let re = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    return re.test(acc) ? acc.replace(re, value) : acc
  }, html)
  return html
}

const handleMessage = async (record) => {
  let { Sns: { Message } } = record
  let message = JSON.parse(Message)
  console.log({ message })
  let { variables, emailAddress, templateType } = message
  templateType = templateType || 'reset'
  let html = await loadTemplate(message.variables, { templateType })
  let template = TEMPLATES[templateType]
  return sendEmail({ ...template.variables, emailAddress, html })
}

const sendEmail = ({ emailAddress, subject, html, text }) => {
  return ses.sendEmail({
    Destination: {
      ToAddresses: [
        emailAddress
      ]
    },
    Message: {
      Body: {
        Html: {
          Data: html,
          Charset: 'utf8'
        },
        Text: {
          Data: text || '',
          Charset: 'utf8'
        }
      },
      Subject: {
        Data: subject,
        Charset: 'utf8'
      }
    },
    Source: SOURCE_EMAIL,
    ReplyToAddresses: [
      SOURCE_EMAIL
    ],
    SourceArn: SOURCE_EMAIL_ARN
  }).promise()
    .then(console.log.bind(console))
}

module.exports.handler = async (event, context) => {
  const { Records } = event
  await Promise.all(Records.map(handleMessage))
}
