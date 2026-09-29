function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function localIsoDate(date: Date): string {
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
