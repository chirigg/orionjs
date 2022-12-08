import {getModelForClass, TypedSchema, Prop, ResolverProp} from '@orion-js/typed-model'
import {GetSessionOpts} from '../types'
import userResolver from './userResolver'

@TypedSchema()
export class AbstractSession {
  @Prop({type: 'ID'})
  _id: string

  @Prop({type: 'ID'})
  publicKey: string

  @Prop({type: 'ID'})
  secretKey: string

  @Prop()
  createdAt: Date

  @Prop({type: 'blackbox'})
  nonce: object

  @Prop({optional: true})
  lastCall: Date

  @Prop({type: 'ID'})
  userId: string

  @Prop({optional: true})
  locale: string

  @Prop({type: [String], optional: true})
  roles: string

  @Prop({optional: true})
  emailVerified: boolean

  @Prop({type: 'blackbox', optional: true})
  options: object
}

export default function (options: GetSessionOpts) {
  const currResolver = userResolver(options)

  @TypedSchema()
  class Session extends AbstractSession {
    @ResolverProp(currResolver)
    user: typeof currResolver.modelResolve
  }

  return getModelForClass(Session)
}
