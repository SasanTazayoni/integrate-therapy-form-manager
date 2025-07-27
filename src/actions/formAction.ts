import axios from "axios";

export async function handleFormSubmission({ request }: { request: Request }) {
  const formData = await request.formData();

  const token = formData.get("token");
  const fullName = formData.get("fullName");
  const dob = formData.get("dob");
  const result = formData.get("result");

  try {
    await axios.post("/submit-form", {
      token,
      fullName,
      dob,
      result,
    });

    return { success: true };
  } catch (err: any) {
    return {
      error:
        err.response?.data?.message || err.message || "Something went wrong",
    };
  }
}
