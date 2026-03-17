import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Moon, Sun, Save, Trash2, UserPlus, Users, Download, AlertCircle, CheckCircle2, ArrowLeft, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import html2canvas from 'html2canvas';
import { IPL_TEAMS, Team, Player, Role } from '../data';

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

const downloadTextFile = (filename: string, contents: string, mime: string) => {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

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
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <circle cx="110" cy="110" r="104" fill="url(#g)" filter="url(#shadow)"/>
  <circle cx="110" cy="110" r="98" fill="rgba(0,0,0,0.18)"/>
  <circle cx="110" cy="110" r="92" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.22)" stroke-width="2"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Oswald,Inter,system-ui,sans-serif" font-size="64" font-weight="900" letter-spacing="4">${shortName}</text>
  <text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="Inter,system-ui,sans-serif" font-size="14" font-weight="700" letter-spacing="5">IPL LABS</text>
</svg>`;
  return `data:image/svg+xml;base64,${safeBtoa(svg)}`;
};

const getPlayerImage = (playerName: string, imageId?: string) => {
  if (imageId) {
    return `https://www.iplt20.com/assets/images/teams-player/headshot/${imageId}.png`;
  }
  const bgColors = ['1e3a8a', '14532d', '7f1d1d', '4c1d95', '831843', '0f766e', 'b45309'];
  const bg = bgColors[playerName.length % bgColors.length];
  const initials = playerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150"><rect width="150" height="150" fill="#${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="60" font-weight="bold">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, playerName: string) => {
  const bgColors = ['1e3a8a', '14532d', '7f1d1d', '4c1d95', '831843', '0f766e', 'b45309'];
  const bg = bgColors[playerName.length % bgColors.length];
  const initials = playerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150"><rect width="150" height="150" fill="#${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="60" font-weight="bold">${initials}</text></svg>`;
  const fallbackSrc = `data:image/svg+xml;base64,${btoa(svg)}`;
  
  if (e.currentTarget.src !== fallbackSrc) {
    e.currentTarget.src = fallbackSrc;
  }
};

const SortablePlayer: React.FC<{ player: Player; index: number; onRemove: (p: Player) => void }> = ({
  player,
  index,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex flex-col items-center shadow-xl group relative overflow-hidden transition-transform hover:-translate-y-1 hover:scale-105"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="absolute top-2 left-2 flex gap-1 z-20">
        <button 
          onClick={() => onRemove(player)}
          className="bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-lg"
          title="Remove from XI"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 right-2 text-white/50 hover:text-white cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-20"
      >
        <GripVertical size={16} />
      </div>
      
      <div className="relative w-16 h-16 mb-3">
        <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 border-2 border-white/20 shadow-inner">
          <img crossOrigin="anonymous" src={getPlayerImage(player.name, player.imageId)} alt={player.name} onError={(e) => handleImageError(e, player.name)} className="w-full h-full object-cover object-top" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center font-black text-xs text-white shadow-lg border border-white/20">
          {index + 1}
        </div>
      </div>
      
      <p className="font-bold text-sm truncate w-full text-white uppercase tracking-wide text-center">{player.name}</p>
      <div className="flex items-center gap-1 mt-1.5">
        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
          player.role === 'BAT' ? 'bg-blue-500/40 text-blue-100' :
          player.role === 'BOWL' ? 'bg-red-500/40 text-red-100' :
          player.role === 'AR' ? 'bg-purple-500/40 text-purple-100' :
          'bg-emerald-500/40 text-emerald-100'
        }`}>
          {player.role}
        </span>
        {player.isOverseas && <span className="text-xs" title="Overseas Player">✈️</span>}
      </div>
    </div>
  );
};

export default function TeamBuilder({ theme, toggleTheme }: { theme: 'dark' | 'light', toggleTheme: () => void }) {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const initialTeam = IPL_TEAMS.find(t => t.id === teamId) || IPL_TEAMS[0];
  
  const [selectedTeam, setSelectedTeam] = useState<Team>(initialTeam);
  const [playingXI, setPlayingXI] = useState<Player[]>([]);
  const [impactPlayer, setImpactPlayer] = useState<Player | null>(null);
  const [bench, setBench] = useState<Player[]>(initialTeam.squad);
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  
  const pitchRef = useRef<HTMLDivElement>(null);
  const exportStageRef = useRef<HTMLDivElement | null>(null);

  // Load saved preset on mount or team change
  useEffect(() => {
    const team = IPL_TEAMS.find(t => t.id === teamId);
    if (team) {
      setSelectedTeam(team);
      
      const presetId = searchParams.get('preset');
      const saved = presetId
        ? localStorage.getItem(savedPresetKey(presetId))
        : localStorage.getItem(`ipl2026_preset_${team.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPlayingXI(parsed.playingXI || []);
          setImpactPlayer(parsed.impactPlayer || null);
          
          // Reconstruct bench
          const xiIds = new Set((parsed.playingXI || []).map((p: Player) => p.id));
          if (parsed.impactPlayer) xiIds.add(parsed.impactPlayer.id);
          
          setBench(team.squad.filter(p => !xiIds.has(p.id)));
        } catch (e) {
          console.error("Failed to load preset", e);
          setPlayingXI([]);
          setImpactPlayer(null);
          setBench(team.squad);
        }
      } else {
        setPlayingXI([]);
        setImpactPlayer(null);
        setBench(team.squad);
      }
      setRoleFilter('ALL');
    } else {
      navigate('/');
    }
  }, [teamId, navigate, searchParams]);

  const handleTeamChange = (newTeamId: string) => {
    navigate(`/team/${newTeamId}`);
  };

  const showNotification = (message: string, type: 'error' | 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const overseasCount = playingXI.filter(p => p.isOverseas).length;
  const wkCount = playingXI.filter(p => p.role === 'WK').length;

  const addToXI = (player: Player) => {
    if (playingXI.length >= 11 && impactPlayer) {
      return showNotification("Team is full! (11 Starting + 1 Impact)", "error");
    }
    
    if (playingXI.length >= 11) {
      // Add as impact player
      if (overseasCount === 4 && player.isOverseas) {
        return showNotification("Impact Player must be Indian if 4 overseas players are in the XI.", "error");
      }
      setImpactPlayer(player);
      setBench(bench.filter(p => p.id !== player.id));
      return;
    }

    if (player.isOverseas) {
      if (overseasCount >= 4) {
        return showNotification("Only 4 overseas players allowed in Playing XI!", "error");
      }
      if (overseasCount === 3 && impactPlayer?.isOverseas) {
        return showNotification("Cannot add 4th overseas player because Impact Player is also overseas.", "error");
      }
    }
    setPlayingXI([...playingXI, player]);
    setBench(bench.filter(p => p.id !== player.id));
  };

  const removeFromXI = (player: Player) => {
    setPlayingXI(playingXI.filter(p => p.id !== player.id));
    setBench([...bench, player]);
  };

  const removeImpact = () => {
    if (impactPlayer) {
      setBench([...bench, impactPlayer]);
      setImpactPlayer(null);
    }
  };

  const clearSelections = () => {
    setPlayingXI([]);
    setImpactPlayer(null);
    setBench(selectedTeam.squad);
    showNotification("Selections cleared", "success");
  };

  const savePreset = () => {
    const preset = {
      teamId: selectedTeam.id,
      playingXI,
      impactPlayer
    };
    localStorage.setItem(`ipl2026_preset_${selectedTeam.id}`, JSON.stringify(preset));

    const savedPreset: SavedPreset = {
      id: `${selectedTeam.id}_${Date.now()}`,
      teamId: selectedTeam.id,
      teamShortName: selectedTeam.shortName,
      savedAt: Date.now(),
      playingXI,
      impactPlayer,
    };

    // Store single-preset blob
    localStorage.setItem(savedPresetKey(savedPreset.id), JSON.stringify(savedPreset));
    // Index for listing
    const indexRaw = localStorage.getItem(SAVED_PRESETS_INDEX_KEY);
    const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    index.unshift(savedPreset.id);
    localStorage.setItem(SAVED_PRESETS_INDEX_KEY, JSON.stringify(Array.from(new Set(index)).slice(0, 200)));

    // Download JSON to local directory (user chooses location via browser)
    downloadTextFile(
      `ipl-labs_${selectedTeam.shortName}_${new Date(savedPreset.savedAt).toISOString().replace(/[:.]/g, '-')}.json`,
      JSON.stringify(savedPreset, null, 2),
      'application/json'
    );

    showNotification("Team preset saved (and downloaded)!", "success");
  };

  const logoForUi = useMemo(
    () => makeTeamLogoSvgDataUrl(selectedTeam.shortName, selectedTeam.color, selectedTeam.secondaryColor),
    [selectedTeam.shortName, selectedTeam.color, selectedTeam.secondaryColor]
  );

  const prepareExportNode = () => {
    if (!pitchRef.current) return null;

    // Create a detached clone so we can safely replace external images (CORS-safe export).
    const clone = pitchRef.current.cloneNode(true) as HTMLDivElement;

    // Replace all images with safe, same-origin data URLs.
    const imgs = Array.from(clone.querySelectorAll('img'));
    for (const img of imgs) {
      const alt = (img.getAttribute('alt') || '').trim();
      if (alt === selectedTeam.name || alt === 'Watermark' || alt === '') {
        img.setAttribute('src', logoForUi);
        continue;
      }
      img.setAttribute('src', getPlayerImage(alt || 'Player'));
    }

    const stage = document.createElement('div');
    stage.style.position = 'fixed';
    stage.style.left = '-10000px';
    stage.style.top = '0';
    stage.style.width = `${pitchRef.current.getBoundingClientRect().width}px`;
    stage.style.zIndex = '-1';
    stage.appendChild(clone);
    document.body.appendChild(stage);
    exportStageRef.current = stage;
    return clone;
  };

  const cleanupExportStage = () => {
    if (exportStageRef.current) {
      exportStageRef.current.remove();
      exportStageRef.current = null;
    }
  };

  const exportImage = async () => {
    try {
      const node = prepareExportNode();
      if (!node) return;

      const canvas = await html2canvas(node, {
        backgroundColor: '#14532d', // green-900 to match pitch
        scale: 2,
        useCORS: true,
        allowTaint: false,
      });

      const image = canvas.toDataURL("image/jpeg", 0.92);
      const link = document.createElement('a');
      link.href = image;
      link.download = `IPL Labs team ${selectedTeam.shortName}.jpg`;
      link.click();
      showNotification("Image exported successfully!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to export image", "error");
    } finally {
      cleanupExportStage();
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setPlayingXI((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredBench = bench.filter(p => roleFilter === 'ALL' || p.role === roleFilter);

  const isDark = theme === 'dark';

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`min-h-screen transition-colors duration-500 font-sans ${
          isDark
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100'
            : 'bg-gradient-to-br from-sky-50 via-slate-100 to-slate-200 text-slate-900'
        }`}
      >
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-2xl font-inter ${
              notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-semibold tracking-wide">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stadium lighting backdrop */}
      <div className="pointer-events-none fixed inset-0 opacity-40 mix-blend-screen">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-gradient-radial from-emerald-500/35 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-conic from-sky-500/35 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-conic from-violet-500/35 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-700/30 pb-6">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={() => navigate('/')}
              className={`p-3 rounded-full transition-all duration-300 mr-2 border ${
                isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-200 hover:text-slate-900 shadow-sm'
              }`}
              title="Back to Home"
            >
              <ArrowLeft size={24} />
            </button>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl p-2 bg-slate-950"
              style={{ border: `3px solid ${selectedTeam.color}` }}
            >
              <img
                crossOrigin="anonymous"
                src={selectedTeam.logoUrl}
                alt={selectedTeam.name}
                className="w-full h-full object-contain drop-shadow-[0_0_18px_rgba(0,0,0,0.7)]"
                onError={(e) => {
                  e.currentTarget.src = logoForUi;
                }}
              />
            </div>
            <div>
              <h1
                className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight"
                style={{ color: isDark ? selectedTeam.color : selectedTeam.secondaryColor }}
              >
                {selectedTeam.shortName}{' '}
                <span className={isDark ? "text-slate-200" : "text-slate-900"} style={{ textShadow: isDark ? '0 0 20px rgba(15,23,42,0.9)' : 'none' }}>
                  Labs
                </span>
              </h1>
              <p className="text-sm sm:text-base opacity-80 font-inter tracking-[0.18em] uppercase font-semibold">
                Craft your ultimate {selectedTeam.shortName} XI · Impact era
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-wrap items-center gap-3 font-inter"
          >
            <select
              value={selectedTeam.id}
              onChange={(e) => handleTeamChange(e.target.value)}
              className={`px-4 py-2.5 rounded-xl font-bold border outline-none transition-colors uppercase tracking-wider ${
                isDark
                  ? 'bg-slate-950/70 border-slate-700 text-white focus:border-emerald-400'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
              }`}
            >
              {IPL_TEAMS.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl transition-colors shadow-md border ${
                isDark
                  ? 'bg-slate-950/70 hover:bg-slate-900 text-yellow-400 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={savePreset}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-5 py-3 rounded-xl hover:from-emerald-400 hover:to-sky-400 transition-colors font-bold shadow-lg uppercase tracking-wider"
            >
              <Save size={18} /> <span className="hidden sm:inline">Save Preset</span>
            </button>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Bench/Squad List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lg:col-span-4 rounded-3xl p-4 sm:p-5 border shadow-xl flex flex-col h-[600px] lg:h-[850px] ${
              isDark
                ? 'bg-slate-950/80 border-slate-800/80'
                : 'bg-white/95 border-slate-200 backdrop-blur-sm'
            }`}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-2xl flex items-center gap-2 uppercase tracking-wide">
                <Users size={24} className="text-emerald-500" />
                Squad Bench <span className="text-slate-400">({bench.length})</span>
              </h2>
              <button
                onClick={clearSelections}
                className="text-red-500 text-sm flex items-center gap-1 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors font-bold uppercase tracking-wider"
              >
                 <Trash2 size={16}/> Clear XI
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide font-inter">
              {['ALL', 'BAT', 'BOWL', 'AR', 'WK'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role as Role | 'ALL')}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap uppercase tracking-wider ${
                    roleFilter === role
                      ? 'bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-md scale-105'
                      : isDark
                        ? 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <AnimatePresence>
                {filteredBench.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-40 text-slate-500 opacity-70"
                  >
                    <Users size={40} className="mb-3" />
                    <p className="font-inter font-medium uppercase tracking-widest">No players found</p>
                  </motion.div>
                ) : (
                  filteredBench.map((player) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={player.id}
                      className={`flex justify-between items-center p-3 rounded-2xl transition-all border ${
                        isDark
                          ? 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/70 hover:bg-slate-900'
                          : 'bg-slate-50 border-slate-200 hover:border-sky-400 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border border-white/10 shrink-0">
                          <img
                            crossOrigin="anonymous"
                            src={getPlayerImage(player.name, player.imageId)}
                            alt={player.name}
                            onError={(e) => handleImageError(e, player.name)}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-lg leading-tight flex items-center gap-1.5 uppercase tracking-wide">
                            {player.name}{' '}
                            {player.isOverseas && (
                              <span title="Overseas Player" className="text-sm">
                                ✈️
                              </span>
                            )}
                          </p>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded uppercase font-black tracking-widest mt-1 inline-block ${
                              player.role === 'BAT'
                                ? 'bg-sky-500/20 text-sky-400'
                                : player.role === 'BOWL'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : player.role === 'AR'
                                    ? 'bg-violet-500/20 text-violet-400'
                                    : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {player.role}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToXI(player)}
                          title="Add to XI"
                          className={`p-2.5 rounded-xl transition-colors border ${
                            isDark
                              ? 'bg-slate-900 border-emerald-500/60 text-emerald-300 hover:bg-emerald-500 hover:text-white'
                              : 'bg-white border-emerald-400/60 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          <UserPlus size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right: Pitch View / XI Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8 flex flex-col gap-4"
          >
            {/* Status Bar */}
            <div
              className={`grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-3xl border shadow-xl ${
                isDark
                  ? 'bg-slate-950/80 border-slate-800/80'
                  : 'bg-white/95 border-slate-200 backdrop-blur-sm'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-sm uppercase font-bold opacity-60 mb-1 tracking-widest">Players</span>
                <span className={`text-3xl font-black ${playingXI.length === 11 ? 'text-emerald-500' : ''}`}>
                  {playingXI.length} <span className="text-lg opacity-50 font-semibold">/ 11</span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm uppercase font-bold opacity-60 mb-1 tracking-widest">Overseas</span>
                <span className={`text-3xl font-black ${overseasCount > 4 ? 'text-red-500' : overseasCount === 4 ? 'text-orange-500' : ''}`}>
                  {overseasCount} <span className="text-lg opacity-50 font-semibold">/ 4</span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm uppercase font-bold opacity-60 mb-1 tracking-widest">
                  Wicket Keepers
                </span>
                <span className={`text-3xl font-black ${wkCount === 0 && playingXI.length > 0 ? 'text-red-500' : wkCount > 0 ? 'text-emerald-500' : ''}`}>
                  {wkCount} <span className="text-lg opacity-50 font-semibold">min 1</span>
                </span>
              </div>
              <div className="flex flex-col justify-center items-end">
                <button
                  onClick={exportImage}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-3 rounded-xl hover:from-emerald-400 hover:to-sky-400 transition-colors font-bold text-lg w-full justify-center shadow-lg uppercase tracking-wider"
                >
                  <Download size={20} /> Export
                </button>
              </div>
            </div>

            {/* Pitch Area */}
            <div
              ref={pitchRef}
              className="bg-gradient-to-b from-emerald-800 to-emerald-950 rounded-[2.5rem] p-4 sm:p-6 relative shadow-2xl overflow-hidden min-h-[600px] lg:min-h-[700px] flex flex-col border-[8px] border-emerald-700/60"
            >
              {/* Pitch Pattern Overlay */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.08) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.04) 41px)',
                }}
              ></div>

              {/* Inner Circle (30 yard) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[65%] border-2 border-emerald-200/40 rounded-[100%] pointer-events-none shadow-[0_0_40px_rgba(16,185,129,0.4)]" />

              {/* Pitch Rectangle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-72 bg-[#facc6b]/10 border-2 border-amber-200/60 pointer-events-none rounded-sm shadow-[0_0_35px_rgba(234,179,8,0.4)]" />

              {/* Team Branding Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.045] pointer-events-none w-[420px] h-[420px] grayscale">
                <img
                  crossOrigin="anonymous"
                  src={selectedTeam.logoUrl}
                  alt="Watermark"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = logoForUi;
                  }}
                />
              </div>

              {/* Title inside pitch for export */}
              <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
                <div className="w-12 h-12 bg-black/20 rounded-full p-1 border border-white/20 backdrop-blur-sm">
                  <img
                    crossOrigin="anonymous"
                    src={selectedTeam.logoUrl}
                    alt={selectedTeam.name}
                    className="w-full h-full object-contain drop-shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = logoForUi;
                    }}
                  />
                </div>
                <div>
                  <h2
                    className="text-white font-black text-3xl uppercase tracking-tighter drop-shadow-lg"
                    style={{ textShadow: `2px 2px 0 ${selectedTeam.color}` }}
                  >
                    {selectedTeam.shortName}{' '}
                    <span className="text-emerald-400" style={{ textShadow: 'none' }}>
                      XI
                    </span>
                  </h2>
                  <p className="text-white/80 text-sm font-bold tracking-widest uppercase mt-0.5">
                    IPL 2026 · Tactics View
                  </p>
                </div>
              </div>

              {/* Player Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-10 relative mt-32">
                <SortableContext items={playingXI.map((p) => p.id)} strategy={rectSortingStrategy}>
                  {playingXI.map((player, index) => (
                    <SortablePlayer 
                      key={player.id} 
                      player={player} 
                      index={index} 
                      onRemove={removeFromXI} 
                    />
                  ))}
                </SortableContext>
                
                {/* Empty Slots */}
                {playingXI.length < 11 &&
                  Array(11 - playingXI.length)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="border-2 border-dashed border-white/20 bg-black/10 rounded-2xl p-3 flex flex-col items-center justify-center opacity-60 min-h-[140px]"
                      >
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-3">
                          <span className="text-white/40 text-lg font-black">
                            {playingXI.length + i + 1}
                          </span>
                        </div>
                        <span className="text-xs font-black text-white/40 uppercase tracking-widest">
                          Empty Slot
                        </span>
                      </div>
                    ))}

                {/* Impact Player = 12th slot */}
                <AnimatePresence mode="wait">
                  {impactPlayer ? (
                    <motion.div
                      key="impact-filled"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-gradient-to-br from-orange-500/90 to-amber-500/90 backdrop-blur-md p-3 rounded-2xl border-2 border-orange-300/70 shadow-2xl flex flex-col items-center group relative overflow-hidden cursor-pointer"
                      onClick={removeImpact}
                      title="Click to remove Impact Player"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 left-2 bg-orange-950/60 text-orange-100 px-2 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/20">
                        Impact (12)
                      </div>
                      <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Trash2 size={14} />
                      </div>
                      <div className="relative w-16 h-16 mb-3 mt-4">
                        <div className="w-full h-full rounded-full overflow-hidden bg-orange-900 border-2 border-white/30 shadow-inner">
                          <img
                            crossOrigin="anonymous"
                            src={getPlayerImage(impactPlayer.name, impactPlayer.imageId)}
                            alt={impactPlayer.name}
                            onError={(e) => handleImageError(e, impactPlayer.name)}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-orange-700 rounded-full flex items-center justify-center font-black text-xs text-white shadow-lg border border-white/20">
                          12
                        </div>
                      </div>
                      <p className="font-bold text-sm truncate w-full text-white uppercase tracking-wide text-center">{impactPlayer.name}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest bg-white/15 text-white">
                          {impactPlayer.role}
                        </span>
                        {impactPlayer.isOverseas && <span className="text-xs" title="Overseas Player">✈️</span>}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="impact-empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-2 border-dashed border-orange-200/40 bg-black/10 rounded-2xl p-3 flex flex-col items-center justify-center opacity-70 min-h-[140px]"
                    >
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-orange-200/40 flex items-center justify-center mb-3">
                        <span className="text-orange-100/60 text-lg font-black">
                          12
                        </span>
                      </div>
                      <span className="text-xs font-black text-orange-100/60 uppercase tracking-widest">
                        Impact Slot
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Warnings */}
            <AnimatePresence>
              {wkCount === 0 && playingXI.length === 11 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border-2 border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-start gap-3 font-inter"
                >
                  <AlertCircle className="shrink-0 mt-0.5" size={20} />
                  <p className="text-sm font-bold tracking-wide">Your starting XI does not have a Wicket Keeper. Please add at least one WK.</p>
                </motion.div>
              )}
            </AnimatePresence>
            
          </motion.div>
        </div>
      </div>
    </div>
    </DndContext>
  );
}
