//pdf-ai-chatbot/src/components/ChatSideBar.tsx

// Directive for Next.js to ensure this code runs only on the client-side.
"use client";

// Import statements for various dependencies and components.
import { DrizzleChat } from "@/lib/db/schema"; // Importing a type definition for DrizzleChat from the database schema.
import Link from "next/link"; // Next.js component for client-side transitions between routes.
import React from "react"; // React library for building user interfaces.
import { Button } from "./ui/button"; // Custom Button component.
import { MessageCircle, PlusCircle } from "lucide-react"; // Icons from the lucide-react icon library.
import { cn } from "@/lib/utils"; // Utility function for conditional className bindings.
import axios from "axios"; // HTTP client for making requests (unused in this snippet).
import SubscriptionButton from "./SubscriptionButton"; // A custom component for managing subscriptions (unused in this snippet).

// TypeScript type definition for the props expected by the ChatSideBar component.
type Props = {
  chats: DrizzleChat[]; // An array of chat objects.
  chatId: number; // The ID of the currently active chat.
  isPro: boolean; // Boolean indicating if the user has a "pro" subscription status.
};

// Functional component definition accepting props matching the Props type.
const ChatSideBar = ({ chats, chatId, isPro }: Props) => {
  const [loading, setLoading] = React.useState(false); // State hook for managing loading status (unused in this snippet).

  // JSX for rendering the sidebar.
  return (
    // Container div with styling for full width, max height of the screen, overflow scroll, padding, and background color.
    <div className="w-full max-h-screen overflow-scroll p-4 text-gray-200 bg-gray-900">
      {/* Link component wrapping a Button for creating a new chat. */}
      <Link href="/">
        <Button className="w-full border-dashed border-white border">
          <PlusCircle className="mr-2 w-4 h-4" /> {/* Plus icon for the "New Chat" button. */}
          New Chat
        </Button>
      </Link>

      {/* Container for the list of chats with flex layout, overflow scroll, and padding. */}
      <div className="flex max-h-screen overflow-scroll pb-20 flex-col gap-2 mt-4">
        {/* Mapping through the chats array to render each chat item. */}
        {chats.map((chat) => (
          // Link component for navigation to the chat detail view, using the chat's ID in the URL.
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              // Conditional styling to highlight the active chat and change styling on hover for others.
              className={cn("rounded-lg p-3 text-slate-300 flex items-center", {
                "bg-blue-600 text-white": chat.id === chatId, // Styling for the active chat.
                "hover:text-white": chat.id !== chatId, // Styling for other chats on hover.
              })}
            >
              <MessageCircle className="mr-2" /> {/* Icon for the chat item. */}
              {/* Chat name, truncated if too long to fit within the container. */}
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                {chat.pdfName}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Exporting the component for use in other parts of the application.
export default ChatSideBar;
