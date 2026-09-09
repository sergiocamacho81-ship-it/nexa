export const MEMBERSHIP_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;

export const MEMBERSHIP_ROLE_LABELS: Record<(typeof MEMBERSHIP_ROLES)[number], string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};
