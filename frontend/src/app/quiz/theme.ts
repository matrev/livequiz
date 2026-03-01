export const quizTheme = {
  shell:
    "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white",
  page: "mx-auto w-full max-w-5xl px-6 py-10",
  header: "mb-8 flex flex-wrap items-center justify-between gap-4",
  title: "text-3xl font-bold text-white",
  subtitle: "text-sm text-white/70",
  panel: "landing-panel",
  sectionTitle: "mb-4 text-xl font-semibold text-white",
  mutedText: "text-sm text-white/65",
  label: "landing-label",
  input: "landing-input",
  textarea: "landing-input min-h-24 resize-y",
  select: "landing-input",
  radioLabel:
    "flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85",
  inlineActions: "flex flex-wrap items-center gap-3",
  buttonPrimary:
    "landing-btn inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50",
  buttonOutline:
    "landing-btn landing-btn-outline inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50",
  buttonDanger:
    "inline-flex items-center justify-center rounded-full border border-red-300/35 bg-red-400/15 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-400/25 disabled:cursor-not-allowed disabled:opacity-50",
  buttonNeutral:
    "inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50",
  noticeError:
    "mb-5 rounded-xl border border-red-300/35 bg-red-400/15 px-4 py-3 text-sm text-red-100",
  noticeSuccess:
    "mb-5 rounded-xl border border-emerald-300/35 bg-emerald-400/15 px-4 py-3 text-sm text-emerald-100",
  itemCard:
    "rounded-2xl border border-white/20 bg-white/5 p-5 backdrop-blur-sm transition hover:border-cyan-300/55 hover:bg-white/10",
  tableWrap: "overflow-x-auto rounded-2xl border border-white/20 bg-white/5",
  tableHeader:
    "border-b border-white/20 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70",
  tableCell: "border-b border-white/10 px-4 py-3 text-sm text-white/90",
} as const;
