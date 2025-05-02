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

  return (
    <>
      <div className={`app-content ${!authenticated ? "blurred" : ""}`}>
        {children}
      </div>

      {!authenticated && (
        <div className="overlay">
          <form className="modal" onSubmit={handleSubmit}>
            <h2>Enter Password</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button type="submit">Access Form</button>
          </form>
        </div>
      )}
    </>
  );
};

export default ProtectedForm;
