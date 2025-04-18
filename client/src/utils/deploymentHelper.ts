
import { queryPerplexity, PerplexityMessage, PERPLEXITY_MODELS } from './perplexityApi';

/**
 * Analyzes deployment errors and suggests fixes using Perplexity AI
 * @param buildLog - The deployment build log containing errors
 * @returns Promise with solution suggestions
 */
export async function analyzeDeploymentError(buildLog: string): Promise<string> {
  const messages: PerplexityMessage[] = [
    {
      role: "system",
      content: "You are a deployment troubleshooting expert that helps fix Netlify deployment issues. Provide clear, actionable advice for resolving deployment errors."
    },
    {
      role: "user",
      content: `I'm having an issue with my Netlify deployment. Here's the build log with errors:\n\n${buildLog}\n\nPlease analyze what went wrong and suggest specific fixes.`
    }
  ];

  try {
    const response = await queryPerplexity(messages, PERPLEXITY_MODELS.CODELLAMA_34B_INSTRUCT);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error analyzing deployment error:", error);
    return "Unable to analyze deployment error. Please check your API key and try again.";
  }
}

/**
 * Suggests optimizations for your Netlify deployment configuration
 * @param currentConfig - Current Netlify configuration
 * @returns Promise with optimization suggestions
 */
export async function suggestDeploymentOptimizations(currentConfig: string): Promise<string> {
  const messages: PerplexityMessage[] = [
    {
      role: "system",
      content: "You are a Netlify deployment expert that helps optimize build configurations and deployment settings. Provide specific recommendations to improve build time, performance, and reliability."
    },
    {
      role: "user",
      content: `Here's my current Netlify configuration:\n\n${currentConfig}\n\nCan you suggest optimizations to improve my deployment?`
    }
  ];

  try {
    const response = await queryPerplexity(messages, PERPLEXITY_MODELS.CODELLAMA_34B_INSTRUCT);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error getting deployment optimization suggestions:", error);
    return "Unable to suggest deployment optimizations. Please check your API key and try again.";
  }
}

/**
 * Automatically generates a fix for common deployment issues
 * @param errorMessage - The specific error message from the build
 * @param filePath - Path to the file causing the issue (if known)
 * @returns Promise with code fix or configuration change
 */
export async function generateDeploymentFix(errorMessage: string, filePath?: string): Promise<string> {
  const fileContext = filePath ? `in file ${filePath}` : '';
  
  const messages: PerplexityMessage[] = [
    {
      role: "system",
      content: "You are a deployment fix generator that provides exact code or configuration changes to resolve Netlify deployment issues. Provide only the necessary changes without explanations."
    },
    {
      role: "user",
      content: `I have this error during Netlify deployment: "${errorMessage}" ${fileContext}. Generate the exact fix I should apply.`
    }
  ];

  try {
    const response = await queryPerplexity(messages, PERPLEXITY_MODELS.CODELLAMA_34B_INSTRUCT);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating deployment fix:", error);
    return "Unable to generate a fix. Please check your API key and try again.";
  }
}
