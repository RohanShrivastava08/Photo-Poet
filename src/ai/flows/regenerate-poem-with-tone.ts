// regenerate-poem-with-tone.ts
'use server';

/**
 * @fileOverview A flow to regenerate a poem with a specified tone.
 *
 * - regeneratePoemWithTone - A function that regenerates a poem based on the provided image and desired tone.
 * - RegeneratePoemWithToneInput - The input type for the regeneratePoemWithTone function.
 * - RegeneratePoemWithToneOutput - The return type for the regeneratePoemWithTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegeneratePoemWithToneInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo used to inspire the poem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
  tone: z
    .string()
    .describe(
      'The desired tone of the poem (e.g., optimistic, melancholic, humorous).'
    ),
});
export type RegeneratePoemWithToneInput = z.infer<
  typeof RegeneratePoemWithToneInputSchema
>;

const RegeneratePoemWithToneOutputSchema = z.object({
  poem: z.string().describe('The regenerated poem with the specified tone.'),
});
export type RegeneratePoemWithToneOutput = z.infer<
  typeof RegeneratePoemWithToneOutputSchema
>;

export async function regeneratePoemWithTone(
  input: RegeneratePoemWithToneInput
): Promise<RegeneratePoemWithToneOutput> {
  return regeneratePoemWithToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regeneratePoemWithTonePrompt',
  input: {schema: RegeneratePoemWithToneInputSchema},
  output: {schema: RegeneratePoemWithToneOutputSchema},
  prompt: `You are a skilled poet who can generate poems from images.

  Given the following image and requested tone, write a poem inspired by the image.
  The poem should reflect the specified tone.

  Image: {{media url=photoDataUri}}
  Tone: {{{tone}}}

  Poem:`, 
});

const regeneratePoemWithToneFlow = ai.defineFlow(
  {
    name: 'regeneratePoemWithToneFlow',
    inputSchema: RegeneratePoemWithToneInputSchema,
    outputSchema: RegeneratePoemWithToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
