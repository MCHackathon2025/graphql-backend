/* eslint-disable no-undef */
import { createSchema, createYoga } from 'graphql-yoga';
import { pipeline } from 'stream/promises';

import typeDefs from './schemas/index.js';
import resolvers from './resolvers/index.js';
import baseContext from './contexts/baseContext.js';

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  context: baseContext,
  graphqlEndpoint: '/',
  cors: {
    origin: '*',
  },
});

const classicHandler = async (event, context) => {
  // console.log('Event Body: ', JSON.parse(event.body))

  const response = await yoga.fetch(
    `http://${event.headers.host}${event.rawPath}${event.rawQueryString ? `?${event.rawQueryString}` : ''}`,
    {
      method: event.requestContext.http?.method ?? event.httpMethod,
      headers: event.headers,
      body: event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body,
    },
    { event, context },
  );

  // console.log('Resp: ', response)
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.text(),
  };
};

const streamingHandler = awslambda.streamifyResponse(async (event, res, lambdaContext) => {
  const path = event.requestContext.http?.path ?? event.path;
  const method = event.requestContext.http?.method ?? event.httpMethod;
  const { domainName } = event.requestContext;
  const query = event.rawQueryString ?? new URLSearchParams(event.queryStringParameters || {}).toString();

  const response = await yoga.fetch(
    `https://${domainName}${path}${query ? `?${query}` : ''}`,
    {
      method,
      headers: event.headers,
      body: event.body && event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body,
    },
    {
      event,
      lambdaContext,
      res,
    },
  );
  const responseStream = awslambda.HttpResponseStream.from(res, {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
  });

  if (response.body) {
    await pipeline(response.body, responseStream);
  }

  responseStream.end();
});

const isLocal = !!process.env.AWS_SAM_LOCAL;
// eslint-disable-next-line import/prefer-default-export
export const handler = isLocal ? classicHandler : streamingHandler;
