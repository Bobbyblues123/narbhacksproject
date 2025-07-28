import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
  }),
  
  topics: defineTable({
    userId: v.string(),
    name: v.string(),
    totalProblems: v.number(),
    completedProblems: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  
  problems: defineTable({
    topicId: v.id("topics"),
    userId: v.string(),
    title: v.string(),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    description: v.string(),
    leetcodeUrl: v.optional(v.string()),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_topic", ["topicId"]).index("by_user", ["userId"]),
});
