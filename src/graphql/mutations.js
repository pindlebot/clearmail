import gql from 'graphql-tag'

export const DELETE_THREAD = gql`
  mutation($id: ID!) {
    deleteThread(id: $id) {
      id
    }
  }
`

export const RESET_PASSWORD = gql`
  mutation($emailAddress: String!) {
    resetPassword(emailAddress: $emailAddress)
  }
`
