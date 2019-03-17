import React from 'react'
import Input from 'antd/lib/input'

const SignInEmailTextField = props => (
  <Input
    className={'input'}
    id='email'
    placeholder='Email'
    value={props.value}
    onChange={props.onChange}
    type={'email'}
    autoComplete={'username'}
  />
)

export default SignInEmailTextField

