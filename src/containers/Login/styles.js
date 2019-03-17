import pattern from '../../styles/pattern'

export default {
  title: {
    marginBottom: 48
  },
  form: {
    boxShadow: '0 15px 35px rgba(50,50,93,.1), 0 5px 15px rgba(0,0,0,.07)',
    borderRadius: '4px',
    margin: '0 auto',
    // padding: 40,
    backgroundColor: '#fff',
    minWidth: 340,
    minHeight: 340,
    // height: 240,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  formContent: {
    padding: 40
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  background: {
    backgroundColor: '#f5f7f9',
    // backgroundImage: pattern,
    height: '100vh'
  },
  column: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fields: {
    flexBasis: '55%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 40
  }
}
