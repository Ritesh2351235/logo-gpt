import OpenAI from 'openai';

// Check for API key more gracefully
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey || '',
});

export async function generateLogo(prompt: string): Promise<string> {
  try {
    // Verify API key at runtime
    if (!apiKey) {
      throw new Error("OpenAI API key is missing");
    }

    console.log('Generating logo with prompt:', prompt);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a professional, minimalist logo for: ${prompt}. The logo should be clean, modern, and suitable for business use.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    console.log('OpenAI API Response:', JSON.stringify(response, null, 2));

    if (!response.data || response.data.length === 0) {
      throw new Error("No image generated");
    }

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error("No image URL received from OpenAI");
    }

    return imageUrl;
  } catch (error: any) {
    // Log the full error object
    console.error('OpenAI API Error Details:', {
      message: error.message,
      status: error.status,
      response: error.response?.data,
      stack: error.stack
    });

    // Throw a more specific error message
    if (error.status === 401) {
      throw new Error("Invalid API key or authentication error");
    } else if (error.status === 429) {
      throw new Error("Rate limit exceeded or quota reached");
    } else if (error.response?.data?.error?.message) {
      throw new Error(`OpenAI Error: ${error.response.data.error.message}`);
    } else {
      throw new Error(`Failed to generate logo: ${error.message}`);
    }
  }
} 