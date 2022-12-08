import {generateId} from '@orion-js/helpers'
import {ObjectID} from 'bson'
import {CreateCollectionOptions} from '..'

const getIdGenerator = (options: CreateCollectionOptions): (() => string) => {
  if (options.idGeneration === 'random') {
    const prefix = options.idPrefix || ''
    const random = generateId()
    return () => `${prefix}${random}`
  }

  return () => {
    const id = new ObjectID()

    return id.toString()
  }
}

export default getIdGenerator
