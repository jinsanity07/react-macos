const darkThemeQuery = "(prefers-color-scheme: dark)";

export const getPreferredDarkTheme = (): boolean => {
  if (typeof window === "undefined") return true;
  return window.matchMedia(darkThemeQuery).matches;
};

export const applyDocumentTheme = (dark: boolean): void => {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("dark", dark);
};

export const watchPreferredDarkTheme = (
  onChange: (dark: boolean) => void
): (() => void) => {
  if (typeof window === "undefined") return () => undefined;

  const mediaQueryList = window.matchMedia(darkThemeQuery);
  const handleChange = (event: MediaQueryListEvent): void => onChange(event.matches);

  onChange(mediaQueryList.matches);

  if (typeof mediaQueryList.addEventListener === "function") {
    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }

  mediaQueryList.addListener(handleChange);
  return () => mediaQueryList.removeListener(handleChange);
};
