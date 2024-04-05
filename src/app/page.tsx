// Importing components and utilities from various libraries and local modules.
import { Button } from "@/components/ui/button"; // Custom Button component.
import { UserButton, auth } from "@clerk/nextjs"; // Clerk components for user authentication.
import Link from "next/link"; // Next.js Link component for client-side navigation.
import { ArrowRight, LogIn } from "lucide-react"; // Icons from lucide-react library.
import FileUpload from "@/components/FileUpload"; // Custom component for file upload functionality.
import { checkSubscription } from "@/lib/subscription"; // Utility function to check user subscription status.
import SubscriptionButton from "@/components/SubscriptionButton"; // Custom component for subscription-related actions (commented out).
import { db } from "@/lib/db"; // Database utility for queries.
import { chats } from "@/lib/db/schema"; // Database schema definition for chats.
import { eq } from "drizzle-orm"; // Utility function from Drizzle ORM for equality condition in database queries.

// The default export of an async function component named Home.
export default async function Home() {
  // Authenticate the user and retrieve their userId.
  const { userId } = await auth();
  // Boolean flag indicating if the user is authenticated.
  const isAuth = !!userId;

  // Check if the authenticated user has a pro subscription.
  const isPro = await checkSubscription();

  // Initialize variable to hold the first chat if it exists.
  let firstChat;
  if (userId) {
    // If the user is authenticated, query the database for their chats.
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    // If chats are found, select the first chat from the result.
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }

  // JSX to render the component's UI.
  return (
    // A div that spans the full screen with a gradient background.
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100">
      {/* {/* // A container for the main content, centered on the screen. */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          {/* // Header section with the application's title and a UserButton for authentication actions. */}
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
          {/* // Conditional rendering based on user authentication and the existence of chats. */}
          <div className="flex mt-2">
            {isAuth && firstChat && (
              <>
                <Link href={`/chat/${firstChat.id}`}>
                  <Button>
                    Go to Chats <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <div className="ml-3">
                  {/* Conditional rendering for SubscriptionButton is commented out. */}
                </div>
              </>
            )}
          </div>
          {/* // A paragraph describing the application's purpose. */}
          <p className="max-w-xl mt-1 text-lg text-slate-600">
            Join millions of students, researchers and professionals to instantly
            answer questions and understand research with AI
          </p>
          {/* // Conditional rendering of the FileUpload component or a login button based on authentication. */}
          <div className="w-full mt-4">
            {isAuth ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in">
                <Button>
                  Login to get Started! <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

