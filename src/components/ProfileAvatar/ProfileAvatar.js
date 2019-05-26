import React from 'react'
import PropTypes from 'prop-types'
import Avatar from 'antd/lib/avatar'
import styles from './styles.scss'

const createAvatarUrl = () => 'https://avatar.tobi.sh/cj75w3w9w00013i6243n238zr'

const ProfileAvatar = props => {
  return (
    <div className={styles.row}>
      <Avatar alt='Remy Sharp' src={createAvatarUrl()} className={styles.avatar} />
    </div>
  )
}

ProfileAvatar.propTypes = {}

export default ProfileAvatar

