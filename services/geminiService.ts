import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { MODEL_NAME } from '../constants';
import { Attachment } from '../types';

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

export const initializeChat = (systemInstruction: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    return;
  }

  genAI = new GoogleGenAI({ apiKey });
  
  chatSession = genAI.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const sendMessageStream = async (
  text: string, 
  attachment: Attachment | null,
  onChunk: (text: string) => void
): Promise<string> => {
  if (!genAI || !chatSession) {
    throw new Error("Chat session not initialized. Call initializeChat first.");
  }

  try {
    let responseStream;

    // Construct the message payload
    // The SDK expects 'message' to be string | (string | Part)[]
    let messagePayload: any = text;

    if (attachment) {
      messagePayload = [
        {
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.data
          }
        },
        { text: text || "Please analyze this image." }
      ];
    }

    responseStream = await chatSession.sendMessageStream({ 
      message: messagePayload 
    });

    let fullResponse = "";
    
    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        fullResponse += c.text;
        onChunk(fullResponse);
      }
    }

    return fullResponse;
  } catch (error) {
    console.error("Error in Gemini service:", error);
    throw error;
  }
};