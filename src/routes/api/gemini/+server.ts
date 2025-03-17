import { json } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
    try {
        // Check if this is a continuous edit request
        const isContinuousEdit = url.searchParams.get('mode') === 'continuous-edit';
        
        // Parse request body
        const requestData = await request.json();
        const { prompt, apiKey, imageData, conversationHistory } = requestData;
        
        if (!apiKey) {
            return json({ error: 'API key is required' }, { status: 400 });
        }

        console.log(`🚀 SERVER: Initializing Gemini with ${isContinuousEdit ? 'continuous edit' : 'new'} request`);

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Use the appropriate model based on the request type
        const modelName = isContinuousEdit || imageData 
            ? "gemini-2.0-flash-exp" 
            : "gemini-2.0-flash-exp-image-generation";
            
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseModalities: ["TEXT", "IMAGE"]
            }
        });

        console.log('📦 SERVER: Model configuration:', { model: modelName });

        let result;
        
        if (isContinuousEdit && conversationHistory) {
            // Handle continuous editing with conversation history
            console.log('🔄 SERVER: Continuing conversation with history length:', 
                conversationHistory.length);
                
            // Create a chat session with history
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
            
            // Send the new prompt
            result = await chatSession.sendMessage(prompt);
        } else if (imageData) {
            // Handle initial image editing
            console.log('🖼️ SERVER: Processing image edit request');
            
            result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: imageData
                    }
                },
                { text: prompt }
            ]);
        } else {
            // Handle image generation (original functionality)
            console.log('🎨 SERVER: Processing image generation request');
            
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
            result = await chatSession.sendMessage(prompt);
        }
        
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

        console.log('✅ SERVER: Final processed response:', {
            textCount: processedResponse.text.length,
            imageCount: processedResponse.images.length
        });

        return json({
            ...processedResponse,
            // Include the updated conversation history for continuous editing
            updatedHistory: isContinuousEdit ? [
                ...(conversationHistory || []),
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
            ] : undefined
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ SERVER: Error generating content:', error);
        return json({ error: 'Failed to generate content', details: errorMessage }, { status: 500 });
    }
}; 