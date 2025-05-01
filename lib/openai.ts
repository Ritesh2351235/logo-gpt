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

    console.log('Generating logo with GPT-Image-1 model:', prompt);

    // Using the GPT-Image-1 model
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `Create a professional, minimalist logo for: ${prompt}. The logo should be clean, modern, and suitable for business use.`,
      n: 1,
      quality: "medium",
      // Note: GPT-Image-1 might have different parameters than DALL-E 3
      // Size and quality might be handled differently
    });

    console.log('OpenAI API Response received');

    if (!response.data || response.data.length === 0) {
      throw new Error("No image generated");
    }

    // Extract the base64 data
    const base64Data = response.data[0].b64_json;
    if (!base64Data) {
      throw new Error("No base64 image data received from OpenAI");
    }

    // Convert the base64 data to a data URL
    const imageUrl = `data:image/png;base64,${base64Data}`;
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