import { createRequire } from 'module';
// eslint-disable-next-line import/no-unresolved
import { v4 as uuidv4 } from 'uuid';
import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { TodayEventSuggestionPrompt } from './prompt.js';
import { GoogleGenAI } from "@google/genai";

const require = createRequire(import.meta.url);
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { EVENT_ID_TABLE_NAME, EVENT_ID_TABLE_USER_GSI_NAME, LLM_API_KEY } = process.env;
const dynamoDBClient = new DynamoDBClient({ region: 'ap-east-2' });
const ai = new GoogleGenAI({apiKey: LLM_API_KEY});


const suggestEvent = async (_p, _a, { me }) => {
  const { id: ownerId } = me;
  const today = new Date().toISOString().slice(0, 10);
  const eventId = uuidv4();
  const type = "AI_RECOMMENDATION";
  const createTime = Date.now();

  const command = new QueryCommand({
    TableName: EVENT_ID_TABLE_NAME,
    IndexName: EVENT_ID_TABLE_USER_GSI_NAME,
    KeyConditionExpression: "ownerId = :uid",
    FilterExpression: "begins_with(startTime, :today)",
    ExpressionAttributeValues: {
      ":uid": { S: ownerId },
      ":today": { S: today },
    },
  });
  const { Items } = await dynamoDBClient.send(command);
  const todayEvents = (Items || []).map(unmarshall).map(({ ownerId, createTime, eventId, type, ...rest }) => rest);;
  const llmPrompt = TodayEventSuggestionPrompt(today, todayEvents);
  console.log("Prompt: ", llmPrompt);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: llmPrompt,
  });
  console.log("LLM Resp: ", response.text);

  let data = JSON.parse(response.text);
  data = {ownerId, eventId, createTime, type, ...data};

  const eventCommand = new PutItemCommand({
    TableName: EVENT_ID_TABLE_NAME,
    Item: marshall(data),
  });
  await dynamoDBClient.send(eventCommand);

  return data;
}

export { suggestEvent };
