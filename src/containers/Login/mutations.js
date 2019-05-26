import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

export default [
  graphql(
    gql`
      mutation(
        $emailAddress: String!
        $password: String!
      ) {
        signinUser(
          emailAddress: $emailAddress
          password: $password
        ) {
          token
        }
      }
    `,
    {
      name: 'signinWithEmail',
      props: ({
        signinWithEmail,
        ownProps: { client, setGraphQLErrors }
      }) => ({
        signin: async (variables) => {
          try {
            const resp = await signinWithEmail({ variables })
            const { data: { signinUser: { token } } } = resp

            if (token) {
              window.localStorage.setItem('token', token)

              await client.resetStore()
            }

            return resp
          } catch (err) {
            setGraphQLErrors(err.graphQLErrors)
            throw err
          }
        }
      })
    }
  ),
  graphql(
    gql`
      mutation(
        $emailAddress: String!
        $password: String!
      ) {
        createUser(
          emailAddress: $emailAddress,
          password: $password
        ) {
          id
        }
        signinUser(
          emailAddress: $emailAddress
          password: $password
        ) {
          token
        }
      }
    `,
    {
      name: 'createWithEmail',
      props: ({
        createWithEmail,
        ownProps: { client, setGraphQLErrors }
      }) => ({
        create: async (variables) => {
          try {
            const resp = await createWithEmail({ variables })
            const { data: { signinUser: { token } } } = resp

            if (token) {
              window.localStorage.setItem('token', token)

              await client.resetStore()
            }

            return resp
          } catch (err) {
            setGraphQLErrors(err.graphQLErrors)
            throw err
          }
        }
      })
    }
  )
]
