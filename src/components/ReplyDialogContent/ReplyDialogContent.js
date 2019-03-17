import React from 'react'
import {
  Editor,
  EditorState,
  convertFromHTML
} from 'draft-js'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import 'draft-js/dist/Draft.css'
import customBlockRenderMap from './customBlockRenderMap'
import './editor.scss'
import classnames from 'classnames'
import { toHtml } from './convert'
import { THREAD_QUERY, FEED_QUERY } from '../../graphql/queries'
import uuid from 'uuid/v4'
import format from 'date-fns/format'
import Input from 'antd/lib/input'
import Icon from 'antd/lib/icon'
import Radio from 'antd/lib/radio'
import Button from 'antd/lib/button'

const QuoteIcon = props => (
  <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M176 32H64C28.7 32 0 60.7 0 96v128c0 35.3 28.7 64 64 64h64v24c0 30.9-25.1 56-56 56H56c-22.1 0-40 17.9-40 40v32c0 22.1 17.9 40 40 40h16c92.6 0 168-75.4 168-168V96c0-35.3-28.7-64-64-64zm32 280c0 75.1-60.9 136-136 136H56c-4.4 0-8-3.6-8-8v-32c0-4.4 3.6-8 8-8h16c48.6 0 88-39.4 88-88v-56H64c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h112c17.7 0 32 14.3 32 32v216zM448 32H336c-35.3 0-64 28.7-64 64v128c0 35.3 28.7 64 64 64h64v24c0 30.9-25.1 56-56 56h-16c-22.1 0-40 17.9-40 40v32c0 22.1 17.9 40 40 40h16c92.6 0 168-75.4 168-168V96c0-35.3-28.7-64-64-64zm32 280c0 75.1-60.9 136-136 136h-16c-4.4 0-8-3.6-8-8v-32c0-4.4 3.6-8 8-8h16c48.6 0 88-39.4 88-88v-56h-96c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h112c17.7 0 32 14.3 32 32v216z"></path></svg>
)

const SEND_EMAIL = gql`
  mutation($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      createdAt
      source
      destination
      subject
      text
      snippet
      labels
      html
      attachments {
        id
      }
      thread {
        id
      }
    }
  }
`
class ReplyDialogContent extends React.Component {
  componentDidMount () {
    const { thread } = this.props
    if (!thread) return
    let { messages } = thread
    let [message] = messages
    if (message) {
      const {
        subject,
        source,
      } = message
      let html = window.atob(message.html) || message.text
      let formattedDate = format(new Date(message.createdAt), 'ddd, MMM D, YYYY at h:mm')
      let formatted = `On ${formattedDate} &#60;${source[0].emailAddress}&#62; wrote:`
      let recipients = source.map(({ emailAddress }) => emailAddress)
      this.props.update({
        subject: subject,
        recipients,
        html: `${formatted}<br /><blockquote>${html}</blockquote>`
      })
    }
  }

  handleRecipientsChange = evt => {
    this.props.update({
      recipients: evt.target.value.split(/,\s*/g).map(addr => addr.trim())
    })
  }

  handleSubjectChange = evt => {
    this.props.update({
      subject: evt.target.value
    })
  }

  render () {
    const { subject, recipients } = this.props
    return (
      <React.Fragment>
        <div className={'formContainer'}>
          <Input
            addonAfter={<Icon type="mail" />}
            onChange={this.handleRecipientsChange}
            value={recipients.join(', ')}
            placeholder={'Recipient'}
          />
          <Input
            addonAfter={<Icon type="mail" />}
            onChange={this.handleSubjectChange}
            value={subject}
            placeholder={'Subject'}
          />
        </div>
        <div>
          <Radio.Group
            value={this.props.alignment}
            onChange={this.props.handleAlignment}
            className={'toggleButtonGroup'}
          >
            <Radio.Button value={'list'} className={'toggleButton'}>
              <Icon type={'ordered-list'} />
            </Radio.Button>
            <Radio.Button value={'quote'} className={'toggleButton'}>
              <QuoteIcon />
            </Radio.Button>
            <Radio.Button value={'bold'} className={'toggleButton'}>
              <Icon type={'bold'} />
            </Radio.Button>
            <Radio.Button value={'italic'} className={'toggleButton'}>
              <Icon type={'italic'} />
            </Radio.Button>
          </Radio.Group>
        </div>
        <div className={classnames('editor')}>
          <Editor
            editorState={this.props.editorState}
            onChange={this.props.onChange}
            blockRenderMap={customBlockRenderMap}
            autoFocus
          />
          <div dangerouslySetInnerHTML={{ __html: this.props.html }} />
        </div>
      </React.Fragment>
    )
  }
}

export default ReplyDialogContent
