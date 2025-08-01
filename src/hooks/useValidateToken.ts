import { useState, useEffect } from "react";
import { validateFormToken } from "../api/formsFrontend";

export default function useValidateToken(token?: string) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showInvalidTokenModal, setShowInvalidTokenModal] = useState(false);

  useEffect(() => {
    if (!token) {
      setShowInvalidTokenModal(true);
      setIsValid(false);
      return;
    }

    let active = true;

    const checkToken = async () => {
      const { ok } = await validateFormToken(token);
      if (!active) return;

      if (!ok) {
        setShowInvalidTokenModal(true);
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    };

    checkToken();

    return () => {
      active = false;
    };
  }, [token]);

  return { isValid, showInvalidTokenModal, setShowInvalidTokenModal };
}
