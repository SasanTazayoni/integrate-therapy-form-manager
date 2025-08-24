import { NavigateFunction } from "react-router-dom";
import { submitYSQForm } from "../api/formsFrontend";
import { Item } from "../data/YSQCommon";

export const normalizeCode = (code: string): string =>
  code.split("/")[0].toLowerCase();

export const extractNumber = (value: string | null | undefined): string => {
  if (!value) return "";
  const match = value.match(/^\d+/);
  return match ? match[0] : "";
};

export const extractRating = (value: string | null | undefined): string => {
  if (!value) return "";
  const match = value.match(/-(.+)$/);
  return match ? match[1] : "";
};

export const shouldHighlight = (rating: string): boolean =>
  ["high", "very high", "severe"].some((r) => rating.toLowerCase().includes(r));

export type YSQSchema = { key: string; label: string; data: Item[] };

export const submitYSQWithToken = async ({
  token,
  answers,
  schemas,
  setFormError,
  setShowInvalidTokenModal,
  navigate,
}: {
  token?: string;
  answers: Record<string, number>;
  schemas: YSQSchema[];
  setFormError: (msg: string) => void;
  setShowInvalidTokenModal: (val: boolean) => void;
  navigate: NavigateFunction;
}) => {
  if (!token) {
    setFormError("Token missing");
    return;
  }

  const scores = schemas.reduce((acc, schema) => {
    acc[`ysq_${schema.key}_answers`] = schema.data.map((item) =>
      Number(answers[item.id] ?? 0)
    );
    return acc;
  }, {} as Record<string, number[]>);

  const { ok, error, code } = await submitYSQForm({ token, scores });

  if (!ok) {
    if (code === "INVALID_TOKEN") {
      setShowInvalidTokenModal(true);
      return;
    }
    setFormError(error ?? "Failed to submit the YSQ form.");
    return;
  }

  setFormError("");
  navigate("/submitted");
};
