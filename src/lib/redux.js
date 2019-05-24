import * as redux from 'redux'
import { routerMiddleware, connectRouter } from 'connected-react-router'
import { createBrowserHistory } from 'history'
import { composeWithDevTools } from 'redux-devtools-extension'

export const history = createBrowserHistory({ basename: process.env.UP_STAGE || '' })

const initialState = {
  loading: true,
  snackbar: {
    show: true
  },
  validationErrors: {},
  graphQLErrors: [],
  location: null,
  cusrsor: undefined,
  limit: 10,
  query: '',
  filter: ['INBOX'],
  draft: {
    subject: '',
    html: '',
    recipients: []
  }
}

const SET_CURSOR = 'SET_CURSOR'
const SET_LOADING_STATE = 'SET_LOADING_STATE'
const SHOW_SNACKBAR = 'SHOW_SNACKBAR'
const CLEAR_SNACKBAR = 'CLEAR_SNACKBAR'
const SET_VALIDATION_ERROR = 'SET_VALIDATION_ERRORS'
const CLEAR_VALIDATION_ERROR = 'CLEAR_VALIDATION_ERROR'
const SET_GRAPHQL_ERRORS = 'SET_GRAPHQL_ERRORS'
const CLEAR_GRAPHQL_ERRORS = 'CLEAR_GRAPHQL_ERRORS'
const ROUTER_LOCATION_CHANGE = '@@router/LOCATION_CHANGE'
const SET_LOCATION = 'SET_LOCATION'
const SET_LIMIT = 'SET_LIMIT'
const SET_QUERY = 'SET_QUERY'
const SET_DRAFT_RECIPIENTS = 'SET_DRAFT_RECIPIENTS'
const UPDATE_DRAFT = 'UPDATE_DRAFT'

export const setLocation = payload => ({
  type: SET_LOCATION,
  payload
})

export const setLoadingState = payload => ({
  type: SET_LOADING_STATE,
  payload
})

export const setValidationError = payload => ({
  type: SET_VALIDATION_ERROR,
  payload
})

export const clearValidationError = payload => ({
  type: CLEAR_VALIDATION_ERROR,
  payload
})

export const setGraphQLErrors = payload => ({
  type: SET_GRAPHQL_ERRORS,
  payload
})

export const clearGraphQLErrors = payload => ({
  type: CLEAR_GRAPHQL_ERRORS,
  payload
})

export const setDraftRecipients = payload => ({
  type: SET_DRAFT_RECIPIENTS,
  payload
})

export const updateDraft = payload => ({
  type: UPDATE_DRAFT,
  payload
})

export const reducer = (state = initialState, action) => {

  switch (action.type) {
    case SET_QUERY:
      return {
        ...state,
        filter: action.payload.filter || state.filter,
        query: action.payload.query || ''
      }
    case SET_LIMIT:
      return {
        ...state,
        limit: action.payload
      }
    case SET_LOCATION:
      return {
        ...state,
        location: action.payload
      }
    case ROUTER_LOCATION_CHANGE:
      return {
        ...state,
        location: action.payload.location.pathname !== '/login'
          ? null
          : state.location,
        loading: true
      }
    case SET_GRAPHQL_ERRORS:
      return {
        ...state,
        graphQLErrors: action.payload,
        snackbar: {
          show: true
        }
      }
    case CLEAR_GRAPHQL_ERRORS:
      return {
        ...state,
        graphQLErrors: [],
        snackbar: {
          show: true
        }
      }
    case SET_VALIDATION_ERROR:
      return {
        ...state,
        validationErrors: {
          ...(state.validationErrors || {}),
          ...action.payload
        }
      }
    case CLEAR_VALIDATION_ERROR:
      let { validationErrors } = state
      delete validationErrors[action.payload]
      return {
        ...state,
        validationErrors,
        snackbar: {
          show: true
        }
      }
    case CLEAR_SNACKBAR:
      return {
        ...state,
        snackbar: {
          show: false
        }
      }
    case SHOW_SNACKBAR:
      return {
        ...state,
        snackbar: {
          show: true
        }
      }
    case SET_LOADING_STATE:
      return {
        ...state,
        loading: action.payload
      }
    case SET_DRAFT_RECIPIENTS:
      return {
        ...state,
        draft: {
          ...state.draft,
          recipients: action.payload
        }
      }
    case UPDATE_DRAFT:
      return {
        ...state,
        draft: {
          ...state.draft,
          ...action.payload
        }
      }
    default:
      return state
  }
}

export const rootReducer = redux.combineReducers({
  root: reducer,
  router: connectRouter(history)
})

export const store = redux.createStore(
  rootReducer,
  composeWithDevTools(
    redux.applyMiddleware(
      routerMiddleware(history)
    )
  )
)
