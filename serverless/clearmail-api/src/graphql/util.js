const { randomBytes } = require('crypto')
const jwt = require('jsonwebtoken')
const {
  CLIENT_AUTH_ID,
  CLIENT_SESSION_ID,
  CLIENT_SESSION_SECRET
} = process.env

var re = /^[\w!#\$%&'\*\+\/\=\?\^`\{\|\}~\-]+(:?\.[\w!#\$%&'\*\+\/\=\?\^`\{\|\}~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?$/i

function isEmail (email) {
  return re.test(email)
}

async function createToken ({
  sub = randomBytes(5).toString('hex'),
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

const createNonce = async (user) => {
  let clientId = user.password ? CLIENT_AUTH_ID : CLIENT_SESSION_ID
  let clientSecret = user.password || CLIENT_SESSION_SECRET
  let { token } = await createToken({
    sub: user.id,
    expiresIn: '1h',
    clientId,
    clientSecret
  })

  let nonce = `https://clearmail.co/auth?nonce=${token}`
  return nonce
}

module.exports.createNonce = createNonce
module.exports.createToken = createToken
module.exports.calculateFee = calculateFee
module.exports.isEmail = isEmail
