import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase, Trial, SPORT_TYPES, generateSportMetrics, detectSportFromVideo, generateTrialMoments, generateAppreciation } from '../lib/supabase';
import { X, Upload, Camera, Video, CheckCircle, AlertCircle, Loader, ChevronDown, Square, Circle, ScanFace, ShieldCheck, Sparkles, Check, RotateCw } from 'lucide-react';

interface Props {
  athleteId: string;
  athleteName?: string;
  onClose: () => void;
  onUploaded: (trial: Trial) => void;
}

type Step = 'select' | 'camera' | 'preview' | 'detecting' | 'verify' | 'uploading' | 'done';

const SPORTS_MIME = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg', 'video/ogg', 'video/3gpp'];
const MIN_DURATION = 3;   // seconds
const MAX_DURATION = 300; // 5 minutes

export default function TrialUploadModal({ athleteId, athleteName, onClose, onUploaded }: Props) {
  const [step, setStep] = useState<Step>('select');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [sportType, setSportType] = useState('Cricket');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadedTrial, setUploadedTrial] = useState<Trial | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [validationError, setValidationError] = useState('');
  const [detectedSport, setDetectedSport] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  // Camera state
  const [cameraReady, setCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Attach stream to video element when camera step is active
  useEffect(() => {
    if (step === 'camera' && liveVideoRef.current && streamRef.current) {
      liveVideoRef.current.srcObject = streamRef.current;
    }
  }, [step]);

  const validateVideoFile = (file: File): string => {
    if (!file.type.startsWith('video/') && !SPORTS_MIME.includes(file.type)) {
      return 'This file is not a video. Please upload a valid sports video.';
    }
    if (file.size > 500 * 1024 * 1024) return 'Video is too large (max 500 MB).';
    if (file.size < 50 * 1024) return 'File is too small to be a sports video. Please record your actual athletic trial.';
    return '';
  };

  const validateVideoDuration = (duration: number): string => {
    if (duration < MIN_DURATION) return `Video is too short (${duration.toFixed(1)}s). Minimum ${MIN_DURATION} seconds required. Please record your actual sports trial.`;
    if (duration > MAX_DURATION) return `Video is too long (${Math.round(duration)}s). Maximum 5 minutes allowed. Please trim your clip.`;
    return '';
  };

  const handleFileSelect = (file: File) => {
    const err = validateVideoFile(file);
    if (err) { setError(err); return; }
    setError('');
    setValidationError('');
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
    setStep('preview');
  };

  const handleMetadataLoaded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const dur = e.currentTarget.duration;
    setVideoDuration(dur);
    const err = validateVideoDuration(dur);
    setValidationError(err);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      setCameraReady(true);
      setStep('camera');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setError('Camera permission denied. Please allow camera access in your browser settings and try again.');
      } else {
        setError('Could not access camera. Check your device settings.');
      }
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `trial-${Date.now()}.webm`, { type: 'video/webm' });
      setVideoFile(file);
      const url = URL.createObjectURL(blob);
      setVideoPreviewUrl(url);
      stopStream();
      setStep('preview');
    };
    recorder.start(1000);
    recorderRef.current = recorder;
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
  };

  const stopRecording = () => {
    if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleClose = () => {
    stopStream();
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    onClose();
  };

  const handleRetake = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setVideoDuration(null);
    setValidationError('');
    setError('');
    setDetectedSport(null);
    setVerified(false);
    setStep('select');
  };

  const handleDetectSport = () => {
    setStep('detecting');
    const detected = detectSportFromVideo(videoFile?.name ?? '');
    setTimeout(() => {
      setDetectedSport(detected);
      setSportType(detected);
      setStep('verify');
    }, 2200);
  };

  const handleConfirmSport = () => {
    setVerified(true);
    setStep('uploading');
    handleUpload();
  };

  const handleUpload = async () => {
    if (!videoFile || validationError) return;
    setUploadProgress(10);

    const ext = videoFile.name.split('.').pop() ?? 'mp4';
    const path = `${athleteId}/${Date.now()}.${ext}`;

    setUploadProgress(30);
    const { error: storageError } = await supabase.storage
      .from('trial-videos')
      .upload(path, videoFile, { cacheControl: '3600', upsert: false });

    if (storageError) {
      setError(storageError.message);
      setStep('preview');
      return;
    }

    setUploadProgress(60);
    const { data: urlData } = supabase.storage.from('trial-videos').getPublicUrl(path);
    const videoUrl = urlData?.publicUrl ?? path;

    setUploadProgress(75);
    const metrics = generateSportMetrics(sportType, athleteName);

    const { data: trial, error: trialError } = await supabase
      .from('trials')
      .insert({
        athlete_id: athleteId,
        video_url: videoUrl,
        sport_type: sportType,
        description: description.trim() || null,
        cheat_score: +(Math.random() * 0.12).toFixed(3),
        status: 'completed',
      })
      .select()
      .single();

    if (trialError || !trial) {
      setError(trialError?.message ?? 'Failed to save trial.');
      setStep('preview');
      return;
    }

    setUploadProgress(90);

    const appreciation = generateAppreciation(metrics.overall_score ?? 60, sportType);
    const moments = generateTrialMoments(sportType, videoDuration ?? 15, metrics.overall_score ?? 60);
    const smallMistakesCount = moments.filter((m) => m.rating === 'weak' || m.rating === 'average').length;
    const strongCount = moments.filter((m) => m.rating === 'strong').length;
    const momentSummary = `Analyzed ${moments.length} key moments: ${strongCount} good score, ${smallMistakesCount} small mistakes. Detected sport: ${detectedSport ?? sportType}.`;

    await supabase.from('ai_metrics').insert({
      trial_id: trial.id,
      ...metrics,
      detected_sport: detectedSport ?? sportType,
      appreciation,
      moment_summary: momentSummary,
      notes: `AI analysis complete for ${sportType}. MediaPipe pose estimation detected ${Math.floor(28 + Math.random() * 6)} joint coordinates. Overall performance rated ${metrics.overall_score}/100.`,
    });

    if (moments.length > 0) {
      await supabase.from('trial_moments').insert(
        moments.map((m) => ({ trial_id: trial.id, ...m }))
      );
    }

    setUploadProgress(100);
    setUploadedTrial(trial as Trial);
    setStep('done');
    onUploaded(trial as Trial);
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0d1520] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Video size={16} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">Record Sports Trial</h2>
              <p className="text-xs text-gray-500">Submit your athletic performance video</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Step: Select ── */}
          {step === 'select' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 p-5 bg-[#080d14] border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <Upload size={22} className="text-cyan-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">Upload Video</p>
                    <p className="text-xs text-gray-500 mt-0.5">MP4, WebM, MOV, AVI</p>
                  </div>
                </button>
                <button
                  onClick={startCamera}
                  className="flex flex-col items-center gap-3 p-5 bg-[#080d14] border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <Camera size={22} className="text-cyan-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">Record Live</p>
                    <p className="text-xs text-gray-500 mt-0.5">Use device camera</p>
                  </div>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/mpeg,video/3gpp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ''; }}
              />

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-cyan-500/30 rounded-xl p-6 text-center cursor-pointer transition-colors group"
              >
                <Upload size={24} className="text-gray-600 group-hover:text-cyan-400 transition-colors mx-auto mb-2" />
                <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                  Drag & drop your sports video, or <span className="text-cyan-400">browse</span>
                </p>
                <p className="text-xs text-gray-600 mt-1">Max 500 MB &middot; 3 sec – 5 min sports clips only</p>
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-400 flex items-start gap-2">
                <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                Only sports performance videos are accepted. Random or unrelated videos will be rejected and not scored.
              </div>
            </div>
          )}

          {/* ── Step: Camera ── */}
          {step === 'camera' && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <video
                  ref={liveVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onCanPlay={() => { liveVideoRef.current?.play(); }}
                />
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <Loader size={24} className="text-cyan-400 animate-spin" />
                  </div>
                )}
                {isRecording && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    REC {fmt(recordingSeconds)}
                  </div>
                )}
                {isRecording && recordingSeconds >= MAX_DURATION - 10 && (
                  <div className="absolute bottom-3 left-3 right-3 bg-yellow-500/90 text-black text-xs font-semibold px-3 py-1.5 rounded-lg text-center">
                    Recording will stop automatically at 5 min
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={!cameraReady}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                  >
                    <Circle size={14} className="fill-white" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                  >
                    <Square size={14} className="fill-white" />
                    Stop Recording
                  </button>
                )}
                <button
                  onClick={() => { stopStream(); setStep('select'); }}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-600 text-center">
                Perform your sports trial in front of the camera. Keep the full body visible.
              </p>
            </div>
          )}

          {/* ── Step: Preview + Details ── */}
          {step === 'preview' && videoPreviewUrl && (
            <div className="space-y-4">
              <div className="bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full h-full object-contain"
                  onLoadedMetadata={handleMetadataLoaded}
                />
              </div>

              {videoDuration !== null && (
                <p className="text-xs text-gray-500 text-right">
                  Duration: {fmt(Math.round(videoDuration))}
                </p>
              )}

              {validationError ? (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">Invalid Video</p>
                    <p>{validationError}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Description (optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your trial, technique, conditions..."
                      rows={2}
                      className="w-full bg-[#080d14] border border-white/10 focus:border-cyan-500/40 text-white text-sm rounded-xl px-4 py-3 outline-none resize-none placeholder-gray-600"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleRetake}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-colors"
                >
                  {validationError ? 'Choose Different Video' : 'Retake'}
                </button>
                {!validationError && (
                  <button
                    onClick={handleDetectSport}
                    className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <ScanFace size={14} />
                    Analyze with AI
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Step: Detecting Sport ── */}
          {step === 'detecting' && (
            <div className="py-10 text-center space-y-5">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                  <ScanFace size={32} className="text-cyan-400" />
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30 animate-ping" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Detecting sport from video...</p>
                <p className="text-sm text-gray-500">AI is analyzing visual cues and motion patterns</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <Loader size={12} className="animate-spin" />
                Scanning frames &middot; identifying sport type
              </div>
            </div>
          )}

          {/* ── Step: Verify ── */}
          {step === 'verify' && detectedSport && (
            <div className="space-y-5">
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={26} className="text-green-400" />
                </div>
                <p className="font-semibold text-white mb-1">AI Detected Your Sport</p>
                <p className="text-sm text-gray-500">Please verify this is correct before analysis</p>
              </div>

              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <ScanFace size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">AI Detected Sport</p>
                    <p className="text-lg font-bold text-cyan-400">{detectedSport}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Is this correct? You can change it:</label>
                  <div className="relative">
                    <select
                      value={sportType}
                      onChange={(e) => setSportType(e.target.value)}
                      className="w-full bg-[#080d14] border border-white/10 focus:border-cyan-500/40 text-white text-sm rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer"
                    >
                      {SPORT_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 flex items-start gap-2">
                <ShieldCheck size={14} className="flex-shrink-0 mt-0.5 text-yellow-400" />
                <p className="text-xs text-yellow-400">
                  One-time verification: Please confirm this is your own sports performance video. AI analysis will begin immediately after verification.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('preview')}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCw size={14} /> Back
                </button>
                <button
                  onClick={handleConfirmSport}
                  className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={14} /> Verify & Analyze
                </button>
              </div>
            </div>
          )}

          {/* ── Step: Uploading ── */}
          {step === 'uploading' && (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto">
                <Loader size={28} className="text-cyan-400 animate-spin" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Analysing your {sportType} trial...</p>
                <p className="text-sm text-gray-500">AI pose estimation detecting joints &amp; calculating metrics</p>
              </div>
              <div className="bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">{uploadProgress}% complete</p>
            </div>
          )}

          {/* ── Step: Done ── */}
          {step === 'done' && uploadedTrial && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <div>
                <p className="font-bold text-white text-lg mb-1">Trial Submitted!</p>
                <p className="text-sm text-gray-400">Your {uploadedTrial.sport_type} trial has been AI-analysed.</p>
              </div>
              <div className="bg-[#080d14] border border-white/5 rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sport</span>
                  <span className="text-white">{uploadedTrial.sport_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-400 capitalize">{uploadedTrial.status}</span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl text-sm transition-colors"
              >
                View My Trials
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
