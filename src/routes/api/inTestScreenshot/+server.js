import { error } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import { html2canvas } from 'html2canvas';

const uri = "mongodb+srv://ldelucia:BHFJTRz8V7wHfLld@cluster-0.c5sdcyr.mongodb.net/?retryWrites=true&w=majority";

let screenshotURL = '';
// @ts-ignore
export async function POST({ request }) {
  const body = await request.json();
  const { email, iframeSrc } = body;
  if (!email || !iframeSrc) {
    throw error(400, 'Please provide all required fields.');
  }

  // Get the iframe contents as a base64 image and save them to screenshotURL
  const iframeElement = document.createElement('iframe');

  // Hide the iframe off-screen to avoid displaying it on the page
  iframeElement.style.position = 'absolute';
  iframeElement.style.left = '-9999px';

  // Add the iframe to the DOM
  document.body.appendChild(iframeElement);

  // Load the iframe content
  iframeElement.src = iframeSrc;

  // Wait for the iframe to load
  iframeElement.onload = async () => {
    // Capture a screenshot of the iframe's content
    const canvas = await html2canvas(iframeElement.contentDocument.body, { useCORS: true });
    screenshotURL = canvas.toDataURL();

    // Now you have the screenshot in screenshotURL

    // Upload the student email and the base64 image to the database
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const collection = client.db("proctoring").collection('testScreenshot');
    const result = await collection.insertOne({ email: email, image: screenshotURL });
    await client.close();

    if (!result) {
      throw error(500, 'Failed to insert data.');
    }

    // Remove the iframe from the DOM if no longer needed
    document.body.removeChild(iframeElement);
    // @ts-ignore
      return new Response(collection);
    };

}