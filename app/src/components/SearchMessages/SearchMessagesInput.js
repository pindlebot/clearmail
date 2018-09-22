import React from 'react'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'
import FormControl from '@material-ui/core/FormControl'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  label: {
    marginLeft: '4px'
  },
  formControl: {
    width: '100%'
  },
  input: {}
})

const SearchMessagesInput = (props) => {
  const {
    label,
    classes,
    inputRef,
    adornment,
    margin,
    variant,
    value,
    ...rest
  } = props

  const endAdornment = adornment ? (
    <InputAdornment position='end'>{adornment}</InputAdornment>
  ) : undefined

  let inputId = label
    ? label.toLowerCase().replace(' ', '-')
    : undefined
  return (
    <FormControl fullWidth margin={margin}>
      {label && <InputLabel htmlFor={inputId} className={classes.label}>{label}</InputLabel>}
      <Input
        inputProps={{
          style: {
            // padding: '8px 7px'
            padding: '0'
          }
        }}
        className={classes.input}
        disableUnderline
        id={inputId}
        inputRef={inputRef}
        endAdornment={endAdornment}
        {...rest}
        value={value || ''}
      />
    </FormControl>
  )
}

SearchMessagesInput.defaultProps = {
  label: '',
  inputRef: undefined,
  adornment: undefined,
  margin: 'normal',
  variant: 'normal'
}

export default withStyles(styles)(SearchMessagesInput)
