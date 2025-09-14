import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';

const { USER_ID_TABLE_NAME } = process.env;
//TODO: No hardcode region
const dynamoDBClient = new DynamoDBClient({region: "ap-east-2"});

const userRegister = async (_p, { input }) => {
  console.log(input);
  const { username, email, password } = input;
  //TODO: check existing user before register.

  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, Number(2));
  const command = new PutItemCommand({
    TableName: USER_ID_TABLE_NAME,
    Item: {
      id: {
        S: id,
      },
      email: {
        S: email,
      },
      username: {
        S: username,
      },
      password: {
        S: hashedPassword,
      },
    },
  });
  const response = await dynamoDBClient.send(command);
  console.log( USER_ID_TABLE_NAME );
  return { id, username };
}


export { userRegister };
