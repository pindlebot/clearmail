import React, { Component } from 'react'
import PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles'
import Header from '../LayoutHeader'
import getToken from '../../lib/getToken'
import Footer from '../Footer'

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

const styles = {
  main: {
    backgroundColor: '#fafafa',
    paddingTop: 40,
    minHeight: 'calc(100vh - 65px)',
    height: '100%',
    boxSizing: 'border-box',
    backgroundImage: `url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='150px' height='150px' viewBox='0 0 150 150' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3C!-- Generator: Sketch 42 (36781) - http://www.bohemiancoding.com/sketch --%3E%3Ctitle%3EGroup 2%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cdefs%3E%3Crect id='path-1' x='0' y='0' width='150' height='150'%3E%3C/rect%3E%3C/defs%3E%3Cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cg id='Group-2'%3E%3Cmask id='mask-2' fill='white'%3E%3Cuse xlink:href='%23path-1'%3E%3C/use%3E%3C/mask%3E%3Cg id='Mask'%3E%3C/g%3E%3Cg mask='url(%23mask-2)' id='file'%3E%3Cg transform='translate(-23.000000, -30.000000)'%3E%3Cg transform='translate(73.000000, 150.000000)'%3E%3Cg id='Group' fill-rule='nonzero' fill='%23EEEEEE'%3E%3Cpath d='M36.5,22 L11.5,22 C10.948,22 10.5,22.447 10.5,23 C10.5,23.553 10.948,24 11.5,24 L36.5,24 C37.052,24 37.5,23.553 37.5,23 C37.5,22.447 37.052,22 36.5,22 Z' id='Shape'%3E%3C/path%3E%3Cpath d='M11.5,16 L21.5,16 C22.052,16 22.5,15.553 22.5,15 C22.5,14.447 22.052,14 21.5,14 L11.5,14 C10.948,14 10.5,14.447 10.5,15 C10.5,15.553 10.948,16 11.5,16 Z' id='Shape'%3E%3C/path%3E%3Cpath d='M32.914,0 L0.5,0 L0.5,60 L47.5,60 L47.5,14.586 L32.914,0 Z M33.5,3.414 L44.086,14 L33.5,14 L33.5,3.414 Z M2.5,58 L2.5,2 L31.5,2 L31.5,16 L45.5,16 L45.5,58 L2.5,58 Z' id='Shape'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3Cg transform='translate(73.000000, 0.000000)'%3E%3Cg id='Group' fill-rule='nonzero' fill='%23EEEEEE'%3E%3Cpath d='M36.5,30 L11.5,30 C10.948,30 10.5,30.447 10.5,31 C10.5,31.553 10.948,32 11.5,32 L36.5,32 C37.052,32 37.5,31.553 37.5,31 C37.5,30.447 37.052,30 36.5,30 Z' id='Shape'%3E%3C/path%3E%3Cpath d='M36.5,38 L11.5,38 C10.948,38 10.5,38.447 10.5,39 C10.5,39.553 10.948,40 11.5,40 L36.5,40 C37.052,40 37.5,39.553 37.5,39 C37.5,38.447 37.052,38 36.5,38 Z' id='Shape'%3E%3C/path%3E%3Cpath d='M36.5,46 L11.5,46 C10.948,46 10.5,46.447 10.5,47 C10.5,47.553 10.948,48 11.5,48 L36.5,48 C37.052,48 37.5,47.553 37.5,47 C37.5,46.447 37.052,46 36.5,46 Z' id='Shape'%3E%3C/path%3E%3Cpath d='M32.914,0 L0.5,0 L0.5,60 L47.5,60 L47.5,14.586 L32.914,0 Z M33.5,3.414 L44.086,14 L33.5,14 L33.5,3.414 Z M2.5,58 L2.5,2 L31.5,2 L31.5,16 L45.5,16 L45.5,58 L2.5,58 Z' id='Shape'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3Cg transform='translate(0.000000, 75.000000)'%3E%3Cg id='Group' fill-rule='nonzero' fill='%23EEEEEE'%3E%3Cpath d='M36.5,22 L11.5,22 C10.948,22 10.5,22.447 10.5,23 C10.5,23.553 10.948,24 11.5,24 L36.5,24 C37.052,24 37.5,23.553 37.5,23 C37.5,22.447 37.052,22 36.5,22 Z' id='Shape'%3E%3C/path%3E%3Cpath d='M36.5,30 L11.5,30 C10.948,30 10.5,30.447 10.5,31 C10.5,31.553 10.948,32 11.5,32 L36.5,32 C37.052,32 37.5,31.553 37.5,31 C37.5,30.447 37.052,30 36.5,30 Z' id='Shape'%3E%3C/path%3E%3Cpath d='M36.5,38 L11.5,38 C10.948,38 10.5,38.447 10.5,39 C10.5,39.553 10.948,40 11.5,40 L36.5,40 C37.052,40 37.5,39.553 37.5,39 C37.5,38.447 37.052,38 36.5,38 Z' id='Shape'%3E%3C/path%3E%3Cpath d='M36.5,46 L11.5,46 C10.948,46 10.5,46.447 10.5,47 C10.5,47.553 10.948,48 11.5,48 L36.5,48 C37.052,48 37.5,47.553 37.5,47 C37.5,46.447 37.052,46 36.5,46 Z' id='Shape'%3E%3C/path%3E%3Cpath d='M32.914,0 L0.5,0 L0.5,60 L47.5,60 L47.5,14.586 L32.914,0 Z M33.5,3.414 L44.086,14 L33.5,14 L33.5,3.414 Z M2.5,58 L2.5,2 L31.5,2 L31.5,16 L45.5,16 L45.5,58 L2.5,58 Z' id='Shape'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3Cg transform='translate(148.000000, 75.000000)'%3E%3Cg id='Group' fill-rule='nonzero' fill='%23EEEEEE'%3E%3Cpath d='M36.5,22 L11.5,22 C10.948,22 10.5,22.447 10.5,23 C10.5,23.553 10.948,24 11.5,24 L36.5,24 C37.052,24 37.5,23.553 37.5,23 C37.5,22.447 37.052,22 36.5,22 Z' id='Shape'%3E%3C/path%3E%3Cpath d='M11.5,16 L21.5,16 C22.052,16 22.5,15.553 22.5,15 C22.5,14.447 22.052,14 21.5,14 L11.5,14 C10.948,14 10.5,14.447 10.5,15 C10.5,15.553 10.948,16 11.5,16 Z' id='Shape'%3E%3C/path%3E%3Cpath d='M36.5,30 L11.5,30 C10.948,30 10.5,30.447 10.5,31 C10.5,31.553 10.948,32 11.5,32 L36.5,32 C37.052,32 37.5,31.553 37.5,31 C37.5,30.447 37.052,30 36.5,30 Z' id='Shape'%3E%3C/path%3E%3Cpath d='M36.5,38 L11.5,38 C10.948,38 10.5,38.447 10.5,39 C10.5,39.553 10.948,40 11.5,40 L36.5,40 C37.052,40 37.5,39.553 37.5,39 C37.5,38.447 37.052,38 36.5,38 Z' id='Shape'%3E%3C/path%3E%3Cpath d='M36.5,46 L11.5,46 C10.948,46 10.5,46.447 10.5,47 C10.5,47.553 10.948,48 11.5,48 L36.5,48 C37.052,48 37.5,47.553 37.5,47 C37.5,46.447 37.052,46 36.5,46 Z' id='Shape'%3E%3C/path%3E%3Cpath d='M32.914,0 L0.5,0 L0.5,60 L47.5,60 L47.5,14.586 L32.914,0 Z M33.5,3.414 L44.086,14 L33.5,14 L33.5,3.414 Z M2.5,58 L2.5,2 L31.5,2 L31.5,16 L45.5,16 L45.5,58 L2.5,58 Z' id='Shape'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
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

  render () {
    const { classes, loading, ...other } = this.props
    const { user } = this.props
    const logged = user && user.data && user.data.user && user.data.user.role === 'USER'
    return (
      <div>
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
        <div className={classes.main}>
          {this.props.children}
        </div>
        <Footer {...other} />
      </div>
    )
  }
}

Layout.propTypes = {
  classes: PropTypes.object.isRequired,
  loading: PropTypes.bool
}

Layout.defaultProps = {
  loading: false,
  user: {}
}

export default withStyles(styles)(Layout)
