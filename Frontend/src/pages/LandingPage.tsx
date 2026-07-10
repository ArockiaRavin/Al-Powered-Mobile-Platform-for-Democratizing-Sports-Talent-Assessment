import { Users, Smartphone, Shield, MapPin, DollarSign, Scale, Activity, Calculator, UserCheck, Wifi, Video, Cloud, BarChart3, Trophy, Search, Settings, Flag, ChevronRight } from 'lucide-react';

type Page = 'landing' | 'login' | 'register' | 'forgot';

interface Props {
  onNavigate: (page: Page) => void;
}

export default function LandingPage({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-[#080d14] text-white font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#080d14]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src="/WhatsApp_Image_2026-06-14_at_6.48.44_PM.jpeg" alt="Ravin Sports" className="w-9 h-9 rounded-xl object-cover" />
          <div>
            <span className="text-sm font-bold tracking-tight leading-none block">Ravin Sports</span>
            <span className="text-xs text-gray-500 leading-none">DSTA</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#challenge" className="hover:text-cyan-400 transition-colors">Challenge</a>
          <a href="#solution" className="hover:text-cyan-400 transition-colors">Solution</a>
          <a href="#features" className="hover:text-cyan-400 transition-colors">AI Features</a>
          <a href="#pipeline" className="hover:text-cyan-400 transition-colors">Pipeline</a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#080d14] via-[#0a1628] to-[#080d14]" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
            Smart India Hackathon Project Submission
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Democratizing<br />
            <span className="text-cyan-400">Sports Talent</span><br />
            Assessment
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            An AI-Powered Mobile Platform for Grassroots Identification designed to bring
            professional sports lab analytics to any village in India using a standard smartphone.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => onNavigate('register')}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              Join the Platform <ChevronRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-white px-8 py-3.5 rounded-xl transition-all hover:bg-white/5"
            >
              Sign In
            </button>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500 border-t border-white/5 pt-8">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-cyan-400" />
              <span>Created by Ravin</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-cyan-400" />
              <span>Mobile Grassroots Identification</span>
            </div>
          </div>
        </div>
      </section>

      {/* Challenge */}
      <section id="challenge" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-8 bg-cyan-400 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-bold">The Challenge</h2>
          </div>
          <div className="w-full h-px bg-white/10 mb-12" />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <MapPin size={22} className="text-cyan-400" />,
                title: 'Geographic Barrier',
                desc: 'Talent in rural and remote communities remains completely undiscovered due to a lack of professional testing infrastructure and sports academy access.',
              },
              {
                icon: <DollarSign size={22} className="text-cyan-400" />,
                title: 'High Scouting Costs',
                desc: 'Physical scouting camps and multi-camera sports labs are highly expensive to organize, impossible to scale nationally, and logistically restricted.',
              },
              {
                icon: <Scale size={22} className="text-cyan-400" />,
                title: 'Human Bias',
                desc: 'Subjective evaluation metrics and physical favoritism by scouts can lead to severe inconsistency, rendering selection parameters flawed and unfair.',
              },
            ].map((item) => (
              <div key={item.title} className="group bg-[#0d1520] border border-white/5 rounded-2xl p-6 hover:border-cyan-500/20 transition-all hover:-translate-y-1">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5 group-hover:bg-cyan-500/20 transition-colors">
                  {item.icon}
                </div>
                <div className="w-full h-px bg-gradient-to-r from-cyan-500/50 to-transparent mb-5" />
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="py-24 px-6 bg-[#0a0f1a]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-8 bg-cyan-400 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-bold">The Solution</h2>
          </div>
          <div className="w-full h-px bg-white/10 mb-12" />
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">DSTA Mobile App</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                An AI-first mobile platform that enables any athlete with a smartphone to self-record athletic and technical trials.
              </p>
              <div className="space-y-5">
                {[
                  { icon: <Smartphone size={18} className="text-cyan-400" />, label: 'Smartphone Delivery', desc: 'Uses a single RGB standard phone camera. No external hardware required.' },
                  { icon: <Activity size={18} className="text-cyan-400" />, label: 'On-Device CV', desc: 'Computes complex performance variables locally on consumer smartphones.' },
                  { icon: <Shield size={18} className="text-cyan-400" />, label: 'Data Security', desc: 'Decentralized verification and absolute data integrity to prevent manipulation.' },
                ].map((f) => (
                  <div key={f.label} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {f.icon}
                    </div>
                    <div>
                      <span className="font-semibold text-white">{f.label}: </span>
                      <span className="text-gray-400 text-sm">{f.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl blur-xl" />
              <div className="relative bg-[#0d1520] border border-white/5 rounded-3xl p-8 text-center">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val: '33', label: 'Joint Points Tracked' },
                    { val: '0', label: 'External Hardware' },
                    { val: '99%', label: 'Offline Capable' },
                    { val: '100%', label: 'Bias Eliminated' },
                  ].map((s) => (
                    <div key={s.label} className="bg-[#080d14] rounded-2xl p-5">
                      <div className="text-3xl font-extrabold text-cyan-400 mb-1">{s.val}</div>
                      <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-8 bg-cyan-400 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-bold">AI Powered Analysis</h2>
          </div>
          <div className="w-full h-px bg-white/10 mb-12" />
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { icon: <Activity size={22} className="text-cyan-400" />, title: 'Pose Estimation', desc: 'Real-time edge skeletal tracking using MediaPipe API models to detect 33 human joint coordinates dynamically.' },
              { icon: <Calculator size={22} className="text-cyan-400" />, title: 'Metric Extraction', desc: 'Automated cloud/edge computations to extract vertical jump heights, precise limb flight times, and angle speeds.' },
              { icon: <UserCheck size={22} className="text-cyan-400" />, title: 'Cheat Detection', desc: 'Lightweight validation layer checking frame ratios, tracking anomalies, and visual deepfakes to filter out fraudulent trials.' },
              { icon: <Wifi size={22} className="text-cyan-400" />, title: 'Offline Processing', desc: 'Optimized compiled TensorFlow Lite architectures allowing local feature extractions without real-time internet.' },
            ].map((f) => (
              <div key={f.title} className="group bg-[#0d1520] border border-white/5 rounded-2xl p-6 hover:border-cyan-500/20 transition-all hover:-translate-y-1">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5 group-hover:bg-cyan-500/20 transition-colors">
                  {f.icon}
                </div>
                <div className="w-full h-px bg-gradient-to-r from-cyan-500/50 to-transparent mb-5" />
                <h3 className="text-lg font-bold mb-3">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6 bg-[#0a0f1a]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-8 bg-cyan-400 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-bold">UML Use Case Diagram</h2>
          </div>
          <div className="w-full h-px bg-white/10 mb-12" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0d1520] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <Users size={20} className="text-cyan-400" />
                <span className="font-bold text-lg tracking-wide uppercase">Athlete</span>
                <span className="ml-2 text-xs border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded-full">Primary Actor</span>
              </div>
              <div className="h-px bg-white/5 mb-5" />
              <div className="grid grid-cols-2 gap-3">
                {['Create Profile', 'Record & Upload', 'View Performance', 'Compete Leaderboard'].map((a) => (
                  <div key={a} className="bg-[#080d14] rounded-xl px-4 py-3 text-sm text-gray-300 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {a}
                  </div>
                ))}
              </div>
              <div className="mt-5 border border-dashed border-green-500/30 bg-green-500/5 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-green-400">
                <Shield size={14} />
                Shared Use Case: Secure Authentication
              </div>
            </div>
            <div className="bg-[#0d1520] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <Settings size={20} className="text-cyan-400" />
                <span className="font-bold text-lg tracking-wide uppercase">Scout & Admin</span>
                <span className="ml-2 text-xs border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded-full">Secondary Authorities</span>
              </div>
              <div className="h-px bg-white/5 mb-5" />
              <div className="grid grid-cols-2 gap-3">
                {['Search Metrics', 'Compare Athlete', 'Validate AI Flags', 'Manage Standards'].map((a) => (
                  <div key={a} className="bg-[#080d14] rounded-xl px-4 py-3 text-sm text-gray-300 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {a}
                  </div>
                ))}
              </div>
              <div className="mt-5 border border-dashed border-green-500/30 bg-green-500/5 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-green-400">
                <Video size={14} />
                Shared Use Case: Video Verification
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section id="pipeline" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-8 bg-cyan-400 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-bold">System Data Pipeline Flow</h2>
          </div>
          <div className="w-full h-px bg-white/10 mb-16" />
          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-px bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 opacity-50 hidden md:block" />
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { stage: '01', color: 'text-cyan-400', border: 'border-cyan-500/40', title: 'Record', desc: 'Local video buffer captures trials with automated sensor angle framing. Compiles offline MP4 chunks.' },
                { stage: '02', color: 'text-cyan-400', border: 'border-cyan-500/40', title: 'Edge AI', desc: 'MediaPipe tracks 33 skeleton coordinates inside TFLite. Flags velocity anomalies instantly.' },
                { stage: '03', color: 'text-blue-400', border: 'border-blue-500/40', title: 'Cloud', desc: 'S3 video uploads triggered. FastAPI executes deeper, robust anti-cheat & score compiles.' },
                { stage: '04', color: 'text-cyan-400', border: 'border-cyan-500/40', title: 'Analytics', desc: 'Updates active geographic leaderboard maps. Direct digital scout invitation dispatch.' },
              ].map((s) => (
                <div key={s.stage} className="flex flex-col items-center">
                  <div className={`border ${s.border} bg-[#080d14] text-xs font-bold tracking-widest ${s.color} px-4 py-1.5 rounded-full mb-4 relative z-10`}>
                    STAGE {s.stage}
                  </div>
                  <div className="bg-[#0d1520] border border-white/5 rounded-2xl p-5 w-full">
                    <h4 className="font-bold text-lg mb-3">{s.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#0a0f1a] text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
            Conclusion
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Village Grounds to{' '}
            <span className="text-cyan-400">National Glory</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Empowering the next generation of athletic champions through precise, objective, and globally accessible AI sports tech.
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-10 py-4 rounded-xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20"
          >
            Start Your Journey <ChevronRight size={20} />
          </button>
          <div className="mt-10 inline-flex items-center gap-6 bg-[#0d1520] border border-white/5 rounded-2xl px-8 py-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-cyan-400" />
              DSTA Assessment Platform
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Users size={16} className="text-cyan-400" />
              Created by Ravin | Smart India Hackathon
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-sm text-gray-600">
        <p>Democratizing Sports Talent Assessment &copy; 2026 &mdash; Created by Ravin</p>
      </footer>
    </div>
  );
}
