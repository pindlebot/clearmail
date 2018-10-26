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
          createdAt
          snippet
          source
          messageId
          subject
          destination
          labels
          html
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
        snippet
        createdAt
        source
        subject
        destination
        labels
        html
        text
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
