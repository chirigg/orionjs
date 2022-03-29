---
id: graphql
title: GraphQL
sidebar_label: GraphQL
sidebar_position: 2
---

Orionjs is deeply integrated with GraphQL. It generates automatically the schemas and all boilerplate code. It supports subscriptions over websockets and uses Apollo Server. It only requires few lines of configuration to get started.

## Install package

```bash npm2yarn
npm install @orion-js/graphql
```

## Starting the GraphQL Server

Create a file that it's included on the startup of your app that calls the `startGraphQL` function.

```ts title="app/index.ts"
import {startGraphQL} from '@orion-js/graphql'
import resolvers from 'app/resolvers'

startGraphQL({
  resolvers,
  useGraphiql
})
```

- `resolvers`: An object with all the resolvers of your app.
- `subscriptions?`: An object containing all the subscriptions of your app.
- `executeGraphQLCache?`: A function that executes the http level cache of graphql queries.
- `useGraphiql?`: A boolean to set up the graphiQL in-browser IDE for exploring GraphQL. Defaults to `false`.
- `app?`: Pass another express app.

If you follow the [GraphQL installation example](../getting-started/installation), you will find a structure like the following:

```
app
└── services
    ├── graphql
    │   └── index.ts
    └── index.ts
```

In `app/services/graphql/index.ts `.

### GraphiQL

When running the server app, you can check the [`GraphiQL`](https://github.com/graphql/graphiql) GraphQL IDE for testing queries and mutations by following the next URL:

```sh
http://localhost:3000/graphiql
```

## Subscriptions

To define a subscription you must call the `subscription` function.

```js
import {subscription} from '@orion-js/graphql'

const mySubscription = subscription({
  params,
  returns
})
```

- `params`: The options of the subscription. A hash with a mix between the params and the subscription name will be the id of the channel.
- `returns`: A Model or a Type that is returned on every update.
- `checkPermission`: A function called every time the subscription is initialized. The string returned will be the permissions error code.

### Sending updates

To send an update you must call the subscription.

```js
await mySubscription(params, updatedItem)
```
