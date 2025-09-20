import {
  createEvent, updateEvent, deleteEvent, getEvent
} from './calender.js';
import { suggestEvent } from './suggestion.js';

export const Query = {
  getEvent,
  suggestEvent,
};

export const Mutation = {
  createEvent,
  updateEvent,
  deleteEvent,
};
