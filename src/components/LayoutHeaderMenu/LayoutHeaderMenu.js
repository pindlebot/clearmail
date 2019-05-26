import React from 'react'
import PropTypes from 'prop-types'
import Button from 'antd/lib/button'
import Menu from 'antd/lib/menu'
import Dropdown from 'antd/lib/dropdown'
import ProfileAvatar from '../ProfileAvatar'
import styles from './styles.scss'

class AppBarMenu extends React.Component {
  state = {
    open: false,
    anchorEl: undefined
  }

  handleClick = (event) => {
    this.setState({ open: true, anchorEl: event.currentTarget })
  }

  handleClose = () => {
    this.setState({ open: false, anchorEl: undefined })
  }

  renderMenu = () => {
    const { classes } = this.props
    return [
      this.props.logged
        ? (
          <Menu.Item
            className={styles.item}
            onClick={this.props.signout}
            key={0}
          >
            Logout
          </Menu.Item>
        ) : (
          <Menu.Item
            className={styles.item}
            onClick={this.props.login}
            key={1}>Login</Menu.Item>
        )
    ]
  }

  render () {
    const { open } = this.state
    const { landing, classes } = this.props
    const menu = (
      <Menu>
        {this.renderMenu()}
      </Menu>
    )
    return (
      <div className={styles.root}>
        <ProfileAvatar />
        <Dropdown overlay={menu} trigger={['click']}>
          <Button
            onClick={this.handleClick}
            icon={'more'}
          >
          </Button>
        </Dropdown>
      </div>
    )
  }
}

AppBarMenu.propTypes = {
  data: PropTypes.object,
  logged: PropTypes.bool,
  landing: PropTypes.bool
}

AppBarMenu.defaultProps = {
  logged: false,
  landing: false
}

export default AppBarMenu
