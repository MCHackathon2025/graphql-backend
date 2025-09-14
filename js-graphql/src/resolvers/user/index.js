import { registerUser, loginUser } from './user-auth.js';


export const Mutation = {
  register: registerUser,
  login: loginUser
};
