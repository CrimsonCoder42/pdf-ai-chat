// pdf-ai-chatbot/src/lib/s3.ts

// Import necessary types from the AWS SDK for JavaScript.
import { PutObjectCommandOutput, S3 } from "@aws-sdk/client-s3";

// This async function uploads a file to an AWS S3 bucket and returns a promise.
// The promise resolves to an object containing the file key and file name.
export async function uploadToS3(
  file: File // The file to upload, of type File.
): Promise<{ file_key: string; file_name: string }> {
  return new Promise((resolve, reject) => {
    try {
      // Instantiate an S3 client with specific credentials and region.
      // The credentials are pulled from environment variables, ensuring they are not hard-coded.
      const s3 = new S3({
        region: "us-east-1",
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!, // Asserting non-null.
          secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!, // Asserting non-null.
        },
      });

      // Generate a unique file key for the object in S3, prefixing it with 'uploads/' and replacing spaces with dashes.
      const file_key =
        "uploads/" + Date.now().toString() + "-" + file.name.replace(/ /g, "-");

      // Define the parameters for the S3 putObject operation, including the bucket name from an environment variable.
      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!, // Asserting non-null.
        Key: file_key,
        Body: file, // The actual file to upload.
      };

      // Perform the putObject operation to upload the file to S3.
      s3.putObject(params, (err: any, data: PutObjectCommandOutput | undefined) => {
        if (err) {
          reject(err); // If there's an error, reject the promise.
        } else {
          resolve({
            file_key,
            file_name: file.name, // Resolve the promise with the file key and name.
          });
        }
      });
    } catch (error) {
      reject(error); // Catch and reject any error that occurs during the upload process.
    }
  });
}


// This function generates a URL for accessing a file stored in an S3 bucket.
export function getS3Url(file_key: string) { // Takes the file key as an argument.
  // Constructs the URL using the bucket name from environment variables and the file key.
  // Note the use of `ap-southeast-1` region in the URL; this should match the bucket's actual region.
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${file_key}`;
  return url; // Returns the constructed URL.
}