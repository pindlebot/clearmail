import React from 'react'
import Modal from 'antd/lib/modal'
import { Mutation } from 'react-apollo'
import ReplyDialogContent from '../ReplyDialogContent'
import { toHtml } from '../ReplyDialogContent/convert'
import gql from 'graphql-tag'
import { EditorState } from 'draft-js'
import { THREAD_QUERY, FEED_QUERY } from '../../graphql/queries'
import uuid from 'uuid/v4'
import { RichUtils } from 'draft-js'

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
      messageId
      attachments {
        id
      }
      thread {
        id
      }
    }
  }
`
class ReplyDialog extends React.Component {
  state = {
    alignment: undefined,
    editorState: EditorState.createEmpty(),
    loading: false,
    subject: '',
    recipients: [''],
    html: ''
  }


  onChange = editorState => {
    this.setState({ editorState })
  }

  update = data => this.setState(data)

  handleAlignment = evt => {
    console.log('handleAlignment', evt)
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        evt.target.value
      )
    )
  }

  handleCancel = () => {
    this.props.handleClose()
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
          messageId: uuid(),
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
    const inlineStyles = this.state.editorState.getCurrentInlineStyle()
    return (
      <Modal
        title={'Compose'}
        visible={typeof this.props.dialog !== 'undefined'}
        onOk={this.sendEmail}
        onCancel={this.handleCancel}
        okText={'Send'}
        width={700}
      >
        <ReplyDialogContent
          {...this.props}
          {...this.state}
          update={this.update}
          sendEmail={this.sendEmail}
          onChange={this.onChange}
          alignment={inlineStyles}
          handleAlignment={this.handleAlignment}
        />
      </Modal>
    )
  }
}

// const styles = theme => ({
//   dialogContent: {
//     minWidth: 660
//   },
//   dialog: {
//     backgroundColor: '#fafafa',
//     [theme.breakpoints.down('md')]: {
//       height: '100vh',
//       width: '100vw'
//     },
//     [theme.breakpoints.up('md')]: {
//       height: '80vh',
//       width: '70vw'
//     }
//   }
// })

export default props => (
  <Mutation mutation={SEND_EMAIL}>
    {mutate =>(
      <ReplyDialog {...props} mutate={mutate} />
    )}
  </Mutation>
)

