let { UP_STAGE } = process.env
UP_STAGE = UP_STAGE.endsWith('/') ? UP_STAGE.slice(0, UP_STAGE.length - 1) : UP_STAGE

export const APP_NAME = 'clearmail.co'
// export const SESSION_ENDPOINT = `${UP_STAGE}/token`
// export const GRAPHQL_ENDPOINT = `${UP_STAGE}/graphql`
export const GRAPHQL_ENDPOINT = 'https://s7pxxuz4t1.execute-api.us-east-1.amazonaws.com/prod/graphql'

export default {
  APP_NAME,
  GRAPHQL_ENDPOINT
}
