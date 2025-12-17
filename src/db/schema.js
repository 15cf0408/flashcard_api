import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core"
import { randomUUID } from "crypto"

export const user = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  first_name: text("first_name", { length: 30 }).notNull(),
  last_name: text("last_name", { length: 50 }).notNull(),
  email: text("email", { length: 150 }).notNull().unique(),
  password: text("password", { length: 256 }).notNull(),
  is_admin: integer("is_admin", { mode: "boolean" }).notNull().default(false)
})

export const collection = sqliteTable("collection", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    owner_id: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    title: text("title", { length: 100 }).notNull(),
    description: text("description", { length: 500 }).notNull(),
    is_public: integer("is_public", { mode: "boolean" }).notNull().default(true)
})

export const flashcard = sqliteTable("flashcard", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    collection_id: text("collection_id").notNull().references(() => collection.id, { onDelete: "cascade" }),
    front_side: text("front_side", { length: 500 }).notNull(),
    back_side: text("back_side", { length: 1000 }).notNull(),
    front_url: text("front_url", { length: 200 }),
    back_url: text("back_url", { length: 200 })
})

export const study = sqliteTable("study", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    user_id: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    level: integer("level").notNull().default(1),
    flashcard_id: text("flashcard_id").notNull().references(() => flashcard.id, { onDelete: "cascade" }),
    created_at: integer("created_at").notNull().default(() => Date.now()),
    last_study: integer("last_study").notNull().default(() => Date.now()),
    next_study: integer("next_study").notNull().default(() => Date.now() + (Math.pow(2, this.level - 1) * 24 * 60 * 60 * 1000))
})
