import React from 'react'
import Input from 'antd/lib/input'

import PropTypes from 'prop-types'

class SearchMessages extends React.Component {
  static propTypes = {
    handleSearch: PropTypes.func,
    handleChange: PropTypes.func,
    query: PropTypes.string
  }

  onSearch = query => this.props.handleSearch({ query })

  render () {
    const {
      handleChange,
      query,
    } = this.props
    return (
      <Input.Search
        placeholder="input search text"
        onSearch={this.onSearch}
        enterButton
      />
    )
  }
}

export default SearchMessages
