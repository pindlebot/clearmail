import React from 'react'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import {
  Editor,
  EditorState,
  convertFromHTML
} from 'draft-js'
import { withStyles } from '@material-ui/core/styles'
import ToggleButton, { ToggleButtonGroup } from '@material-ui/lab/ToggleButton'
import ListIcon from '@material-ui/icons/List'
import FormatBoldIcon from '@material-ui/icons/FormatBold'
import FormatItalicIcon from '@material-ui/icons/FormatItalic'
import FormatQuoteIcon from '@material-ui/icons/FormatQuote'
import Button from '@material-ui/core/Button'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import 'draft-js/dist/Draft.css'
import Input from '@material-ui/core/Input'
import FormControl from '@material-ui/core/FormControl'
import EmailIcon from '@material-ui/icons/Email'
import SubjectIcon from '@material-ui/icons/Subject'
import InputAdornment from '@material-ui/core/InputAdornment'
import customBlockRenderMap from './customBlockRenderMap'
import './editor.scss'
import classnames from 'classnames'
import { toHtml } from './convert'
import { THREAD_QUERY, FEED_QUERY } from '../../graphql/queries'
import uuid from 'uuid/v4'
import format from 'date-fns/format'

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
      thread {
        id
      }
    }
  }
`

const dialogContentStyles = {
  toggleButtonGroup: {},
  editor: {
    minHeight: '200px'
  },
  toggleButton: {
    padding: '6px 0px'
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    minHeight: '120px'
  },
  adornment: {
    marginRight: '8px'
  }
}

class ReplyDialogContent extends React.Component {
  state = {
    editorState: EditorState.createEmpty(),
    loading: false,
    subject: '',
    recipients: [''],
    html: ''
  }

  onChange = editorState => {
    this.setState({ editorState })
  }

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
      console.log(html)
      let formattedDate = format(new Date(message.createdAt), 'ddd, MMM D, YYYY at h:mm')
      let formatted = `On ${formattedDate} &#60;${source[0].emailAddress}&#62; wrote:`
      let recipients = source.map(({ emailAddress }) => emailAddress)
      this.setState({
        subject: subject,
        recipients,
        html: `${formatted}<br /><blockquote>${html}</blockquote>`
      })
    }
  }

  handleRecipientsChange = evt => {
    this.setState({
      recipients: evt.target.value.split(/,\s*/g).map(addr => addr.trim())
    })
  }

  handleSubjectChange = evt => {
    this.setState({
      subject: evt.target.value
    })
  }

  sendEmail = (evt) => {
    this.props.handleClose()
    const {
      query,
      user: {
        data: {
          user: {
            emailAddress,
            id: userId
          }
        }
      }
    } = this.props
    let { editorState, subject, recipients } = this.state
    let currentContent = editorState.getCurrentContent()
    let html = toHtml(currentContent)
    if (this.state.html) {
      html = `${html}<br />${this.state.html}`
    }
    let text = currentContent.getPlainText('\n')
    let snippet = currentContent.getPlainText('\n')
    let encoded = window.btoa(html)
    const input = {
      source: [emailAddress],
      destination: recipients,
      html: encoded,
      text: text,
      subject: subject,
      snippet: snippet
    }
    let { data: { feed, thread }, variables } = query

    if (thread) {
      input.thread = thread.id
    }

    this.props.mutate({
      variables: {
        input
      },
      optimisticResponse: {
        __typename: 'Mutation',
        sendMessage: {
          __typename: 'Message',
          id: uuid(),
          user: userId,
          destination: recipients.map(emailAddress => ({ emailAddress })),
          source: [{
            emailAddress
          }],
          createdAt: new Date().toISOString(),
          html: encoded,
          text: text,
          subject,
          labels: ['SENT'],
          snippet: snippet,
          thread: {
            __typename: 'Thread',
            id: input.thread || uuid()
          },
          attachments: []
        }
      },
      update: (store, { data: { sendMessage } }) => {
        store.writeQuery(
          thread
            ? {
              query: THREAD_QUERY,
              data: {
                thread: {
                  ...thread,
                  messages: thread.messages.concat(sendMessage)
                }
              },
              variables
            }
            : {
              query: FEED_QUERY,
              data: {
                feed: {
                  ...feed,
                  threads: [{
                    ...sendMessage.thread,
                    messages: sendMessage
                  }].concat(feed.threads)
                }
              },
              variables
            }
        )
      }
    }).then(() => {
      console.log('SENT')
    })
  }
  render () {
    console.log(this.props)
    const { classes } = this.props
    const { subject, recipients } = this.state
    return (
      <React.Fragment>
        <DialogContent>
          <div className={classes.formContainer}>
            <FormControl fullWidth>
              <Input
                type={'text'}
                value={recipients.join(', ')}
                onChange={this.handleRecipientsChange}
                disabled={this.state.disabled}
                disableUnderline
                endAdornment={
                  <InputAdornment position='end' className={classes.adornment}>
                    <EmailIcon />
                  </InputAdornment>
                }
                placeholder={'Recipients'}
              />
            </FormControl>
            <FormControl fullWidth>
              <Input
                type={'text'}
                value={subject}
                onChange={this.handleSubjectChange}
                disabled={this.state.disabled}
                disableUnderline
                endAdornment={
                  <InputAdornment position='end' className={classes.adornment}>
                    <SubjectIcon />
                  </InputAdornment>
                }
                placeholder={'Subject'}
              />
            </FormControl>
          </div>
          <div>
            <ToggleButtonGroup
              value={this.state.alignment}
              exclusive
              onChange={this.handleAlignment}
              className={this.props.classes.toggleButtonGroup}
            >
              <ToggleButton value={'list'} className={classes.toggleButton}>
                <ListIcon />
              </ToggleButton>
              <ToggleButton value={'quote'} className={classes.toggleButton}>
                <FormatQuoteIcon />
              </ToggleButton>
              <ToggleButton value={'bold'} className={classes.toggleButton}>
                <FormatBoldIcon />
              </ToggleButton>
              <ToggleButton value={'italic'} className={classes.toggleButton}>
                <FormatItalicIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className={classnames(classes.editor, 'editor')}>
            <Editor
              editorState={this.state.editorState}
              onChange={this.onChange}
              blockRenderMap={customBlockRenderMap}
              autoFocus
            />
            <div
              dangerouslySetInnerHTML={{ __html: this.state.html }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.sendEmail}>Send</Button>
        </DialogActions>
      </React.Fragment>
    )
  }
}

const Wrapper = props => (
  <Mutation mutation={SEND_EMAIL}>
    {mutate => {
      return (
        <ReplyDialogContent {...props} mutate={mutate} />
      )
    }}
  </Mutation>
)

export default withStyles(dialogContentStyles)(Wrapper)
