import React, { useState, useEffect } from 'react';
import { Client, Databases, ID, Query } from 'appwrite';
import { Languages, Users, BarChart3, Save, Info, AlertTriangle } from 'lucide-react';

// --- KONFIGURÁCIA APPWRITE ---
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6a26d7780019fe2ffcc5'); // 

const databases = new Databases(client);
const DB_ID = 'https://fra.cloud.appwrite.io/v1'; 
const COLL_ID = 'pracovn_styly';

const CATEGORIES = {
  HurryUp: { sk: "Ponáhľaj sa", en: "Hurry Up", color: "bg-blue-500", questions: [1, 10, 15, 17, 24] },
  BePerfect: { sk: "Buď dokonalý", en: "Be Perfect", color: "bg-purple-500", questions: [2, 9, 11, 16, 25] },
  PleaseOthers: { sk: "Poteš ľudí", en: "Please Others", color: "bg-green-500", questions: [3, 8, 14, 18, 23] },
  TryHard: { sk: "Veľmi sa snaž", en: "Try Hard", color: "bg-orange-500", questions: [4, 7, 12, 20, 21] },
  BeStrong: { sk: "Buď silný", en: "Be Strong", color: "bg-red-500", questions: [5, 6, 13, 19, 22] }
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
  { id: 9, sk: "Starostlivo si veci plánujem vopred, aby som bol pripravený.", en: "I plan things carefully in advance to be prepared." },
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
  { id: 21, sk: "Ľudia sa sťažujú, že zveličujem úlohy (príliš veľa aspektov).", en: "People complain that I over-complicate tasks (too many aspects)." },
  { id: 22, sk: "Zdá sa, že ľudia si myslia, že som chladný a nie priateľský.", en: "It seems people think I am cold and unfriendly." },
  { id: 23, sk: "Mám problém povedať ľuďom nie, aj keď mám veľa práce.", en: "I have trouble saying no to people, even when I'm busy." },
  { id: 24, sk: "Som netrpezlivý, keď ľudia trávia priveľa času diskusiou.", en: "I am impatient when people spend too much time discussing." },
  { id: 25, sk: "Niekedy zmeškám termín, pretože si musím dlhšie overovať prácu.", en: "Sometimes I miss a deadline because I need to check my work longer." }
];

export default function App() {
  const [lang, setLang] = useState('sk');
  const [view, setView] = useState('login'); // login | survey | results | team
  const [user, setUser] = useState({ name: '', team: '' });
  const [answers, setAnswers] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);

  // Výpočet výsledkov
  const calculateScores = (data) => {
    const results = {};
    Object.keys(CATEGORIES).forEach(cat => {
      const sum = CATEGORIES[cat].questions.reduce((acc, qId) => acc + (parseInt(data[qId]) || 0), 0);
      results[cat] = (sum / 40) * 100; // Max je 40 bodov na kategóriu
    });
    return results;
  };

  const saveToAppwrite = async () => {
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
    } catch (e) { alert("Chyba pri ukladaní. Skontroluj ID databázy."); }
  };

  const loadTeam = async () => {
    try {
      const res = await databases.listDocuments(DB_ID, COLL_ID, [Query.equal('teamId', user.team.toLowerCase())]);
      setTeamMembers(res.documents);
      setView('team');
    } catch (e) { alert("Chyba pri načítaní tímu."); }
  };

  // Tímová analýza (Logika z PDF)
  const getTeamAnalysis = () => {
    if (teamMembers.length === 0) return [];
    const avg = { hurryUp: 0, bePerfect: 0, pleaseOthers: 0, tryHard: 0, beStrong: 0 };
    teamMembers.forEach(m => {
      avg.hurryUp += m.hurryUp; avg.bePerfect += m.bePerfect; avg.pleaseOthers += m.pleaseOthers;
      avg.tryHard += m.tryHard; avg.beStrong += m.beStrong;
    });
    Object.keys(avg).forEach(k => avg[k] /= teamMembers.length);

    const tips = [];
    if (avg.hurryUp > 60) tips.push({ sk: "V tíme je PRETLAK náhlivosti. Pozor na chyby z nepozornosti.", en: "Team OVERLOAD of Hurry Up. Watch out for careless mistakes." });
    if (avg.bePerfect > 70) tips.push({ sk: "Tím je vysoko kritický. Hrozí zmeškanie termínov kvôli detailom.", en: "Team is highly critical. Risk of missing deadlines due to details." });
    if (avg.beStrong < 30) tips.push({ sk: "CHÝBA 'Be Strong'. Tím môže v kríze podliehať emóciám.", en: "MISSING 'Be Strong'. Team might get emotional during crises." });
    if (avg.tryHard > 60 && avg.bePerfect < 40) tips.push({ sk: "Tím veľa vecí začne, ale málo dokončí.", en: "Team starts many things but finishes few." });
    
    return { avg, tips };
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Kahler Drivers Assessment</h1>
        <button onClick={() => setLang(lang === 'sk' ? 'en' : 'sk')} className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 transition">
          <Languages size={20} /> {lang === 'sk' ? 'English' : 'Slovenčina'}
        </button>
      </div>

      <main className="max-w-4xl mx-auto">
        {/* VIEW: LOGIN */}
        {view === 'login' && (
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <Users className="mx-auto mb-4 text-blue-600" size={48} />
            <h2 className="text-2xl font-bold mb-6">{lang === 'sk' ? 'Zadajte údaje' : 'Enter details'}</h2>
            <input className="w-full p-4 border rounded-xl mb-4" placeholder={lang === 'sk' ? 'Vaše meno' : 'Your name'} onChange={e => setUser({...user, name: e.target.value})} />
            <input className="w-full p-4 border rounded-xl mb-6" placeholder={lang === 'sk' ? 'ID tímu (napr. marketing)' : 'Team ID (e.g. sales)'} onChange={e => setUser({...user, team: e.target.value})} />
            <button disabled={!user.name || !user.team} onClick={() => setView('survey')} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
              {lang === 'sk' ? 'Začať dotazník' : 'Start Assessment'}
            </button>
          </div>
        )}

        {/* VIEW: SURVEY */}
        {view === 'survey' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm">
              {lang === 'sk' ? 'Každej položke priraďte skóre od 0 do 8 (8 = úplne ako vy, 0 = vôbec nie).' : 'Rate each item from 0 to 8 (8 = exactly like you, 0 = not at all).'}
            </div>
            {QUESTIONS_DATA.map(q => (
              <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition hover:shadow-md">
                <p className="text-lg mb-4 font-medium text-slate-700">{q.id}. {lang === 'sk' ? q.sk : q.en}</p>
                <div className="flex items-center gap-4">
                  <input type="range" min="0" max="8" step="1" value={answers[q.id] || 0} onChange={e => setAnswers({...answers, [q.id]: e.target.value})} className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  <span className="text-2xl font-bold text-blue-600 w-8">{answers[q.id] || 0}</span>
                </div>
              </div>
            ))}
            <button onClick={saveToAppwrite} className="w-full bg-green-600 text-white p-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-green-700 flex items-center justify-center gap-2">
              <Save /> {lang === 'sk' ? 'Uložiť a vyhodnotiť' : 'Save & Evaluate'}
            </button>
          </div>
        )}

        {/* VIEW: RESULTS */}
        {view === 'results' && (
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2"><BarChart3 text-blue-600 /> {lang === 'sk' ? 'Vaše výsledky' : 'Your Results'}</h2>
            <div className="space-y-8">
              {Object.keys(CATEGORIES).map(cat => {
                const score = calculateScores(answers)[cat];
                return (
                  <div key={cat}>
                    <div className="flex justify-between mb-2 font-bold uppercase text-sm tracking-widest text-slate-500">
                      <span>{lang === 'sk' ? CATEGORIES[cat].sk : CATEGORIES[cat].en}</span>
                      <span>{Math.round(score)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4">
                      <div className={`h-4 rounded-full ${CATEGORIES[cat].color}`} style={{ width: `${score}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={loadTeam} className="mt-12 w-full bg-slate-800 text-white p-4 rounded-xl font-bold hover:bg-slate-900 flex items-center justify-center gap-2">
              <Users /> {lang === 'sk' ? 'Pozrieť tímový dashboard' : 'View Team Dashboard'}
            </button>
          </div>
        )}

        {/* VIEW: TEAM DASHBOARD */}
        {view === 'team' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-slate-800 underline decoration-blue-500 underline-offset-8">
                {lang === 'sk' ? `Tím: ${user.team}` : `Team: ${user.team}`} ({teamMembers.length} {lang === 'sk' ? 'členov' : 'members'})
              </h2>
              
              {/* Team Gaps / Analysis */}
              <div className="grid gap-4 mb-8">
                {getTeamAnalysis().tips.map((tip, i) => (
                  <div key={i} className="flex gap-4 bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800">
                    <AlertTriangle className="shrink-0" />
                    <p className="font-medium">{lang === 'sk' ? tip.sk : tip.en}</p>
                  </div>
                ))}
              </div>

              {/* Members List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-slate-400 text-xs uppercase font-black">
                      <th className="py-4 px-2">{lang === 'sk' ? 'Meno' : 'Name'}</th>
                      <th>HU</th><th>BP</th><th>PO</th><th>TH</th><th>BS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((m, i) => (
                      <tr key={i} className="border-b hover:bg-slate-50 transition">
                        <td className="py-4 px-2 font-bold text-slate-700">{m.userName}</td>
                        <td className="text-blue-600 font-medium">{m.hurryUp}%</td>
                        <td className="text-purple-600 font-medium">{m.bePerfect}%</td>
                        <td className="text-green-600 font-medium">{m.pleaseOthers}%</td>
                        <td className="text-orange-600 font-medium">{m.tryHard}%</td>
                        <td className="text-red-600 font-medium">{m.beStrong}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
