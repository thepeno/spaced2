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
  exampleSentence: z
    .string()
    .max(MAX_INPUT_LENGTH, {
      message: 'Example sentence is too long.',
    })
    .optional()
    .describe('Example sentence in target language.'),
  exampleSentenceTranslation: z
    .string()
    .max(MAX_INPUT_LENGTH, {
      message: 'Example sentence translation is too long.',
    })
    .optional()
    .describe('Translation of example sentence in native language.'),
});

export type CardContentFormValues = z.infer<typeof cardContentFormSchema>;

export const assistedCardFormSchema = z.object({
  word: z
    .string()
    .min(1, {
      message: 'Word is required.',
    })
    .max(100, {
      message: 'Word is too long.',
    })
    .describe('The word to generate a flashcard for.'),
});
export type AssistedCardFormValues = z.infer<typeof assistedCardFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(8, {
      message: 'Password must be at least 8 characters long.',
    })
    .max(128, {
      message: 'Password must be less than 128 characters long.',
    }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z
      .string()
      .min(8, {
        message: 'Password must be at least 8 characters long.',
      })
      .max(128, {
        message: 'Password must be less than 128 characters long.',
      }),
    confirmPassword: z
      .string()
      .min(8, {
        message: 'Password must be at least 8 characters long.',
      })
      .max(128, {
        message: 'Password must be less than 128 characters long.',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const verifyOtpFormSchema = z.object({
  pin: z.string().min(8, {
    message: 'Your one-time password must be 8 characters.',
  }),
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpFormSchema>;

export const deckFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .max(30, { message: 'Name must be less than 30 characters.' }),
  description: z
    .string()
    .min(1, { message: 'Description is required.' })
    .max(300, { message: 'Description is too long.' })
    .optional(),
  nativeLanguage: z.string().optional(),
  targetLanguage: z.string().optional(),
});

export type DeckFormValues = z.infer<typeof deckFormSchema>;
