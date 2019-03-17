import { Route, Switch } from 'react-router-dom'
import React from 'react'
import { withApollo } from 'react-apollo'
import { ConnectedRouter } from 'connected-react-router'
import { Provider } from 'react-redux'

import { store, history } from './lib/redux'
import pages from './pages'
import ValidationErrorsSnackbar from './components/ValidationErrorsSnackbar'
import GraphQLErrorsSnackbar from './components/GraphQLErrorsSnackbar'

export default withApollo(props => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <React.Suspense timeout={3000} fallback={<div />}>
        <ValidationErrorsSnackbar />
        <GraphQLErrorsSnackbar />
        <Switch>
          {pages.map(props => (
            <Route {...props} />
          ))}
        </Switch>
      </React.Suspense>
    </ConnectedRouter>
  </Provider>
))
