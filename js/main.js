// Shared behaviour for every page: theme toggle and mobile nav.
// No dependencies. Loaded with `defer`.

const root = document.documentElement;
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ---- Theme toggle ----------------------------------------------------------
// The saved choice is applied by the inline script in <head> before first
// paint; this only keeps the button in sync and handles clicks.
const themeToggle = document.querySelector('.theme-toggle');

function isDark() {
  const chosen = root.dataset.theme;
  return chosen ? chosen === 'dark' : darkQuery.matches;
}

function syncThemeToggle() {
  themeToggle?.setAttribute('aria-pressed', String(isDark()));
}

function setTheme(theme) {
  root.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this page.
  }
  syncThemeToggle();
}

themeToggle?.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  if (document.startViewTransition && !reducedMotion.matches) {
    document.startViewTransition(() => setTheme(next));
  } else {
    setTheme(next);
  }
});

darkQuery.addEventListener('change', syncThemeToggle);
syncThemeToggle();

// ---- Mobile nav ------------------------------------------------------------
const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');

function setNavOpen(open) {
  header.toggleAttribute('data-nav-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
}

if (header && navToggle) {
  navToggle.addEventListener('click', () => {
    setNavOpen(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  // Escape closes the menu and returns focus to the button.
  header.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.hasAttribute('data-nav-open')) {
      setNavOpen(false);
      navToggle.focus();
    }
  });
}
