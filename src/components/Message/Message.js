import React from 'react'
import { format } from 'date-fns'
import Button from 'antd/lib/button'
import './styles.scss'
import Card from 'antd/lib/card'
import Icon from 'antd/lib/icon'
import { THREAD_QUERY } from '../../graphql/queries'

const formatDateString = isoDate => {
  return format(new Date(isoDate), 'MMM Mo, YYYY, h:mm A')
}

class MessageCard extends React.Component {
  handleDelete = async () => {
    let { message: { id } } = this.props
    await this.props.deleteMessage({
      variables: { id },
      optimisticResponse: {
        __typename: 'Mutation',
        deleteMessage: {
          __typename: 'Message',
          id: id
        }
      },
      update:(store, { data: { deleteMessage }}) => {
        
        store.writeQuery({
          query: THREAD_QUERY,
          variables: this.props.query.variables,
          data: {
            thread: {
              ...this.props.thread,
              messages: this.props.thread.messages.filter(({ id }) => deleteMessage.id !== id)
            }
          }
        })
      }
    })
  }

  render () {
    const { message } = this.props
    let {
      text,
      from,
      html
    } = message
    let content = html ? window.atob(html) : text

    return (
      <Card
        className={'messageCard'}
        title={from[0]?.emailAddress}
        actions={[
          <Icon type={'heart'} />,
          <Icon type={'enter'} onClick={this.props.handleReplyClick} />,
          <Icon type={'delete'} onClick={this.handleDelete} />
        ]}
      >
        <div dangerouslySetInnerHTML={{ __html: content }} />
        <Button
          onClick={() => {}}
          icon={'more'}
        />
      </Card>
    )
  }
}

export default MessageCard
