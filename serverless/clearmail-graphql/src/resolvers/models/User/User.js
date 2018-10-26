const AWS = require('aws-sdk')
const sns = new AWS.SNS({ region: process.env.AWS_REGION || 'us-east-1' })
const ses = new AWS.SES({ region: process.env.AWS_REGION || 'us-east-1' })
const { ValidationError, AuthenticationError } = require('apollo-server-lambda')
const { isEmail } = require('../../util')
const { sendUserConfirmationEmail } = require('../../email')
const client = require('postgres-tools')
const snakeCase = require('lodash.snakecase')

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
  SELECT
    users.*,
    sign(
      JSON_BUILD_OBJECT(
        'sub', users.id,
        'exp', (select extract(epoch from now() + interval '1' day)::int)
      ),
      users.password
    ) as token
  FROM
    users
  WHERE
    email_address = '${emailAddress}'
  AND
    password = crypt('${password}', password);
  `, {
    head: true
  }).catch(err => {
    throw new AuthenticationError(err)
  })
  if (user) {
    return user
  } else {
    throw new AuthenticationError('Could not login with provided credentials')
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
  // let user = await client.query(`
  //  SELECT * FROM users WHERE email_address = '${emailAddress}'
  // `, { head: true })
  // if (user) {
  //  let clientId = user.password ? CLIENT_AUTH_ID : CLIENT_SESSION_ID
  //  let clientSecret = user.password || CLIENT_SESSION_SECRET
  //  let { token } = await createToken({
  //    sub: user.id,
  //    expiresIn: '1h',
  //   clientId,
  //    clientSecret
  //  })
  //
  //  let href = 'https://letterpost.co/auth?nonce=' + token
  //  const params = {
  //    Message: JSON.stringify({
  //      emailAddress: user.emailAddress,
  //      variables: {
  //        href
  //      },
  //      templateType: 'reset'
  //    }),
  //    TopicArn: SES_TOPIC_ARN
  //  }
  //  await sns.publish(params).promise()
  //  return true
  // }
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
module.exports.signin = signin
module.exports.update = update
module.exports.create = create
