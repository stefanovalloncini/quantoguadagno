export const SOURCE_REPOSITORY_URL: string | null =
  "https://github.com/stefanovalloncini/quantoguadagno";

export function licenseUrlOf(repositoryUrl: string): string {
  return `${repositoryUrl}/blob/main/LICENSE`;
}
