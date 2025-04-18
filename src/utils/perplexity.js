
import { Perplexity } from '@perplexity/browser';

// Initialize the Perplexity client
const perplexity = new Perplexity({
  apiKey: process.env.PERPLEXITY_API_KEY, // Store this in your environment variables
});

// Function to ask a question to Perplexity
export async function askPerplexity(question) {
  try {
    const response = await perplexity.query({
      query: question,
      focus: ['web_search'],
    });
    return response;
  } catch (error) {
    console.error('Error querying Perplexity:', error);
    throw error;
  }
}

// Function to generate content with Perplexity
export async function generateWithPerplexity(prompt) {
  try {
    const response = await perplexity.generateText({
      prompt: prompt,
    });
    return response;
  } catch (error) {
    console.error('Error generating with Perplexity:', error);
    throw error;
  }
}
