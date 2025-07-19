import { useState } from "react";
import ProtectedAccess from "../components/ProtectedAccess";

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [errorFadingOut, setErrorFadingOut] = useState(false);
  const [formsCompleted, setFormsCompleted] = useState<number | null>(null);
  const [searched, setSearched] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleCheckProgress = () => {
    if (!email.trim()) {
      setError("Input cannot be empty");
      setErrorFadingOut(false);
      return;
    }
    if (!validateEmail(email)) {
      setError("This email is not valid");
      setErrorFadingOut(false);
      return;
    }

    setError("");
    setErrorFadingOut(false);
    setSearched(true);

    const completedForms = Math.floor(Math.random() * 5);
    setFormsCompleted(completedForms);
  };

  const handleClear = () => {
    setEmail("");
    setSearched(false);
    setFormsCompleted(null);

    if (error) {
      setErrorFadingOut(true);
      setTimeout(() => {
        setError("");
        setErrorFadingOut(false);
      }, 500);
    }
  };

  return (
    <ProtectedAccess>
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Integrate Therapy Form Manager
        </h1>

        <label className="block mb-2 text-sm font-medium text-center">
          {searched
            ? `Client Email — Forms completed: ${formsCompleted} / 4`
            : "Please enter client email to check the progress"}
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
            setErrorFadingOut(false);
            setSearched(false);
          }}
          placeholder="Enter client email"
          className={`w-full p-2 border rounded mb-1 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />

        <p
          className={`text-red-600 text-sm mb-4 text-center font-bold min-h-[1.25rem] transition-opacity duration-500`}
          style={{ opacity: error && !errorFadingOut ? 1 : 0 }}
        >
          {error || "\u00A0"}
        </p>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleCheckProgress}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Check
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Clear
          </button>
        </div>

        <div className="grid gap-2">
          <button className="bg-gray-200 px-4 py-2 rounded" disabled>
            Send YSQ Form (Coming Next)
          </button>
          <button className="bg-gray-200 px-4 py-2 rounded" disabled>
            Send SMI Form (Coming Next)
          </button>
          <button className="bg-gray-200 px-4 py-2 rounded" disabled>
            Send BECKS Form (Coming Next)
          </button>
          <button className="bg-gray-200 px-4 py-2 rounded" disabled>
            Send BURNS Form (Coming Next)
          </button>
        </div>
      </div>
    </ProtectedAccess>
  );
}
