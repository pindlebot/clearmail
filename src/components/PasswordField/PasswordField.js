import React from 'react'
import PropTypes from 'prop-types'
import Input from 'antd/lib/input'
import './styles.scss'
class PasswordField extends React.Component {
  render () {
    return (
      <div className={'password'}>
        <Input.Password
          placeholder="input password"
          onChange={this.props.onChange}
          value={this.props.value}
        />
      </div>
    )
  }
}

PasswordField.propTypes = {}

PasswordField.defaultProps = {
  type: 'password',
  id: 'password',
  placeholder: 'Password'
}

export default PasswordField
