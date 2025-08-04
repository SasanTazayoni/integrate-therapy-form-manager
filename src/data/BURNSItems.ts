export type Item = {
  id: string;
  text: string;
  category: string;
  options: { value: 0 | 1 | 2 | 3; text: string }[];
};

const OPTIONS: { value: 0 | 1 | 2 | 3; text: string }[] = [
  { value: 0, text: "Not at all" },
  { value: 1, text: "Somewhat" },
  { value: 2, text: "Moderately" },
  { value: 3, text: "A lot" },
];

const categorizedPrompts = [
  {
    category: "ANXIOUS FEELINGS",
    questions: [
      "Anxiety, nervousness, worry or fear",
      "Feeling things around you are strange or foggy",
      "Feeling detached from all or part of your body",
      "Sudden unexpected panic spells",
      "Apprehension or a sense of impending doom",
      "Feeling tense, stress, “uptight” or on edge",
    ],
  },
  {
    category: "ANXIOUS THOUGHTS",
    questions: [
      "Difficulty concentrating",
      "Racing thoughts",
      "Frightening fantasies or daydreams",
      "Feeling on the verge of losing control",
      "Fears of cracking up or going crazy",
      "Fears of fainting or passing out",
      "Fears of illnesses, heart attacks or dying",
      "Fears of looking foolish in front of others",
      "Fears of being alone, isolated or abandoned",
      "Fears of criticism or disapproval",
      "Fears that something terrible will happen",
    ],
  },
  {
    category: "PHYSICAL SYMPTOMS",
    questions: [
      "Skipping, racing or pounding of the heart",
      "Pain, pressure or tightness in the chest",
      "Tingling or numbness in the toes or fingers",
      "Butterflies or discomfort in the stomach",
      "Constipation or diarrhea",
      "Restlessness or jumpiness",
      "Tight, tense muscles",
      "Sweating not brought on by heat",
      "A lump in the throat",
      "Trembling or shaking",
      "Rubbery or “jelly” legs",
      "Feeling dizzy, lightheaded or off balance",
      "Choking or smothering sensations",
      "Headaches or pains in the neck or back",
      "Hot flashes or cold chills",
      "Feeling tired, weak or easily exhausted",
    ],
  },
];

const BURNS_ITEMS: Item[] = [];

categorizedPrompts.forEach(({ category, questions }) => {
  questions.forEach((text) => {
    const id = (BURNS_ITEMS.length + 1).toString();
    BURNS_ITEMS.push({ id, text, category, options: OPTIONS });
  });
});

export default BURNS_ITEMS;
