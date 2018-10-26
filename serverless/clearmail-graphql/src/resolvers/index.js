const User = require('./models/User')
const GraphQLJSON = require('graphql-type-json')
const GraphQLAny = require('./types/GraphQLAny')
const Message = require('./models/Message')
const client = require('postgres-tools')

const resolvers = {
  Query: {
    feed: async (parent, args, context) => {
      let { filter, cursor, sort, limit, offset, query } = args

      if (filter) {
        context.filter = filter
      }

      if (sort) {
        context.sort = sort
      }

      limit = limit || 10
      offset = offset || 0
      query = query ? `AND (messages.subject LIKE '%${query}%' OR messages.text LIKE '%${query}%')` : ''

      let command = `
      SELECT DISTINCT
        threads.*
      FROM
        threads
      JOIN
        messages ON messages.thread_id = threads.id
      WHERE
        threads.user_id = '${context.user}'
      AND
        messages.labels && '{${filter.labels.join(', ')}}' ${query}
      ORDER BY
        created_at DESC LIMIT ${limit} OFFSET ${offset}
      `
      let threads = await client.query(command).catch(err => {
        console.log(err)
      })
      console.log(threads)
      return {
        threads: threads.map(({ userId, ...rest }) => ({
          user: userId,
          ...rest
        })),
        limit,
        offset
      }
    },
    thread: (parent, args = {}, context) => {
      let { filter, sort, ...rest } = args
      if (filter) {
        context.filter = filter
      }
      if (sort) {
        context.sort = sort
      }

      return client.query(`
         SELECT * FROM threads
         WHERE id = '${args.id}'
      `, {
        snakeCase: true,
        head: true
      }).then(({ userId, ...rest }) => ({
        user: userId,
        ...rest
      }))
    },
    threads: async (parent, args = {}, context) => {
      let { filter, ...rest } = args

      if (filter) {
        context.filter = filter
      }
      return client.query(`
        SELECT * FROM threads
        WHERE user_id = '${context.user}'
      `).then(threads => {
        return threads.map(({ userId, ...rest }) => ({
          user: userId,
          ...rest
        }))
      })
    },
    user: (obj, args, context) => {
      if (context.user) {
        return client.query(`
          SELECT * FROM users WHERE id = '${context.user}'
        `, { head: true })
      }
      return null
    }
  },
  Mutation: {
    sendMessage: Message.send,
    deleteAttachment: (_, args, { user }) => {
      return client.query(`
        DELETE FROM attachments
        WHERE id = '${args.id}'
        RETURNING *
      `, {
        head: true,
        snakeCase: true
      }).then(({ userId, ...rest }) => ({
        user: userId,
        ...rest
      }))
    },
    deleteThread: (_, args, context) => {
      return client.query(`
        DELETE FROM threads
        WHERE id = '${args.id}'
        RETURNING *
      `, {
        head: true,
        snakeCase: true
      })
    },
    updatePassword: (_, { password }, { user }) => User.updatePassword({ user, password }),
    resetPassword: (_, { emailAddress }, { user }) => User.resetPassword({ user, emailAddress }),
    emailInUse: (_, { emailAddress }, { user }) => User.emailInUse({ user, emailAddress }),
    createUser: (_, { emailAddress, password }, { user }) =>
      User.create({ emailAddress, password, id: user }),
    signinUser: (_, { emailAddress, password }) =>
      User.signin({ emailAddress, password }),
    updateUser: (_, { input }) => {

    },
    deleteUser: (_, { id }) => {
      return client.query(`
        DELETE FROM users
        WHERE id = '${id}'
        RETURNING *
      `, {
        head: true
      })
    }
  },
  Feed: {
    threads: (feed, args, context) => {
      return feed.threads || []
    }
  },
  User: {},
  Message: {
    content: (message, _, { user }) => {
      return client.query(`
        SELECT * FROM messages_content WHERE message_id = '${message.id}'
      `, { head: true })
    },
    attachments: (message, _, { user }) => {
      return client.query(
        `SELECT * FROM attachments a WHERE a.message_id = '${message.id}'`
      )
    },
    thread: (message, _, { user }) => {
      return client.query(`
        SELECT * FROM threads
        WHERE id = '${message.thread}'
      `, {
        snakeCase: true,
        head: true
      }).then(({ userId, ...rest }) => ({
        user: userId,
        ...rest
      }))
    }
  },
  Attachment: {
    message: (attachment, _, { user }) => {
      return client.query(`
        SELECT * FROM messages
        WHERE id = '${attachment.message}'
      `, {
        head: true
      }).then(({ userId, threadId, ...rest }) => ({
        user: userId,
        thread: threadId,
        ...rest
      }))
    }
  },
  Thread: {
    messages: async (thread, args = {}, context) => {
      let filter = args.filter || context.filter || {}
      let sort = (args.sort && args.sort.messages) || (context.sort && context.sort.messages) || 'DESC'
      let command = `
        SELECT
          m.*,
          z.a as attachments
        FROM messages m
        left outer join (
          select
          array_agg(attachments.id) as a,
          attachments.message_id as id
          from
            attachments
          group by attachments.message_id
        ) z using(id)
        WHERE m.thread_id = '${thread.id}'
        AND m.labels && '{SENT,INBOX}'
        ORDER BY m.created_at ${sort}
      `
      let messages = await client.query(command).catch(err => {
        console.log(err)
      })

      let data = messages.map(({ userId, threadId, ...rest }) => ({
        user: userId,
        thread: threadId,
        ...rest
      }))
      return data
    },
    user: (thread, _, { user }) => {
      return client.query(`
        SELECT * FROM users
        WHERE id = '${user}'
      `, {
        head: true
      })
    }
  },
  JSON: GraphQLJSON,
  Any: GraphQLAny
}

module.exports = resolvers
