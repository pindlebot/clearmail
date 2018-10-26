import React from 'react'
import FavoriteIcon from '@material-ui/icons/Favorite'
import IconButton from '@material-ui/core/IconButton'
import ReplyIcon from '@material-ui/icons/Reply'
import DeleteIcon from '@material-ui/icons/Delete'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import { withStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core';
import { format } from 'date-fns'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'

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
    const { message, classes } = this.props
    let {
      text,
      source,
      html
    } = message
    let content = html ? window.atob(html) : text

    return (
      <Card className={classes.card}>
        <div className={classes.row}>
          <div className={classes.column}>
            <Typography variant={'subheading'}>
              {source[0].emailAddress}
            </Typography>
          </div>
          <div className={classes.column}>
            <Typography variant={'body1'}>
              {formatDateString(message.createdAt)}
            </Typography>
          </div>
          <div>
            <IconButton aria-label={'Add to favorites'}>
              <FavoriteIcon color={'primary'} />
            </IconButton>
            <IconButton aria-label={'Reply'} onClick={this.props.handleReplyClick}>
              <ReplyIcon color={'primary'} />
            </IconButton>
            <IconButton aria-label={'Delete'} onClick={this.handleDelete}>
              <DeleteIcon color={'primary'} />
            </IconButton>
          </div>
        </div>
        <CardContent>
          <div dangerouslySetInnerHTML={{ __html: content }} />
          <IconButton
            onClick={() => {}}
          >
            <MoreHorizIcon />
          </IconButton>
        </CardContent>
      </Card>
    )
  }
}

const styles = {
  card: {
    marginBottom: 20
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 20px'
  }
}
export default withStyles(styles)(MessageCard)
