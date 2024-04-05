// pdf-ai-chatbot/src/lib/embeddings.ts

// Import necessary classes from the "openai-edge" package to interact with OpenAI's API.
import { OpenAIApi, Configuration } from "openai-edge";

// Configure the API client using the API key stored in environment variables.
// This is a common practice for securing sensitive information like API keys.
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // The API key is accessed from the environment variables.
});

// Initialize the OpenAI API client with the provided configuration.
// This client will be used to make requests to the OpenAI API.
const openai = new OpenAIApi(config);

// Define an asynchronous function to get embeddings for a given piece of text.
// This function will be exported for use elsewhere in the application.
export async function getEmbeddings(text: string) {
  try {
    // Make a request to the OpenAI API to create embeddings for the input text.
    // The text is preprocessed to replace newline characters with spaces to ensure
    // it's in a single-line format, which might be required or beneficial for the embedding process.
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002", // Specifies the model to use for generating embeddings.
      input: text.replace(/\n/g, " "), // Replace newline characters with spaces in the input text.
    });

    // Parse the JSON response from the API call.
    const result = await response.json();

    // Extract the embedding from the first (and likely only) item in the response data array.
    // The embedding is an array of numbers representing the input text.
    return result.data[0].embedding as number[];
  } catch (error) {
    // Log any errors that occur during the API call or data processing.
    console.log("error calling openai embeddings api", error);
    // Rethrow the error to handle it further up in the call stack if necessary.
    throw error;
  }
}
