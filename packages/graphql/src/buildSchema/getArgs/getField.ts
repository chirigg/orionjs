import isPlainObject from 'lodash/isPlainObject'
import isArray from 'lodash/isArray'
import {GraphQLList, GraphQLInputObjectType} from 'graphql'
import {getFieldType} from '@orion-js/schema'
import getScalar from '../getType/getScalar'
import {getStaticFields} from '../../resolversSchemas/getStaticFields'

const storedModelInput = {}

const getModelInput = function (model, fields) {
  if (storedModelInput[model.name]) {
    return storedModelInput[model.name]
  }

  storedModelInput[model.name] = new GraphQLInputObjectType({
    name: model.name + 'Input',
    fields
  })

  return storedModelInput[model.name]
}

export default function getParams(type) {
  if (!type) {
    throw new Error(`No type specified`)
  }

  if (isArray(type)) {
    const graphQLType = getParams(type[0])
    return new GraphQLList(graphQLType)
  } else if (!type._isFieldType && (isPlainObject(type) || type.__isModel)) {
    const model = type.__isModel ? type : type.__model
    if (!model || !model.__isModel) throw new Error(`A type is not a Model`)

    const fields = {}

    for (const field of getStaticFields(model)) {
      fields[field.key] = {
        type: getParams(field.type)
      }
    }

    return getModelInput(model, fields)
  } else {
    const schemaType = getFieldType(type)
    const graphQLType = getScalar(schemaType)
    return graphQLType
  }
}
