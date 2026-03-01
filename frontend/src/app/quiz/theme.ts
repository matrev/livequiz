const fieldBase =
  "w-full rounded-landing-input border border-landing-inputBorder bg-landing-inputBg px-4 py-3 text-base text-landing-inputText";
const fieldFocus = "focus:outline-2 focus:outline-landing-focus focus:outline-offset-2";
const inputLike = `${fieldBase} ${fieldFocus}`;

const buttonBase =
  "inline-flex min-h-11 items-center justify-center px-4 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50";
const buttonLandingBase = `${buttonBase} rounded-landing-pill`;

export const quizTheme = {
  shell:
    "min-h-screen bg-slate-950 bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950 text-white",
  page: "mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10",
  header: "mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center",
  title: "text-2xl font-bold leading-tight text-white sm:text-3xl",
  subtitle: "text-sm text-landing-text",
  panel:
    "rounded-landing-card border border-landing-border bg-landing-panel p-4 shadow-landing-panel backdrop-blur-[10px] sm:rounded-2xl sm:p-6",
  sectionTitle: "mb-3 text-lg font-semibold text-white sm:mb-4 sm:text-xl",
  mutedText: "text-sm text-landing-label",
  label: "mb-[0.4rem] block text-xs uppercase tracking-[0.2em] text-landing-label",
  input: `mb-3 min-h-11 ${inputLike} sm:mb-4`,
  textarea: `min-h-28 resize-y ${inputLike}`,
  select: `mb-3 min-h-11 ${inputLike} sm:mb-4`,
  radioLabel:
    "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-landing-border bg-landing-surface px-3 py-2.5 text-base text-landing-text",
  inlineActions: "flex flex-wrap items-center gap-3",
  buttonPrimary:
    `${buttonLandingBase} bg-landing-primary text-landing-primaryText`,
  buttonOutline:
    `${buttonLandingBase} border border-landing-focus bg-transparent text-landing-outlineText`,
  buttonDanger:
    "inline-flex min-h-11 items-center justify-center rounded-full border border-red-300/35 bg-red-400/15 px-4 py-2.5 text-sm font-semibold text-red-100 transition hover:bg-red-400/25 disabled:cursor-not-allowed disabled:opacity-50",
  buttonNeutral:
    "inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50",
  noticeError:
    "mb-5 rounded-xl border border-red-300/35 bg-red-400/15 px-4 py-3 text-sm text-red-100",
  noticeSuccess:
    "mb-5 rounded-xl border border-emerald-300/35 bg-emerald-400/15 px-4 py-3 text-sm text-emerald-100",
  itemCard:
    "rounded-xl border border-landing-border bg-landing-surface p-4 backdrop-blur-sm transition hover:border-landing-focus hover:bg-white/10 sm:rounded-2xl sm:p-5",
  tableWrap: "overflow-x-auto rounded-2xl border border-landing-border bg-landing-surface",
  tableHeader:
    "border-b border-landing-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-landing-label sm:px-4",
  tableCell: "border-b border-landing-border px-3 py-3 text-sm whitespace-nowrap text-landing-text sm:px-4",
} as const;
