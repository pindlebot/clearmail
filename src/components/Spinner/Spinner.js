import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

const styles = {
  // '@global': {
  //  body: {
  //    backgroundColor: '#29b6f6'
  //  }
  // },
  progress: {
    margin: '0 auto 0 auto',
    color: '#8898AA'
  },
  fullPage: {
    position: 'absolute',
    top: 'calc(50vh - 13px)',
    left: 'calc(50vw - 50px)',
    opacity: '0.9 !important'
  },
  icon: {
    margin: '0'
  },
  spinner: {
    width: 100,
    textAlign: 'center'
  },
  bounce: {
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: '100%',
    display: 'inline-block',
    animation: 'sk-bouncedelay 1.4s infinite ease-in-out both',
    marginRight: 10
  },
  '@keyframes sk-bouncedelay': {
    '0%, 80%, 100%': {
      transform: 'scale(0)'
    },
    '40%': {
      transform: 'scale(1.0)'
    }
  },
  bounce1: {
    animationDelay: '-0.32s'
  },
  bounce2: {
    animationDelay: '-0.16s'
  },
  bounce3: {}
}

const Spinner = props => {
  const {
    fullPage
  } = props
  return (
    <div style={{}}>
      <div style={styles.spinner}>
        <div style={{ ...styles.bounce, ...classes.bounce1}} />
        <div style={{ ...styles.bounce, ...classes.bounce2}} />
        <div style={{ ...styles.bounce, ...classes.bounce3}} />
      </div>
    </div>
  )
}

Spinner.propTypes = {
  fullPage: PropTypes.bool
}

Spinner.defaultProps = {
  fullPage: true
}

export default Spinner