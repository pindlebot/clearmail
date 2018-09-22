let { UP_STAGE } = process.env
UP_STAGE = UP_STAGE.endsWith('/') ? UP_STAGE.slice(0, UP_STAGE.length - 1) : UP_STAGE

export const APP_NAME = 'clearmail.co'
export const SESSION_ENDPOINT = `${UP_STAGE}/token`
export const GRAPHQL_ENDPOINT = `${UP_STAGE}/graphql`

export default {
  APP_NAME,
  SESSION_ENDPOINT,
  GRAPHQL_ENDPOINT
}
