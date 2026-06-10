import { useThemeStore } from "../store/themeStore";

export function DarkModeToggle() {
  const { dark, toggle } = useThemeStore();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      {dark ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 14a4 4 0 100-8 4 4 0 000 8zm0 2a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM4.22 5.636a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm12.02 12.02a1 1 0 011.415 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM3 12a1 1 0 110 2H2a1 1 0 110-2h1zm18 0a1 1 0 110 2h-1a1 1 0 110-2h1zM5.636 19.778a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM17.657 7.757a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}
