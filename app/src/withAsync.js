import React from 'react'
import getToken from './lib/getToken'
import { withApollo, compose } from 'react-apollo'
import { connect } from 'react-redux'
import { setLoadingState } from './lib/redux'
import { push } from 'connected-react-router'

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
      if (!this._loaded && !this.state.Component) {
        this._loaded = true
        await getToken(this.props)
        let Component = await this.load()
        this.setState({ Component })
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
    connect(
      state => ({ app: state.root }),
      dispatch => ({
        setLoadingState: loading => dispatch(setLoadingState(loading)),
        redirect: pathname => dispatch(push(pathname))
      })
    ),
    withApollo
  )(AsyncComponent)
}

export default withAsync