import { MuiThemeProvider } from '@material-ui/core/styles'
import { Route, Switch } from 'react-router-dom'
import { store, history } from './lib/redux'
import theme from './theme'
import React from 'react'
import { Provider } from 'react-redux'
import pages from './pages'
import { withApollo } from 'react-apollo'
import { ConnectedRouter } from 'connected-react-router'
import ValidationErrorsSnackbar from './components/ValidationErrorsSnackbar'
import GraphQLErrorsSnackbar from './components/GraphQLErrorsSnackbar'

export default withApollo(props => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <MuiThemeProvider theme={theme}>
        <ValidationErrorsSnackbar />
        <GraphQLErrorsSnackbar />
        <Switch>
          {pages.map(props => (
            <Route {...props} />
          ))}
        </Switch>
      </MuiThemeProvider>
    </ConnectedRouter>
  </Provider>
))
