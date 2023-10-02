import { error } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';

const uri = import.meta.env.VITE_MONGODB_URI;
const test = import.meta.env.VITE_TEST_NAME;

// @ts-ignore
export async function POST({ request }) {
  const body = await request.json();
  const { email, time, imageData } = body;

  if (!email || !time || !imageData) {
    throw error(400, 'Please provide all required fields.');
  }

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("UGGHHH I'M CONECTINNN")
  console.log("to this URI: " + uri)
  await client.connect();
  console.log("CONNECTION SUCCESFULL!")
  const collection = client.db("proctoring").collection('periodicPhotos');
  const count = await collection.countDocuments();
  if (count > 10) {
    await collection.deleteMany({}); // Clear the entire collection
  }
  const result = await collection.insertOne({ student: email,exam:test, time: time, image: imageData });
  await client.close();
  if (!result) {
    throw error(500, 'Failed to insert data.');
  }
  // @ts-ignore
  return new Response(collection);
}

