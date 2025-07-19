import { useState } from "react";

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [formsCompleted, setFormsCompleted] = useState<number | null>(null);
  const [searched, setSearched] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleCheckProgress = () => {
    if (!email.trim()) {
      setError("Input cannot be empty");
      return;
    }
    if (!validateEmail(email)) {
      setError("This email is not valid");
      return;
    }

    setError("");
    setSearched(true);

    // Simulated progress (replace with real fetch logic later)
    const completedForms = Math.floor(Math.random() * 5); // 0 to 4
    setFormsCompleted(completedForms);
  };

  const handleClear = () => {
    setEmail("");
    setError("");
    setSearched(false);
    setFormsCompleted(null);
  };

  return (
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
          setSearched(false);
        }}
        placeholder="Enter client email"
        className={`w-full p-2 border rounded mb-1 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />

      {/* Error message with fixed space */}
      <p className="text-red-600 text-sm mb-4 text-center font-bold min-h-[1.25rem]">
        {error || "\u00A0"}
      </p>

      {/* Buttons */}
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
          YSQ Form (Coming Next)
        </button>
        <button className="bg-gray-200 px-4 py-2 rounded" disabled>
          SMI Form (Coming Next)
        </button>
        <button className="bg-gray-200 px-4 py-2 rounded" disabled>
          BECKS Form (Coming Next)
        </button>
        <button className="bg-gray-200 px-4 py-2 rounded" disabled>
          BURNS Form (Coming Next)
        </button>
      </div>
    </div>
  );
}
