import React from 'react'
import PropTypes from 'prop-types'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { stableSort, getSorting } from './util'
import DashboardMessagesTableToolbar from '../MessagesTableToolbar'
import Table from 'antd/lib/table'
import './styles.scss'

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

  isSelected = id => this.state.selected.indexOf(id) !== -1

  render () {
    const {
      feed,
      client,
      classes,
      app: {
        limit
      },
      query
    } = this.props
    const { order, orderBy, selected, page } = this.state
    let threads = (feed.threads || []).filter(thread => thread.messages.length)
    const emptyRows = limit - Math.min(limit, threads.length - page * limit)
    const labels = query.variables.filter.labels
    const columns = [{
      title: 'sender',
      dataIndex: 'sender',
      render: (text, row, index) => {
        return (
          <Link to={`/dashboard/${row.key}`}>{text}</Link>
        )
      } 
    }, {
      title: 'subject',
      dataIndex: 'subject'
    }, {
      title: 'date',
      dataIndex: 'date'
    }]

    return (
      <div className={'messageTable'}>
        <DashboardMessagesTableToolbar
          numSelected={selected.length}
          selected={selected}
          client={client}
          handleReplyClick={this.props.handleReplyClick}
          deleteThread={this.props.deleteThread}
          feed={this.props.feed}
          query={this.props.query}
        />
        <div className={'tableWrapper'}>
          <Table 
            showHeader={false}
            className={'table'}
            selectedRowKeys={this.state.selected}
            rowSelection={{
              onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ selected: selectedRowKeys })
              }
            }}
            columns={columns}
            dataSource={
              threads.slice(page * limit, page * limit + limit)
                .map(({ id, messages }) => {
                  let message = messages[0]
                  return {
                    key: id,
                    sender: labels[0] === 'SENT'
                      ? `To: ${message.from[0].emailAddress}`
                      : message.to[0].emailAddress,
                    subject: message.subject,
                    date: formatDateString(message.createdAt) 
                  }
                })
            }
          >
          </Table>
        </div>
        {/*<TablePagination
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
        />*/}
      </div>
    )
  }
}

export default MessagesTable
