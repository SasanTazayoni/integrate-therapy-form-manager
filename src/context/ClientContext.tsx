import { createContext, useState, useContext, ReactNode } from "react";
import type { ClientFormsStatus } from "../types/formStatusTypes";

type ClientContextType = {
  email: string;
  setEmail: (email: string) => void;
  clientFormsStatus: ClientFormsStatus | null;
  setClientFormsStatus: (status: ClientFormsStatus | null) => void;
  successMessage: string;
  setSuccessMessage: (msg: string) => void;
  error: string;
  setError: (msg: string) => void;
};

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState("");
  const [clientFormsStatus, setClientFormsStatus] =
    useState<ClientFormsStatus | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <ClientContext.Provider
      value={{
        email,
        setEmail,
        clientFormsStatus,
        setClientFormsStatus,
        successMessage,
        setSuccessMessage,
        error,
        setError,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context)
    throw new Error("useClientContext must be used within ClientProvider");
  return context;
};
