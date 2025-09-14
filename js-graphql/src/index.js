import { createSchema, createYoga } from 'graphql-yoga';
import { pipeline } from 'stream/promises'

import typeDefs from './schemas/index.js';
import resolvers from './resolvers/index.js';
import baseContext from './contexts/baseContext.js';

const yoga = createYoga({
  schema: createSchema({
    typeDefs: await typeDefs,
    resolvers,
  }),
  context: baseContext,
  graphqlEndpoint: '/',
  cors: {
    origin: '*',
  },
});

const classicHandler = async (event, context) => {
  const response = await yoga.fetch(
    `http://${event.headers.host}${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`,
    {
      method: event.requestContext.http?.method ?? event.httpMethod,
      headers: event.headers,
      body: event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body
    },
    { event, context }
  )

  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.text()
  }
}

const streamingHandler = awslambda.streamifyResponse(async function handler(
  event, res, lambdaContext) {
  const path = event.requestContext.http?.path ?? event.path
  const method = event.requestContext.http?.method ?? event.httpMethod
  const domainName = event.requestContext.domainName
  const query = event.rawQueryString ?? new URLSearchParams(event.queryStringParameters || {}).toString()

  const response = await yoga.fetch(
    `https://${domainName}${path}${query ? `?{query}` : ''}`,
    {
      method,
      headers: event.headers,
      body: event.body && event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body
    },
    {
      event,
      lambdaContext,
      res
    }
  )
  res = awslambda.HttpResponseStream.from(res, {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries())
  })

  if (response.body) {
    await pipeline(response.body, res)
  }

  res.end()
})

const isLocal= !!process.env.AWS_SAM_LOCAL
export const handler = isLocal ? classicHandler : streamingHandler
