// Import the database connection, database schema, utility function to load files to Pinecone,
// utility function to generate S3 URLs, Clerk authentication for Next.js, and Next.js server response utilities.
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Define an asynchronous POST function to handle the creation of chat sessions.
export async function POST(req: Request, res: Response) {
  // Authenticate the user making the request using Clerk.
  const { userId } = await auth();
  
  // If authentication fails (no userId is found), return a 401 Unauthorized response.
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // Parse the JSON body of the request to get the file key and file name.
    const body = await req.json();
    const { file_key, file_name } = body;

    // Log the file key and file name to the console (useful for debugging).
    console.log(file_key, file_name);

    // Load the PDF file from S3 into Pinecone, a vector database, for further processing or querying.
    await loadS3IntoPinecone(file_key);

    // Insert a new record into the 'chats' table with details about the PDF file and the user.
    // This includes the file key, file name, a generated URL to access the PDF, and the user's ID.
    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key), // Generate a URL to access the file on S3.
        userId,
      })
      .returning({
        insertedId: chats.id, // Return the inserted record's ID.
      });

    // Respond with the newly created chat ID in a 200 OK response.
    return NextResponse.json(
      {
        chat_id: chat_id[0].insertedId,
      },
      { status: 200 }
    );
  } catch (error) {
    // If an error occurs during the process, log it to the console and return a 500 Internal Server Error response.
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
