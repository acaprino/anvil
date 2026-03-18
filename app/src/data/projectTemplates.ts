export interface ProjectTemplate {
  name: string;
  description: string;
  systemPrompt: string;
  model: number;
  effort: number;
  permMode: number;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    name: "Code Review",
    description: "Review code for bugs, security issues, and improvements",
    systemPrompt: "You are a senior code reviewer. Analyze the code for bugs, security vulnerabilities, performance issues, and maintainability. Provide specific, actionable feedback with code examples where helpful.",
    model: 1,  // opus
    effort: 0, // high
    permMode: 0, // plan
  },
  {
    name: "Bug Fix",
    description: "Debug and fix reported issues",
    systemPrompt: "Focus on reproducing and fixing the reported bug. Start by understanding the expected vs actual behavior, then trace through the code to find the root cause. Make minimal, targeted changes.",
    model: 0,  // sonnet
    effort: 0, // high
    permMode: 1, // accept edits
  },
  {
    name: "New Feature",
    description: "Implement a new feature or functionality",
    systemPrompt: "You are implementing a new feature. Follow existing code patterns and conventions. Write clean, well-structured code. Consider edge cases and error handling.",
    model: 0,  // sonnet
    effort: 0, // high
    permMode: 1, // accept edits
  },
  {
    name: "Refactor",
    description: "Improve code structure without changing behavior",
    systemPrompt: "Refactor the codebase for better readability, maintainability, and performance. Preserve all existing behavior. Make incremental, well-tested changes.",
    model: 0,  // sonnet
    effort: 1, // medium
    permMode: 0, // plan
  },
  {
    name: "Explore",
    description: "Understand and explain the codebase",
    systemPrompt: "Help me understand this codebase. Explain the architecture, key patterns, and how components interact. Answer questions clearly with references to specific files and functions.",
    model: 0,  // sonnet
    effort: 1, // medium
    permMode: 0, // plan
  },
];
