import { error } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';

const uri = import.meta.env.VITE_MONGODB_URI;
const test = import.meta.env.VITE_TEST_NAME;

// @ts-ignore
export async function POST({ request}) {
  const body = await request.json();
  const { email, time, imageData ,accessToken} = body;

  // Send photo to Manu's Back-End
  if (!email || !time || !imageData) {
    throw error(400, 'Please provide all required fields.');
  }

  const response = await fetch("http://127.0.0.1:8000/face_validation", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ image: imageData })
  });

  const responseData = await response.json();

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const collection = client.db("proctoring").collection('periodicPhotos');
  const result = await collection.insertOne({
    student: email,
    exam: test,
    time: time,
    image: imageData,
    sessionToken: accessToken,
    status: responseData
  });
  await client.close();
  if (!result) {
    throw error(500, 'Failed to insert data.');
  }
  // @ts-ignore
  return new Response(collection);
}

