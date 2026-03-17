import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { IPL_TEAMS } from '../data';

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const srgbToLin = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

const relLum = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const R = srgbToLin(r);
  const G = srgbToLin(g);
  const B = srgbToLin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

const contrastRatio = (a: string, b: string) => {
  const L1 = relLum(a);
  const L2 = relLum(b);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
};

const pickReadable = (primary: string, secondary: string, bg: string) => {
  const c1 = contrastRatio(primary, bg);
  const c2 = contrastRatio(secondary, bg);
  return c1 >= c2 ? primary : secondary;
};

export default function Home({ theme, toggleTheme }: { theme: 'dark' | 'light'; toggleTheme: () => void }) {
  const navigate = useNavigate();

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen transition-colors duration-500 font-sans ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100'
          : 'bg-gradient-to-br from-sky-50 via-slate-100 to-slate-200 text-slate-900'
      }`}
    >
      {/* Stadium light beams / halo */}
      <div className="pointer-events-none fixed inset-0 opacity-40 mix-blend-screen">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-gradient-radial from-emerald-500/40 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-conic from-sky-500/40 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-conic from-violet-500/40 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Top HUD */}
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-3 rounded-full px-3 py-1 border border-emerald-500/40 bg-emerald-500/5 backdrop-blur"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-inter tracking-[0.25em] uppercase text-emerald-300">
                Live Squad Lab · IPL 2026
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-500 bg-clip-text text-transparent">
                  IPL Labs
                </span>
              </h1>
              <p className="mt-2 text-sm sm:text-base font-inter tracking-[0.2em] uppercase text-slate-400">
                Build futuristic XIs · Enforce real IPL rules · Share cinematic lineups
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex items-center gap-3 self-start md:self-auto"
          >
            <button
              onClick={() => navigate('/presets')}
              className={`hidden sm:inline-flex items-center justify-center h-11 px-4 rounded-2xl border transition-all duration-300 font-inter text-xs uppercase tracking-[0.18em] ${
                isDark
                  ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200'
                  : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-sm'
              }`}
            >
              Saved Presets
            </button>
            <div
              className={`hidden sm:flex flex-col items-end px-4 py-2 rounded-2xl border text-xs font-inter uppercase tracking-[0.18em] ${
                isDark
                  ? 'border-slate-700 bg-slate-900/70 text-slate-300'
                  : 'border-slate-300 bg-white/80 text-slate-700 shadow-sm'
              }`}
            >
              <span className="text-[10px] opacity-60 mb-0.5">Mode</span>
              <span className="flex items-center gap-2 font-semibold">
                {isDark ? 'Night Stadium' : 'Day Stadium'}
                <span
                  className={`h-1.5 w-6 rounded-full ${
                    isDark ? 'bg-gradient-to-r from-emerald-400 to-sky-400' : 'bg-gradient-to-r from-amber-400 to-rose-400'
                  }`}
                />
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className={`relative inline-flex items-center justify-center h-11 w-11 rounded-2xl border transition-all duration-300 ${
                isDark
                  ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-amber-300 shadow-[0_0_30px_rgba(250,204,21,0.25)]'
                  : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-md'
              }`}
            >
              <span className="absolute inset-[2px] rounded-[0.9rem] bg-gradient-to-br from-slate-950/40 to-slate-800/10 pointer-events-none" />
              <span className="relative text-lg">{isDark ? '☀️' : '🌙'}</span>
            </button>
          </motion.div>
        </header>

        {/* Hero strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45 }}
          className={`mb-10 rounded-3xl border px-4 sm:px-6 py-4 sm:py-5 overflow-hidden relative ${
            isDark
              ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-900/60 via-slate-900/80 to-sky-900/60'
              : 'border-sky-300/60 bg-gradient-to-r from-sky-50 via-emerald-50 to-slate-50'
          }`}
        >
          <div className="absolute inset-y-0 right-0 w-40 sm:w-64 opacity-40 pointer-events-none">
            <div className="h-full w-full bg-[radial-gradient(circle_at_0_0,rgba(56,189,248,0.6),transparent_60%),radial-gradient(circle_at_100%_100%,rgba(52,211,153,0.6),transparent_60%)]" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div>
              <p className="text-xs font-inter uppercase tracking-[0.28em] text-emerald-300">
                Choose your franchise
              </p>
              <p className="mt-1 text-sm sm:text-base text-slate-300/90">
                Tap a team card to enter a holographic team lab and craft your perfect XI.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs sm:text-sm font-inter">
              <div className="flex flex-col items-start">
                <span className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Squads loaded</span>
                <span className="font-semibold text-slate-100">
                  {IPL_TEAMS.length}{' '}
                  <span className="text-slate-400 font-normal tracking-[0.18em] uppercase ml-1">Franchises</span>
                </span>
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Rules</span>
                <span className="font-semibold text-emerald-300">Impact · Overseas · XI</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
        >
          {IPL_TEAMS.map((team, index) => (
            <motion.button
              key={team.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/team/${team.id}`)}
              className={`relative flex flex-col items-stretch rounded-3xl border backdrop-blur-md overflow-hidden group transition-all duration-300 ${
                isDark
                  ? 'border-slate-800/80 bg-slate-900/70 hover:border-emerald-400/60 hover:bg-slate-900/90 shadow-[0_0_40px_rgba(16,185,129,0.35)]'
                  : 'border-slate-200 bg-white/90 hover:border-sky-400/70 hover:bg-white shadow-md hover:shadow-xl'
              }`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
                <div className="absolute -top-24 left-0 w-full h-56 bg-gradient-to-b from-emerald-400/25 via-transparent to-transparent blur-2xl" />
              </div>

              <div className="flex items-center justify-between px-4 pt-4">
                <span className="text-[11px] font-inter uppercase tracking-[0.25em] text-slate-500">
                  {team.shortName} • 2026
                </span>
                <span
                  className="h-1.5 w-10 rounded-full"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${team.color}, ${team.secondaryColor})`,
                  }}
                />
              </div>

              <div className="flex flex-col items-center px-5 pt-3 pb-5">
                <div
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mb-3 shadow-[0_0_40px_rgba(15,23,42,0.9)]"
                  style={{
                    backgroundImage: isDark
                      ? `radial-gradient(circle at 30% 0, rgba(255,255,255,0.15), transparent 55%), radial-gradient(circle at 80% 100%, rgba(15,23,42,0.9), rgba(15,23,42,1))`
                      : 'radial-gradient(circle at 30% 0, rgba(255,255,255,0.9), rgba(226,232,240,1))',
                    border: `3px solid ${team.color}`,
                  }}
                >
                  <div className="absolute inset-0 rounded-full border border-white/20 opacity-60" />
                  <img
                    src={team.logoUrl}
                    alt={team.name}
                    className="relative w-[80%] h-[80%] object-contain drop-shadow-[0_0_18px_rgba(0,0,0,0.65)]"
                    onError={(e) => {
                      const initials = team.shortName;
                      const bg = team.color.replace('#', '');
                      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150"><rect width="150" height="150" fill="#${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="50" font-weight="bold">${initials}</text></svg>`;
                      e.currentTarget.src = `data:image/svg+xml;base64,${btoa(svg)}`;
                    }}
                  />
                </div>

                <h2
                  className="text-lg sm:text-xl font-black uppercase tracking-wide text-center"
                  style={{
                    color: pickReadable(
                      team.color,
                      team.secondaryColor,
                      isDark ? '#020617' : '#ffffff'
                    ),
                  }}
                >
                  {team.name}
                </h2>
                <p className="mt-1 text-[11px] font-inter tracking-[0.22em] uppercase text-slate-400">
                  Tap to enter team lab
                </p>
              </div>

              <div
                className={`flex items-center justify-between px-5 py-3 text-xs font-inter border-t ${
                  isDark ? 'border-slate-800/80' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="uppercase tracking-[0.2em]">Squad Ready</span>
                </div>
                <span className="text-[11px] uppercase tracking-[0.22em] text-slate-500 group-hover:text-emerald-400 transition-colors">
                  Build XI →
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
