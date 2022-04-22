import {Model} from '@orion-js/models'
import {StartGraphQLOptions} from '../types/startGraphQL'

export function getModelLoadedResolvers(model: Model, options: StartGraphQLOptions): any[] {
  if (!options.modelsResolvers) return []
  const resolvers = options.modelsResolvers[model.name]
  if (!resolvers) return []

  const keys = Object.keys(resolvers)

  return keys
    .map(key => {
      const resolver = resolvers[key]
      return {
        ...resolver,
        key
      }
    })
    .filter(resolver => !resolver.private)
}
