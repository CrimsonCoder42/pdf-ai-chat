// pdf-ai-chatbot/src/lib/pinecone.ts

// Import necessary modules and functions from external packages and local files.
import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

// Define a function to initialize and return a Pinecone client using environment variables.
export const getPineconeClient = () => {
  return new Pinecone({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

// Define a structure for PDF page content and metadata.
type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

// Main function to process and upload PDF content from S3 to Pinecone.
export async function loadS3IntoPinecone(fileKey: string) {
  // Step 1: Download the PDF from S3 and load it into memory.
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("could not download from s3");
  }
  console.log("loading pdf into memory" + file_name);
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // Step 2: Split and segment the PDF pages into documents.
  const documents = await Promise.all(pages.map(prepareDocument));

  // Step 3: Convert each document into a vector for Pinecone indexing.
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // Step 4: Upload the vectors to Pinecone for indexing.
  const client = await getPineconeClient();
  const pineconeIndex = await client.index("chatpdf");
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

  console.log("inserting vectors into pinecone");
  await namespace.upsert(vectors);

  return documents[0];
}

// Helper function to embed a document and prepare it for Pinecone indexing.
async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

// Helper function to truncate a string to a specified number of bytes.
export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

// Helper function to prepare a document from PDF page content and metadata.
async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, ""); // Clean up page content by removing newline characters.
  // Split the document content into smaller segments if necessary.
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber, // Include page number in metadata.
        text: truncateStringByBytes(pageContent, 36000), // Truncate content to 36,000 bytes.
      },
    }),
  ]);
  return docs;
}
