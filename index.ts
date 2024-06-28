import * as util from 'util'
import { finished } from 'stream'
import fp from 'fastify-plugin'
import { processRequest, UploadOptions } from 'graphql-upload-ts'
import {
  FastifyPluginCallback,
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from 'fastify'

const finishedStream = util.promisify(finished)

declare module 'fastify' {
  interface FastifyRequest {
    mercuriusUploadMultipart?: boolean
  }
}

const mercuriusGQLUpload: FastifyPluginCallback<UploadOptions> = (
  fastify: FastifyInstance,
  options: UploadOptions,
  done: () => void,
) => {
  fastify.addContentTypeParser(
    'multipart',
    (req: FastifyRequest, _payload: any, done: (err: Error | null) => void) => {
      req.mercuriusUploadMultipart = true
      done(null)
    },
  )

  fastify.addHook(
    'preValidation',
    async function (request: FastifyRequest, reply: FastifyReply) {
      if (!request.mercuriusUploadMultipart) {
        return
      }

      try {
        request.body = await processRequest(request.raw, reply.raw, options)
      } catch (error) {
        reply.send(error)
      }
    },
  )

  fastify.addHook(
    'onSend',
    async function (
      request: FastifyRequest,
      reply: FastifyReply,
      payload: any,
    ) {
      if (!request.mercuriusUploadMultipart) {
        return payload
      }

      try {
        await finishedStream(request.raw)
      } catch (error) {
        reply.send(error)
      }

      return payload
    },
  )

  done()
}

export const mercuriusUpload = fp(mercuriusGQLUpload, {
  fastify: '>= 4.x',
  name: 'mercurius-upload',
})

export default mercuriusUpload
