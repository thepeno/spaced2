import { z } from 'zod';

const MAX_INPUT_LENGTH = 20000;

export const cardContentFormSchema = z.object({
  front: z
    .string()
    .min(1, {
      message: 'Question is required.',
    })
    .max(MAX_INPUT_LENGTH, {
      message: 'Question is too long.',
    })
    .describe('The question for the flashcard.'),
  back: z
    .string()
    .min(1, {
      message: 'Answer is required.',
    })
    .max(MAX_INPUT_LENGTH, {
      message: 'Answer is too long.',
    })
    .describe('The answer for the flashcard.'),
});

export type CardContentFormValues = z.infer<typeof cardContentFormSchema>;
