import { registerUser, loginUser, meResolver } from './user-auth.js';

export const Mutation = {
  register: registerUser,
  login: loginUser,
};

export const Query = {
  me: meResolver,
};
