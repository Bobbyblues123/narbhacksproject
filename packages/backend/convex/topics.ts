import type { Auth } from "convex/server";
import { v } from "convex/values";
import { internal } from "../convex/_generated/api";
import { mutation, query } from "./_generated/server";

export const getUserId = async (ctx: { auth: Auth }) => {
  return (await ctx.auth.getUserIdentity())?.subject;
};

// Get all topics for a specific user
export const getTopics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const topics = await ctx.db
      .query("topics")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return topics;
  },
});

// Create a new topic for a user
export const createTopic = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");
    
    const topicId = await ctx.db.insert("topics", {
      userId,
      name,
      totalProblems: 0,
      completedProblems: 0,
      createdAt: Date.now(),
    });

    // Generate problems for this topic using Claude API
    await ctx.scheduler.runAfter(0, internal.claude.generateProblems, {
      topicId,
      topicName: name,
    });

    return topicId;
  },
});

// Update topic progress
export const updateTopicProgress = mutation({
  args: {
    topicId: v.id("topics"),
    totalProblems: v.number(),
    completedProblems: v.number(),
  },
  handler: async (ctx, { topicId, totalProblems, completedProblems }) => {
    await ctx.db.patch(topicId, {
      totalProblems,
      completedProblems,
    });
  },
});

// Delete a topic and all its problems
export const deleteTopic = mutation({
  args: {
    topicId: v.id("topics"),
  },
  handler: async (ctx, { topicId }) => {
    // Delete all problems for this topic
    const problems = await ctx.db
      .query("problems")
      .withIndex("by_topic", (q) => q.eq("topicId", topicId))
      .collect();
    
    for (const problem of problems) {
      await ctx.db.delete(problem._id);
    }
    
    // Delete the topic
    await ctx.db.delete(topicId);
  },
}); 