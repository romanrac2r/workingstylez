import React, { useState, useEffect } from 'react';
import { Client, Databases, ID, Query } from 'appwrite';
import { 
  Languages, Users, BarChart3, Save, Info, AlertTriangle, 
  Zap, Diamond, Heart, Rocket, Shield, CheckCircle2, 
  ChevronRight, Timer, Trophy, Lightbulb, Users2
} from 'lucide-react';

// --- KONFIGURÁCIA APPWRITE ---
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6a26d7780019fe2ffcc5'); 

const databases = new Databases(client);
const DB_ID = '6a26d789000c25937cf5';  
const COLL_ID = 'pracovn_styly';

const CATEGORIES = {
  HurryUp: { 
    sk: "Ponáhľaj sa", en: "Hurry Up", 
    color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", accent: "bg-blue-500",
    icon: <Zap size={24} />, 
    questions: [1, 10, 15, 17, 24],
    strengths: { sk: "Rýchlosť, efektivita, zvládanie termínov", en: "Speed, efficiency, hitting deadlines" },
    risks: { sk: "Chybovosť v náhlivosti, netrpezlivosť", en: "Errors in haste, impatience" }
  },
  BePerfect: { 
    sk: "Buď dokonalý", en: "Be Perfect", 
    color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", accent: "bg-indigo-600",
    icon: <Diamond size={24} />, 
    questions: [2, 9, 11, 16, 25],
    strengths: { sk: "Presnosť, vysoké štandardy, plánovanie", en: "Accuracy, high standards, planning" },
    risks: { sk: "Prokrastinácia kvôli detailom, kritickosť", en: "Procrastination over details, overly critical" }
  },
  PleaseOthers: { 
    sk: "Poteš ľudí", en: "Please Others", 
    color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200", accent: "bg-rose-500",
    icon: <Heart size={24} />, 
    questions: [3, 8, 14, 18, 23],
    strengths: { sk: "Empatia, harmónia v tíme, intuitívnosť", en: "Empathy, team harmony, intuitiveness" },
    risks: { sk: "Neschopnosť povedať nie, strach z konfliktu", en: "Inability to say no, fear of conflict" }
  },
  TryHard: { 
    sk: "Veľmi sa snaž", en: "Try Hard", 
    color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", accent: "bg-amber-500",
    icon: <Rocket size={24} />, 
    questions: [4, 7, 12, 20, 21],
    strengths: { sk: "Nadšenie, iniciatíva, veľa nápadov", en: "Enthusiasm, initiative, many ideas" },
    risks: { sk: "Nedoťahovanie vecí, rýchla strata záujmu", en: "Not finishing tasks, losing interest fast" }
  },
  BeStrong: { 
    sk: "Buď silný", en: "Be Strong", 
    color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-300", accent: "bg-slate-600",
    icon: <Shield size={24} />, 
    questions: [5, 6, 13, 19, 22],
    strengths: { sk: "Pokoj v kríze, spoľahlivosť, logika", en: "Calm in crisis, reliability, logic" },
    risks: { sk: "Nedostatok emócií, nežiadanie o pomoc", en: "Lack of emotion, not asking for help" }
  }
};

const QUESTIONS_DATA = [
  { id: 1, sk: "Mám sklon čakať, kým sa nepriblíži termín, až potom sa pustím do úlohy.", en: "I tend to wait until the deadline is close before starting a task." },
  { id: 2, sk: "Rád si efektívne usporiadam pracovnú oblasť.", en: "I like to organize my work area effectively." },
  { id: 3, sk: "V pracovných vzťahoch je dôležité udržať harmóniu.", en: "In work relationships, it is important to maintain harmony." },
  { id: 4, sk: "Rád začínam nové projekty.", en: "I like starting new projects." },
  { id: 5, sk: "Viem zachovať pokoj v krízovej situácii.", en: "I can stay calm in a crisis situation." },
  { id: 6, sk: "Vytrvalo a svedomito pracujem na tom, čo je potrebné.", en: "I work persistently and conscientiously on what is needed." },
  { id: 7, sk: "Dokážem vidieť úlohu ako celok a prejaviť iniciatívu.", en: "I can see a task as a whole and show initiative." },
  { id: 8, sk: "Rád povzbudzujem ľudí a rád robím to, čo im pomáha.", en: "I like encouraging people and doing what helps them." },
  { id: 9, sk: "Starostlivo si veci plánujem vopred, aby som bol pripravený na problémy.", en: "I plan things carefully in advance to be ready for potential problems." },
  { id: 10, sk: "Som rád, keď mám veľa roboty (aj keď sa niekedy sťažujem).", en: "I like being busy (even if I sometimes complain)." },
  { id: 11, sk: "Je dôležité veci skontrolovať, aby tam neboli chyby.", en: "It is important to check things to avoid mistakes." },
  { id: 12, sk: "Obyčajne som viac nadšený ako iní ľudia.", en: "I am usually more enthusiastic than other people." },
  { id: 13, sk: "Obyčajne som vyrovnanejší a pokojnejší ako iní ľudia.", en: "I am usually more balanced and calmer than other people." },
  { id: 14, sk: "Obyčajne som intuitívny a citlivý na pocity iných ľudí.", en: "I am usually intuitive and sensitive to the feelings of others." },
  { id: 15, sk: "Obyčajne viem dokončiť úlohy rýchlejšie než iní ľudia.", en: "I can usually finish tasks faster than other people." },
  { id: 16, sk: "Zdá sa, že si ľudia myslia, že som nadmerne kritický voči štandardom.", en: "It seems people think I am overly critical of standards." },
  { id: 17, sk: "Niekedy robím chyby, pretože pracujem rýchlo.", en: "I sometimes make mistakes because I work fast." },
  { id: 18, sk: "Niekedy sa ľudia správajú, akoby sa im nepáčilo, keď sa snažím pomôcť.", en: "Sometimes people act as if they don't like it when I try to help." },
  { id: 19, sk: "Niekedy zmeškám termín, pretože je ťažké požiadať o pomoc.", en: "Sometimes I miss a deadline because it is hard to ask for help." },
  { id: 20, sk: "Mám sklon začínať niekoľko projektov, ale nie vždy ich dokončím.", en: "I tend to start several projects but don't always finish them." },
  { id: 21, sk: "Ľudia sa sťažujú, že zveličujem úlohy kvôli príliš veľa aspektom.", en: "People complain that I over-complicate tasks due to too many aspects." },
  { id: 22, sk: "Zdá sa, že ľudia si myslia, že som chladný a nie priateľský.", en: "It seems people think I am cold and unfriendly." },
  { id: 23, sk: "Mám problém povedať ľuďom nie, aj keď mám už veľa práce.", en: "I have trouble saying no to people, even when I'm already busy." },
  { id: 24, sk: "Som netrpezlivý, keď ľudia trávia priveľa času diskusiou.", en: "I am impatient when people spend too much time discussing." },
  { id: 25, sk: "Niekedy zmeškám termín, pretože si musím dlhšie overovať prácu.", en: "Sometimes I miss a deadline because I need to check my work longer." }
];

export default function App() {
  const [lang, setLang] = useState('sk');
  const [view, setView] = useState('login'); 
  const [user, setUser] = useState({ name: '', team: '' });
  const [answers, setAnswers] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const calculateScores = (data) => {
    const results = {};
    Object.keys(CATEGORIES).forEach(cat => {
      const sum = CATEGORIES[cat].questions.reduce((acc, qId) => acc + (parseInt(data[qId]) || 0), 0);
      results[cat] = (sum / 40) * 100;
    });
    return results;
  };

  const saveToAppwrite = async () => {
    setLoading(true);
    const scores = calculateScores(answers);
    try {
      await databases.createDocument(DB_ID, COLL_ID, ID.unique(), {
        userName: user.name,
        teamId: user.team.toLowerCase(),
        hurryUp: Math.round(scores.HurryUp),
        bePerfect: Math.round(scores.BePerfect),
        pleaseOthers: Math.round(scores.PleaseOthers),
        tryHard: Math.round(scores.TryHard),
        beStrong: Math.round(scores.BeStrong)
      });
      setView('results');
    } catch (e) { alert("Chyba pri ukladaní."); }
    setLoading(false);
  };

  const loadTeam = async () => {
    setLoading(true);
    try {
      const res = await databases.listDocuments(DB_ID, COLL_ID, [Query.equal('teamId', user.team.toLowerCase())]);
      setTeamMembers(res.documents);
      setView('team');
    } catch (e) { alert("Chyba pri načítaní tímu."); }
    setLoading(false);
  };

  const getTeamAnalysis = () => {
    if (teamMembers.length === 0) return [];
    const avg = { hurryUp: 0, bePerfect: 0, pleaseOthers: 0, tryHard: 0, beStrong: 0 };
    teamMembers.forEach(m => {
      avg.hurryUp += m.hurryUp; avg.bePerfect += m.bePerfect; avg.pleaseOthers += m.pleaseOthers;
      avg.tryHard += m.tryHard; avg.beStrong += m.beStrong;
    });
    Object.keys(avg).forEach(k => avg[k] /= teamMembers.length);

    const tips = [];
    if (avg.hurryUp > 65) tips.push({ sk: "Tím je v móde 'Šprint'. Pozor na vyhorenie a zbytočné chyby.", en: "Team is in 'Sprint' mode. Watch out for burnout and careless mistakes." });
    if (avg.bePerfect > 70) tips.push({ sk: "Vysoký dôraz na kvalitu, ale hrozí paralyzácia rozhodovania.", en: "High focus on quality, but risk of decision paralysis." });
    if (avg.beStrong < 35) tips.push({ sk: "Chýba emocionálna stabilita v kríze. Tím potrebuje kotvu.", en: "Lacks emotional stability in crisis. Team needs an anchor." });
    if (avg.pleaseOthers > 70) tips.push({ sk: "Prílišná snaha vyhovieť bráni úprimnej spätnej väzbe.", en: "Over-attempting to please hinders honest feedback." });
    
    return { avg, tips };
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">G</div>
            <span className="font-bold text-lg tracking-tight text-indigo-900">GrowClub <span className="font-light text-slate-400">Assessment</span></span>
          </div>
          <button onClick={() => setLang(lang === 'sk' ? 'en' : 'sk')} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
            <Languages size={18} /> {lang === 'sk' ? 'English' : 'Slovenčina'}
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        
        {/* VIEW: LOGIN (GrowClub Style Card) */}
        {view === 'login' && (
          <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-2xl shadow-indigo-100 border border-indigo-50 text-center animate-in fade-in zoom-in duration-500">
            <div className="inline-flex p-4 bg-indigo-50 rounded-3xl mb-6 text-indigo-600">
              <Users2 size={40} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-indigo-950 tracking-tight">
              {lang === 'sk' ? 'Spoznaj svoj pracovný štýl' : 'Discover Your Work Style'}
            </h2>
            <p className="text-slate-500 mb-10 text-lg max-w-md mx-auto leading-relaxed">
              {lang === 'sk' ? 'Zisti, čo ťa poháňa vpred a ako tvoj štýl ovplyvňuje dynamiku celého tímu.' : 'Find out what drives you and how your style affects the team dynamics.'}
            </p>
            <div className="space-y-4 max-w-sm mx-auto">
              <input className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition outline-none" placeholder={lang === 'sk' ? 'Tvoje meno' : 'Your name'} onChange={e => setUser({...user, name: e.target.value})} />
              <input className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition outline-none" placeholder={lang === 'sk' ? 'Názov tímu' : 'Team Name'} onChange={e => setUser({...user, team: e.target.value})} />
              <button disabled={!user.name || !user.team} onClick={() => setView('survey')} className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition disabled:opacity-30 disabled:translate-y-0">
                {lang === 'sk' ? 'Spustiť dotazník' : 'Start Assessment'}
              </button>
            </div>
          </div>
        )}

        {/* VIEW: SURVEY */}
        {view === 'survey' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-indigo-100">
              <div className="p-3 bg-indigo-600 rounded-2xl text-white"><Info /></div>
              <div>
                <p className="text-sm font-bold text-indigo-900 uppercase tracking-widest">{lang === 'sk' ? 'Inštrukcia' : 'Instruction'}</p>
                <p className="text-slate-500">{lang === 'sk' ? 'Priraďte skóre 0 až 8 (8 = úplne ako vy, 0 = vôbec nie).' : 'Rate from 0 to 8 (8 = exactly like you, 0 = not at all).'}</p>
              </div>
            </div>
            
            {QUESTIONS_DATA.map((q, idx) => (
              <div key={q.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 group hover:border-indigo-200 transition">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-xs font-black text-indigo-200 uppercase tracking-widest">Otázka {q.id} / 25</span>
                  <div className="text-3xl font-black text-indigo-600">{answers[q.id] || 0}</div>
                </div>
                <p className="text-xl font-bold text-slate-800 mb-8 leading-snug">{lang === 'sk' ? q.sk : q.en}</p>
                <input type="range" min="0" max="8" step="1" value={answers[q.id] || 0} onChange={e => setAnswers({...answers, [q.id]: e.target.value})} className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600" />
                <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  <span>{lang === 'sk' ? 'Vôbec nie' : 'Not at all'}</span>
                  <span>{lang === 'sk' ? 'Presne ja' : 'Exactly me'}</span>
                </div>
              </div>
            ))}
            
            <button onClick={saveToAppwrite} className="w-full bg-indigo-600 text-white p-6 rounded-[32px] font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition flex items-center justify-center gap-3">
              {loading ? '...' : <><Save /> {lang === 'sk' ? 'Vyhodnotiť výsledky' : 'Evaluate Results'}</>}
            </button>
          </div>
        )}

        {/* VIEW: RESULTS (Colorful Cards) */}
        {view === 'results' && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <header className="text-center mb-12">
              <h2 className="text-4xl font-black text-indigo-950 mb-2">{lang === 'sk' ? 'Váš profil' : 'Your Profile'}</h2>
              <p className="text-slate-500">{lang === 'sk' ? 'Pomer vašich hnacích síl v percentách' : 'The ratio of your driving forces in percentage'}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(CATEGORIES).map(cat => {
                const score = calculateScores(answers)[cat];
                const c = CATEGORIES[cat];
                return (
                  <div key={cat} className={`bg-white p-8 rounded-[40px] border-2 ${c.border} shadow-sm relative overflow-hidden`}>
                    <div className="relative z-10">
                      <div className={`inline-flex p-3 rounded-2xl ${c.bg} ${c.color} mb-4`}>
                        {c.icon}
                      </div>
                      <h3 className="text-xl font-extrabold mb-1">{lang === 'sk' ? c.sk : c.en}</h3>
                      <div className="text-4xl font-black mb-6">{Math.round(score)}%</div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 rounded-2xl">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1 tracking-tighter">🚀 {lang === 'sk' ? 'Silné stránky' : 'Strengths'}</p>
                          <p className="text-sm font-medium text-emerald-900">{lang === 'sk' ? c.strengths.sk : c.strengths.en}</p>
                        </div>
                        <div className="p-4 bg-rose-50 rounded-2xl">
                          <p className="text-[10px] font-bold text-rose-600 uppercase mb-1 tracking-tighter">⚠️ {lang === 'sk' ? 'Možné riziká' : 'Risks'}</p>
                          <p className="text-sm font-medium text-rose-900">{lang === 'sk' ? c.risks.sk : c.risks.en}</p>
                        </div>
                      </div>
                    </div>
                    {/* Background decoration */}
                    <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${c.bg} rounded-full opacity-50`}></div>
                  </div>
                );
              })}
            </div>

            <button onClick={loadTeam} className="w-full bg-slate-900 text-white p-6 rounded-[32px] font-black text-xl hover:bg-black transition-all flex items-center justify-center gap-3">
              <Users2 /> {lang === 'sk' ? 'Pozrieť dynamiku tímu' : 'View Team Dynamics'}
            </button>
          </div>
        )}

        {/* VIEW: TEAM DASHBOARD */}
        {view === 'team' && (
          <div className="space-y-8 animate-in slide-in-from-right-20 duration-500">
            <div className="bg-white p-10 rounded-[40px] shadow-xl border border-indigo-50">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-indigo-950 uppercase tracking-tighter">{user.team}</h2>
                  <p className="text-slate-400 font-bold">{teamMembers.length} {lang === 'sk' ? 'Členovia' : 'Members'}</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600"><BarChart3 size={32} /></div>
              </div>

              {/* Analysis Pills */}
              <div className="space-y-4 mb-12">
                {getTeamAnalysis().tips.map((tip, i) => (
                  <div key={i} className="flex gap-4 bg-amber-50 p-5 rounded-3xl border border-amber-100 text-amber-900 items-start">
                    <AlertTriangle className="shrink-0 mt-1" size={20} />
                    <p className="font-bold leading-snug">{lang === 'sk' ? tip.sk : tip.en}</p>
                  </div>
                ))}
              </div>

              {/* Colorful List */}
              <div className="space-y-4">
                {teamMembers.map((m, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-3xl gap-4">
                    <span className="font-black text-lg text-indigo-900">{m.userName}</span>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-black">HU {m.hurryUp}%</span>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-black">BP {m.bePerfect}%</span>
                      <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-black">PO {m.pleaseOthers}%</span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-black">TH {m.tryHard}%</span>
                      <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-black">BS {m.beStrong}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button onClick={() => window.location.reload()} className="w-full text-indigo-600 font-black py-4 hover:underline">
              {lang === 'sk' ? '← Späť na začiatok' : '← Back to start'}
            </button>
          </div>
        )}
      </main>
      
      <footer className="text-center py-10 text-slate-300 text-xs font-bold uppercase tracking-[0.2em]">
        &copy; 2024 GrowClub Framework • Powered by Appwrite & Cloudflare
      </footer>
    </div>
  );
}
