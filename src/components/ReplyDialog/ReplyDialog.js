import React from 'react'
import Modal from 'antd/lib/modal'
import { Mutation, compose, withApollo } from 'react-apollo'
import ReplyDialogContent from '../ReplyDialogContent'
import { toHtml } from '../ReplyDialogContent/convert'
import gql from 'graphql-tag'
import { EditorState, RichUtils } from 'draft-js'
import { THREAD_QUERY, FEED_QUERY } from '../../graphql/queries'
import uuid from 'uuid/v4'
import { connect } from 'react-redux'
import { updateDraft, setDraftRecipients } from '../../lib/redux'
import format from 'date-fns/format'

const SEND_EMAIL = gql`
  mutation($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      createdAt
      subject
      text
      snippet
      labels
      html
      messageId
      source
      destination
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
    loading: false
  }
  
  componentDidUpdate (prevProps) {
    const { thread } = this.props
    if (thread && !prevProps.thread) {
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
        this.props.updateDraft({
          subject: subject,
          recipients,
          html: `${formatted}<br /><blockquote>${html}</blockquote>`
        })
      }
    }
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
      draft,
      user: {
        data: {
          user: {
            emailAddress,
            id: userId
          }
        }
      }
    } = this.props
    const { editorState } = this.state
    const currentContent = editorState.getCurrentContent()
    let html = toHtml(currentContent)
    if (draft.html) {
      html = `${html}<br />${draft.html}`
    }
    const text = currentContent.getPlainText('\n')
    const snippet = currentContent.getPlainText('\n')
    const encoded = window.btoa(html)
    const input = {
      source: [emailAddress],
      destination: draft.recipients,
      html: encoded,
      text: text,
      subject: draft.subject,
      snippet: snippet
    }
    const { data: { feed, thread }, variables } = query

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
          destination: draft.recipients
            .map(emailAddress => ({ emailAddress })),
          source: [{
            emailAddress
          }],
          createdAt: new Date().toISOString(),
          html: encoded,
          text: text,
          subject: draft.subject,
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

const ReplyDialogWithMutation = props => (
  <Mutation mutation={SEND_EMAIL}>
    {mutate => (
      <ReplyDialog {...props} mutate={mutate} />
    )}
  </Mutation>
)

export default compose(
  connect(
    state => ({
      draft: state.root.draft
    }),
    {
      updateDraft,
      setDraftRecipients
    }
  ),
  withApollo
)(ReplyDialogWithMutation)

