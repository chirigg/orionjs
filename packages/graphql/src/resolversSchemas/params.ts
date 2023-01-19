import {resolver} from '@orion-js/resolvers'
import {UserError} from '@orion-js/helpers'
import ResolverParams from './ResolverParamsInfo'
import {resolversStore} from '../buildSchema/getResolvers/resolversStore'

declare const global: any

export default resolver({
  params: {
    name: {
      type: 'ID'
    },
    mutation: {
      type: Boolean
    }
  },
  returns: ResolverParams,
  mutation: false,
  resolve: async function ({mutation, name}, viewer) {
    const resolver = resolversStore[name]
    if (!resolver) {
      throw new UserError(
        'notFound',
        `${mutation ? 'Mutation' : 'Query'} named "${name}" not found`
      )
    }
    if (!!resolver.mutation !== !!mutation) {
      throw new UserError('incorrectType', `"${name}" is ${mutation ? 'not' : ''} a mutation`)
    }
    return {resolver, name}
  }
})
