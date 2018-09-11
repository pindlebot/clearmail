import gql from 'graphql-tag'

export const USER_QUERY = gql`
  query {
    user {
      id
      role
      emailAddress
    }
  }
`

export const MESSAGES_QUERY = gql`
  query {
    messages {
      id
      date
      from
      mail
      messageId
      notificationType
      receipt
      replyTo
      subject
      to
    }
  }
`

export const MESSAGE_QUERY = gql`
  query($id: ID!) {
    message(id: $id) {
      id
      date
      from
      headers
      html
      mail
      messageId
      notificationType
      receipt
      replyTo
      subject
      text
      textAsHtml
      to
    }
  }
`