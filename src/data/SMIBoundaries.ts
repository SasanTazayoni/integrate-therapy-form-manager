export const smiBoundaries: Record<string, number[]> = {
  smi_vc_score: [1, 1.47, 1.98, 3.36, 4.47, 6],
  smi_ac_score: [1, 1.81, 2.29, 3.09, 4.03, 6],
  smi_ec_score: [1, 1.2, 1.49, 2.05, 2.97, 6],
  smi_ic_score: [1, 2.15, 2.68, 3.05, 4.12, 6],
  smi_uc_score: [1, 2.27, 2.87, 3.47, 3.89, 6],
  smi_cc_score: [6, 5.06, 4.52, 2.88, 2.11, 1],
  smi_cs_score: [1, 2.51, 3.07, 3.63, 4.27, 6],
  smi_dp_score: [1, 1.59, 2.11, 2.95, 3.89, 6],
  smi_dss_score: [1, 1.93, 2.58, 3.32, 4.3, 6],
  smi_sa_score: [1, 2.31, 2.9, 3.49, 4.08, 6],
  smi_ba_score: [1, 1.72, 2.23, 2.74, 3.25, 6],
  smi_pp_score: [1, 1.47, 1.86, 2.75, 3.72, 6],
  smi_dc_score: [1, 3.06, 3.66, 4.26, 4.86, 6],
  smi_ha_score: [6, 5.16, 4.6, 3.6, 2.77, 1],
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

export const categoryKeyMap: Record<string, string> = {
  "Vulnerable Child": "smi_vc_score",
  "Angry Child": "smi_ac_score",
  "Enraged Child": "smi_ec_score",
  "Impulsive Child": "smi_ic_score",
  "Undisciplined Child": "smi_uc_score",
  "Contented Child": "smi_cc_score",
  "Compliant Surrenderer": "smi_cs_score",
  "Detached Protector": "smi_dp_score",
  "Detached Self-Soother": "smi_dss_score",
  "Self-Aggrandizer": "smi_sa_score",
  "Bully and Attack": "smi_ba_score",
  "Punitive Parent": "smi_pp_score",
  "Demanding Parent": "smi_dc_score",
  "Healthy Adult": "smi_ha_score",
};

export const boundaryMap: Record<string, string> = {
  "Very Low": "Very Low - Average",
  Low: "Very Low - Average",
  Average: "Average - Moderate",
  Moderate: "Moderate - High",
  High: "High – Very High",
  "Very High": "Very High - Severe",
  Severe: "Very High - Severe",
};

export function getBoundary(
  scoreStr: string | null | undefined
): string | null {
  if (!scoreStr) return null;
  const parts = scoreStr.split("-");
  const level = parts[1]?.trim();
  return boundaryMap[level as keyof typeof boundaryMap] || null;
}
