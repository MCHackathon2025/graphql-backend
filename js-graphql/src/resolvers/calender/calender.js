import { createRequire } from 'module';
// eslint-disable-next-line import/no-unresolved
import { v4 as uuidv4 } from 'uuid';
import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';

const require = createRequire(import.meta.url);
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const { EVENT_ID_TABLE_NAME, EVENT_ID_TABLE_USER_GSI_NAME } = process.env;
// TODO: No hardcode region
const dynamoDBClient = new DynamoDBClient({ region: 'ap-east-2' });

const createEvent = async (_p, { input }, { me }) => {
  const {
    title, startTime, endTime, description, type, location: place
  } = input;
  const ownerId = me.id;
  const eventId = uuidv4();
  const data = {
    ownerId,
    eventId,
    title,
    startTime,
    endTime,
    createTime: Date.now(),
    description: description ?? '',
    type,
    location: place,
  };
  const command = new PutItemCommand({
    TableName: EVENT_ID_TABLE_NAME,
    Item: marshall(data),
  });
  await dynamoDBClient.send(command);
  return data;
};

const updateEvent = async (_p, { input }) => {
  // TODO: Authroity Check
  // if (!me) throw new Error("Unauthorized");
  const { eventID, ...fields } = input;

  const updateExpr = [];
  const exprAttrValues = {};
  const exprAttrNames = {};

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) {
      updateExpr.push(`#${key} = :${key}`);
      exprAttrNames[`#${key}`] = key;
      exprAttrValues[`:${key}`] = Array.isArray(value) ? { L: value.map((v) => ({ S: v })) } : { S: String(value) };
    }
  });

  if (updateExpr.length === 0) {
    throw new Error('No fields to update');
  }

  const command = new UpdateItemCommand({
    TableName: EVENT_ID_TABLE_NAME,
    Key: { eventId: { S: eventID } },
    UpdateExpression: `SET ${updateExpr.join(', ')}`,
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
    ReturnValues: 'ALL_NEW',
  });

  const { Attributes } = await dynamoDBClient.send(command);
  return unmarshall(Attributes);
};

const deleteEvent = async (_, { input }) => {
  // TODO: Authroity Check
  // if (!me) throw new Error("Unauthorized");

  const { eventId } = input;

  const command = new DeleteItemCommand({
    TableName: EVENT_ID_TABLE_NAME,
    Key: { eventId: { S: eventId } },
  });

  await dynamoDBClient.send(command);
  return `Event ${eventId} deleted successfully.`;
};

const getUserEvent = async ({ id }) => {
  const command = new QueryCommand({
    TableName: EVENT_ID_TABLE_NAME,
    IndexName: EVENT_ID_TABLE_USER_GSI_NAME,
    KeyConditionExpression: 'ownerId = :uid',
    ExpressionAttributeValues: marshall({
      ':uid': id,
    }),
  });

  const { Items } = await dynamoDBClient.send(command);
  return Items.map((item) => unmarshall(item));
};

const getEvent = async (_p, { input }) => {
  // TODO: Authroity Check
  // if (!me) throw new Error("Unauthorized");
  const { eventId } = input;

  const command = new GetItemCommand({
    TableName: EVENT_ID_TABLE_NAME,
    Key: { eventId: { S: eventId } },
  });

  const { Item } = await dynamoDBClient.send(command);

  return unmarshall(Item);
};

export {
  createEvent, getUserEvent, deleteEvent, updateEvent, getEvent,
};
