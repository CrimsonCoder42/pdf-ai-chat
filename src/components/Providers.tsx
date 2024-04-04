// pdf-ai-chatbot/src/components/Providers.tsx
// Directive for Next.js to ensure this module only runs on the client-side,
// since React Query's data fetching and state management features are client-side operations.
"use client";

// Import necessary modules from React and React Query.
import React from "react"; // Importing React to use JSX and React components.
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"; // Importing QueryClientProvider for providing React Query's context, and QueryClient to create an instance of it.

// TypeScript type for the component props, specifying that it expects children of type React.ReactNode.
// This type allows any valid React node(s) to be passed as children, making this component flexible for use as a wrapper.
type Props = {
  children: React.ReactNode;
};

// Creating an instance of QueryClient.
// This instance is used to configure React Query's behavior and provide the caching mechanism.
// You can customize the QueryClient with options to tailor React Query's caching, retries, and other behaviors.
const queryClient = new QueryClient();

// Defining the Providers component that takes children as props, adhering to the Props type.
const Providers = ({ children }: Props) => {
  // Returning a JSX structure where QueryClientProvider wraps the children.
  // QueryClientProvider requires a client prop, to which we pass the queryClient instance.
  // This setup allows any child components to use React Query's hooks, such as useQuery or useMutation,
  // ensuring they have access to the React Query context provided by QueryClientProvider.
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Exporting the Providers component so it can be imported and used in other parts of the application.
// This component is typically used near the root of your component tree to ensure wide availability
// of React Query's context.
export default Providers;
