import { FormEvent, useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Activity, 
  CheckCircle2, 
  MessageSquare, 
  Share2, 
  Video, 
  HelpCircle, 
  Zap, 
  Layout, 
  Send, 
  Bell, 
  Database,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Expand,
  Terminal,
  ExternalLink,
  ChevronRight,
  RefreshCcw
} from "lucide-react";

type AgentInput = {
  model: string;
  city: string;
  concern: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type AgentOutput = {
  whatsappDrip: string[];
  faq: FaqItem[];
  videoScript: string;
  socialPosts: string[];
};

const STAGES = [
  { id: "trigger", label: "Webhook Trigger", icon: Zap, color: "text-amber-400", log: "Receiving payload from upstream..." },
  { id: "validate", label: "Filtering & Validation", icon: CheckCircle2, color: "text-emerald-400", log: "Verifying model availability and city charging maps..." },
  { id: "branches", label: "LLM Orchestration", icon: Layers, color: "text-blue-400", log: "Executing Gemini API generation streams..." },
  { id: "store", label: "State Merging", icon: Database, color: "text-purple-400", log: "Syncing outputs to Airtable & CRM records..." },
  { id: "scheduler", label: "Time-Series Scheduler", icon: Calendar, color: "text-pink-400", log: "Calculating optimal drip timings for IST timezone..." },
  { id: "delivery", label: "Delivery Pipeline", icon: Send, color: "text-indigo-400", log: "Preparing WhatsApp API & Email templates..." },
  { id: "alert", label: "Notification Layer", icon: Bell, color: "text-red-400", log: "Triggering Slack alert for regional sales team..." },
] as const;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function App() {
  const [input, setInput] = useState<AgentInput>({
    model: "",
    city: "",
    concern: "",
  });
  const [currentStageId, setCurrentStageId] = useState<string | "idle">("idle");
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<AgentOutput | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');

  const currentStageIndex = useMemo(
    () => STAGES.findIndex((s) => s.id === currentStageId),
    [currentStageId]
  );

  async function runPipeline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isRunning) return;
    if (Object.values(input).some((value) => !value.trim())) return;

    setIsRunning(true);
    setOutput(null);
    setLogs([]);

    let outputData: AgentOutput | null = null;
    let apiError: string | null = null;

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const fetchPromise = fetch(`${API_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: AgentOutput) => {
        // Formatting fallback to make sure Day prefixes are present
        if (data.whatsappDrip) {
           data.whatsappDrip = data.whatsappDrip.map((msg, i) => 
               msg.toLowerCase().startsWith('day') ? msg : `Day ${i + 1}: ${msg}`
           );
        }
        outputData = data;
      })
      .catch((err) => {
        apiError = err.message;
      });

    // 2. Play the UI Stage Sequence Simulation (makes it feel like a complex process)
    for (const stage of STAGES) {
      setCurrentStageId(stage.id);
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${stage.log}`, ...prev.slice(0, 5)]);
      await delay(800 + Math.random() * 400); // slightly faster than before
    }

    // 3. Await final output format if the animation finished sooner than the AI logic
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] Awaiting final LLM orchestrator response...`, ...prev.slice(0, 5)]);
    await fetchPromise;

    if (apiError) {
      setLogs(prev => [`[ERROR] ${apiError}`, ...prev]);
      setCurrentStageId("idle");
      setIsRunning(false);
      return;
    }

    if (outputData) {
      setOutput(outputData);
      setLogs(prev => [`[SUCCESS] All branches merged. Assets generated via API.`, ...prev]);
    }
    
    setCurrentStageId("idle");
    setIsRunning(false);
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[150px] opacity-40 rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] opacity-40 rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100 mix-blend-overlay" />
      </div>

      <nav className="relative z-50 px-8 xl:px-16 py-8 flex justify-between items-center w-full border-b border-white/5 backdrop-blur-md mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-teal-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Zap className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AgentZero</h1>
            <p className="text-xs text-teal-400 font-bold uppercase tracking-[0.1em]">EV Adoption Education Content Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-8 text-base font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          {userEmail ? (
            <div className="flex items-center gap-6">
              <span className="text-teal-400">{userEmail}</span>
              <button onClick={() => { setUserEmail(null); localStorage.removeItem('userEmail'); }} className="hover:text-white transition-colors">Logout</button>
              <button className="bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-full border border-white/10 transition-all text-white">
                Dashboard
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="bg-gradient-to-r from-teal-500 to-indigo-600 flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-bold transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95">
              Sign In
            </button>
          )}
        </div>
      </nav>

      <main className="relative z-10 w-full px-8 xl:px-16 grid grid-cols-1 xl:grid-cols-12 gap-12 pb-20">
        
        {/* Left Column: Input & Logs */}
        <section className="xl:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Layout className="w-16 h-16" />
            </div>
            
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-teal-400" />
              Configure Agent
            </h2>

            <form onSubmit={runPipeline} className="space-y-6">
              {[
                { id: "model", label: "EV Model", placeholder: "e.g. Ioniq 5, Nexon EV" },
                { id: "city", label: "Customer's City", placeholder: "e.g. Mumbai (charging infra context)" },
                { id: "concern", label: "Specific Concern or FAQ Trigger", placeholder: "e.g. range anxiety, resale value" },
              ].map((f) => (
                <div key={f.id} className="group">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2 transition-colors group-focus-within:text-teal-400">
                    {f.label}
                  </label>
                  <input 
                    value={input[f.id as keyof AgentInput]}
                    onChange={(e) => setInput(p => ({ ...p, [f.id]: e.target.value }))}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-teal-500/40 focus:ring-4 focus:ring-teal-500/5 outline-none transition-all placeholder:text-slate-800 font-semibold text-lg"
                    placeholder={f.placeholder}
                  />
                </div>
              ))}

              <button 
                disabled={isRunning}
                className="w-full group bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative text-lg"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isRunning ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5 fill-current" /> Initialize Flow</>}
                </div>
                {isRunning && (
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-white/20"
                  />
                )}
              </button>
            </form>
          </motion.div>


        </section>

        {/* Right Column: Visualization & Outputs */}
        <section className="xl:col-span-8 space-y-8">
          
          {/* Timeline Visualizer */}
          <div className="bg-slate-900/30 border border-white/10 rounded-[40px] p-10 backdrop-blur-md">
            <h3 className="text-base font-bold text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2">
              <Layers className="w-5 h-5" /> Orchestration Pipeline
            </h3>
            
            <div className="relative flex justify-between items-start gap-4">
              {/* Progress Line */}
              <div className="absolute top-7 left-0 right-0 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                   animate={{ width: `${isRunning ? ((currentStageIndex + 1) / STAGES.length) * 100 : output ? 100 : 0}%` }}
                   className="h-full bg-gradient-to-r from-teal-400 to-indigo-500"
                />
              </div>

              {STAGES.map((s, idx) => {
                const isActive = s.id === currentStageId;
                const isPast = currentStageIndex > idx || (output && !isRunning);
                return (
                  <div key={s.id} className="relative z-10 flex flex-col items-center flex-1 text-center group">
                    <motion.div 
                      animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                        isActive ? "bg-teal-500/20 border-teal-400 shadow-[0_0_30px_-5px_rgba(45,212,191,0.4)]" : 
                        isPast ? "bg-indigo-500/20 border-indigo-500" : "bg-slate-950 border-white/5"
                      }`}
                    >
                      <s.icon className={`w-6 h-6 ${isActive ? "text-teal-400" : isPast ? "text-indigo-300" : "text-slate-700"}`} />
                    </motion.div>
                    <p className={`mt-4 text-xs font-bold uppercase tracking-tighter ${isActive ? "text-white" : isPast ? "text-indigo-400" : "text-slate-700"}`}>
                      {s.label.split(' ')[0]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results Grid */}
          <AnimatePresence mode="wait">
            {output ? (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Branch 1: WhatsApp */}
                <OutputTile 
                  title="WhatsApp Sequence" 
                  icon={MessageSquare} 
                  accent="teal"
                  exportTag="WhatsApp Business"
                  onCopy={() => copyToClipboard(output.whatsappDrip.join('\n'), 'wa')}
                  isCopied={copiedId === 'wa'}
                >
                  <div className="space-y-4">
                    {output.whatsappDrip.map((msg, i) => (
                      <div key={i} className="group relative p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-teal-500/20 transition-all">
                        <span className="absolute -top-2 -left-2 w-6 h-6 bg-teal-500 text-black text-[10px] font-black flex items-center justify-center rounded-lg">#D{i+1}</span>
                        <p className="text-[12px] leading-relaxed text-slate-300 pl-2">{msg}</p>
                      </div>
                    ))}
                  </div>
                </OutputTile>

                {/* Branch 2: Social */}
                <OutputTile 
                  title="Engagement Plan" 
                  icon={Share2} 
                  accent="indigo"
                  exportTag="Canva"
                  onCopy={() => copyToClipboard(output.socialPosts.join('\n'), 'social')}
                  isCopied={copiedId === 'social'}
                >
                  <div className="space-y-5">
                    {output.socialPosts.map((post, i) => (
                      <div key={i} className="flex gap-4 items-start bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 shadow-lg shadow-indigo-500/50" />
                        <p className="text-[12px] text-slate-300 font-medium">{post}</p>
                      </div>
                    ))}
                    <div className="pt-4 flex gap-2">
                       <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-400">#TWITTER</span>
                       <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-400">#INSTA</span>
                    </div>
                  </div>
                </OutputTile>

                {/* Branch 3: FAQ */}
                <OutputTile 
                  title="Knowledge Base" 
                  icon={HelpCircle} 
                  accent="amber"
                  onCopy={() => copyToClipboard(output.faq.map(f => `${f.question}\n${f.answer}`).join('\n\n'), 'faq')}
                  isCopied={copiedId === 'faq'}
                >
                  <div className="space-y-6">
                    {output.faq.map((item, i) => (
                      <div key={i} className="relative pl-6">
                        <ChevronRight className="absolute left-0 top-0.5 w-4 h-4 text-amber-500" />
                        <h4 className="text-[13px] font-bold text-white mb-1.5">{item.question}</h4>
                        <p className="text-[11px] leading-relaxed text-slate-400">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </OutputTile>

                {/* Branch 4: Video */}
                <OutputTile 
                  title="Video Production" 
                  icon={Video} 
                  accent="rose"
                  exportTag="Canva"
                  onCopy={() => copyToClipboard(output.videoScript, 'video')}
                  isCopied={copiedId === 'video'}
                >
                  <div className="h-full flex flex-col justify-between">
                    <div className="p-5 bg-rose-500/5 border border-rose-500/10 rounded-3xl relative">
                      <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-3 h-3 text-rose-400" />
                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Optimized for Conversion</span>
                      </div>
                      <p className="text-[13px] leading-relaxed text-slate-300 italic">
                        "{output.videoScript.split('\n\n')[0].replace('Hook: ', '')}"
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                       <div className="flex -space-x-2">
                          {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border border-white/10" />)}
                       </div>
                       <span className="text-[10px] text-slate-500 font-bold uppercase">+12 Assets Pending</span>
                    </div>
                  </div>
                </OutputTile>
              </motion.div>
            ) : (
              <EmptyState isRunning={isRunning} />
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Modal Detail View */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedDetail(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
            />
            <motion.div 
              layoutId={selectedDetail}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] p-12 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <button onClick={() => setSelectedDetail(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><Expand className="w-6 h-6 rotate-45" /></button>
              <h2 className="text-3xl font-bold mb-8">Full WhatsApp Drip Sequence</h2>
              <div className="space-y-6">
                {output?.whatsappDrip.map((msg, i) => (
                  <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-2">Message Day {i+1}</p>
                    <p className="text-lg leading-relaxed">{msg}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[32px] p-10 shadow-2xl"
            >
              <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                <Expand className="w-5 h-5 rotate-45" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-sm text-slate-400 mb-8">Sign in to access your AgentZero analytics dashboard.</p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (loginEmail.trim()) {
                  setUserEmail(loginEmail);
                  localStorage.setItem('userEmail', loginEmail);
                  setShowLoginModal(false);
                }
              }}>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2 transition-colors">
                  Email Address
                </label>
                <input 
                  type="email" 
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-teal-500/40 focus:ring-4 focus:ring-teal-500/5 outline-none transition-all placeholder:text-slate-700 font-medium text-lg mb-8"
                />
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg"
                >
                  Continue with Email
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="relative z-10 border-t border-white/5 pt-12 pb-20 text-center text-slate-600">
         <p className="text-xs font-bold uppercase tracking-[0.3em]">AgentZero Orchestrator v4.2.0 • Build with Passion</p>
      </footer>
    </div>
  );
}

function OutputTile({ title, icon: Icon, accent, children, onCopy, isCopied, exportTag }: any) {
  const themes: any = {
    teal: "group-hover:text-teal-400",
    indigo: "group-hover:text-indigo-400",
    amber: "group-hover:text-amber-400",
    rose: "group-hover:text-rose-400"
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group bg-slate-900/40 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl transition-all hover:bg-slate-900/60 shadow-xl overflow-hidden relative"
    >
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 transition-colors ${themes[accent]}`} />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-100">{title}</h3>
        </div>
        <button 
          onClick={onCopy}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white relative z-20"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="relative z-10">{children}</div>
      {exportTag && (
        <div className="absolute top-8 right-16 z-10 hidden xl:block">
          <span className="bg-slate-800/80 backdrop-blur-sm border border-white/10 text-slate-300 text-[10px] px-3 py-1.5 rounded-full font-bold uppercase flex items-center gap-1.5">
            <ExternalLink className="w-3 h-3" />
            {exportTag}
          </span>
        </div>
      )}
    </motion.div>
  );
}

function EmptyState({ isRunning }: { isRunning: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[48px] h-[600px] flex flex-col items-center justify-center p-12 text-center"
    >
      <div className="w-24 h-24 bg-slate-800/50 rounded-[32px] flex items-center justify-center mb-8 animate-bounce-slow">
        <Database className="w-10 h-10 text-slate-700" />
      </div>
      <h3 className="text-2xl font-bold mb-4">Pipeline Dormant</h3>

      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl p-6 mt-4 mb-8 max-w-3xl flex items-start gap-4 text-left shadow-lg">
        <Activity className="w-8 h-8 shrink-0 mt-1" />
        <p className="text-sm md:text-base font-semibold leading-relaxed">
          EV enquiry to purchase conversion is <span className="underline decoration-emerald-500/50 underline-offset-4">50% lower</span> than ICE vehicles due to knowledge gaps. Systematic education bridges this gap and dramatically increases conversion.
        </p>
      </div>

      <p className="text-slate-500 max-w-xs leading-relaxed font-medium">
        {isRunning ? "Logic engines are firing. Analyzing the segment data..." : "Enter parameters and initialize to deploy the multi-step agent flow."}
      </p>
      
      {!isRunning && (
        <div className="mt-12 flex gap-4 text-[10px] items-center text-slate-800 font-bold uppercase tracking-widest">
           <span>No API costs</span>
           <div className="w-1 h-1 rounded-full bg-slate-800" />
           <span>100% Deterministic</span>
           <div className="w-1 h-1 rounded-full bg-slate-800" />
           <span>Ready to export</span>
        </div>
      )}
    </motion.div>
  );
}
