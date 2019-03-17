import React from 'react'
import { connect } from 'react-redux'
import message from 'antd/lib/message'

class GraphQLErrorsSnackbar extends React.Component {
  componentDidUpdate () {
    const { snackbar, graphQLErrors } = this.props
    if (!graphQLErrors || !graphQLErrors.length) return false
    graphQLErrors.forEach(error => {
      message.error(error.message)
    }) 
  }
  render () {
    return null
  }
}

export default connect(
  state => state.root
)(GraphQLErrorsSnackbar)
