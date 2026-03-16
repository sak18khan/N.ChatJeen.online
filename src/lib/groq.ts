'use server';

import Groq from 'groq-sdk';
import { supabase } from './supabaseClient';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateIcebreaker(roomId: string) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI icebreaker generator for a friendly anonymous chat app. Generate one fun, light, safe conversation starter for two strangers. Stay positive and helpful. Do not use hashtags or emojis. Keep it under 15 words.'
        }
      ],
      model: 'mixtral-8x7b-32768',
    });

    const joke = completion.choices[0]?.message?.content || "What's the best thing that happened to you today?";

    // Insert as a system message
    const { error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender_id: '00000000-0000-0000-0000-000000000000', // System ID
        content: `🧊 Icebreaker: ${joke}`
      });

    if (error) throw error;
    return joke;
  } catch (error) {
    console.error('Groq AI Error:', error);
    return null;
  }
}
