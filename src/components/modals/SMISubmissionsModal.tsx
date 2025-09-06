import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { useClientContext } from "../../context/ClientContext";
import { fetchAllSmiForms } from "../../api/formsFrontend";
import { formatDate } from "../../utils/formatDate";
import Modal from "../Modal";
import Button from "../ui/Button";

type SMISubmissionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  setLocalSmiScores: React.Dispatch<
    React.SetStateAction<Record<string, string | null>>
  >;
  setLocalSmiSubmittedAt: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
};

export default function SMISubmissionsModal({
  isOpen,
  onClose,
  setLocalSmiScores,
  setLocalSmiSubmittedAt,
}: SMISubmissionsModalProps) {
  const { email } = useClientContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smiForms, setSmiForms] = useState<
    {
      id: string;
      submittedAt: string;
      smiScores: Record<string, string | null>;
    }[]
  >([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchForms = async () => {
      if (!email) {
        setError("No client email available.");
        setSmiForms([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetchAllSmiForms(email);
        const forms = res.data.smiForms ?? [];

        if (res.ok) {
          if (forms.length === 0) {
            setSmiForms([]);
            setError("No SMI submissions found.");
          } else {
            setSmiForms(
              forms.map((f) => ({
                id: f.id,
                submittedAt: formatDate(f.submittedAt),
                smiScores: f.smiScores,
              }))
            );
          }
        } else {
          setError("Failed to fetch SMI submissions.");
          setSmiForms([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch SMI submissions.");
        setSmiForms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [isOpen, email]);

  const handleSelect = (form: {
    submittedAt: string;
    smiScores: Record<string, string | null>;
  }) => {
    const keyMap: Record<string, string> = {
      vc: "smi_vc_score",
      ac: "smi_ac_score",
      ec: "smi_ec_score",
      ic: "smi_ic_score",
      uc: "smi_uc_score",
      cc: "smi_cc_score",
      cs: "smi_cs_score",
      dp: "smi_dp_score",
      dss: "smi_dss_score",
      sa: "smi_sa_score",
      ba: "smi_ba_score",
      pp: "smi_pp_score",
      dc: "smi_dc_score",
      ha: "smi_ha_score",
    };

    const normalizedScores: Record<string, string | null> = {};

    Object.entries(form.smiScores).forEach(([shortKey, value]) => {
      const fullKey = keyMap[shortKey];
      if (fullKey) normalizedScores[fullKey] = value ?? null;
    });

    setLocalSmiScores(normalizedScores);
    setLocalSmiSubmittedAt(form.submittedAt);
  };

  if (!isOpen) return null;

  return (
    <Modal ariaLabelledBy="smi-submissions-title" onOverlayClick={onClose}>
      <div className="items-center mb-4">
        <h2
          id="smi-submissions-title"
          className="text-lg font-bold text-center"
        >
          Previous SMI Submissions
        </h2>
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader className="w-6 h-6 text-gray-500 animate-spin" />
        </div>
      )}

      {error && <p className="text-red-600 mb-2">{error}</p>}

      {!loading && !error && smiForms.length === 0 && (
        <p className="text-gray-600">No previous SMI submissions found.</p>
      )}

      {!loading && smiForms.length > 0 && (
        <ul className="space-y-2 mb-2">
          {smiForms.map((form) => {
            const disabled = Object.keys(form.smiScores).length === 0;
            return (
              <li key={form.id}>
                <span
                  onClick={() => !disabled && handleSelect(form)}
                  className={`cursor-pointer ${
                    disabled
                      ? "cursor-not-allowed text-gray-400"
                      : "text-blue-500 hover:text-blue-700"
                  }`}
                >
                  {form.submittedAt}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex justify-center mt-4">
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}
