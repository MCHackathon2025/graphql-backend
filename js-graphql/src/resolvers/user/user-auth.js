import { createRequire } from 'module';
// eslint-disable-next-line import/no-unresolved
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { getUserByUsername, getUserById } from './user-impl.js';

const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const { USER_ID_TABLE_NAME } = process.env;
// TODO: No hardcode region
const dynamoDBClient = new DynamoDBClient({ region: 'ap-east-2' });

// TODO: No hardcode and exposed secret...
const createToken = async ({ id }) => jwt.sign({ id }, 'abc', { expiresIn: '1d' });

const registerUser = async (_p, { input }) => {
  const { username, email, password } = input;
  // TODO: check existing user before register.

  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, Number(2));
  // TODO: Use Transact to prevent race condition
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
  await dynamoDBClient.send(command);
  return { id, username };
};

const loginUser = async (_p, { input }) => {
  const { username, password } = input;
  const user = await getUserByUsername(username);

  if (!user) throw Error('User Not Found!');

  const hashedPassword = user.Item.password.S;
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);
  if (!isPasswordValid) throw Error('Wrong Password!');

  return { token: await createToken({ id: user.Item.id.S }) };
};

const meResolver = async (_p, _a, { me }) => {
  const user = await getUserById(me.id);
  // TODO: remove the password...
  return unmarshall(user.Item);
};

export { registerUser, loginUser, meResolver };
