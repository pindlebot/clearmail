import React from 'react'
import Layout from '../../components/Layout'
import { withStyles } from '@material-ui/core/styles'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import MessagesTable from '../../components/MessagesTable'
import { USER_QUERY, THREAD_QUERY, FEED_QUERY } from '../../graphql/queries'
import { DELETE_THREAD } from '../../graphql/mutations'
import Thread from '../../components/Thread'
import ReplyDialog from '../../components/ReplyDialog'

class Dashboard extends React.Component {
  state = {
    dialog: undefined,
    selected: []
  }

  handleReplyClick = () => {
    this.setState({ dialog: 'REPLY' })
  }

  handleDialogClose = () => {
    this.setState({ dialog: undefined })
  }

  handleDeleteThread = async () => {
    const { selected } = this.state
    let promises = Promise.all(
      selected.map(id => this.props.deleteThread({
        variables: { id },
        optimisticResponse: {
          __typename: 'Mutation',
          deleteThread: {
            __typename: 'Thread',
            id: id
          }
        }
      }))
    )

    await promises
  }

  render () {
    const { classes, ...other } = this.props
    const {
      match: { params }
    } = this.props
    const { dialog } = this.state
    return (
      <Layout {...other}>
        <ReplyDialog
          {...other}
          dialog={dialog}
          handleClose={this.handleDialogClose}
        />
        <div className={classes.main}>
          {params.id
            ? <Thread
              {...other}
              handleDialogClose={this.handleDialogClose}
              handleReplyClick={this.handleReplyClick}
              dialog={dialog}
            />
            : <MessagesTable
              {...other}
              handleDialogClose={this.handleDialogClose}
              handleReplyClick={this.handleReplyClick}
              dialog={dialog}
            />
          }
        </div>
      </Layout>
    )
  }
}

const styles = {
  main: {
    maxWidth: '960px',
    boxSizing: 'border-box',
    margin: '1em auto'
  }
}

class DashboardWrapper extends React.Component {
  componentDidMount () {
    const { user } = this.props
    if (
      user &&
      !user.loading &&
      user.data.user.role !== 'USER'
    ) {
      this.props.redirect('/')
    }
  }

  render () {
    const {
      user,
      app,
      match
    } = this.props

    const filter = {
      labels: app.filter
    }
    console.log(this.props)
    return (
      <Query
        query={
          match.params.id
            ? THREAD_QUERY
            : FEED_QUERY
        }
        variables={
          match.params.id
            ? {
              ...match.params,
              filter,
              sort: { messages: 'ASC' }
            }
            : {
              filter,
              sort: { messages: 'ASC' },
              limit: app.limit,
              offset: 0,
              query: app.query
            }
        }
      >
        {query => {
          return (
            <Mutation mutation={DELETE_THREAD}>
              {deleteThread => {
                return (
                  <Dashboard
                    {...this.props}
                    query={query}
                    feed={query.data.feed || undefined}
                    thread={query.data.thread || undefined}
                    deleteThread={deleteThread}
                    fetchMore={() => {
                      query.fetchMore({
                        variables: {
                          ...query.variables,
                          offset: query.data.feed.offset + query.data.feed.limit
                        },
                        updateQuery: (prev, { fetchMoreResult }) => {
                          if (!fetchMoreResult) return prev
                            
                          return {
                            ...prev,
                            feed: {
                              ...prev.feed,
                              ...fetchMoreResult.feed,
                              threads: prev.feed.threads.concat(fetchMoreResult.feed.threads)
                            }
                          }
                        }
                      })
                    }}
                  />
                )
              }}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

export default withStyles(styles)(props => (
  <Query query={USER_QUERY}>
    {user => {
      if (user.loading) return false

      return (
        <DashboardWrapper user={user} {...props} />
      )
    }}
  </Query>
))
