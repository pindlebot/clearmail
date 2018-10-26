function stripEmptyStrings (entity) {
  return Object.keys(entity).reduce((acc, key) => {
    let value = entity[key]
    if (value !== '') {
      acc[key] = value
    }
    return acc
  }, {})
}

module.exports = (entities) => {
  return entities.map(stripEmptyStrings)
}
