import React from 'react'
import AntDAutoComplete from 'antd/lib/auto-complete'
import Input from 'antd/lib/input'
import Icon from 'antd/lib/icon'
import { Query, withApollo, compose } from 'react-apollo'
import classnames from 'classnames'
import { connect } from 'react-redux'
import gql from 'graphql-tag'
import { setMessageRecipients } from '../../lib/redux'
import { Select } from 'antd';
import debounce from 'lodash.debounce'

class AutoComplete extends React.Component {
  state = {
    options: [],
    focused: false
  }

  onSelect = value => {
    this.props.setDraftRecipients(
      this.props.draft.recipients.concat([value])
    )
  }

  handleSearch = debounce(async query => {
    if (query.length > 2) {
      const { data } = await this.props.client.query({
        query: gql`
          query ($emailAddress: String!) {
            lookupAddresses(emailAddress: $emailAddress) {
              emailAddress
              name
              id
            }
          }
        `,
        variables: { emailAddress: query }
      })
      
      this.setState({
        options: data.lookupAddresses || []
      })
    }
  }, 300)

  handleChange = value => {
    this.props.setDraftRecipients(value)
  }

  render() {
    const value = this.props.draft.recipients 
    console.log({ value })
    return(
      <Select
        mode={'tags'}
        style={{ width: '100%' }}
        onSelect={this.onSelect}
        placeholder={'To'}
        onChange={this.handleChange}
        defaultValue={value}
        tokenSeparators={[',']}
        onSearch={this.handleSearch}
      >
        {this.state.options.map(recipient => 
          <Select.Option key={recipient.emailAddress}>{recipient.emailAddress}</Select.Option>
        )}
      </Select>
    )
  }
}

export default AutoComplete