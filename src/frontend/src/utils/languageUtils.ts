/** Format a language slug for display: "english_1k" -> "English 1k" */
export function formatLanguage(language: string): string {
  return language
    .split("_")
    .map((word) =>
      /^\d/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}
