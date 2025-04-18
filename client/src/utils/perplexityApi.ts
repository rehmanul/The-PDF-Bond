
/**
 * Perplexity API integration for AI-powered search and question answering
 */

// API configuration
const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;
const API_URL = "https://api.perplexity.ai/chat/completions";

// Message type definition
export interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// API response interface
export interface PerplexityResponse {
  id: string;
  choices: {
    index: number;
    message: PerplexityMessage;
    finish_reason: string;
  }[];
  created: number;
  model: string;
  object: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

// Available models
export const PERPLEXITY_MODELS = {
  SONAR_SMALL_ONLINE: "sonar-small-online",
  SONAR_MEDIUM_ONLINE: "sonar-medium-online",
  MIXTRAL_8X7B_INSTRUCT: "mixtral-8x7b-instruct",
  CODELLAMA_34B_INSTRUCT: "codellama-34b-instruct",
};

/**
 * Function to send a query to the Perplexity API
 * @param messages - Array of message objects with role and content
 * @param model - Perplexity model to use
 * @returns Promise with the API response
 */
export async function queryPerplexity(
  messages: PerplexityMessage[],
  model: string = PERPLEXITY_MODELS.SONAR_SMALL_ONLINE
): Promise<PerplexityResponse> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error("Perplexity API key is not set. Please set VITE_PERPLEXITY_API_KEY in your environment variables.");
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Perplexity API Error: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error querying Perplexity API:", error);
    throw error;
  }
}

/**
 * Get garden advice for a specific plant or gardening question
 * @param query - User's gardening question
 * @returns Promise with the advice text
 */
export async function getGardeningAdvice(query: string): Promise<string> {
  const messages: PerplexityMessage[] = [
    {
      role: "system",
      content: "You are a helpful gardening assistant that provides accurate advice about plants, gardening techniques, and plant care. Provide concise and helpful answers."
    },
    {
      role: "user",
      content: query
    }
  ];

  const response = await queryPerplexity(messages, PERPLEXITY_MODELS.SONAR_MEDIUM_ONLINE);
  return response.choices[0].message.content;
}

/**
 * Generate product recommendations based on user requirements
 * @param requirements - User's gardening needs and requirements
 * @returns Promise with product recommendations
 */
export async function getProductRecommendations(requirements: string): Promise<string> {
  const messages: PerplexityMessage[] = [
    {
      role: "system",
      content: "You are a gardening product expert who can recommend the best plants, tools, and supplies based on specific requirements. Provide tailored recommendations."
    },
    {
      role: "user",
      content: requirements
    }
  ];

  const response = await queryPerplexity(messages, PERPLEXITY_MODELS.SONAR_MEDIUM_ONLINE);
  return response.choices[0].message.content;
}
/**
 * Perplexity API integration for AI assistance features
 */

// Define model options
export const PERPLEXITY_MODELS = {
  SONAR_SMALL_ONLINE: "sonar-small-online",
  SONAR_MEDIUM_ONLINE: "sonar-medium-online",
  CODELLAMA_34B_INSTRUCT: "codellama-34b-instruct",
  MIXTRAL_8X7B_INSTRUCT: "mixtral-8x7b-instruct"
};

// Define message interface
export interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Define API response interface
export interface PerplexityResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Query the Perplexity API with specified messages and model
 * @param messages Array of messages to send to Perplexity
 * @param model The model to use for generation
 * @returns Promise with the Perplexity API response
 */
export async function queryPerplexity(
  messages: PerplexityMessage[],
  model: string = PERPLEXITY_MODELS.MIXTRAL_8X7B_INSTRUCT
): Promise<PerplexityResponse> {
  // In a real implementation, this would be stored in environment variables
  // For development, API key would need to be retrieved securely
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error("Perplexity API key not found. Please add it to your environment variables.");
  }

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Perplexity API error: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error querying Perplexity API:", error);
    throw error;
  }
}
