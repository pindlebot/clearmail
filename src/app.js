import React from 'react'
import { render } from 'react-dom'
import 'isomorphic-fetch'
import { Route, Switch, Router as BrowserRouter } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'
import { Provider, ReactReduxContext } from 'react-redux'
import { ApolloProvider, withApollo } from 'react-apollo'
import createClient from './lib/apolloClient'
import { store, history } from './lib/redux'
import pages from './pages'
import ValidationErrorsSnackbar from './components/ValidationErrorsSnackbar'
import GraphQLErrorsSnackbar from './components/GraphQLErrorsSnackbar'

import './styles/main.scss'
import 'antd/dist/antd.css'

const App = withApollo(props => (
  <Provider store={store} context={ReactReduxContext}>
    <ConnectedRouter history={history} context={ReactReduxContext}>
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

const client = createClient()

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
)
