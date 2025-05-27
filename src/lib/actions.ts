// src/lib/actions.ts
'use server';

import { generatePoem as generatePoemFlow, type GeneratePoemInput } from '@/ai/flows/generate-poem';
import { regeneratePoemWithLength as regeneratePoemWithLengthFlow, type RegeneratePoemWithLengthInput } from '@/ai/flows/regenerate-poem-with-length';
import { regeneratePoemWithTone as regeneratePoemWithToneFlow, type RegeneratePoemWithToneInput } from '@/ai/flows/regenerate-poem-with-tone';

export async function handleGeneratePoem(
  photoDataUri: string,
  stylePreferences?: string
) {
  try {
    const input: GeneratePoemInput = { photoDataUri, stylePreferences };
    const result = await generatePoemFlow(input);
    return { success: true, poem: result.poem };
  } catch (error) {
    console.error('Error generating poem:', error);
    return { success: false, error: 'Failed to generate poem.' };
  }
}

export async function handleRegeneratePoemWithLength(
  photoDataUri: string,
  poemLength: 'short' | 'medium' | 'long'
) {
  try {
    const input: RegeneratePoemWithLengthInput = { photoDataUri, poemLength };
    const result = await regeneratePoemWithLengthFlow(input);
    return { success: true, poem: result.poem };
  } catch (error) {
    console.error('Error regenerating poem with length:', error);
    return { success: false, error: 'Failed to regenerate poem with length.' };
  }
}

export async function handleRegeneratePoemWithTone(
  photoDataUri: string,
  tone: string
) {
  try {
    const input: RegeneratePoemWithToneInput = { photoDataUri, tone };
    const result = await regeneratePoemWithToneFlow(input);
    return { success: true, poem: result.poem };
  } catch (error) {
    console.error('Error regenerating poem with tone:', error);
    return { success: false, error: 'Failed to regenerate poem with tone.' };
  }
}
