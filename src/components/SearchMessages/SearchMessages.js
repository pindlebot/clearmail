import React from 'react'
import SearchMessagesInput from './SearchMessagesInput'
import SearchIcon from '@material-ui/icons/es/Search'
import { withStyles } from '@material-ui/core/styles'

import PropTypes from 'prop-types'

class SearchMessages extends React.Component {
  static propTypes = {
    handleSearch: PropTypes.func,
    handleChange: PropTypes.func,
    query: PropTypes.string,
    // width: PropTypes.string,
    classes: PropTypes.object
  }

  onKeyDown = keyboardEvent => {
    const { query } = this.props
    switch (keyboardEvent.key) {
      case 'Enter':
        this.props.handleSearch({ query })
        break
      case 'Backspace':
        if (!query) {
          this.props.handleSearch({ query })
        }
    }
  }

  render () {
    const {
      handleChange,
      query,
      classes
    } = this.props
    return (
      <div
        onKeyDown={this.onKeyDown}
        style={{
          display: 'block',
        }}
      >
        <SearchMessagesInput
          margin='none'
          onChange={handleChange}
          value={query}
          adornment={<SearchIcon />}
          className={classes.input}
        />
      </div>
    )
  }
}

const styles = {
  toolbar: {
    justifyContent: 'space-between'
  },
  input: {
    //backgroundColor: '#6cb8ff',
    //border: 'none',
    //color: '#fff'
  }
}

export default withStyles(styles)(SearchMessages)
