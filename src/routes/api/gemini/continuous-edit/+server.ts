import { json } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { RequestHandler } from './$types';

/**
 * Server endpoint for continuous image editing
 * This endpoint handles multi-turn conversations for image editing
 * based on the Google AI Studio method shown in continues-edit.curl
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        // Parse request body
        const { prompt, apiKey, conversationHistory } = await request.json();
        
        if (!apiKey) {
            return json({ error: 'API key is required' }, { status: 400 });
        }

        if (!conversationHistory || !Array.isArray(conversationHistory) || conversationHistory.length === 0) {
            return json({ error: 'Valid conversation history is required' }, { status: 400 });
        }

        console.log('🔄 SERVER: Processing continuous edit request');
        console.log('📜 SERVER: Conversation history length:', conversationHistory.length);

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Use the Gemini Flash model for image editing
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseModalities: ["TEXT", "IMAGE"]
            }
        });

        // Create a chat session with the conversation history
        const chatSession = model.startChat({
            history: conversationHistory,
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseModalities: ["TEXT", "IMAGE"]
            }
        });
        
        // Send the new prompt to continue the conversation
        const result = await chatSession.sendMessage(prompt);
        
        console.log('📝 SERVER: Raw result structure:', {
            hasResponse: !!result,
            hasText: !!result.response?.text?.(),
            hasParts: !!result.response?.candidates?.[0]?.content?.parts
        });
        
        const processedResponse = {
            text: [] as string[],
            images: [] as string[]
        };

        // Process the response parts
        const parts = result.response?.candidates?.[0]?.content?.parts || [];
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
        const textResponse = result.response?.text?.();
        if (textResponse && !processedResponse.text.includes(textResponse)) {
            processedResponse.text.push(textResponse);
        }

        // Create updated conversation history
        const updatedHistory = [
            ...conversationHistory,
            {
                role: 'user',
                parts: [{ text: prompt }]
            },
            {
                role: 'model',
                parts: parts.map(part => {
                    if (part.text) {
                        return { text: part.text };
                    } else if (part.inlineData) {
                        return {
                            inlineData: {
                                mimeType: part.inlineData.mimeType,
                                data: part.inlineData.data
                            }
                        };
                    }
                    return part;
                })
            }
        ];

        console.log('✅ SERVER: Final processed response:', {
            textCount: processedResponse.text.length,
            imageCount: processedResponse.images.length,
            updatedHistoryLength: updatedHistory.length
        });

        return json({
            ...processedResponse,
            updatedHistory
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ SERVER: Error in continuous editing:', error);
        return json({ error: 'Failed to process continuous edit', details: errorMessage }, { status: 500 });
    }
}; 