import { createRequire } from 'module';
// eslint-disable-next-line import/no-unresolved
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

const require = createRequire(import.meta.url);
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const { EVENT_ID_TABLE_NAME, EVENT_ID_TABLE_USER_GSI_NAME } = process.env;
// TODO: No hardcode region
const dynamoDBClient = new DynamoDBClient({ region: 'ap-east-2' });

const createEvent = async (_p, { input }, { me }) => {
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
  return data
}

const getUserEvent = async ({ id }) => {
  const command = new QueryCommand({
    TableName: EVENT_ID_TABLE_NAME,
    IndexName: EVENT_ID_TABLE_USER_GSI_NAME,
    KeyConditionExpression: "ownerId = :uid",
    ExpressionAttributeValues: marshall({
      ":uid": id
    }),
  })

  const { Items } = await dynamoDBClient.send(command);
  return Items.map(item => unmarshall(item));
}

export { createEvent, getUserEvent };
