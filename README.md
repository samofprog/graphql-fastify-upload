# fastify-gql-upload-ts

Based on https://github.com/bmullan91/fastify-gql-upload but with **TypeScript support**, updated dependencies and updated syntax for **Fastify v3**:

## Install

```sh
yarn add fastify-gql-upload-ts
# or
npm i fastify-gql-upload-ts
```

## Usage

Plugin options should conform to https://github.com/jaydenseric/graphql-upload#type-processrequestoptions

```js
fastify.register(require('fastify-gql-upload-ts'), {
  // options passed to processRequest from graphql-upload
})
```

> or

```ts
import FastifyGQLUpload from 'fastify-gql-upload-ts'

// ...

fastify.register(FastifyGQLUpload)
```

## Example

```js
const GQL = require('fastify-gql')
const { GraphQLUpload } = require('graphql-upload')
const fs = require('fs')
const util = require('util')
const stream = require('stream')
const path = require('path')

const pipeline = util.promisify(stream.pipeline)
const uploadsDir = path.resolve(__dirname, '../uploads')

const schema = /* GraphQL */ `
  scalar Upload

  type Query {
    add(x: Int, y: Int): Int
  }

  type Mutation {
    uploadImage(image: Upload): Boolean
  }
`

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    add: async (_, { x, y }) => {
      return x + y
    },
  },
  Mutation: {
    uploadImage: async (_, { image }) => {
      const { filename, createReadStream } = await image
      const rs = createReadStream()
      const ws = fs.createWriteStream(path.join(uploadsDir, filename))
      await pipeline(rs, ws)
      return true
    },
  },
}

module.exports = function (fastify, options, done) {
  fastify.register(require('fastify-gql-upload-ts'))

  fastify.register(GQL, {
    schema,
    resolvers,
    graphiql: true,
  })

  done()
}
```
