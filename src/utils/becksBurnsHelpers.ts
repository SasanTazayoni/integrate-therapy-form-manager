export type SubmitPayload = {
  token: string;
  result: string;
};

export type SubmitResponse = {
  ok: boolean;
  error?: string;
  code?: string;
};

export type SubmitFormParams = {
  token?: string;
  result: string;
  submitFn: (payload: SubmitPayload) => Promise<SubmitResponse>;
  setFormError: (msg: string) => void;
  setShowInvalidTokenModal: (show: boolean) => void;
  navigate: (path: string) => void;
};

export const submitFormWithToken = async ({
  token,
  result,
  submitFn,
  setFormError,
  setShowInvalidTokenModal,
  navigate,
}: SubmitFormParams) => {
  if (!token) {
    setFormError("Token missing");
    return;
  }

  setFormError("");

  const { ok, error, code } = await submitFn({ token, result });

  if (!ok) {
    if (code === "INVALID_TOKEN") {
      setShowInvalidTokenModal(true);
      return;
    }

    setFormError(error ?? "Failed to submit the form.");
    return;
  }

  navigate("/submitted");
};
