import React from 'react'
import { render } from 'react-dom'
import 'isomorphic-fetch'
import { ApolloProvider } from 'react-apollo'
import createClient from './lib/apolloClient'
import './styles/main.scss'
import 'antd/dist/antd.css'

import AppRouter from './Router'

const client = createClient()

render(
  <ApolloProvider client={client}>
    <AppRouter />
  </ApolloProvider>,
  document.getElementById('root')
)
