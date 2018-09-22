import React from 'react'
import MessageCard from '../Message'
import { withStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Chip from '@material-ui/core/Chip'
import Avatar from '@material-ui/core/Avatar'

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

  componentDidMount () {
    this.props.setLoadingState(false)
  }

  render () {
    const { classes, ...rest } = this.props
    const { thread: { messages } } = this.props
    if (!(messages && messages.length)) {
      return false
    }
    let [message] = messages
    return (
      <div className={classes.container}>
        <div className={classes.row}>
          <Typography variant={'title'} gutterBottom>
            {message.subject}
          </Typography>
          {message.labels.map((label, i) => <Chip
            label={label}
            onClick={() => {}}
            onDelete={() => {}}
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
        <div className={classes.row}>
          <Button onClick={this.props.handleReplyClick}>
            Reply
          </Button>
        </div>
      </div>
    )
  }
}

const styles = theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 720,
    margin: '40px auto',
    [theme.breakpoints.down('sm')]: {
      margin: '40px 5%',
    }
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  }
})

export default withStyles(styles)(Thread)
