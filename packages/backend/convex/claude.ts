import Anthropic from "@anthropic-ai/sdk";
import { internal } from "../convex/_generated/api";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Generate problems for a topic using Claude API
export const generateProblems = internalAction({
  args: {
    topicId: v.id("topics"),
    topicName: v.string(),
  },
  handler: async (ctx, { topicId, topicName }) => {
    try {
      console.log(`Generating problems for topic: ${topicName}`);
      
      const prompt = `Generate 5 LeetCode-style coding problems for the topic "${topicName}". 
      
      For each problem, provide:
      1. A clear, concise title
      2. Difficulty level (Easy, Medium, or Hard)
      3. A detailed problem description
      4. The LeetCode URL if it's an actual LeetCode problem, or leave blank if it's a custom problem
      
      Format the response as a JSON array with objects containing:
      {
        "title": "Problem Title",
        "difficulty": "Easy|Medium|Hard",
        "description": "Detailed problem description...",
        "leetcodeUrl": "https://leetcode.com/problems/..." (optional)
      }
      
      Make sure the problems are relevant to ${topicName} and vary in difficulty.
      Return ONLY the JSON array, no additional text.`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      console.log("Full Claude API response:", JSON.stringify(response, null, 2));
      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type from Claude");
      }

      console.log("Claude response text:", content.text);

      // Try to extract JSON from the response
      let jsonText = content.text.trim();
      
      // Remove any markdown formatting if present
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\n?/, "").replace(/```\n?/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\n?/, "").replace(/```\n?/, "");
      }

      // Parse the JSON response
      const problemsData = JSON.parse(jsonText);
      
      console.log(`Parsed ${problemsData.length} problems`);
      
      // Save each problem to the database
      for (const problem of problemsData) {
        console.log(`Creating problem: ${problem.title}`);
        await ctx.runMutation(internal.problems.createProblem, {
          topicId,
          title: problem.title,
          difficulty: problem.difficulty,
          description: problem.description,
          leetcodeUrl: problem.leetcodeUrl || undefined,
        });
      }

      // Update topic with total problems count
      const problems = await ctx.runQuery(internal.problems.getProblemsByTopic, {
        topicId,
      });
      
      if (problems) {
        await ctx.runMutation(internal.topics.updateTopicProgress, {
          topicId,
          totalProblems: problems.length,
          completedProblems: 0,
        });
        console.log(`Updated topic progress: ${problems.length} total problems`);
      }

    } catch (error) {
      console.error("Error generating problems:", error);
      if (error.response) {
        console.error("Claude API error response:", error.response.data);
      }
      
      // Create some default problems if Claude fails
      const defaultProblems = [
        {
          title: `Basic ${topicName} Problem`,
          difficulty: "Easy",
          description: `A fundamental problem to practice ${topicName} concepts.`,
        },
        {
          title: `Intermediate ${topicName} Challenge`,
          difficulty: "Medium", 
          description: `A moderate difficulty problem to test your ${topicName} skills.`,
        },
      ];

      for (const problem of defaultProblems) {
        try {
          await ctx.runMutation(internal.problems.createProblem, {
            topicId,
            title: problem.title,
            difficulty: problem.difficulty,
            description: problem.description,
          });
        } catch (createError) {
          console.error("Error creating default problem:", createError);
        }
      }

      // Update topic progress with default problems
      try {
        await ctx.runMutation(internal.topics.updateTopicProgress, {
          topicId,
          totalProblems: defaultProblems.length,
          completedProblems: 0,
        });
      } catch (updateError) {
        console.error("Error updating topic progress:", updateError);
      }
    }
  },
}); 