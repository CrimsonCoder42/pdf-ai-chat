import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// Define a PostgreSQL enum called "user_system_enum" with possible values "system" and "user".
export const userSystemEnum = pgEnum("user_system_enum", ["system", "user"]);


// Define a table named "chats" with fields for id, pdfName, pdfUrl, createdAt, userId, and fileKey.
export const chats = pgTable("chats", {
  // Automatically incrementing primary key.
  id: serial("id").primaryKey(),
  // Text field for the PDF name, cannot be null.
  pdfName: text("pdf_name").notNull(),
  // Text field for the PDF URL, cannot be null.
  pdfUrl: text("pdf_url").notNull(),
  // Timestamp field for creation time, automatically set to now on record creation, cannot be null.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // A varchar field for the user ID, must be 256 characters or less, cannot be null.
  userId: varchar("user_id", { length: 256 }).notNull(),
  // Text field for the file key, cannot be null.
  fileKey: text("file_key").notNull(),
});


// Automatically infer a TypeScript type for select queries on the chats table.
export type DrizzleChat = typeof chats.$inferSelect;


// Define a table named "messages" with fields for id, chatId, content, createdAt, and role.
export const messages = pgTable("messages", {
  // Automatically incrementing primary key.
  id: serial("id").primaryKey(),
  // Integer field for chat ID, references the id field in the chats table, cannot be null.
  chatId: integer("chat_id")
    .references(() => chats.id)
    .notNull(),
  // Text field for the message content, cannot be null.
  content: text("content").notNull(),
  // Timestamp field for the creation time, automatically set to now on record creation, cannot be null.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // Enum field for the role, using the userSystemEnum, cannot be null.
  role: userSystemEnum("role").notNull(),
});


// Define a table named "user_subscriptions" with fields for user subscription details.
export const userSubscriptions = pgTable("user_subscriptions", {
  // Automatically incrementing primary key.
  id: serial("id").primaryKey(),
  // A varchar field for the user ID, must be 256 characters or less, cannot be null, must be unique.
  userId: varchar("user_id", { length: 256 }).notNull().unique(),
  // A varchar field for the Stripe customer ID, must be 256 characters or less, cannot be null, must be unique.
  stripeCustomerId: varchar("stripe_customer_id", { length: 256 })
    .notNull()
    .unique(),
  // A varchar field for the Stripe subscription ID, must be 256 characters or less, must be unique.
  stripeSubscriptionId: varchar("stripe_subscription_id", {
    length: 256,
  }).unique(),
  // A varchar field for the Stripe price ID, must be 256 characters or less.
  stripePriceId: varchar("stripe_price_id", { length: 256 }),
  // A timestamp field for when the current subscription period ends.
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_ended_at"),
});


// drizzle-orm
// drizzle-kit