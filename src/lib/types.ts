import { Card } from "ts-fsrs";

export type CardWithContent = Card & {
  id: string;
  question: string;
  answer: string;
  created_at: number;
  updated_at: number;
};
