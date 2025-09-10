import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchema } from '@graphql-tools/load';

const typeDefs = loadSchema('./**/*.graphql', {
  loaders: [new GraphQLFileLoader()],
});

export default typeDefs;
