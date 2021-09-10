require('dotenv').config();

import { MongoClient, Db } from 'mongodb';

let db: Db;

MongoClient.connect(process.env.MONGO_URL,{
  // @ts-ignore
  useNewUrlParser: true,
  useUnifiedTopology: true
  
}, async (err, client) => {
  if (err) return console.error(err)
  db = await client.db(process.env.DB_NAME);
  console.log('Connected to Database')
});

export default db;