export function parseDateStrict(input: string | Date): Date | null {
  const parsedDate = input instanceof Date ? input : new Date(input);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}
