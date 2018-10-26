import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Checkbox from '@material-ui/core/Checkbox'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { stableSort, getSorting } from './util'
import DashboardMessagesTableHead from '../MessagesTableHead'
import DashboardMessagesTableToolbar from '../MessagesTableToolbar'

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 960
  },
  tableWrapper: {
    overflowX: 'auto'
  }
})

const formatDateString = isoDate => {
  let date = new Date(isoDate)
  if (
    date.getDate() === new Date().getDay() &&
    date.getFullYear() === new Date().getFullYear()
  ) {
    return format(date, 'h a')
  }
  return format(date, 'MMM Mo')
}

class MessagesTable extends React.Component {
  state = {
    order: 'asc',
    orderBy: 'date',
    selected: [],
    page: 0,
  }

  static propTypes = {
    classes: PropTypes.object.isRequired
  }

  static defaultProps = {
    feed: {
      threads: []
    }
  }

  handleRequestSort = (event, property) => {
    const orderBy = property
    let order = 'desc'

    if (
      this.state.orderBy === property &&
      this.state.order === 'desc'
    ) {
      order = 'asc'
    }

    this.setState({ order, orderBy })
  }

  handleSelectAllClick = event => {
    if (event.target.checked) {
      const { page } = this.state
      let { app: { limit }, feed: { threads } } = this.props
      this.setState(state => ({
        selected: threads.slice(page * limit, page * limit + limit).map(({ id }) => id)
      }))
      return
    }
    this.setState({ selected: [] })
  }

  handleClick = (event, id) => {
    const { selected } = this.state
    const selectedIndex = selected.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }

    this.setState({ selected: newSelected })
  }

  handleChangePage = (event, page) => {
    if (this.state.page < page) {
      if (this.props.feed.threads.length % this.props.app.limit === 0) {
        this.props.fetchMore()
      }
    }
    this.setState({ page })
  }

  handleChangeRowsPerPage = event => {
    this.props.setLimit(event.target.value)
  }

  componentDidMount () {
    this.props.setLoadingState(false)
  }

  isSelected = id => this.state.selected.indexOf(id) !== -1

  render () {
    const {
      feed,
      client,
      classes,
      app: {
        limit
      }
    } = this.props
    const { order, orderBy, selected, page } = this.state
    let threads = (feed.threads || []).filter(thread => thread.messages.length)
    const emptyRows = limit - Math.min(limit, threads.length - page * limit)
    return (
      <Paper className={classes.root}>
        <DashboardMessagesTableToolbar
          numSelected={selected.length}
          selected={selected}
          client={client}
          handleReplyClick={this.props.handleReplyClick}
          deleteThread={this.props.deleteThread}
          feed={this.props.feed}
          query={this.props.query}
        />
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby='emails'>
            <DashboardMessagesTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={threads.length}
            />
            <TableBody>
              {threads.slice(page * limit, page * limit + limit)
                .map(({ id, messages }) => {
                  let message = messages[0]
                  const isSelected = this.isSelected(id)
                  return (
                    <TableRow
                      hover
                      onClick={event => this.handleClick(event, id)}
                      role='checkbox'
                      aria-checked={isSelected}
                      tabIndex={-1}
                      key={id}
                      selected={isSelected}
                    >
                      <TableCell padding='checkbox'>
                        <Checkbox checked={isSelected} />
                      </TableCell>
                      <TableCell padding={'none'}>
                        {message.source[0].emailAddress}
                      </TableCell>
                      <TableCell padding={'none'}>
                        <Link to={`/dashboard/${id}`}>
                          {message.subject}
                        </Link>
                      </TableCell>
                      <TableCell padding={'none'}>{formatDateString(message.createdAt)}</TableCell>
                    </TableRow>
                  )
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          component='div'
          count={1000}
          rowsPerPage={limit}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page'
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page'
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    )
  }
}

export default withStyles(styles)(MessagesTable)
