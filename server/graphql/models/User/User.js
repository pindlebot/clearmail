const uuid = require('uuid/v4')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const AWS = require('aws-sdk')
const sns = new AWS.SNS({ region: process.env.AWS_REGION || 'us-east-1' })
const ses = new AWS.SES({ region: process.env.AWS_REGION || 'us-east-1' })
const { ValidationError } = require('apollo-server-koa')
const { isEmail } = require('../../util')
const { sendUserConfirmationEmail } = require('../../email')
const {
  CLIENT_AUTH_ID,
  CLIENT_SESSION_ID,
  CLIENT_SESSION_SECRET,
  SES_TOPIC_ARN
} = process.env
const client = require('postgres-tools')
const snakeCase = require('lodash.snakecase')
// const Hash = require('../../hash')

const update = (params) => {
  if (params.emailAddress) {
    if (!isEmail(params.emailAddress)) {
      throw new ValidationError('Email address is invalid')
    }
  }
  let { id, ...rest } = params
  let fields = Object.keys(rest).map(key => `${snakeCase(key)}='${params[key]}'`).join(', ')
  return client.query(`
    UPDATE users SET ${fields} WHERE id='${id}' RETURNING *
  `, { head: true })
}

async function createToken ({
  sub = uuid(),
  expiresIn = '72h',
  clientId,
  clientSecret
}) {
  const payload = {
    sub
  }

  const options = {
    audience: clientId,
    expiresIn: expiresIn
  }

  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      clientSecret,
      options,
      (err, token) => {
        if (err) reject(err)
        else resolve({ token, payload })
      }
    )
  })
}

async function createSession ({ userId }) {
  // let keys = Object.keys(params).map(key => snakeCase(key)).join(', ')
  // let values = Object.values(params).map(value =>
  //  typeof value === 'string'
  //    ? `'${value}'`
  //    : value
  // ).join(', ')
  //  INSERT INTO users(${keys}) values(${values}) RETURNING *

  return client.query(`
    WITH get_user AS (
      SELECT * FROM users WHERE id = '${userId}'
    ),
    create_user AS (
      INSERT INTO
      users(id, role)
      SELECT
        '${userId}',
        'SESSION'
      WHERE NOT EXISTS(
        SELECT * FROM get_user
      )
      RETURNING *
    )
    SELECT * FROM get_user UNION select * FROM create_user;    
  `, { head: true })
}

async function create ({ id, emailAddress, password }) {
  let user = await client.query(`
    INSERT INTO users(role, email_address, password)
    SELECT 'USER', '${emailAddress}', crypt('${password}', gen_salt('bf'))
    WHERE NOT EXISTS(
      SELECT * FROM users WHERE email_address = '${emailAddress}'
    )
    RETURNING *
  `, {
    head: true
  })
  if (user) {
    try {
      await ses.VerifyEmailIdentity({
        EmailAddress: emailAddress
      }).promise()
    } catch (err) {
      console.error(err)
    }
    await sendUserConfirmationEmail(user).catch(err => {
      console.log(err)
    })
    return user
  } else {
    throw new ValidationError('User exists')
  }
}

async function signin ({ emailAddress, password }) {
  let user = await client.query(`
    SELECT * FROM users
    WHERE email_address = '${emailAddress}'
    AND password = crypt('${password}', password);
  `, {
    head: true
  }).catch(err => {
    console.log(err)
  })
  // const hash = new Hash({ emailAddress, password })
  // const state = await hash.verify()
  // if (state && state.result) {
  console.log('signin', { user })
  if (user) {
    const jwt = await createToken({
      sub: user.id,
      clientSecret: user.password,
      clientId: CLIENT_AUTH_ID
    })
    return { ...user, token: jwt.token }
  }
}

function emailInUse ({ emailAddress, user }) {
  if (!isEmail(emailAddress)) {
    throw new ValidationError('Email address is invalid')
  }

  return client.query(`
    SELECT rows FROM users WHERE email_address = '${emailAddress}'
  `).then(rows => rows.length)
}

async function resetPassword ({ emailAddress, user: userId }) {
  let user = await client.query(`
    SELECT * FROM users WHERE email_address = '${emailAddress}'
  `, { head: true })
  if (user) {
    let clientId = user.password ? CLIENT_AUTH_ID : CLIENT_SESSION_ID
    let clientSecret = user.password || CLIENT_SESSION_SECRET
    let { token } = await createToken({
      sub: user.id,
      expiresIn: '1h',
      clientId,
      clientSecret
    })

    let href = 'https://letterpost.co/auth?nonce=' + token
    const params = {
      Message: JSON.stringify({
        emailAddress: user.emailAddress,
        variables: {
          href
        },
        templateType: 'reset'
      }),
      TopicArn: SES_TOPIC_ARN
    }
    await sns.publish(params).promise()
    return true
  }
  return false
}

async function updatePassword ({ password, user: userId }) {
  if (password.length < 5) {
    throw new ValidationError('Passwords must be at least 5 characters')
  }
  const user = await client.query(`SELECT * FROM users WHERE id = ${userId}`, { head: true })

  if (!user.emailAddress) {
    throw new ValidationError('Please add an email address before adding a password')
  }

  if (user.role !== 'USER') {
    await sendUserConfirmationEmail(user)
  }

  return client.query(`
    UPDATE users SET password = crypt('${password}', gen_salt('bf'))
    WHERE id = '${userId}'
  `, {
    head: true
  })
}

module.exports.updatePassword = updatePassword
module.exports.emailInUse = emailInUse
module.exports.resetPassword = resetPassword
module.exports.createSession = createSession
module.exports.signin = signin
module.exports.update = update
module.exports.create = create
