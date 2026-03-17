import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trash2, FolderOpen } from 'lucide-react';
import { IPL_TEAMS, Player } from '../data';

type SavedPreset = {
  id: string;
  teamId: string;
  teamShortName: string;
  savedAt: number;
  playingXI: Player[];
  impactPlayer: Player | null;
};

const SAVED_PRESETS_INDEX_KEY = 'ipl2026_saved_presets_index';
const savedPresetKey = (id: string) => `ipl2026_saved_preset_${id}`;

const safeBtoa = (s: string) => btoa(unescape(encodeURIComponent(s)));
const makeTeamLogoSvgDataUrl = (shortName: string, primary: string, secondary: string) => {
  const p = primary.replace('#', '');
  const s = secondary.replace('#', '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="220" height="220">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#${p}"/>
      <stop offset="1" stop-color="#${s}"/>
    </linearGradient>
  </defs>
  <circle cx="110" cy="110" r="104" fill="url(#g)"/>
  <circle cx="110" cy="110" r="98" fill="rgba(0,0,0,0.22)"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Oswald,Inter,system-ui,sans-serif" font-size="64" font-weight="900" letter-spacing="4">${shortName}</text>
</svg>`;
  return `data:image/svg+xml;base64,${safeBtoa(svg)}`;
};

const loadIndex = (): string[] => {
  try {
    const raw = localStorage.getItem(SAVED_PRESETS_INDEX_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const loadPreset = (id: string): SavedPreset | null => {
  try {
    const raw = localStorage.getItem(savedPresetKey(id));
    return raw ? (JSON.parse(raw) as SavedPreset) : null;
  } catch {
    return null;
  }
};

export default function Presets({ theme }: { theme: 'dark' | 'light' }) {
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [ids, setIds] = useState<string[]>(() => loadIndex());

  const presets = useMemo(() => ids.map((id) => loadPreset(id)).filter(Boolean) as SavedPreset[], [ids]);

  const removePreset = (id: string) => {
    localStorage.removeItem(savedPresetKey(id));
    const next = ids.filter((x) => x !== id);
    localStorage.setItem(SAVED_PRESETS_INDEX_KEY, JSON.stringify(next));
    setIds(next);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 font-sans ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100'
          : 'bg-gradient-to-br from-sky-50 via-slate-100 to-slate-200 text-slate-900'
      }`}
    >
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <header className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className={`p-3 rounded-full transition-all duration-300 border ${
                isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-200 shadow-sm'
              }`}
              title="Back to Home"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">Saved Presets</h1>
              <p className={`text-xs sm:text-sm font-inter uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Stored in localStorage · Includes Impact Player
              </p>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {presets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border p-8 text-center ${
                isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white/90'
              }`}
            >
              <FolderOpen className="mx-auto mb-4 opacity-60" size={40} />
              <p className="font-black uppercase tracking-wider">No presets saved yet</p>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mt-2 font-inter`}>
                Go to a team lab and click Save Preset.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {presets.map((p) => {
                const team = IPL_TEAMS.find((t) => t.id === p.teamId);
                const logo = team ? makeTeamLogoSvgDataUrl(team.shortName, team.color, team.secondaryColor) : undefined;
                return (
                  <motion.div
                    key={p.id}
                    layout
                    className={`rounded-3xl border overflow-hidden ${
                      isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white/90'
                    }`}
                  >
                    <div className="p-4 flex items-center gap-3">
                      {team && (
                        <div className="w-14 h-14 rounded-full border border-white/10 bg-slate-950/40 p-1">
                          <img src={logo} alt={team.name} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-inter uppercase tracking-[0.25em] opacity-70">
                          {new Date(p.savedAt).toLocaleString()}
                        </p>
                        <p className="text-lg font-black uppercase tracking-wide">
                          {team?.name ?? p.teamShortName}
                        </p>
                        <p className={`text-xs font-inter uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          XI: {p.playingXI?.length ?? 0} · Impact: {p.impactPlayer ? p.impactPlayer.name : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <div className={`rounded-2xl border p-3 text-sm ${isDark ? 'border-slate-800 bg-black/20' : 'border-slate-200 bg-slate-50'}`}>
                        <p className="font-black uppercase tracking-wider text-xs opacity-70 mb-2">Playing XI</p>
                        <ol className="grid grid-cols-2 gap-x-3 gap-y-1 font-inter text-xs">
                          {(p.playingXI || []).slice(0, 10).map((pl, idx) => (
                            <li key={pl.id || `${pl.name}_${idx}`} className="truncate">
                              {idx + 1}. {pl.name}
                            </li>
                          ))}
                          {(p.playingXI || []).length > 10 && (
                            <li className="truncate">{11}. {(p.playingXI || [])[10]?.name}</li>
                          )}
                        </ol>
                      </div>
                    </div>

                    <div className="px-4 pb-4 flex gap-3">
                      <button
                        onClick={() => navigate(`/team/${p.teamId}?preset=${encodeURIComponent(p.id)}`)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-4 py-2.5 rounded-xl hover:from-emerald-400 hover:to-sky-400 transition-colors font-bold uppercase tracking-wider"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => removePreset(p.id)}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider border ${
                          isDark
                            ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                            : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                        }`}
                        title="Delete preset"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

