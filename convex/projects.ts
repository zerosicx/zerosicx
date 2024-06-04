import { query } from "./_generated/server";

// Return the last 100 tasks in a given task list.
export const getProjects = query({
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return projects;
  },
});
