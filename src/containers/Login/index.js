import React from 'react'
import LoginComponent from '@menubar/login'
import mutations from './mutations'
import { withRouter } from 'react-router-dom'
import { withApollo, compose, Mutation, Query } from 'react-apollo'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { setGraphQLErrors } from '../../lib/redux'

import '@menubar/login/dist/style.css'


class Login extends React.Component {
  render () {
    return (
      <LoginComponent 
        {...this.props}
        renderLoading={() => (<div></div>)}
        createAccount={({ emailAddress, password }) => this.props.create({ emailAddress, password })}
        login={({ emailAddress, password }) => this.props.signin({ emailAddress, password })}
        resetPassword={() => {}}
        redirectPathname={'/dashboard'}
        title={<div>Title</div>}
      />
    )
  }
}

export default compose(
  withApollo,
  connect(state => state, { push, setGraphQLErrors }),
  ...mutations,
  withRouter
)(Login)

