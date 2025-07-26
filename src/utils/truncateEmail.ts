export default function truncateEmail(email: string, maxLength = 16) {
  if (email.length <= maxLength) return email;
  return email.slice(0, maxLength - 1) + "…";
}
