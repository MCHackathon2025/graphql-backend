import { registerUser, loginUser, meResolver } from './user-auth.js'
// TODO: Better have relative import from project root...
import { getUserEvent } from '../calender/calender.js'

export const Mutation = {
  register: registerUser,
  login: loginUser
}

export const Query = {
  me: meResolver
}

export const User = {
  events: getUserEvent
}
