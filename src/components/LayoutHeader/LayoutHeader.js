/* eslint-disable react/no-danger */
import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import LayoutHeaderMenu from '../LayoutHeaderMenu'
import config from '../../lib/config'
import Button from '@material-ui/core/Button'
import DocumentIcon from '../DocumentIcon'
import { compose } from 'react-apollo'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { Link } from 'react-router-dom'
import SearchMessages from '../SearchMessages'

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
        variant={'raised'}
        color={'primary'}
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
    <header>
      <AppBar position='static' className={classes.root}>
        <Toolbar>
          <IconButton
            onClick={() => {}}
            color='inherit'
            aria-label='Menu'
          >
            <DocumentIcon background={'rgba(255,255,255,0.1)'} fill={'rgba(0,0,0,0.8)'} />
          </IconButton>
          <Typography
            type='title'
            color='inherit'
            className={classes.brand}
          >
            <Link to='/' className={classes.link}>
              {config.APP_NAME}
            </Link>
          </Typography>
          <SearchMessages
            width={window.innerWidth}
            handleSearch={props.handleSearch}
            handleChange={props.handleChange}
            query={props.query}
          />
          {props.landing
            ? <LandingPageMenu {...other} />
            : <LayoutHeaderMenu {...other} />
          }
        </Toolbar>
      </AppBar>
    </header>
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
  withStyles(styleSheet)
)(LayoutHeader)
