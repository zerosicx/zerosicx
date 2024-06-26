import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    company: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    iconUrl: v.string(),
    imageUrl: v.optional(v.string()),
    link: v.string(),
    name: v.string(),
    tags: v.array(v.string()),
  }),
});
