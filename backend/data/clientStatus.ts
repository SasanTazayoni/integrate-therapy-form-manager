export const CLIENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type ClientStatus = (typeof CLIENT_STATUS)[keyof typeof CLIENT_STATUS];
