import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import QuestionnaireForm from "../components/QuestionnaireForm";

type Item = {
  id: number;
  prompt: string;
  options: { value: 0 | 1 | 2 | 3; text: string }[];
};

const ITEMS: Item[] = [
  {
    id: 1,
    prompt: "1.",
    options: [
      { value: 0, text: "I do not feel sad." },
      { value: 1, text: "I feel sad" },
      { value: 2, text: "I am sad all the time and I can't snap out of it." },
      { value: 3, text: "I am so sad and unhappy that I can't stand it." },
    ],
  },
  {
    id: 2,
    prompt: "2.",
    options: [
      { value: 0, text: "I am not particularly discouraged about the future." },
      { value: 1, text: "I feel discouraged about the future." },
      { value: 2, text: "I feel I have nothing to look forward to." },
      {
        value: 3,
        text: "I feel the future is hopeless and that things cannot improve.",
      },
    ],
  },
  {
    id: 3,
    prompt: "3.",
    options: [
      { value: 0, text: "I do not feel like a failure." },
      { value: 1, text: "I feel I have failed more than the average person." },
      {
        value: 2,
        text: "As I look back on my life, all I can see is a lot of failures.",
      },
      { value: 3, text: "I feel I am a complete failure as a person." },
    ],
  },
  {
    id: 4,
    prompt: "4.",
    options: [
      {
        value: 0,
        text: "I get as much satisfaction out of things as I used to.",
      },
      { value: 1, text: "I don't enjoy things the way I used to." },
      {
        value: 2,
        text: "I don't get real satisfaction out of anything anymore.",
      },
      { value: 3, text: "I am dissatisfied or bored with everything." },
    ],
  },
  {
    id: 5,
    prompt: "5.",
    options: [
      { value: 0, text: "I don't feel particularly guilty" },
      { value: 1, text: "I feel guilty a good part of the time." },
      { value: 2, text: "I feel quite guilty most of the time." },
      { value: 3, text: "I feel guilty all of the time." },
    ],
  },
  {
    id: 6,
    prompt: "6.",
    options: [
      { value: 0, text: "I don't feel I am being punished." },
      { value: 1, text: "I feel I may be punished." },
      { value: 2, text: "I expect to be punished." },
      { value: 3, text: "I feel I am being punished." },
    ],
  },
  {
    id: 7,
    prompt: "7.",
    options: [
      { value: 0, text: "I don't feel disappointed in myself." },
      { value: 1, text: "I am disappointed in myself." },
      { value: 2, text: "I am disgusted with myself." },
      { value: 3, text: "I hate myself." },
    ],
  },
  {
    id: 8,
    prompt: "8.",
    options: [
      { value: 0, text: "I don't feel I am any worse than anybody else." },
      {
        value: 1,
        text: "I am critical of myself for my weaknesses or mistakes.",
      },
      { value: 2, text: "I blame myself all the time for my faults." },
      { value: 3, text: "I blame myself for everything bad that happens." },
    ],
  },
  {
    id: 9,
    prompt: "9.",
    options: [
      { value: 0, text: "I don't have any thoughts of killing myself." },
      {
        value: 1,
        text: "I have thoughts of killing myself, but I would not carry them out.",
      },
      { value: 2, text: "I would like to kill myself." },
      { value: 3, text: "I would kill myself if I had the chance." },
    ],
  },
  {
    id: 10,
    prompt: "10.",
    options: [
      { value: 0, text: "I don't cry any more than usual." },
      { value: 1, text: "I cry more now than I used to." },
      { value: 2, text: "I cry all the time now." },
      {
        value: 3,
        text: "I used to be able to cry, but now I can't cry even though I want to.",
      },
    ],
  },
  {
    id: 11,
    prompt: "11.",
    options: [
      { value: 0, text: "I am no more irritated by things than I ever was." },
      { value: 1, text: "I am slightly more irritated now than usual." },
      {
        value: 2,
        text: "I am quite annoyed or irritated a good deal of the time.",
      },
      { value: 3, text: "I feel irritated all the time." },
    ],
  },
  {
    id: 12,
    prompt: "12.",
    options: [
      { value: 0, text: "I have not lost interest in other people." },
      {
        value: 1,
        text: "I am less interested in other people than I used to be.",
      },
      { value: 2, text: "I have lost most of my interest in other people." },
      { value: 3, text: "I have lost all of my interest in other people." },
    ],
  },
  {
    id: 13,
    prompt: "13.",
    options: [
      { value: 0, text: "I make decisions about as well as I ever could." },
      { value: 1, text: "I put off making decisions more than I used to." },
      {
        value: 2,
        text: "I have greater difficulty in making decisions than I used to.",
      },
      { value: 3, text: "I can't make decisions at all anymore." },
    ],
  },
  {
    id: 14,
    prompt: "14.",
    options: [
      { value: 0, text: "I don't feel that I look any worse than I used to." },
      { value: 1, text: "I am worried that I am looking old or unattractive." },
      {
        value: 2,
        text: "I feel there are permanent changes in my appearance that make me look unattractive",
      },
      { value: 3, text: "I believe that I look ugly." },
    ],
  },
  {
    id: 15,
    prompt: "15.",
    options: [
      { value: 0, text: "I can work about as well as before." },
      {
        value: 1,
        text: "It takes an extra effort to get started at doing something.",
      },
      { value: 2, text: "I have to push myself very hard to do anything." },
      { value: 3, text: "I can't do any work at all." },
    ],
  },
  {
    id: 16,
    prompt: "16.",
    options: [
      { value: 0, text: "I can sleep as well as usual." },
      { value: 1, text: "I don't sleep as well as I used to." },
      {
        value: 2,
        text: "I wake up 1–2 hours earlier than usual and find it hard to get back to sleep.",
      },
      {
        value: 3,
        text: "I wake up several hours earlier than I used to and cannot get back to sleep.",
      },
    ],
  },
  {
    id: 17,
    prompt: "17.",
    options: [
      { value: 0, text: "I don't get more tired than usual." },
      { value: 1, text: "I get tired more easily than I used to." },
      { value: 2, text: "I get tired from doing almost anything." },
      { value: 3, text: "I am too tired to do anything." },
    ],
  },
  {
    id: 18,
    prompt: "18.",
    options: [
      { value: 0, text: "My appetite is no worse than usual." },
      { value: 1, text: "My appetite is not as good as it used to be." },
      { value: 2, text: "My appetite is much worse now." },
      { value: 3, text: "I have no appetite at all anymore." },
    ],
  },
  {
    id: 19,
    prompt: "19.",
    options: [
      { value: 0, text: "I haven't lost much weight, if any, lately." },
      { value: 1, text: "I have lost more than five pounds." },
      { value: 2, text: "I have lost more than ten pounds." },
      { value: 3, text: "I have lost more than fifteen pounds." },
    ],
  },
  {
    id: 20,
    prompt: "20.",
    options: [
      { value: 0, text: "I am no more worried about my health than usual." },
      {
        value: 1,
        text: "I am worried about physical problems like aches, pains, upset stomach, or constipation.",
      },
      {
        value: 2,
        text: "I am very worried about physical problems and it's hard to think of much else.",
      },
      {
        value: 3,
        text: "I am so worried about my physical problems that I cannot think of anything else.",
      },
    ],
  },
  {
    id: 21,
    prompt: "21.",
    options: [
      {
        value: 0,
        text: "I have not noticed any recent change in my interest in sex.",
      },
      { value: 1, text: "I am less interested in sex than I used to be." },
      { value: 2, text: "I have almost no interest in sex." },
      { value: 3, text: "I have lost interest in sex completely." },
    ],
  },
];

const BECKS = () => {
  const { token } = useParams<{ token: string }>();
  const [answers, setAnswers] = useState<Record<number, 0 | 1 | 2 | 3>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const total = useMemo(
    () => ITEMS.reduce((sum, item) => sum + (answers[item.id] ?? 0), 0),
    [answers]
  );

  const handleChange = (qId: number, val: 0 | 1 | 2 | 3) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  return (
    <QuestionnaireForm
      title="BECKS"
      questionnaire="BECKS"
      token={token}
      onError={setFormError}
    >
      <div className="questionnaire">
        {ITEMS.map((item) => (
          <fieldset key={item.id} className="question">
            <legend className="question-title">{item.prompt}</legend>
            <div className="options">
              {item.options.map((opt, idx) => {
                const inputId = `q${item.id}-${opt.value}`;
                const name = `q${item.id}`;
                const checked = answers[item.id] === opt.value;
                return (
                  <div className="option" key={opt.value}>
                    <input
                      id={inputId}
                      className="option-input"
                      type="radio"
                      name={name}
                      value={opt.value}
                      checked={checked || false}
                      onChange={() => handleChange(item.id, opt.value)}
                      required={idx === 0}
                    />
                    <label htmlFor={inputId} className="option-label">
                      <span className="badge">{opt.value}</span>
                      <span>{opt.text}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <input type="hidden" name="result" value={total} />

      <div className="flex justify-center mt-8 space-x-4">
        <button
          type="submit"
          className="bg-blue-500 text-white px-8 py-2 rounded hover:bg-blue-600 transition"
        >
          Submit
        </button>

        <button
          type="button"
          className="bg-gray-500 text-white px-8 py-2 rounded hover:bg-gray-600 transition"
          onClick={() => {
            setAnswers({});
            setFormError(null);
          }}
        >
          Reset
        </button>
      </div>

      {formError && (
        <p className="text-red-600 text-center mt-4">{formError}</p>
      )}
    </QuestionnaireForm>
  );
};

export default BECKS;
