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
import AutoComplete from '../AutoComplete'

const QuoteIcon = props => (
  <i>
  <svg width='12' height='12' aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M176 32H64C28.7 32 0 60.7 0 96v128c0 35.3 28.7 64 64 64h64v24c0 30.9-25.1 56-56 56H56c-22.1 0-40 17.9-40 40v32c0 22.1 17.9 40 40 40h16c92.6 0 168-75.4 168-168V96c0-35.3-28.7-64-64-64zm32 280c0 75.1-60.9 136-136 136H56c-4.4 0-8-3.6-8-8v-32c0-4.4 3.6-8 8-8h16c48.6 0 88-39.4 88-88v-56H64c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h112c17.7 0 32 14.3 32 32v216zM448 32H336c-35.3 0-64 28.7-64 64v128c0 35.3 28.7 64 64 64h64v24c0 30.9-25.1 56-56 56h-16c-22.1 0-40 17.9-40 40v32c0 22.1 17.9 40 40 40h16c92.6 0 168-75.4 168-168V96c0-35.3-28.7-64-64-64zm32 280c0 75.1-60.9 136-136 136h-16c-4.4 0-8-3.6-8-8v-32c0-4.4 3.6-8 8-8h16c48.6 0 88-39.4 88-88v-56h-96c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h112c17.7 0 32 14.3 32 32v216z"></path></svg>
  </i>
)

class ReplyDialogContent extends React.Component {
  ref = React.createRef()

  componentDidMount () {
    this.ref.current.focus()
    const { thread } = this.props
    if (!thread) return
    let { messages } = thread
    let [message] = messages
    if (message) {
      const {
        subject,
        from,
      } = message
      let html = window.atob(message.html) || message.text
      let formattedDate = format(new Date(message.createdAt), 'ddd, MMM D, YYYY at h:mm')
      let formatted = `On ${formattedDate} &#60;${from[0].emailAddress}&#62; wrote:`
      let recipients = from.map(({ emailAddress }) => emailAddress)
      this.props.updateDraft({
        subject: subject,
        recipients,
        html: `${formatted}<br /><blockquote>${html}</blockquote>`
      })
    }
    this.ref.current.editor.addEventListener('blur', this.onBlur, true)
  }

  handleSubjectChange = evt => {
    this.props.updateDraft({
      subject: evt.target.value
    })
  }

  preventBubbles = evt => {
    console.log(evt)
    evt.preventDefault()
  }

  onBlur = evt => {
    console.log('onBlur', evt)
  }

  handleAlignment = evt => {
    evt.preventDefault()
    evt.stopPropagation()
    this.props.handleAlignment(evt)
  }

  render () {
    const { draft, alignment } = this.props
    console.log(this.props)
    return (
      <React.Fragment>
        <div className={'formContainer'}>
          <AutoComplete {...this.props} />
          <Input
            addonAfter={<Icon type="mail" />}
            onChange={this.handleSubjectChange}
            value={draft.subject}
            placeholder={'Subject'}
          />
        </div>
        <div>
          <Radio.Group
            onChange={this.handleAlignment}
            className={'toggleButtonGroup'}
            onClick={this.preventBubbles}
            value={alignment.toArray()}
          >
            <Radio.Button
              value={'LIST'}
              className={'toggleButton'}
              checked={alignment.has('LIST')}
            >
              <Icon type={'ordered-list'} />
            </Radio.Button>
            <Radio.Button
              value={'QUOTE'}
              className={'toggleButton'}
              checked={alignment.has('BLOCKQUOTE')}
            >
              <QuoteIcon />
            </Radio.Button>
            <Radio.Button
              value={'BOLD'}
              className={'toggleButton'}
              checked={alignment.has('BOLD')}
            >
              <Icon type={'bold'} />
            </Radio.Button>
            <Radio.Button
              value={'ITALIC'}
              className={'toggleButton'}
              checked={alignment.has('ITALIC')}
            >
              <Icon type={'italic'} />
            </Radio.Button>
          </Radio.Group>
        </div>
        <div className={classnames('editor')}>
          <Editor
            editorState={this.props.editorState}
            onChange={this.props.onChange}
            blockRenderMap={customBlockRenderMap}
            ref={this.ref}
          />
          <div dangerouslySetInnerHTML={{
            __html: draft.html
          }} />
        </div>
      </React.Fragment>
    )
  }
}

export default ReplyDialogContent
