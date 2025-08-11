export type Item = {
  id: number;
  prompt: string;
  options: { value: 1 | 2 | 3 | 4 | 5 | 6; text: string }[];
  category: string;
};

export const OPTIONS: { value: 1 | 2 | 3 | 4 | 5 | 6; text: string }[] = [
  { value: 1, text: "Never or Almost Never" },
  { value: 2, text: "Rarely" },
  { value: 3, text: "Occasionally" },
  { value: 4, text: "Frequently" },
  { value: 5, text: "Most of the time" },
  { value: 6, text: "All of the time" },
];
