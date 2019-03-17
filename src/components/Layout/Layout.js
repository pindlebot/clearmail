import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Header from '../LayoutHeader'
import getToken from '../../lib/getToken'
import Footer from '../Footer'
import AntLayout from 'antd/lib/layout'
import './styles.scss'
import Menu from 'antd/lib/menu'
import { push } from 'connected-react-router'
import { connect } from 'react-redux'

function parseQuery (string) {
  let { query, filter } = string.split(/\s+/g)
    .filter(s => s)
    .reduce((acc, val) => {
      if (/([^:]+)(?::)([^:]+)/g.test(val)) {
        let [_, key, value] = val.match(/([^:]+)(?::)([^:]+)/)
        console.log({ key, value })
        acc.filter.push(value.toUpperCase())
      } else {
        acc.query.push(val)
      }
      return acc
    }, {
      filter: [],
      query: []
    })
  return {
    query: query.join(' '),
    filter: filter.length ? filter : null
  }
}

class Layout extends Component {
  state = {
    value: ''
  }

  signout = async () => {
    window.localStorage.removeItem('token')
    getToken(this.props)
      .then(() => {
        this.props.redirect('/login')
      })
  }

  handleSearch = ({ query }) => {
    this.props.setQuery(parseQuery(query))
  }

  onClick = evt => {
    this.props.setQuery({
      query: '',
      filter: [evt.key]
    })
    if (this.props.match.url !== '/dashboard') {
      this.props.push('/dashboard')
    }
  }

  render () {
    const { classes, loading, query, ...other } = this.props
    const { user } = this.props
    const logged = user && user.data && user.data.user && user.data.user.role === 'USER'
    return (
      <AntLayout className={'layoutContainer'}>
        <Header
          {...other}
          signout={this.signout}
          logged={logged}
          query={this.state.value}
          handleSearch={this.handleSearch}
          handleChange={evt => {
            this.setState({
              value: evt.target.value
            })
          }}
        />
        <div className={'layoutRow'}>
          <div className={'sidebar'}>
            <Menu selectedKeys={query.variables.filter.labels} style={{width: '100%', marginTop: '60px'}} mode={'inline'} onClick={this.onClick}>
              <Menu.Item key='INBOX'>Inbox</Menu.Item>
              <Menu.Item key='SENT'>Sent</Menu.Item>
            </Menu>
          </div>
          <AntLayout.Content className={'layout'}>
            {this.props.children}
          </AntLayout.Content>
        </div>
        <Footer {...other} />
      </AntLayout>
    )
  }
}

Layout.propTypes = {
  loading: PropTypes.bool
}

Layout.defaultProps = {
  loading: false,
  user: {}
}

export default connect(
  state => state, { push }
)(Layout)
