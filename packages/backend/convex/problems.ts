import type { Auth } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserId = async (ctx: { auth: Auth }) => {
  return (await ctx.auth.getUserIdentity())?.subject;
};

// Get all problems for a specific topic
export const getProblemsByTopic = query({
  args: {
    topicId: v.id("topics"),
  },
  handler: async (ctx, { topicId }) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const problems = await ctx.db
      .query("problems")
      .withIndex("by_topic", (q) => q.eq("topicId", topicId))
      .order("asc")
      .collect();

    return problems;
  },
});

// Get all problems for a user
export const getProblems = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const problems = await ctx.db
      .query("problems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return problems;
  },
});

// Mark a problem as completed
export const markProblemCompleted = mutation({
  args: {
    problemId: v.id("problems"),
    isCompleted: v.boolean(),
  },
  handler: async (ctx, { problemId, isCompleted }) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const problem = await ctx.db.get(problemId);
    if (!problem) throw new Error("Problem not found");

    await ctx.db.patch(problemId, {
      isCompleted,
      completedAt: isCompleted ? Date.now() : undefined,
    });

    // Update topic progress
    const problemsInTopic = await ctx.db
      .query("problems")
      .withIndex("by_topic", (q) => q.eq("topicId", problem.topicId))
      .collect();

    const totalProblems = problemsInTopic.length;
    const completedProblems = problemsInTopic.filter(p => p.isCompleted).length;

    await ctx.db.patch(problem.topicId, {
      totalProblems,
      completedProblems,
    });
  },
});

// Create a problem (used by Claude API)
export const createProblem = mutation({
  args: {
    topicId: v.id("topics"),
    title: v.string(),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    description: v.string(),
    leetcodeUrl: v.optional(v.string()),
  },
  handler: async (ctx, { topicId, title, difficulty, description, leetcodeUrl }) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const problemId = await ctx.db.insert("problems", {
      topicId,
      userId,
      title,
      difficulty,
      description,
      leetcodeUrl,
      isCompleted: false,
      createdAt: Date.now(),
    });

    return problemId;
  },
}); 