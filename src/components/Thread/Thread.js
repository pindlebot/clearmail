import React from 'react'
import MessageCard from '../Message'
import Button from 'antd/lib/button'
import Tag from 'antd/lib/tag'
import './styles.scss'
class Thread extends React.Component {
  static defaultProps = {
    thread: {
      messages: []
    }
  }
  handleDelete = async () => {
    let { message: { id } } = this.props
    await this.props.deleteThread({
      variables: { id },
      optimisticResponse: {
        __typename: 'Mutation',
        deleteThread: {
          __typename: 'Message',
          id: id
        }
      }
    })
  }

  render () {
    const { classes, ...rest } = this.props
    const { thread: { messages } } = this.props
    if (!(messages && messages.length)) {
      return false
    }
    let [message] = messages
    return (
      <div className={'thread'}>
        <div className={'row'}>
          <div className={'subject'}>
            {message.subject}
          </div>
          {message.labels.map((label, i) => <Tag
            children={label}
            onClick={() => {}}
            key={i}
          />)}
        </div>
        {messages.map(message => (
          <MessageCard
            {...rest}
            message={message}
            key={message.id}
          />
        )
        )}
        <div className={'row'}>
          <Button onClick={this.props.handleReplyClick}>
            Reply
          </Button>
        </div>
      </div>
    )
  }
}

export default Thread
