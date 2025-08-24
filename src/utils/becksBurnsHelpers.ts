export type SubmitFormParams = {
  token?: string;
  result: string | number;
  submitFn: (
    payload: any
  ) => Promise<{ ok: boolean; error?: string; code?: string }>;
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
