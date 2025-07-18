export async function handleFormSubmission({ request }: { request: Request }) {
  const formData = await request.formData();

  const token = formData.get("token");
  const fullName = formData.get("fullName");
  const dob = formData.get("dob");
  const result = formData.get("result");

  try {
    const res = await fetch("/api/submit-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        fullName,
        dob,
        result,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Submission failed");
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Something went wrong" };
  }
}
