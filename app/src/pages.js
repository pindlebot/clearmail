import React from 'react'
import withAsync from './withAsync'
import Spinner from './components/Spinner'

const styles = {
  width: '100%',
  minHeight: '100vh',
  backgroundColor: '#29b6f6',
  position: 'absolute',
  padding: '40vh',
  boxSizing: 'border-box',
  top: 0,
  zIndex: 0,
  pointerEvents: 'none'
}

const LoadingOverlay = ({ loading, children }) => (
  <React.Fragment>
    {loading && (
      <div style={{...styles}}>
        <Spinner />
      </div>
    )}
    {children}
  </React.Fragment>
)

LoadingOverlay.defaultProps = {
  loading: true
}

const withAsyncComponent = withAsync(LoadingOverlay)

const Dashboard = withAsyncComponent(() => import('./containers/Dashboard'))
const Login = withAsyncComponent(() => import('./containers/Login'))

export default [{
  render: props => <Login {...props} />,
  path: '/',
  key: 'login',
  exact: true
}, {
  render: props => <Dashboard {...props} />,
  path: '/dashboard/:id?',
  key: 'dashboard'
}, {
  render: props => <p>404</p>,
  key: 'not-found'
}]
