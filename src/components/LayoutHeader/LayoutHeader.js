/* eslint-disable react/no-danger */
import React from 'react'
import LayoutHeaderMenu from '../LayoutHeaderMenu'
import config from '../../lib/config'
import { compose } from 'react-apollo'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { Link } from 'react-router-dom'
import SearchMessages from '../SearchMessages'
import AntLayout from 'antd/lib/layout'
import Button from 'antd/lib/button'
import styles from './styles.scss'

const styleSheet = {
  root: {
    backgroundColor: '#fff',
    boxShadow: 'none',
    borderBottom: '1px solid #F5F5F5'
  },
  brand: {
    flex: '1',
    fontSize: '18px',
    fontWeight: '400',
    letterSpacing: '0.5px',
    marginLeft: '0.4em'
  },
  link: {
    color: '#123',
    textDecoration: 'none'
  }
}

const LandingPageMenu = props => {
  const { logged } = props
  return (
    <div>
      <Button
        style={{ marginRight: '20px' }}
        onClick={props.login}

      >
        Login
      </Button>
      <Button
        onClick={props.login}
      >
        Create Account
      </Button>
    </div>
  )
}

LandingPageMenu.defaultProps = {
  logged: false
}

const LayoutHeader = props => {
  const { classes, ...other } = props

  return (
    <AntLayout.Header className={styles.root}>
      <div className={styles.brand}>
        <Link to='/' className={styles.link}>
          {config.APP_NAME}
        </Link>
      </div>
      <div className={styles.search}>
        <SearchMessages
          width={window.innerWidth}
          handleSearch={props.handleSearch}
          handleChange={props.handleChange}
          query={props.query}
        />
      </div>
      {props.landing
        ? <LandingPageMenu {...other} />
        : <LayoutHeaderMenu {...other} />}
    </AntLayout.Header>
  )
}

export default compose(
  connect(
    state => state,
    dispatch => ({
      login: () => dispatch(push('/')),
      account: () => dispatch(push('/dashboard'))
    })
  ),
)(LayoutHeader)
