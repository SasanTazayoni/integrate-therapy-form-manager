export type Item = {
  id: number;
  prompt: string;
  options: { value: 1 | 2 | 3 | 4 | 5 | 6; text: string }[];
  category: string;
};

export const OPTIONS: { value: 1 | 2 | 3 | 4 | 5 | 6; text: string }[] = [
  { value: 1, text: "Completely untrue of me" },
  { value: 2, text: "Mostly untrue of me" },
  { value: 3, text: "Slightly more true than untrue" },
  { value: 4, text: "Moderately true of me" },
  { value: 5, text: "Mostly true of me" },
  { value: 6, text: "Describes me perfectly" },
];
