// pdf-ai-chatbot/src/components/FileUpload.tsx

// Directive for Next.js to only include this module in the client-side bundle.
"use client";

// Importing necessary functions and components from external libraries.
import { uploadToS3 } from "@/lib/s3"; // Function to upload files to AWS S3.
import { useMutation } from "@tanstack/react-query"; // Hook for mutations with React Query.
import { Inbox, Loader2 } from "lucide-react"; // React components for icons.
import React from "react"; // React library.
import { useDropzone } from "react-dropzone"; // Hook for creating a dropzone for file uploads.
import axios from "axios"; // HTTP client for making requests.
import { toast } from "react-hot-toast"; // Library for creating toast notifications.
import { useRouter } from "next/navigation"; // Hook for routing in Next.js apps.

// Reference to an AWS SDK issue, possibly related to the implementation.
// https://github.com/aws/aws-sdk-js-v3/issues/4126

// Functional component definition for handling file uploads.
const FileUpload = () => {
  // Hook to manipulate Next.js routing.
  const router = useRouter();

  // Local state to track if a file is currently uploading.
  const [uploading, setUploading] = React.useState(false);

  // React Query mutation setup for posting a file's key and name to create a chat.
  const { mutate, isLoading } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      // Post request to your API endpoint to create a chat with the file's details.
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data; // Returning the response data for further processing.
    },
  });

  // Configuration for the dropzone, including accepted file types and actions on file drop.
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] }, // Only accept PDF files.
    maxFiles: 1, // Limit to one file at a time.
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]; // Assuming single file upload, get the first file.
      if (file.size > 10 * 1024 * 1024) { // Check if file size exceeds 10 MB.
        toast.error("File too large"); // Show error toast if file is too large.
        return;
      }

      try {
        setUploading(true); // Indicate that file upload has started.
        const data = await uploadToS3(file); // Upload file to S3 and wait for the result.
        console.log("meow", data); // Log the response data for debugging.
        if (!data?.file_key || !data.file_name) { // Check if the necessary data is returned.
          toast.error("Something went wrong"); // Show error toast if data is missing.
          return;
        }
        // Perform mutation with the uploaded file data, handling success and error scenarios.
        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast.success("Chat created!"); // Show success toast on chat creation.
            router.push(`/chat/${chat_id}`); // Navigate to the newly created chat.
          },
          onError: (err) => {
            toast.error("Error creating chat"); // Show error toast on failure.
            console.error(err); // Log the error for debugging.
          },
        });
      } catch (error) {
        console.log(error); // Log any errors during the upload process.
      } finally {
        setUploading(false); // Reset the uploading state to false when done.
      }
    },
  });

  // JSX for rendering the dropzone UI, including conditionally rendered loading indicators and messages.
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isLoading ? (
          // Render a loader and a text message during upload or mutation loading.
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Spilling Tea to GPT...
            </p>
          </>
        ) : (
          // Render an inbox icon and a prompt message when not uploading/loading.
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

// Export the component for use in other parts of the application.
export default FileUpload;
