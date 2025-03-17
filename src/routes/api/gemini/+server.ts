import { json } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { prompt, apiKey } = await request.json();
        
        if (!apiKey) {
            return json({ error: 'API key is required' }, { status: 400 });
        }

        console.log('🚀 SERVER: Initializing Gemini with prompt:', prompt);

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Use the specific image generation model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp-image-generation"
        });

        console.log('📦 SERVER: Model configuration:', {
            model: "gemini-2.0-flash-exp-image-generation"
        });

        // Create a chat session for image generation
        const chatSession = model.startChat({
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseModalities: ["TEXT", "IMAGE"]
            }
        });

        // Send the prompt to generate an image
        const result = await chatSession.sendMessage(prompt);
        
        console.log('📝 SERVER: Raw result structure:', {
            hasResponse: !!result,
            hasText: !!result.response.text(),
            hasParts: !!result.response.candidates?.[0]?.content?.parts
        });
        
        const processedResponse = {
            text: [] as string[],
            images: [] as string[]
        };

        // Process the response parts
        const parts = result.response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            console.log('🧩 SERVER: Processing part:', {
                hasText: !!part.text,
                hasInlineData: !!part.inlineData,
                mimeType: part.inlineData?.mimeType
            });

            if (part.text) {
                processedResponse.text.push(part.text);
            } else if (part.inlineData) {
                processedResponse.images.push(part.inlineData.data);
            }
        }

        // Add the text response if available
        const textResponse = result.response.text();
        if (textResponse && !processedResponse.text.includes(textResponse)) {
            processedResponse.text.push(textResponse);
        }

        console.log('✅ SERVER: Final processed response:', {
            textCount: processedResponse.text.length,
            imageCount: processedResponse.images.length
        });

        return json(processedResponse);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ SERVER: Error generating content:', error);
        return json({ error: 'Failed to generate content', details: errorMessage }, { status: 500 });
    }
}; 