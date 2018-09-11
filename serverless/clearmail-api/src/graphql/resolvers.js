const Users = require('./models/users')
const db = require('dynamodb-tools')
const GraphQLJSON = require('graphql-type-json')
const GraphQLAny = require('./types/GraphQLAny')
const { sendEmail } = require('./email')
const MESSAGES_TABLE = `${process.env.DYNAMODB_TABLE}-messages`

const message = {
  get: ({ id }) => {
    return db(MESSAGES_TABLE).get({
      id
    })
  },
  list: () => {
    return db(MESSAGES_TABLE).get()
  },
  remove: ({ id }) => {
    return db(MESSAGES_TABLE).remove({ id })
  }
}

const rootQuery = (table, context) => {
  return db(`${process.env.DYNAMODB_TABLE}-${table}`)
    .get({ user: context.user })
}

const resolvers = {
  Query: {
    message: (_, args, { user }) => {
      return message.get(args)
    },
    messages: (_, args, ctx) => {
      return message.list()
    },
    user: (obj, args, { user }) => Users.get({ id: user })
      .then(data => data && Object.keys(data).length
        ? data
        : Users.createSession({ user })
      )
  },
  Mutation: {
    sendMessage: (_, { input }, { user }) => {
      console.log({ user, input })
      // if (!/(?<=@)letterpost\.co/.test(fromAddress)) {
      //  throw new ValidationError('invalid email')
      // }
      return sendEmail({ ...input })
    },
    deleteMessage: async (_, args, { user }) => {
      let data = await message.remove(args)
      console.log({ data })
      return data
    },
    updatePassword: (_, { password }, { user }) => Users.updatePassword({ user, password }),
    resetPassword: (_, { emailAddress }, { user }) => Users.resetPassword({ user, emailAddress }),
    emailInUse: (_, { emailAddress }, { user }) => Users.emailInUse({ user, emailAddress }),
    createUser: (_, { emailAddress, password }, { user }) =>
      Users.create({ emailAddress, password, id: user }),
    signinUser: (_, { emailAddress, password }) =>
      Users.signin({ emailAddress, password }),
    updateUser: (_, { input }) => Users.update(input),
    deleteUser: (_, { id }) => Users.remove({ id })
  },
  User: {},
  JSON: GraphQLJSON,
  Any: GraphQLAny
}

module.exports = resolvers
