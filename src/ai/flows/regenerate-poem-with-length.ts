// regenerate-poem-with-length.ts
'use server';

/**
 * @fileOverview A flow for regenerating a poem with a specified length.
 *
 * - regeneratePoemWithLength - A function that regenerates a poem based on the image and desired length.
 * - RegeneratePoemWithLengthInput - The input type for the regeneratePoemWithLength function.
 * - RegeneratePoemWithLengthOutput - The return type for the regeneratePoemWithLength function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegeneratePoemWithLengthInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  poemLength: z
    .enum(['short', 'medium', 'long'])
    .describe('The desired length of the poem: short, medium, or long.'),
});

export type RegeneratePoemWithLengthInput = z.infer<
  typeof RegeneratePoemWithLengthInputSchema
>;

const RegeneratePoemWithLengthOutputSchema = z.object({
  poem: z.string().describe('The regenerated poem.'),
});

export type RegeneratePoemWithLengthOutput = z.infer<
  typeof RegeneratePoemWithLengthOutputSchema
>;

export async function regeneratePoemWithLength(
  input: RegeneratePoemWithLengthInput
): Promise<RegeneratePoemWithLengthOutput> {
  return regeneratePoemWithLengthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regeneratePoemWithLengthPrompt',
  input: {schema: RegeneratePoemWithLengthInputSchema},
  output: {schema: RegeneratePoemWithLengthOutputSchema},
  prompt: `You are a poet who generates poems based on images.

You will analyze the image provided and compose a poem that reflects its visual aspects, theme, tone, and imagery.

The poem should be of the following length: {{{poemLength}}}

Image: {{media url=photoDataUri}}`,
});

const regeneratePoemWithLengthFlow = ai.defineFlow(
  {
    name: 'regeneratePoemWithLengthFlow',
    inputSchema: RegeneratePoemWithLengthInputSchema,
    outputSchema: RegeneratePoemWithLengthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
