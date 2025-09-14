import merge from 'lodash/merge.js';

import * as healthcheck from './healthcheck.js';

const resolvers = merge({}, ...[healthcheck]);

export default resolvers;
