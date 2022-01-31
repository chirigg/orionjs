import {Collection} from '@orion-js/mongodb'
import {resolver} from '@orion-js/resolvers'
import speakeasy from 'speakeasy'

export default ({Users}: {Users: Collection}) =>
  resolver({
    params: {
      code: {
        type: String
      }
    },
    permissionsOptions: {
      requireUserId: true
    },
    returns: Users.model,
    mutation: true,
    resolve: async function ({code}, viewer) {
      const user = await Users.findOne(viewer.userId)
      if (!user) throw new Error('User not found')

      const verified = speakeasy.totp.verify({
        secret: user.services.twoFactor.base32,
        encoding: 'base32',
        token: code
      })

      if (!verified) {
        throw new Error('The code is not correct')
      }

      await Users.updateOne(user._id, {$set: {'services.twoFactor.enabled': true}})

      return await Users.findOne(viewer.userId)
    }
  })
