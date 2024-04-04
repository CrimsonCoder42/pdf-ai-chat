// Import the authentication module from Clerk, designed for Next.js applications.
import { auth } from "@clerk/nextjs";
// Import the database instance or configuration from a local module.
import { db } from "./db";
// Import the userSubscriptions table definition from the local database schema.
import { userSubscriptions } from "./db/schema";
// Import the `eq` function from Drizzle ORM for creating equality conditions in queries.
import { eq } from "drizzle-orm";

// Define a constant for the number of milliseconds in a day.
const DAY_IN_MS = 1000 * 60 * 60 * 24;

// Define an asynchronous function to check the validity of a user's subscription.
export const checkSubscription = async () => {
  // Retrieve the userId from the authentication module.
  const { userId } = await auth();
  // If no userId is found, return false immediately, indicating no valid subscription.
  if (!userId) {
    return false;
  }

  // Query the database for subscriptions matching the userId.
  const _userSubscriptions = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId));

  // If no subscriptions are found for the user, return false.
  if (!_userSubscriptions[0]) {
    return false;
  }

  // If a subscription is found, select the first one (assuming one subscription per user).
  const userSubscription = _userSubscriptions[0];

  // Check if the subscription is valid by ensuring it has a stripePriceId and that
  // the current period end time plus one day is still in the future.
  // This implies the subscription hasn't expired yet.
  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
      Date.now();

  // Return the validity of the subscription. The double negation (!!isValid) converts the expression to a boolean.
  return !!isValid;
};
