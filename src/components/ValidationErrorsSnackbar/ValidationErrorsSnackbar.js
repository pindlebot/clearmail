import React from 'react'
import { connect } from 'react-redux'
import message from 'antd/lib/message'

class ValidationErrorsSnackbar extends React.Component {
  componentDidUpdate () {
    const { snackbar, validationErrors } = this.props
    const values = Object.values(validationErrors)
    if (!values || !values.length) return
    values.forEach(error => {
      message.info(error.message)
    }) 
  }
  render () {
    return null
  }
}

export default connect(
  state => state.root
)(ValidationErrorsSnackbar)
