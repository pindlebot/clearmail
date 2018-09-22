import HTML_ATTRIBUTES from 'html-element-attributes'
import pick from 'lodash.pick'
import stateToHtml from 'draft-js-export-html/lib/stateToHTML'

const createBlockRenderers = contentState => {
  return {
    'atomic:image': contentBlock => {
      const src = contentBlock.getData().get('src')
      return `<img src="${src}" />`
    },
    'atomic': contentBlock => {
      const entityKey = contentBlock.getEntityAt(0)
      if (entityKey) {
        const entity = contentState.getEntity(entityKey)
        const data = entity.getData()
        if (data.tag) {
          return `${data.tag}${data.embed}`
        }
      }
      return undefined
    }
  }
}

const createEntityStyleFn = contentState => entity => {
  let type = entity.getType()
  switch (type) {
    case 'IMG':
      return {
        attributes: pick(entity.getData(), HTML_ATTRIBUTES.img),
        element: 'img'
      }
    case 'LINK':
      let { src, href, url } = entity.getData()
      let _href = href || url || src
      return {
        attributes: { href: _href },
        element: 'a'
      }
    default:
      return null
  }
}

export function toHtml (
  contentState,
  transforms = []
) {
  transforms.forEach(transform => {
    contentState = transform(contentState)
  })
  return stateToHtml(
    contentState, {
      blockRenderers: createBlockRenderers(contentState),
      entityStyleFn: createEntityStyleFn(contentState)
    })
}
