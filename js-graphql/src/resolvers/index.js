import merge from 'lodash/merge.js';

import * as healthcheck from './healthcheck.js';
import * as user from './user/index.js';
import * as weather from './weather.js';

const resolvers = merge({}, ...[healthcheck, user, weather]);

export default resolvers;
