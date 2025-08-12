export const smiBoundaries: Record<string, number[]> = {
  smi_vc_score: [1, 1.47, 1.98, 3.36, 4.47, 6], // Vulnerable Child
  smi_ac_score: [1, 1.81, 2.29, 3.09, 4.03, 6], // Angry Child
  smi_ec_score: [1, 1.2, 1.49, 2.05, 2.97, 6], // Enraged Child
  smi_ic_score: [1, 2.15, 2.68, 3.05, 4.12, 6], // Impulsive Child
  smi_uc_score: [1, 2.27, 2.87, 3.47, 3.89, 6], // Undisciplined Child
  smi_cc_score: [6, 5.06, 4.52, 2.88, 2.11, 1], // Contented Child (Reversed)
  smi_cs_score: [1, 2.51, 3.07, 3.63, 4.27, 6], // Compliant Surrenderer
  smi_dp_score: [1, 1.59, 2.11, 2.95, 3.89, 6], // Detached Protector
  smi_dss_score: [1, 1.93, 2.58, 3.32, 4.3, 6], // Detached Self-Soother
  smi_sa_score: [1, 2.31, 2.9, 3.49, 4.08, 6], // Self-Aggrandizer
  smi_ba_score: [1, 1.72, 2.23, 2.74, 3.25, 6], // Bully and Attack
  smi_pp_score: [1, 1.47, 1.86, 2.75, 3.72, 6], // Punitive Parent
  smi_dc_score: [1, 3.06, 3.66, 4.26, 4.86, 6], // Demanding Parent
  smi_ha_score: [6, 5.16, 4.6, 3.6, 2.77, 1], // Healthy Adult (Reversed)
};

export const labels = [
  "Very Low",
  "Average",
  "Moderate",
  "High",
  "Very High",
  "Severe",
];

export function classifyScore(score: number, boundaries: number[]): string {
  let closestIndex = 0;
  let smallestDiff = Infinity;
  boundaries.forEach((boundary, idx) => {
    const diff = Math.abs(score - boundary);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestIndex = idx;
    }
  });
  return labels[closestIndex];
}

export const labelToBoundaryKey: Record<string, string> = {
  "vulnerable child": "smi_vc_score",
  "angry child": "smi_ac_score",
  "enraged child": "smi_ec_score",
  "impulsive child": "smi_ic_score",
  "undisciplined child": "smi_uc_score",
  "contented child": "smi_cc_score",
  "compliant surrenderer": "smi_cs_score",
  "detached protector": "smi_dp_score",
  "detached self soother": "smi_dss_score",
  "self aggrandizer": "smi_sa_score",
  "bully and attack": "smi_ba_score",
  "punitive parent": "smi_pp_score",
  "demanding parent": "smi_dc_score",
  "healthy adult": "smi_ha_score",
};

export function normalizeLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/[\(\)\-\–]/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function randomScoreBetween(min: number, max: number): number {
  const val = min + Math.random() * (max - min);
  return Math.round(val * 100) / 100;
}

export function generateScore(scaleKey: string): string {
  const boundaries = smiBoundaries[scaleKey];
  const segment = Math.floor(Math.random() * (boundaries.length - 1));
  let low = boundaries[segment];
  let high = boundaries[segment + 1];
  if (low > high) [low, high] = [high, low];
  const score = randomScoreBetween(low, high);
  const category = classifyScore(score, boundaries);
  return `${score} - ${category}`;
}
