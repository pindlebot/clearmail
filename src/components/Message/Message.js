import React from 'react'
import { format } from 'date-fns'
import Button from 'antd/lib/button'
import './styles.scss'
import Card from 'antd/lib/card'
import Icon from 'antd/lib/icon'

const formatDateString = isoDate => {
  return format(new Date(isoDate), 'MMM Mo, YYYY, h:mm A')
}

class MessageCard extends React.Component {
  handleDelete = async () => {
    let { message: { id } } = this.props
    await this.props.deleteThread({
      variables: { id },
      optimisticResponse: {
        __typename: 'Mutation',
        deleteThread: {
          __typename: 'Thread',
          id: id
        }
      }
    })
  }

  render () {
    // formatDateString(message.createdAt)
    const { message } = this.props
    let {
      text,
      source,
      html
    } = message
    let content = html ? window.atob(html) : text

    return (
      <Card
        className={'messageCard'}
        title={source[0]?.emailAddress}
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
