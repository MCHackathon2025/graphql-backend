import { DynamoDBClient, QueryCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';

const { USER_ID_TABLE_NAME, USER_ID_TABLE_USERNAME_GSI_NAME } = process.env;
//TODO: No hardcode region
const dynamoDBClient = new DynamoDBClient({ region: 'ap-east-2' });

const getUserByUsername = async (username) => {
  const command = new QueryCommand({
    TableName: USER_ID_TABLE_NAME,
    IndexName: USER_ID_TABLE_USERNAME_GSI_NAME,
    KeyConditionExpression: 'username = :username',
    ExpressionAttributeValues: {
      ':username': { S: username },
    },
  });

  const result = await dynamoDBClient.send(command);
  return result.Count === 1 ? { Item: result.Items[0] } : null;
};

const getUserById = async (id) => {
  const command = new GetItemCommand({
    TableName: USER_ID_TABLE_NAME,
    Key: {
      id: {
        S: id,
      },
    },
  });
  return await dynamoDBClient.send(command);
};

export { getUserById, getUserByUsername };
