import {execute, subscribe} from 'graphql'
import {SubscriptionServer} from 'subscriptions-transport-ws'
import {PubSub} from 'graphql-subscriptions'
import {setPubsub} from './pubsub'
import {getApp} from '@orion-js/http'
import {getWebsockerViewer} from './websockerViewer'
import {StartGraphQLOptions} from './types/startGraphQL'

export default function ({schema}, options: StartGraphQLOptions) {
  const pubsub = options.pubsub || new PubSub()
  setPubsub(pubsub)

  const server = options.app || getApp()
  if (!server) {
    throw new Error(
      'Error starting GraphQL WebSocket. You must start http server before starting GraphQL WebSocket'
    )
  }

  SubscriptionServer.create(
    {
      execute,
      subscribe,
      schema,
      async onConnect(connectionParams) {
        try {
          const viewer = await getWebsockerViewer(connectionParams)
          return viewer
        } catch (error) {
          console.log('Error connecting to GraphQL Subscription server', error)
          const viewer = await getWebsockerViewer({})
          return viewer
        }
      },
      onDisconnect() {}
    },
    server
  )
}
