import merge from 'lodash/merge.js';

import * as healthcheck from './healthcheck.js';
import * as user from './user/index.js';

const resolvers = merge({}, ...[healthcheck, user]);

export default resolvers;
