type SchemaType =
  | "ED" // Emotional Deprivation
  | "AB" // Abandonment
  | "MA" // Mistrust/Abuse
  | "SI" // Social Isolation
  | "DS" // Defectiveness
  | "FA" // Failure
  | "DI" // Dependence
  | "VU" // Vulnerability
  | "EU" // Enmeshment
  | "SB" // Subjugation
  | "SS" // Self Sacrifice
  | "EI" // Emotional Inhibition
  | "US" // Unrelenting Standards
  | "ET" // Entitlement
  | "IS" // Insufficient Self Control
  | "AS" // Approval Seeking
  | "NP" // Negativity/Pessimism
  | "PU"; // Punitiveness

export default function getScoreCategory(
  schema: SchemaType,
  score: number
): string {
  const boundaries: Record<SchemaType, [number, number, number]> = {
    ED: [8, 18, 30],
    AB: [12, 25, 39],
    MA: [12, 25, 39],
    SI: [8, 18, 30],
    DS: [12, 25, 39],
    FA: [8, 18, 30],
    DI: [12, 25, 39],
    VU: [8, 18, 30],
    EU: [8, 18, 30],
    SB: [8, 18, 30],
    SS: [12, 25, 39],
    EI: [8, 18, 30],
    US: [12, 25, 39],
    ET: [8, 18, 30],
    IS: [12, 25, 39],
    AS: [12, 25, 39],
    NP: [8, 18, 30],
    PU: [12, 25, 39],
  };

  const [lowMax, medMax, highMax] = boundaries[schema];

  if (score <= lowMax) return "Low";
  if (score <= medMax) return "Medium";
  if (score <= highMax) return "High";
  return "Very High";
}
