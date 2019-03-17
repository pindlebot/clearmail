import React from 'react'
import PropTypes from 'prop-types'
import { withApollo, compose, Mutation, Query } from 'react-apollo'
import { connect } from 'react-redux'
import Button from 'antd/lib/button'
import mutations from './mutations'
import PasswordField from '../../components/PasswordField'
import Spinner from '../../components/Spinner'
import SignInEmailTextField from '../../components/SignInEmailTextField'
import { withRouter } from 'react-router-dom'
import styles from './styles'
import Tabs from 'antd/lib/tabs'
import { RESET_PASSWORD } from '../../graphql/mutations'
import { USER_QUERY } from '../../graphql/queries'
import { setGraphQLErrors } from '../../lib/redux'
import { push } from 'connected-react-router'
import { parse } from 'query-string'
import './styles.scss'
import { Row, Col } from 'antd';

class Signin extends React.Component {
  static propTypes = {
    data: PropTypes.object,
    create: PropTypes.func,
    signin: PropTypes.func
  }

  state = {
    emailAddress: '',
    password: '',
    tab: '0',
    passwordResetSent: false
  }

  handleTabChange = (value) => {
    this.setState({ tab: value })
  }

  componentDidMount () {
    const params = parse(this.props.location.search)
    const { user: { data: { user } } } = this.props
    if (user && user.role === 'USER') {
      this.redirect(`/dashboard`)
    } else {

    }
  }

  signin = () => {
    const { emailAddress, password } = this.state
    this.setState({ loading: true }, () => {
      this.props.signin({ emailAddress, password })
        .then(({ data: { signinUser } }) => {
          this.redirect('/dashboard')
        })
        .catch(err => this.props.setGraphQLErrors(err.graphQLErrors))
    })
  }


  redirect = (pathname) => {
    const params = parse(this.props.location.search)
    if (params.action) {
      this.props.redirect(`/${params.action}`)
    } else {
      this.props.redirect(pathname)
    }
  }

  createAccount = async () => {
    const { emailAddress, password } = this.state
    return this.props.create({
      emailAddress,
      password
    }).catch(err => this.props.setGraphQLErrors(err.graphQLErrors))
      .then(({ data: { signinUser } }) => {
        this.redirect('/dashboard')
      })
  }

  resetPassword = mutate => () => mutate({
    variables: {
      emailAddress: this.state.emailAddress
    }
  }).then(() => {
    this.setState({
      password: '',
      emailAddress: '',
      passwordResetSent: true
    })
  })

  render () {
    const { emailAddress, password, tab, passwordResetSent } = this.state
    const { user: { data: { user } } } = this.props
    const login = tab === '0'
    return (
      <Mutation mutation={RESET_PASSWORD}>
        {mutate => {
          return (
            <div className={'loginContainer'}>
              <div className={'column'}>
                <div>
                  <div className={'title'}>
                    ClearMail
                  </div>
                  <form className={'form'}>
                    <Tabs
                      activeKey={this.state.tab}
                      onChange={this.handleTabChange}
                    >
                      <Tabs.TabPane tab={'Login/Create Account'} key={0} />
                      <Tabs.TabPane tab={'Reset Password'} key={1} />
                    </Tabs>
                    <Col className={'loginBody'}>
                      {passwordResetSent && (
                        <Row>
                          Password reset email sent!
                        </Row>
                      )}
                      <Row gutter={8}>
                        <Col>
                        <SignInEmailTextField
                          value={emailAddress}
                          onChange={e => this.setState({ emailAddress: e.target.value })}
                        />
                        </Col>
                      </Row>
                      {login && (
                        <Row gutter={8}>
                          <Col>
                            <PasswordField
                              value={password}
                              onChange={e => this.setState({ password: e.target.value })}
                            />
                          </Col>
                        </Row>
                      )}
                      <Row>
                        {login ? (
                          <div className={'apart'}>
                            <Button onClick={this.signin}>
                              Sign in {this.state.loading ? <Spinner /> : ''}
                            </Button>
                            <Button
                              variant={'raised'}
                              onClick={this.createAccount}
                              color={'primary'}
                            >
                              Create
                            </Button>
                          </div>
                        ) : (
                          <Row>
                            <Button onClick={this.resetPassword(mutate)}>Reset</Button>
                          </Row>
                        )}
                      </Row>
                    </Col>
                  </form>
                </div>
              </div>
            </div>
          )
        }}
      </Mutation>
    )
  }
}

export default compose(
  withApollo,
  ...mutations,
  connect(
    state => state,
    dispatch => ({
      setGraphQLErrors: error => dispatch(setGraphQLErrors(error)),
      clearGraphQLErrors: () => dispatch({ type: 'CLEAR_GRAPHQL_ERRORS' }),
      redirect: (pathname) => dispatch(push(pathname))
    })
  ),
  withRouter
)(props => (
  <Query query={USER_QUERY}>
    {user => {
      if (user.loading) return false
      return (
        <Signin {...props} user={user} />
      )
    }}
  </Query>
))
