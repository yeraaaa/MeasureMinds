// src/pages/api/compare-measurement.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use server-side environment variable
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { value, unit } = req.body;

  try {
    const response = await openai.completions.create({
      model: 'text-davinci-003',
      prompt: `Compare ${value} ${unit} to something in real life so that a user can better understand the size.`,
      max_tokens: 50,
    });

    res.status(200).json({ comparison: response.choices[0]?.text?.trim() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comparison from OpenAI' });
  }
}
