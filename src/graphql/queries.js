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

export const FEED_QUERY = gql`
  query($limit: Int, $offset: Int, $filter: JSON, $sort: JSON, $query: String) {
    feed(limit: $limit, offset: $offset, filter: $filter, sort: $sort, query: $query) {
      limit
      offset
      threads {
        id
        messages {
          id
          messageId
          createdAt
          snippet
          subject
          labels
          html
          to {
            id
            emailAddress
          }
          from {
            id
            emailAddress
          }
          attachments {
            id
            objectKey
          }
        }
      }
    }
  }
`

export const THREAD_QUERY = gql`
  query($id: ID!, $filter: JSON, $sort: JSON) {
    thread(id: $id, filter: $filter, sort: $sort) {
      id
      messages {
        id
        messageId
        snippet
        createdAt
        subject
        labels
        html
        text
        to {
          id
          emailAddress
        }
        from {
          id
          emailAddress
        }
        thread {
          id
        }
        attachments {
          id
          objectKey
        }
      }
    }
  }
`
