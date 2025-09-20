import { createRequire } from 'module';
// eslint-disable-next-line import/no-unresolved
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const require = createRequire(import.meta.url);
const { marshall } = require('@aws-sdk/util-dynamodb');

const { EVENT_ID_TABLE_NAME } = process.env;
// TODO: No hardcode region
const dynamoDBClient = new DynamoDBClient({ region: 'ap-east-2' });

const createEvent = async (_p, { input }, { me }) => {
  console.log("aa");
  const { title, startTime, endTime, description, participants, type } = input;
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
  };
  const command = new PutItemCommand({
    TableName: EVENT_ID_TABLE_NAME,
    Item: marshall(data)
  });
  await dynamoDBClient.send(command);
  console.log(data);
  return data
}

export const Mutation = {
  createEvent
}
