import { useState } from "react";

const ProtectedForm = ({ children }: { children: React.ReactNode }) => {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_FORM_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enter Password to Access the Form</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Enter</button>
    </form>
  );
};

export default ProtectedForm;
