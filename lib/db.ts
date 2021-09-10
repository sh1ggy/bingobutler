require('dotenv').config();

import { MongoClient, Db } from 'mongodb';

let db: Db;

MongoClient.connect(process.env.MONGOURL, {
  // @ts-ignore
  useNewUrlParser: true,
  useUnifiedTopology: true

}, async (err, client) => {
  if (err) return console.error(err)
  db = await client.db("bingobutler");
  console.log('Connected to Database')
});

export { db };