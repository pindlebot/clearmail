const bcrypt = require('bcryptjs')
const { ValidationError, AuthenticationError } = require('apollo-server-koa')
const client = require('postgres-tools')

class Hash {
  constructor ({
    password,
    emailAddress,
    saltWorkFactor = 10
  }) {
    this.password = password
    this.emailAddress = emailAddress
    this.saltWorkFactor = saltWorkFactor
  }

  async create () {
    if (this.password.length < 5) {
      throw new ValidationError('Passwords must be at least 5 characters')
    }

    const salt = await bcrypt.genSalt(this.saltWorkFactor)
    return bcrypt.hash(this.password, salt)
  }

  async verify () {
    const user = await this.getUserByEmail()
      .catch(err => {
        throw err
      })
    if (!user) {
      throw new AuthenticationError('User not found.')
    }
    const result = await bcrypt.compare(this.password, user.password)

    if (!result) {
      throw new AuthenticationError('Incorrect password.')
    }

    return { user: user, result }
  }

  getUserByEmail () {
    return client.query(`
      SELECT * FROM users
      WHERE email_address = '${this.emailAddress}'
    `, { head: true })
  }
}

module.exports = Hash
