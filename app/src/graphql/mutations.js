import gql from 'graphql-tag'

export const DELETE_MESSAGE = gql`
  mutation($id: ID!) {
    deleteMessage(id: $id) {
      id
    }
  }
`

export const RESET_PASSWORD = gql`
  mutation($emailAddress: String!) {
    resetPassword(emailAddress: $emailAddress)
  }
`
