import { createSchema, createYoga } from 'graphql-yoga';
import { createServer } from 'http';

import typeDefs from './schemas/index.js';
import resolvers from './resolvers/index.js';

const main = async () => {
  const yoga = createYoga({
    schema: createSchema({
      typeDefs: await typeDefs,
      resolvers,
    }),
    cors: {
      origin: '*',
    },
  });

  const server = createServer(yoga);
  server.listen(4000, () => {
    // eslint-disable-next-line no-console
    console.info('Server is running on http://localhost:4000/graphql');
  });
};

main();
