import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import { withStyles } from '@material-ui/core/styles'
import ReplyDialogContent from '../ReplyDialogContent'

class ReplyDialog extends React.Component {
  state = {
    alignment: undefined
  }
  handleAlignment = alignment => {
    this.setState({ alignment })
  }
  render () {
    const { classes, ...rest } = this.props
    return (
      <Dialog
        open={this.props.dialog === 'REPLY'}
        onClose={this.props.handleClose}
        fullWidth
        PaperProps={{
          classes: {
            root: classes.dialog
          }
        }}
      >
        <ReplyDialogContent
          {...rest}
        />
      </Dialog>
    )
  }
}

const styles = theme => ({
  dialogContent: {
    minWidth: 660
  },
  dialog: {
    backgroundColor: '#fafafa',
    [theme.breakpoints.down('md')]: {
      height: '100vh',
      width: '100vw'
    },
    [theme.breakpoints.up('md')]: {
      height: '80vh',
      width: '70vw'
    }
  }
})

export default withStyles(styles)(ReplyDialog)
