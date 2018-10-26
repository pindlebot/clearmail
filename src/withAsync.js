import React from 'react'
import getToken from './lib/getToken'
import { withApollo, compose } from 'react-apollo'
import { connect } from 'react-redux'
import { setLoadingState } from './lib/redux'
import { push } from 'connected-react-router'
import { withRouter } from 'react-router-dom'

const DefaultLoadingOverlay = props =>
  <div>{props.children}</div>

const withAsync = (LoadingOverlay = DefaultLoadingOverlay) => (getComponent) => {
  class AsyncComponent extends React.Component {
    state = {
      Component: undefined
    }
    _loaded = false

    load = () => getComponent(this.props)
      .then(module => module.default || module)

    static displayName = 'AsyncComponent'

    async componentDidMount () {
      if (!this._loaded) {
        this._loaded = true
        // await getToken(this.props)
        let Component = await this.load()
        this.setState({ Component }, () => {
          // this.loaded = false
        })
      }
    }

    isLoading = () => typeof this.state.Component === 'undefined'

    render () {
      const { Component } = this.state
      return (
        <LoadingOverlay loading={this.props.app.loading}>
          {Component && <Component {...this.props} />}
        </LoadingOverlay>
      )
    }
  }

  return compose(
    withRouter,
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
    ),
    withApollo
  )(AsyncComponent)
}

export default withAsync
