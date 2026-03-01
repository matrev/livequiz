export const quizTheme = {
  shell:
    "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white",
  page: "mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10",
  header: "mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center",
  title: "text-2xl font-bold leading-tight text-white sm:text-3xl",
  subtitle: "text-sm text-white/70",
  panel: "landing-panel rounded-xl p-4 sm:rounded-2xl sm:p-6",
  sectionTitle: "mb-3 text-lg font-semibold text-white sm:mb-4 sm:text-xl",
  mutedText: "text-sm text-white/65",
  label: "landing-label",
  input: "landing-input mb-3 min-h-11 text-base sm:mb-4",
  textarea: "landing-input min-h-28 resize-y text-base",
  select: "landing-input mb-3 min-h-11 text-base sm:mb-4",
  radioLabel:
    "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-base text-white/85",
  inlineActions: "flex flex-wrap items-center gap-3",
  buttonPrimary:
    "landing-btn inline-flex min-h-11 items-center justify-center px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50",
  buttonOutline:
    "landing-btn landing-btn-outline inline-flex min-h-11 items-center justify-center px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50",
  buttonDanger:
    "inline-flex min-h-11 items-center justify-center rounded-full border border-red-300/35 bg-red-400/15 px-4 py-2.5 text-sm font-semibold text-red-100 transition hover:bg-red-400/25 disabled:cursor-not-allowed disabled:opacity-50",
  buttonNeutral:
    "inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50",
  noticeError:
    "mb-5 rounded-xl border border-red-300/35 bg-red-400/15 px-4 py-3 text-sm text-red-100",
  noticeSuccess:
    "mb-5 rounded-xl border border-emerald-300/35 bg-emerald-400/15 px-4 py-3 text-sm text-emerald-100",
  itemCard:
    "rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm transition hover:border-cyan-300/55 hover:bg-white/10 sm:rounded-2xl sm:p-5",
  tableWrap: "overflow-x-auto rounded-2xl border border-white/20 bg-white/5",
  tableHeader:
    "border-b border-white/20 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-white/70 sm:px-4",
  tableCell: "border-b border-white/10 px-3 py-3 text-sm whitespace-nowrap text-white/90 sm:px-4",
} as const;
