import React from 'react'

import { Query, Mutation } from 'react-apollo'
import { withRouter } from 'react-router-dom'
import { withApollo, compose } from 'react-apollo'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import gql from 'graphql-tag'

import MessagesTable from '../../components/MessagesTable'
import { USER_QUERY, THREAD_QUERY, FEED_QUERY } from '../../graphql/queries'
import { DELETE_THREAD, DELETE_MESSAGE } from '../../graphql/mutations'
import Thread from '../../components/Thread'
import ReplyDialog from '../../components/ReplyDialog'
import './styles.scss'
import { setLoadingState } from '../../lib/redux'
import Layout from '../../components/Layout'

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
    const {
      match: { params }
    } = this.props
    const { dialog } = this.state
    return (
      <Layout {...this.props}>
        <ReplyDialog
          {...this.props}
          dialog={dialog}
          handleClose={this.handleDialogClose}
        />
        <div className={'main'}>
          {params.id
            ? <Thread
              {...this.props}
              handleDialogClose={this.handleDialogClose}
              handleReplyClick={this.handleReplyClick}
              dialog={dialog}
            />
            : <MessagesTable
              {...this.props}
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

class DashboardWrapper extends React.Component {
  componentDidUpdate () {
    const { user } = this.props
    if (!user.data.user) {
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
                  <Mutation mutation={DELETE_MESSAGE}>
                    {deleteMessage => {
                      return (
                        <Dashboard
                          {...this.props}
                          query={query}
                          feed={query.data.feed || undefined}
                          thread={query.data.thread || undefined}
                          deleteThread={deleteThread}
                          deleteMessage={deleteMessage}
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
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

export default compose(
  connect(
    state => ({ app: state.root }),
    dispatch => ({
      setLoadingState: loading => dispatch(setLoadingState(loading)),
      redirect: pathname => dispatch(push(pathname)),
      setCursor: cursor => dispatch({
        type: 'SET_CURSOR',
        payload: cursor
      }),
      setLimit: limit => dispatch({
        type: 'SET_LIMIT',
        payload: limit
      }),
      setQuery: ({ query, filter }) => dispatch({
        type: 'SET_QUERY',
        payload: {
          query,
          filter
        }
      })
    })
  )
)(props => (
  <Query query={USER_QUERY}>
    {user => {
      if (user.loading) return false

      return (
        <DashboardWrapper user={user} {...props} />
      )
    }}
  </Query>
))
