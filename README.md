# graphql-fastify-upload

[graphql-upload-ts](https://github.com/flash-oss/graphql-upload-minimal) implementation plugin for [Fastify](https://www.fastify.io/) & [mercurius](https://github.com/mercurius-js/mercurius).

Plugin made for **Fastify v4^**:

## Install

```sh
yarn add graphql-fastify-upload
# or
npm i graphql-fastify-upload
# or
pnpm add graphql-fastify-upload
```

## Usage

Plugin options should conform to https://github.com/flash-oss/graphql-upload-minimal#type-processrequestoptions

```js
fastify.register(require('graphql-fastify-upload'), {
  // options passed to processRequest from graphql-upload-minimal
  // maxFileSize: 1024 * 1024 * 5,
  // maxFiles: 1,
})
```

> or

```ts
import MercuriusGQLUpload from 'graphql-fastify-upload'

// ...

fastify.register(MercuriusGQLUpload, {
  // options passed to processRequest from graphql-upload-minimal
})
```

## Example

```js
const GQL = require('mercurius')
const { GraphQLUpload } = require('graphql-upload-ts')
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
  fastify.register(require('mercurius-upload'))

  fastify.register(GQL, {
    schema,
    resolvers,
    graphiql: true,
  })

  done()
}
```
