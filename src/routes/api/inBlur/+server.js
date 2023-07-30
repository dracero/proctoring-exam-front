import { error } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://ldelucia:BHFJTRz8V7wHfLld@cluster-0.c5sdcyr.mongodb.net/?retryWrites=true&w=majority";

// @ts-ignore
export async function POST({request}){
  const body = await request.json();
  const { notification, dateTime } = body;
  if (!notification || !dateTime) {
    throw error(400, 'Please provide all required fields.');
  }
  // @ts-ignore
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const collection = client.db("proctoring").collection('blur');
  const result = await collection.insertOne({ msg: notification, time: dateTime });
  await client.close();
  if (!result) {
    throw error(500, 'Failed to insert data.');
  }
  // @ts-ignore
  return new Response(collection);
}