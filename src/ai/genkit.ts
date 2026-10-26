import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const NEXUS_AI_PROVIDER = 'Google Gemini';
export const NEXUS_AI_MODEL = 'googleai/gemini-2.5-flash';

export const ai = genkit({
  plugins: [googleAI()],
  model: NEXUS_AI_MODEL,
});
