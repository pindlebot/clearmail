import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { FEED_QUERY } from '../../graphql/queries';
import Button from 'antd/lib/button'
import styles from './styles.scss'

class DashboardMessagesTableToolbar extends React.Component {
  static propTypes = {
    numSelected: PropTypes.number.isRequired
  }

  handleDelete = async () => {
    const { selected, client, query, query: { data: { feed } } } = this.props
    let promises = Promise.all(
      selected.map(id => this.props.deleteThread({
        variables: { id },
        optimisticResponse: {
          __typename: 'Mutation',
          deleteThread: {
            __typename: 'Thread',
            id: id
          }
        },
        update:(store, { data: { deleteThread }}) => {
          store.writeQuery({
            query: FEED_QUERY,
            variables: query.variables,
            data: {
              feed: {
                ...feed,
                threads: feed.threads.filter(({ id }) => !selected.includes(id))
              }
            }
          })
        }
      }))
    )

    await promises
  }

  render () {
    const { numSelected, selected, classes } = this.props
    return (
      <div
        className={classNames(styles.root, {
          [styles.highlight]: numSelected > 0,
        })}
      >
        <div className={styles.title}>
          {numSelected > 0 ? (
            <div>
              {numSelected} selected
            </div>
          ) : (
            <div>
              Inbox
            </div>
          )}
        </div>
        <div className={styles.spacer} />
        <div className={styles.actions}>
          <Button onClick={this.props.handleReplyClick} icon={'plus'} shape="circle" />
          {numSelected > 0 ? (
            <Button aria-label='Delete' onClick={this.handleDelete} icon={'delete'} shape="circle" />
          ) : (
            <Button aria-label='Filter list' icon={'filter'} shape={'circle'} />
          )}
        </div>
      </div>
    )
  }
}

export default DashboardMessagesTableToolbar

