// This is an autogenerated file from Firebase Studio.
'use server';

/**
 * @fileOverview Generates a poem inspired by a photo.
 *
 * - generatePoem - A function that handles the poem generation process.
 * - GeneratePoemInput - The input type for the generatePoem function.
 * - GeneratePoemOutput - The return type for the generatePoem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePoemInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to inspire the poem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  stylePreferences: z.string().optional().describe('Optional preferences for the poem style, such as tone and length.'),
});
export type GeneratePoemInput = z.infer<typeof GeneratePoemInputSchema>;

const GeneratePoemOutputSchema = z.object({
  poem: z.string().describe('The generated poem inspired by the photo.'),
});
export type GeneratePoemOutput = z.infer<typeof GeneratePoemOutputSchema>;

export async function generatePoem(input: GeneratePoemInput): Promise<GeneratePoemOutput> {
  return generatePoemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePoemPrompt',
  input: {schema: GeneratePoemInputSchema},
  output: {schema: GeneratePoemOutputSchema},
  prompt: `You are a poet skilled at writing poems inspired by images.

  Analyze the image provided and compose a poem that reflects its visual aspects, themes, and emotions.  Consider the composition, colors, objects, and overall mood of the photo.

  Image: {{media url=photoDataUri}}

  {{#if stylePreferences}}
  Consider these style preferences: {{{stylePreferences}}}
  {{/if}}
  `,
});

const generatePoemFlow = ai.defineFlow(
  {
    name: 'generatePoemFlow',
    inputSchema: GeneratePoemInputSchema,
    outputSchema: GeneratePoemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
