import merge from 'lodash/merge.js';

import * as healthcheck from './healthcheck.js';
import * as user from './user/index.js';
import * as weather from './weather.js';
import * as calender from './calender.js';

const resolvers = merge({}, ...[healthcheck, user, weather, calender]);

export default resolvers;
