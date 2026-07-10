import { useState, useEffect, useRef } from 'react';
import { supabase, Profile, Trial, AiMetric, TrialMoment, SPORT_TYPES, SPORT_METRICS } from '../lib/supabase';
import {
  User, LogOut, Trophy, Video, BarChart3, Shield,
  Bell, ChevronRight, TrendingUp, Zap, Edit2, Save,
  X, Play, CheckCircle, AlertTriangle, ChevronDown, Star,
  Trash2, Camera, ArrowLeft, Sparkles, GraduationCap,
  ThumbsUp, AlertCircle, Clock, ExternalLink
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import TrialUploadModal from '../components/TrialUploadModal';

interface Props {
  onSignOut: () => void;
}

type Tab = 'overview' | 'trials' | 'leaderboard' | 'profile';
type TrialWithMetrics = Trial & { ai_metrics: AiMetric[]; trial_moments: TrialMoment[] };

export default function Dashboard({ onSignOut }: Props) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trials, setTrials] = useState<TrialWithMetrics[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<TrialWithMetrics | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeMoment, setActiveMoment] = useState<TrialMoment | null>(null);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editSportFocus, setEditSportFocus] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  // Avatar upload
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        loadProfile(data.user.id);
        loadTrials(data.user.id);
      }
    });
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) {
      setProfile(data as Profile);
      setEditFullName(data.full_name ?? '');
      setEditSportFocus(data.sport_focus ?? '');
      setEditUsername(data.username ?? '');
    }
  };

  const loadTrials = async (userId: string) => {
    const { data } = await supabase
      .from('trials')
      .select('*, ai_metrics(*), trial_moments(*)')
      .eq('athlete_id', userId)
      .order('created_at', { ascending: false });
    if (data) setTrials(data as TrialWithMetrics[]);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith('image/')) return;
    setAvatarUploading(true);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    await supabase.storage.from('avatars').remove([path]);
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' });
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
      setProfile((p) => p ? { ...p, avatar_url: url } : p);
    }
    setAvatarUploading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setProfileSaveError('');
    const { error } = await supabase.from('profiles').update({
      full_name: editFullName.trim() || null,
      sport_focus: editSportFocus || null,
      username: editUsername.toLowerCase().trim(),
    }).eq('id', user.id);
    setSavingProfile(false);
    if (error) { setProfileSaveError(error.message); return; }
    setEditingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
    loadProfile(user.id);
  };

  const handleDeleteTrial = async (trialId: string, videoUrl: string | null) => {
    if (!confirm('Delete this trial and its AI analysis? This cannot be undone.')) return;
    setDeletingId(trialId);
    if (videoUrl && user) {
      const pathMatch = videoUrl.match(/trial-videos\/(.+?)(\?|$)/);
      if (pathMatch) await supabase.storage.from('trial-videos').remove([pathMatch[1]]);
    }
    await supabase.from('trials').delete().eq('id', trialId);
    setTrials((prev) => prev.filter((t) => t.id !== trialId));
    if (selectedTrial?.id === trialId) setSelectedTrial(null);
    setDeletingId(null);
  };

  const handleTrialUploaded = () => {
    setShowUploadModal(false);
    if (user) loadTrials(user.id);
    setActiveTab('trials');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const avgScore = trials.length
    ? Math.round(trials.reduce((s, t) => s + (t.ai_metrics?.[0]?.overall_score ?? 0), 0) / trials.length)
    : 0;

  const topSport = trials.length
    ? Object.entries(trials.reduce<Record<string, number>>((a, t) => { a[t.sport_type] = (a[t.sport_type] ?? 0) + 1; return a; }, {}))
        .sort((a, b) => b[1] - a[1])[0]?.[0]
    : null;

  const stats = [
    { label: 'Trials Recorded', value: String(trials.length), icon: <Video size={18} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Avg AI Score', value: trials.length ? `${avgScore}/100` : '--', icon: <Zap size={18} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Top Sport', value: topSport ?? '--', icon: <Trophy size={18} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Scout Views', value: '0', icon: <TrendingUp size={18} />, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  const navItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
    { key: 'trials', label: 'My Trials', icon: <Video size={18} /> },
    { key: 'leaderboard', label: 'AI Scores', icon: <Trophy size={18} /> },
    { key: 'profile', label: 'Profile', icon: <User size={18} /> },
  ];

  const getStatusBadge = (status: Trial['status']) => {
    const map = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      completed: 'bg-green-500/10 text-green-400 border-green-500/20',
      flagged: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return <span className={`text-xs border px-2 py-0.5 rounded-full ${map[status]}`}>{status}</span>;
  };

  const scoreColor = (s: number) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-cyan-400' : s >= 40 ? 'text-yellow-400' : 'text-red-400';
  const scoreBar = (s: number) => {
    const c = s >= 80 ? 'bg-green-500' : s >= 60 ? 'bg-cyan-500' : s >= 40 ? 'bg-yellow-500' : 'bg-red-500';
    return <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className={`h-full ${c} rounded-full`} style={{ width: `${s}%` }} /></div>;
  };

  const AvatarOrIcon = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const dim = size === 'lg' ? 'w-20 h-20' : size === 'md' ? 'w-10 h-10' : 'w-8 h-8';
    const iconSize = size === 'lg' ? 32 : size === 'md' ? 18 : 14;
    return profile?.avatar_url ? (
      <img src={profile.avatar_url} alt="avatar" className={`${dim} rounded-full object-cover border-2 border-cyan-500/30`} />
    ) : (
      <div className={`${dim} rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center flex-shrink-0`}>
        <User size={iconSize} className="text-cyan-400" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#080d14] text-white flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0a0f1a] border-r border-white/5 p-6">
        <div className="flex items-center gap-3 mb-10">
          <img src="/WhatsApp_Image_2026-06-14_at_6.48.44_PM.jpeg" alt="Ravin Sports" className="w-10 h-10 rounded-xl object-cover" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight">Ravin Sports</p>
            <p className="text-xs text-gray-500">DSTA</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.key
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
              {item.key === 'trials' && trials.length > 0 && (
                <span className="ml-auto text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">{trials.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/5 pt-5">
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-sm font-semibold py-2.5 rounded-xl transition-colors mb-4"
          >
            <Video size={15} />
            Record Trial
          </button>
          <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => setActiveTab('profile')}>
            <AvatarOrIcon size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name ?? profile?.username ?? user?.email?.split('@')[0] ?? 'Athlete'}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">{profile?.sport_focus ?? 'athlete'}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 w-full text-sm text-gray-400 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/5">
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0f1a]/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img src="/WhatsApp_Image_2026-06-14_at_6.48.44_PM.jpeg" alt="logo" className="w-8 h-8 rounded-lg object-cover lg:hidden" />
            <div>
              <h1 className="text-xl font-bold text-white">
                {activeTab === 'overview' && 'Athlete Overview'}
                {activeTab === 'trials' && 'My Trials'}
                {activeTab === 'leaderboard' && 'AI Scores'}
                {activeTab === 'profile' && 'My Profile'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Created by Ravin &mdash; Smart India Hackathon</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="hidden sm:flex items-center gap-2 text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <Video size={14} />
              Record Trial
            </button>
            <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Bell size={16} className="text-gray-400" />
            </button>
            <button className="lg:hidden" onClick={() => setActiveTab('profile')}>
              <AvatarOrIcon size="sm" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto pb-24 lg:pb-6">

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-cyan-400 text-sm font-medium mb-1">Welcome back</p>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {profile?.full_name ?? (profile?.username ? profile.username : user?.email ?? 'Athlete')}
                    </h2>
                    <p className="text-gray-400 text-sm max-w-sm">
                      {trials.length === 0
                        ? 'Record your first sports trial to begin AI assessment.'
                        : `${trials.length} trial${trials.length > 1 ? 's' : ''} recorded. Keep pushing for glory!`}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <AvatarOrIcon size="md" />
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 inline-flex items-center gap-2 text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <Video size={14} />
                  {trials.length === 0 ? 'Record First Trial' : 'Record New Trial'}
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-[#0d1520] border border-white/5 rounded-2xl p-5">
                    <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3 ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <p className="text-2xl font-bold text-white mb-1 truncate">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {trials.length > 0 && (
                <div className="bg-[#0d1520] border border-white/5 rounded-2xl">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <h3 className="font-bold flex items-center gap-2"><Video size={16} className="text-cyan-400" />Recent Trials</h3>
                    <button onClick={() => setActiveTab('trials')} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">View all</button>
                  </div>
                  <div className="divide-y divide-white/5">
                    {trials.slice(0, 3).map((trial) => {
                      const m = trial.ai_metrics?.[0];
                      return (
                        <button key={trial.id} onClick={() => { setSelectedTrial(trial); setActiveTab('trials'); }} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors text-left">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                            <Play size={14} className="text-cyan-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{trial.sport_type}</p>
                            <p className="text-xs text-gray-500">{new Date(trial.created_at).toLocaleDateString()}</p>
                          </div>
                          {m && <p className={`text-lg font-bold flex-shrink-0 ${scoreColor(m.overall_score ?? 0)}`}>{m.overall_score ?? '--'}</p>}
                          {getStatusBadge(trial.status)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#0d1520] border border-white/5 rounded-2xl p-5">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Zap size={16} className="text-cyan-400" />AI Analysis Pipeline</h3>
                  <div className="space-y-3">
                    {['Pose Estimation (MediaPipe)', 'Sport-Specific Metric Extraction', 'Cheat Detection (Anomaly Check)', 'Offline TFLite Processing'].map((f) => (
                      <div key={f} className="flex items-center gap-3 text-sm text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-cyan-500/50" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#0d1520] border border-white/5 rounded-2xl p-5">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Shield size={16} className="text-cyan-400" />Account Status</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Account Active', ok: true },
                      { label: 'Profile Complete', ok: !!(profile?.full_name && profile?.sport_focus) },
                      { label: 'Profile Picture', ok: !!profile?.avatar_url },
                      { label: 'Trial Recorded', ok: trials.length > 0 },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{item.label}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.ok ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                          {item.ok ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── My Trials ── */}
          {activeTab === 'trials' && (
            <div className="space-y-4">
              {trials.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-64 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4"><Video size={28} className="text-gray-500" /></div>
                  <h3 className="text-lg font-bold mb-2">No Trials Yet</h3>
                  <p className="text-gray-500 text-sm max-w-xs mb-6">Record your first athletic trial using your device camera or upload a sports video.</p>
                  <button onClick={() => setShowUploadModal(true)} className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                    <Video size={14} /> Record First Trial
                  </button>
                </div>
              ) : selectedTrial ? (
                /* Trial detail with enhanced video replay + moment analysis */
                <div className="space-y-4">
                  <button onClick={() => { setSelectedTrial(null); setActiveMoment(null); }} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={14} /> Back to trials
                  </button>

                  {/* Enhanced Video Player with Moment Timeline */}
                  {selectedTrial.video_url && (
                    <div className="bg-black rounded-2xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-[#0d1520] border-b border-white/5 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold">
                          {(profile?.full_name ?? profile?.username ?? 'A')[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-white font-medium">{profile?.full_name ?? profile?.username ?? 'Athlete'}</span>
                        <span className="text-xs text-gray-600">&middot; {selectedTrial.sport_type}</span>
                      </div>
                      <video
                        id="trial-video-player"
                        src={selectedTrial.video_url}
                        controls
                        className="w-full"
                        style={{ aspectRatio: '16/9', objectFit: 'contain' }}
                      />
                      {selectedTrial.trial_moments && selectedTrial.trial_moments.length > 0 && (
                        <div className="px-4 py-3 bg-[#0d1520] border-t border-white/5">
                          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                            <Clock size={11} /> Moment Timeline — click to jump to that moment
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {selectedTrial.trial_moments.map((mom, i) => {
                              const colors = {
                                weak: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
                                average: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
                                strong: 'bg-green-500/15 border-green-500/30 text-green-400',
                              };
                              return (
                                <button
                                  key={mom.id}
                                  onClick={() => {
                                    const v = document.getElementById('trial-video-player') as HTMLVideoElement;
                                    if (v) { v.currentTime = mom.timestamp_sec; v.play(); }
                                    setActiveMoment(mom);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:scale-105 ${colors[mom.rating]} ${activeMoment?.id === mom.id ? 'ring-2 ring-cyan-400/50' : ''}`}
                                >
                                  {Math.floor(mom.timestamp_sec / 60)}:{String(Math.floor(mom.timestamp_sec % 60)).padStart(2, '0')}
                                  <span className="ml-1.5 opacity-60">#{i + 1}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Appreciation Banner */}
                  {selectedTrial.ai_metrics?.[0]?.appreciation && (
                    <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/5 border border-green-500/20 rounded-2xl p-5 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <ThumbsUp size={22} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-400 mb-1 flex items-center gap-1.5">
                          <Sparkles size={13} /> AI Appreciation
                        </p>
                        <p className="text-sm text-gray-300 leading-relaxed">{selectedTrial.ai_metrics[0].appreciation}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[#0d1520] border border-white/5 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold flex items-center gap-2"><Video size={16} className="text-cyan-400" />Trial Info</h3>
                        <button
                          onClick={() => handleDeleteTrial(selectedTrial.id, selectedTrial.video_url)}
                          disabled={deletingId === selectedTrial.id}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                          {deletingId === selectedTrial.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: 'Sport', value: selectedTrial.sport_type },
                          { label: 'Status', value: selectedTrial.status },
                          { label: 'Date', value: new Date(selectedTrial.created_at).toLocaleString() },
                          { label: 'Description', value: selectedTrial.description ?? 'No description' },
                        ].map((row) => (
                          <div key={row.label} className="flex justify-between text-sm">
                            <span className="text-gray-500">{row.label}</span>
                            <span className="text-white capitalize text-right max-w-[60%]">{row.value}</span>
                          </div>
                        ))}
                      </div>
                      {selectedTrial.ai_metrics?.[0]?.moment_summary && (
                        <p className="text-xs text-gray-500 bg-white/5 rounded-xl p-3 mt-4">{selectedTrial.ai_metrics[0].moment_summary}</p>
                      )}
                    </div>
                    {selectedTrial.ai_metrics?.[0] && (() => {
                      const m = selectedTrial.ai_metrics[0];
                      const metrics = SPORT_METRICS[selectedTrial.sport_type] ?? SPORT_METRICS.Other;
                      return (
                        <div className="bg-[#0d1520] border border-white/5 rounded-2xl p-5">
                          <h3 className="font-bold mb-4 flex items-center gap-2"><Zap size={16} className="text-cyan-400" />AI Scout Analysis</h3>
                          <div className="text-center py-2 mb-4">
                            <p className={`text-5xl font-extrabold ${scoreColor(m.overall_score ?? 0)}`}>{m.overall_score ?? '--'}</p>
                            <p className="text-xs text-gray-500 mt-1">Overall Score / 100</p>
                            <div className="mt-2">{scoreBar(m.overall_score ?? 0)}</div>
                          </div>
                          <div className="space-y-3">
                            {metrics.map((row) => {
                              const val = m[row.key];
                              return (
                                <div key={row.label} className="flex justify-between text-sm">
                                  <span className="text-gray-500">{row.label}</span>
                                  <span className="text-white font-medium">{val !== null && val !== undefined ? `${val} ${row.unit}` : '--'}</span>
                                </div>
                              );
                            })}
                          </div>
                          {m.notes && <p className="text-xs text-gray-500 bg-white/5 rounded-xl p-3 mt-4">{m.notes}</p>}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Moment-by-Moment Analysis */}
                  {selectedTrial.trial_moments && selectedTrial.trial_moments.length > 0 && (() => {
                    const moments = selectedTrial.trial_moments.sort((a, b) => a.timestamp_sec - b.timestamp_sec);
                    const goodScore = moments.filter((m) => m.rating === 'strong');
                    const smallMistakes = moments.filter((m) => m.rating === 'weak' || m.rating === 'average');
                    return (
                      <div className="space-y-4">
                        {/* Moment Summary Cards */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-green-400">{goodScore.length}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Good Score Moments</p>
                          </div>
                          <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-orange-400">{smallMistakes.length}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Mistakes</p>
                          </div>
                        </div>

                        {/* Good Score Moments — Appreciation */}
                        {goodScore.length > 0 && (
                          <div className="bg-[#0d1520] border border-white/5 rounded-2xl p-5">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                              <CheckCircle size={16} className="text-green-400" /> Good Score — Well Performed
                            </h3>
                            <div className="space-y-3">
                              {goodScore.map((mom) => (
                                <div key={mom.id} className="bg-green-500/5 border border-green-500/15 rounded-xl p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                                          {Math.floor(mom.timestamp_sec / 60)}:{String(Math.floor(mom.timestamp_sec % 60)).padStart(2, '0')}
                                        </span>
                                        <span className="text-xs font-semibold text-green-400 flex items-center gap-1">
                                          <Star size={10} /> Good Score
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-300">{mom.description}</p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const v = document.getElementById('trial-video-player') as HTMLVideoElement;
                                        if (v) { v.currentTime = mom.timestamp_sec; v.play(); }
                                        setActiveMoment(mom);
                                      }}
                                      className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center text-green-400 transition-colors"
                                      title="Jump to this moment"
                                    >
                                      <Play size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mistakes with Improvement Tips & Tutorial Videos */}
                        {smallMistakes.length > 0 && (
                          <div className="bg-[#0d1520] border border-white/5 rounded-2xl p-5">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                              <AlertTriangle size={16} className="text-orange-400" /> Mistakes — How to Improve
                            </h3>
                            <div className="space-y-3">
                              {smallMistakes.map((mom) => (
                                <div key={mom.id} className={`border rounded-xl p-4 ${mom.rating === 'weak' ? 'bg-orange-500/5 border-orange-500/15' : 'bg-yellow-500/5 border-yellow-500/15'}`}>
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${mom.rating === 'weak' ? 'text-orange-400 bg-orange-500/10' : 'text-yellow-400 bg-yellow-500/10'}`}>
                                          {Math.floor(mom.timestamp_sec / 60)}:{String(Math.floor(mom.timestamp_sec % 60)).padStart(2, '0')}
                                        </span>
                                        {mom.mistake_type && (
                                          <span className={`text-xs font-semibold ${mom.rating === 'weak' ? 'text-orange-400' : 'text-yellow-400'}`}>{mom.mistake_type}</span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-300">{mom.description}</p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const v = document.getElementById('trial-video-player') as HTMLVideoElement;
                                        if (v) { v.currentTime = mom.timestamp_sec; v.play(); }
                                        setActiveMoment(mom);
                                      }}
                                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${mom.rating === 'weak' ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400' : 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400'}`}
                                      title="Jump to this moment"
                                    >
                                      <Play size={12} />
                                    </button>
                                  </div>
                                  {mom.tutorial_url && (
                                    <a
                                      href={mom.tutorial_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-3 flex items-center gap-3 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl p-3 transition-all group"
                                    >
                                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                                        <GraduationCap size={16} className="text-cyan-400" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
                                          Tutorial to Fix This <ExternalLink size={10} />
                                        </p>
                                        <p className="text-sm text-white truncate">{mom.tutorial_title}</p>
                                      </div>
                                      <ChevronRight size={14} className="text-cyan-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Trials list */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{trials.length} trial{trials.length > 1 ? 's' : ''} recorded</p>
                    <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-xl transition-colors">
                      <Video size={14} /> New Trial
                    </button>
                  </div>
                  {trials.map((trial) => {
                    const m = trial.ai_metrics?.[0];
                    return (
                      <div key={trial.id} className="bg-[#0d1520] border border-white/5 hover:border-cyan-500/20 rounded-2xl p-5 transition-all group">
                        <div className="flex items-start gap-4">
                          <button onClick={() => setSelectedTrial(trial)} className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                            <Play size={18} className="text-cyan-400" />
                          </button>
                          <div className="flex-1 min-w-0" onClick={() => setSelectedTrial(trial)}>
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-semibold text-white">{trial.sport_type}</p>
                              {getStatusBadge(trial.status)}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{trial.description ?? 'No description'} · {new Date(trial.created_at).toLocaleDateString()}</p>
                            {m && (
                              <div className="flex items-center gap-4">
                                <div className="flex-1">{scoreBar(m.overall_score ?? 0)}</div>
                                <p className={`text-sm font-bold flex-shrink-0 ${scoreColor(m.overall_score ?? 0)}`}>
                                  {m.overall_score ?? '--'}/100
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleDeleteTrial(trial.id, trial.video_url)}
                              disabled={deletingId === trial.id}
                              className="w-8 h-8 rounded-lg bg-red-500/0 hover:bg-red-500/10 flex items-center justify-center text-gray-600 hover:text-red-400 transition-all disabled:opacity-40"
                              title="Delete trial"
                            >
                              <Trash2 size={14} />
                            </button>
                            <ChevronRight size={16} className="text-gray-600 group-hover:text-cyan-400 transition-colors" onClick={() => setSelectedTrial(trial)} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── AI Scores ── */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-5">
              {trials.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-64 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4"><Trophy size={28} className="text-gray-500" /></div>
                  <h3 className="text-lg font-bold mb-2">No AI Scores Yet</h3>
                  <p className="text-gray-500 text-sm max-w-xs mb-6">Submit a sports trial to see your detailed AI scout analysis.</p>
                  <button onClick={() => setShowUploadModal(true)} className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                    <Video size={14} /> Record Trial
                  </button>
                </div>
              ) : (
                <>
                  {avgScore > 0 && (
                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 rounded-2xl p-6 flex items-center gap-6">
                      <div className="text-center flex-shrink-0">
                        <p className={`text-5xl font-extrabold ${scoreColor(avgScore)}`}>{avgScore}</p>
                        <p className="text-xs text-gray-500 mt-1">Avg AI Score</p>
                      </div>
                      <div className="flex-1">
                        <div className="mb-2">{scoreBar(avgScore)}</div>
                        <p className="text-sm text-gray-400">Based on {trials.length} verified trial{trials.length > 1 ? 's' : ''}. Your performance is being tracked across sports.</p>
                      </div>
                    </div>
                  )}
                  <div className="bg-[#0d1520] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                      <Star size={16} className="text-yellow-400" />
                      <h3 className="font-bold">AI Scout Analysis — All Trials</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                      {trials.map((trial, idx) => {
                        const m = trial.ai_metrics?.[0];
                        const metrics = SPORT_METRICS[trial.sport_type] ?? SPORT_METRICS.Other;
                        return (
                          <div key={trial.id} className="px-5 py-5">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-lg bg-white/5 text-xs font-bold text-gray-400 flex items-center justify-center">#{idx + 1}</span>
                                <div>
                                  <p className="text-sm font-semibold text-white">{trial.sport_type}</p>
                                  <p className="text-xs text-gray-500">{new Date(trial.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                              {m && <p className={`text-2xl font-extrabold ${scoreColor(m.overall_score ?? 0)}`}>{m.overall_score ?? '--'}<span className="text-sm text-gray-600 font-normal">/100</span></p>}
                            </div>
                            {m && (
                              <>
                                <div className="mb-3">{scoreBar(m.overall_score ?? 0)}</div>
                                <div className="grid grid-cols-3 gap-2">
                                  {metrics.map((row) => {
                                    const val = m[row.key];
                                    return (
                                      <div key={row.label} className="bg-white/5 rounded-xl p-2.5 text-center">
                                        <p className="text-white text-sm font-semibold">{val !== null && val !== undefined ? `${val}` : '--'}</p>
                                        <p className="text-gray-500 text-xs">{row.label}</p>
                                        <p className="text-gray-600 text-xs">{row.unit}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                                {m.notes && <p className="text-xs text-gray-500 mt-3 bg-white/5 rounded-xl p-3">{m.notes}</p>}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Profile ── */}
          {activeTab === 'profile' && (
            <div className="max-w-lg space-y-5">
              {profileSaved && (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3">
                  <CheckCircle size={14} /> Profile updated successfully
                </div>
              )}
              {profileSaveError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                  <AlertTriangle size={14} /> {profileSaveError}
                </div>
              )}

              <div className="bg-[#0d1520] border border-white/5 rounded-2xl p-6">
                {/* Avatar section */}
                <div className="flex items-end gap-5 mb-6">
                  <div className="relative">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/30" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                        <User size={32} className="text-cyan-400" />
                      </div>
                    )}
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center shadow-lg transition-colors border-2 border-[#0d1520]"
                      title="Change profile picture"
                    >
                      <Camera size={13} className="text-black" />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); e.target.value = ''; }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{profile?.full_name ?? profile?.username ?? 'Athlete'}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full capitalize mt-1 inline-block">{profile?.role ?? 'athlete'}</span>
                    {avatarUploading && <p className="text-xs text-cyan-400 mt-1">Uploading picture...</p>}
                  </div>
                </div>

                {editingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Full Name</label>
                      <input value={editFullName} onChange={(e) => setEditFullName(e.target.value)} placeholder="Your full name"
                        className="w-full bg-[#080d14] border border-white/10 focus:border-cyan-500/40 outline-none text-white text-sm rounded-xl px-4 py-3 placeholder-gray-600" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Username</label>
                      <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="athletehandle" minLength={3} maxLength={30}
                        className="w-full bg-[#080d14] border border-white/10 focus:border-cyan-500/40 outline-none text-white text-sm rounded-xl px-4 py-3 placeholder-gray-600" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Primary Sport</label>
                      <div className="relative">
                        <select value={editSportFocus} onChange={(e) => setEditSportFocus(e.target.value)}
                          className="w-full bg-[#080d14] border border-white/10 focus:border-cyan-500/40 text-white text-sm rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer">
                          <option value="">Select sport...</option>
                          {SPORT_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { setEditingProfile(false); setProfileSaveError(''); }}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleSaveProfile} disabled={savingProfile}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold rounded-xl text-sm transition-colors">
                        <Save size={14} />
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {[
                      { label: 'Full Name', value: profile?.full_name ?? 'Not set' },
                      { label: 'Username', value: profile?.username ?? '—' },
                      { label: 'Email', value: user?.email ?? '—' },
                      { label: 'Primary Sport', value: profile?.sport_focus ?? 'Not set' },
                      { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—' },
                      { label: 'Total Trials', value: String(trials.length) },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="flex justify-between text-sm py-2.5">
                          <span className="text-gray-500">{row.label}</span>
                          <span className="text-white text-right max-w-[60%] truncate">{row.value}</span>
                        </div>
                        <div className="h-px bg-white/5" />
                      </div>
                    ))}
                    <button onClick={() => setEditingProfile(true)}
                      className="w-full flex items-center justify-center gap-2 mt-3 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/20 text-white hover:text-cyan-400 rounded-xl text-sm transition-all">
                      <Edit2 size={14} /> Edit Profile
                    </button>
                  </div>
                )}
              </div>

              <button onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-4 py-2.5 rounded-xl transition-all w-full justify-center">
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0f1a]/95 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-2 py-2 z-40">
        {navItems.map((item) => (
          <button key={item.key} onClick={() => setActiveTab(item.key)}
            className={`flex flex-col items-center gap-1 text-xs px-3 py-1.5 rounded-xl transition-colors ${activeTab === item.key ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-500'}`}>
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        <button onClick={() => setShowUploadModal(true)} className="flex flex-col items-center gap-1 text-xs">
          <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center -mt-6 border-2 border-[#080d14] shadow-lg shadow-cyan-500/30">
            <Video size={20} className="text-black" />
          </div>
          <span className="text-cyan-400 mt-0.5">Record</span>
        </button>
      </nav>

      {showUploadModal && user && (
        <TrialUploadModal
          athleteId={user.id}
          athleteName={profile?.full_name ?? profile?.username ?? ''}
          onClose={() => setShowUploadModal(false)}
          onUploaded={handleTrialUploaded}
        />
      )}
    </div>
  );
}
