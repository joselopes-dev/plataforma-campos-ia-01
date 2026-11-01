import React, { useState, useEffect } from 'react';
import { Discipline, Lesson, User, FinalExamQuestion } from '../types/index.ts';
import { 
  ArrowLeft, Video, SlidersHorizontal, FileText, CheckSquare, 
  Unlock, Lock, CheckCircle2, AlertCircle, Bot, Download, Award, FileCheck
} from 'lucide-react';

interface ClassroomProps {
  disciplineId: string;
  user: User;
  onBack: () => void;
  openTutorWithContext: (disciplineId: string, lessonId: string) => void;
  onProgressUpdated: () => void;
}

export const Classroom: React.FC<ClassroomProps> = ({
  disciplineId, user, onBack, openTutorWithContext, onProgressUpdated,
}) => {
  const [disciplineData, setDisciplineData] = useState<{ discipline: Discipline; lessons: Lesson[] } | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [activeStepNumber, setActiveStepNumber] = useState<number>(1);
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({ 0: -1, 1: -1, 2: -1 });
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean; feedback: string; explanation: string } | null>(null);
  const [isFinalExamActive, setIsFinalExamActive] = useState<boolean>(false);
  const [finalExamQuestions, setFinalExamQuestions] = useState<FinalExamQuestion[]>([]);
  const [finalExamAnswers, setFinalExamAnswers] = useState<Record<number, number>>({});
  const [finalExamResult, setFinalExamResult] = useState<{ score: number; passed: boolean; feedback: string } | null>(null);
  const [isDisciplineApproved, setIsDisciplineApproved] = useState<boolean>(false);
  const [finalGrade, setFinalGrade] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/curriculum/disciplines/${disciplineId}`);
        const data = await res.json();
        setDisciplineData(data);
        if (data.lessons && data.lessons.length > 0) setActiveLessonId(data.lessons[0].id);
        const progRes = await fetch('/api/v1/progress');
        const progData = await progRes.json();
        const map: Record<string, boolean> = {};
        if (progData.rawProgress) {
          progData.rawProgress.forEach((p: any) => {
            if (p.disciplineId === disciplineId && p.completed) map[`${p.lessonId}:${p.stepNumber}`] = true;
          });
        }
        setProgressMap(map);
        const approval = progData.approvals?.find((a: any) => a.disciplineId === disciplineId && a.approved);
        if (approval) { setIsDisciplineApproved(true); setFinalGrade(approval.finalGrade); }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    loadData();
  }, [disciplineId]);

  if (loading || !disciplineData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#006633] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  const { discipline, lessons } = disciplineData;
  const currentLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  // --- CORREÇÃO: 1 VÍDEO POR DISCIPLINA ---
  const normalizePath = (path: string): string => path.replace(/\\/g, '/').replace(/\/+$/, '');
  const materialBase = normalizePath(discipline.localMaterialPath || '');

  // Pega o número da DISCIPLINA da pasta: 01-fundamentos -> 01, 02-logica -> 02
  const getPaddedFromPath = (path: string): string => {
    const match = path.match(/(\d{2})-[^/]+$/);
    return match ? match[1] : '01';
  };
  const padded = getPaddedFromPath(materialBase);

  const videoPath = `${materialBase}/video-aula-${padded}.mp4`;
  const slidesPath = `${materialBase}/slides-aula-${padded}.pdf`;
  const apostilaPath = `${materialBase}/apostila-aula-${padded}.pdf`;
  const complementarPath = `${materialBase}/material-complementar-${padded}.pdf`;
  const referenciasPath = `${materialBase}/referencias-exercicios-${padded}.pdf`;

  const areAllLessonsCompleted = lessons.every((l) => Boolean(progressMap[`${l.id}:5`]));
  const isStepUnlocked = (stepNum: number) => stepNum === 1 ? true : Boolean(progressMap[`${currentLesson.id}:${stepNum - 1}`]);
  const isStepCompleted = (stepNum: number) => Boolean(progressMap[`${currentLesson.id}:${stepNum}`]);

  const handleCompleteStep = async (stepNum: number) => {
    try {
      setActionLoading(true); setFeedbackMessage(null);
      setProgressMap((prev) => ({ ...prev, [`${currentLesson.id}:${stepNum}`]: true }));
      if (stepNum < 5) setActiveStepNumber(stepNum + 1);
      const res = await fetch('/api/v1/progress/step', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ disciplineId: discipline.id, lessonId: currentLesson.id, stepNumber: stepNum }) });
      const result = await res.json().catch(() => ({}));
      setFeedbackMessage({ type: 'success', text: result.message || `Etapa ${stepNum} concluída.` });
      onProgressUpdated();
    } catch { setFeedbackMessage({ type: 'success', text: `Etapa ${stepNum} concluída.` }); onProgressUpdated(); } finally { setActionLoading(false); }
  };

  const handleSubmitQuiz = async () => {
    try {
      setActionLoading(true); setFeedbackMessage(null);
      const answersArray = [quizAnswers[0], quizAnswers[1], quizAnswers[2]];
      if (answersArray.some((a) => a === -1)) { setFeedbackMessage({ type: 'error', text: 'Responda as 3 questões.' }); setActionLoading(false); return; }
      const res = await fetch('/api/v1/progress/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ disciplineId: discipline.id, lessonId: currentLesson.id, answers: answersArray }) });
      const result = await res.json(); setQuizResult(result);
      if (result.passed) { setProgressMap((prev) => ({ ...prev, [`${currentLesson.id}:4`]: true })); setFeedbackMessage({ type: 'success', text: result.feedback }); onProgressUpdated(); setActiveStepNumber(5); } else { setFeedbackMessage({ type: 'error', text: result.feedback }); }
    } catch (err: any) { setFeedbackMessage({ type: 'error', text: 'Erro: ' + err.message }); } finally { setActionLoading(false); }
  };

  const handleOpenFinalExam = async () => {
    try {
      setActionLoading(true); setFeedbackMessage(null); setIsFinalExamActive(true);
      const res = await fetch(`/api/v1/progress/final-exam/${discipline.id}`); const data = await res.json();
      if (!res.ok) { setFeedbackMessage({ type: 'error', text: data.error }); setIsFinalExamActive(false); return; }
      setFinalExamQuestions(data.questions || []); const initialAnswers: Record<number, number> = {}; for (let i = 0; i < 10; i++) initialAnswers[i] = -1; setFinalExamAnswers(initialAnswers);
    } catch (err: any) { setFeedbackMessage({ type: 'error', text: 'Falha: ' + err.message }); setIsFinalExamActive(false); } finally { setActionLoading(false); }
  };

  const handleSubmitFinalExam = async () => {
    try {
      setActionLoading(true); setFeedbackMessage(null);
      const answersArray: number[] = []; for (let i = 0; i < 10; i++) answersArray.push(finalExamAnswers[i] ?? -1);
      if (answersArray.some((a) => a === -1)) { setFeedbackMessage({ type: 'error', text: 'Responda as 10 questões.' }); setActionLoading(false); return; }
      const res = await fetch(`/api/v1/progress/final-exam/${discipline.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: answersArray }) });
      const result = await res.json(); setFinalExamResult(result);
      if (result.passed) { setIsDisciplineApproved(true); setFinalGrade(result.score); setFeedbackMessage({ type: 'success', text: result.feedback }); onProgressUpdated(); } else { setFeedbackMessage({ type: 'error', text: result.feedback }); }
    } catch (err: any) { setFeedbackMessage({ type: 'error', text: 'Erro: ' + err.message }); } finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>
          <div>
            <div className="flex items-center space-x-2"><span className="bg-emerald-100 text-[#006633] text-xs font-black px-2 py-0.5 rounded uppercase">{discipline.code}</span><span className="text-xs font-semibold text-gray-500">Aula {padded} • {discipline.hours}h</span></div>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{discipline.title}</h1>
          </div>
        </div>
        <button onClick={() => openTutorWithContext(discipline.id, currentLesson.id)} className="bg-emerald-50 hover:bg-emerald-100 text-[#006633] border border-emerald-300 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center space-x-2 cursor-pointer"><Bot className="w-4 h-4" /><span>Tirar Dúvida</span></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div><h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider px-1 mb-2">Aulas da Disciplina</h2><div className="space-y-2">{lessons.map((lesson, idx) => { const isSelected = !isFinalExamActive && lesson.id === currentLesson.id; const isPreviousLessonFinished = idx === 0 || Boolean(progressMap[`${lessons[idx - 1].id}:5`]); return (<button key={lesson.id} disabled={!isPreviousLessonFinished} onClick={() => { setIsFinalExamActive(false); setActiveLessonId(lesson.id); setActiveStepNumber(1); }} className={`w-full text-left p-3.5 rounded-xl border text-xs cursor-pointer ${isSelected ? 'border-[#006633] bg-emerald-50 ring-1 ring-[#006633]' : 'border-gray-200 bg-white'}`}><span className="font-bold text-gray-900">{lesson.title}</span></button>); })}</div></div>
          <div className="bg-gray-50 border rounded-xl p-3 text-[11px]"><p className="font-bold">Arquivo atual:</p><p className="font-mono text-[10px] break-all text-emerald-800">{videoPath}</p></div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {feedbackMessage && <div className={`p-4 rounded-xl border text-xs ${feedbackMessage.type === 'success' ? 'bg-emerald-50' : 'bg-red-50'}`}>{feedbackMessage.text}</div>}
          {isFinalExamActive ? (
            <div className="bg-white p-6 rounded-2xl border space-y-6"><h3 className="text-xl font-black">Avaliação Final — {discipline.code}</h3><div className="space-y-4">{finalExamQuestions.map((q, qIdx) => (<div key={q.id} className="border rounded-xl p-4 bg-gray-50/40"><p className="text-xs font-bold">{q.question}</p><div className="space-y-2 mt-2">{q.options.map((opt, oIdx) => (<label key={oIdx} className="flex space-x-2 p-2.5 rounded-lg border text-xs bg-white cursor-pointer"><input type="radio" name={`final_q_${qIdx}`} checked={finalExamAnswers[qIdx] === oIdx} onChange={() => setFinalExamAnswers({ ...finalExamAnswers, [qIdx]: oIdx })} /><span>{opt}</span></label>))}</div></div>))}</div><button disabled={actionLoading} onClick={handleSubmitFinalExam} className="w-full bg-[#006633] text-white font-bold py-3.5 rounded-xl text-xs cursor-pointer">Submeter Final</button></div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-xl border"><div className="grid grid-cols-5 gap-2 text-center text-xs">{[{ num: 1, label: '1. Vídeo', icon: Video }, { num: 2, label: '2. Slides', icon: SlidersHorizontal }, { num: 3, label: '3. PDF', icon: FileText }, { num: 4, label: '4. Teste', icon: CheckSquare }, { num: 5, label: '5. Liberação', icon: Unlock }].map(({ num, label, icon: Icon }) => { const completed = isStepCompleted(num); const unlocked = isStepUnlocked(num); const isCurrent = activeStepNumber === num; return (<button key={num} disabled={!unlocked} onClick={() => setActiveStepNumber(num)} className={`p-2.5 rounded-lg border font-semibold flex flex-col items-center justify-center space-y-1 cursor-pointer ${completed ? 'border-emerald-300 bg-emerald-50' : isCurrent ? 'border-[#006633] bg-[#006633] text-white' : 'border-gray-200 bg-white'}`}><Icon className="w-4 h-4" /><span className="text-[11px]">{label}</span></button>); })}</div></div>

              <div className="bg-white p-6 rounded-2xl border shadow-xs min-h-[420px]">
                {activeStepNumber === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">Vídeo-Aula {padded}</h3>
                    <div className="aspect-video bg-black rounded-xl overflow-hidden">
                      <video key={padded} controls className="w-full h-full object-contain" src={videoPath}></video>
                    </div>
                    <p className="font-mono text-[11px] text-emerald-800">{videoPath}</p>
                    <button onClick={() => handleCompleteStep(1)} className="w-full bg-[#006633] text-white font-bold py-3 rounded-xl text-xs cursor-pointer">Concluir Vídeo</button>
                  </div>
                )}
                {activeStepNumber === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">Slides Aula {padded}</h3>
                    <div className="border-2 border-dashed rounded-xl p-8 text-center bg-gray-50/50"><p className="font-mono text-[11px] text-emerald-800">{slidesPath}</p><a href={slidesPath} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-2 mt-3 bg-white border px-3.5 py-2 rounded-lg font-bold text-xs cursor-pointer"><Download className="w-3.5 h-3.5" /><span>Baixar slides-aula-{padded}.pdf</span></a></div>
                    <button onClick={() => handleCompleteStep(2)} className="w-full bg-[#006633] text-white font-bold py-3 rounded-xl text-xs cursor-pointer">Concluir Slides</button>
                  </div>
                )}
                {activeStepNumber === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">PDFs Aula {padded}</h3>
                    <a href={apostilaPath} target="_blank" rel="noreferrer" className="block bg-gray-50 border rounded-xl p-4 font-mono text-[11px] text-emerald-800 cursor-pointer">{apostilaPath} - Baixar</a>
                    <a href={complementarPath} target="_blank" rel="noreferrer" className="block bg-gray-50 border rounded-xl p-4 font-mono text-[11px] text-emerald-800 cursor-pointer">{complementarPath} - Baixar</a>
                    <a href={referenciasPath} target="_blank" rel="noreferrer" className="block bg-gray-50 border rounded-xl p-4 font-mono text-[11px] text-emerald-800 cursor-pointer">{referenciasPath} - Baixar</a>
                    <button onClick={() => handleCompleteStep(3)} className="w-full bg-[#006633] text-white font-bold py-3 rounded-xl text-xs cursor-pointer">Confirmar Leitura</button>
                  </div>
                )}
                {activeStepNumber === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">Teste Fixação</h3>
                    <div className="space-y-3">{[0,1,2].map(i => (<div key={i} className="border rounded-xl p-4 bg-gray-50/40"><p className="text-xs font-bold">Questão {i+1}</p><div className="space-y-2 mt-2">{['Opção A','Opção B - Correta','Opção C'].map((opt,oIdx)=>(<label key={oIdx} className={`flex items-center space-x-2 p-2.5 rounded-lg border text-xs bg-white cursor-pointer ${quizAnswers[i]===oIdx?'border-[#006633] bg-emerald-50':''}`}><input type="radio" name={`q${i}`} checked={quizAnswers[i]===oIdx} onChange={()=>setQuizAnswers({...quizAnswers,[i]:oIdx})} /><span>{opt}</span></label>))}</div></div>))}</div>
                    {quizResult && <div className={`p-4 rounded-xl border text-xs ${quizResult.passed?'bg-emerald-50':'bg-red-50'}`}>Nota: {quizResult.score.toFixed(1)} - {quizResult.feedback}</div>}
                    <button onClick={handleSubmitQuiz} className="w-full bg-[#006633] text-white font-bold py-3 rounded-xl text-xs cursor-pointer">Submeter</button>
                  </div>
                )}
                {activeStepNumber === 5 && (
                  <div className="space-y-4"><h3 className="text-lg font-bold">Concluída Aula {padded}</h3><div className="border border-emerald-200 bg-emerald-50 rounded-xl p-8 text-center"><Award className="w-10 h-10 mx-auto text-[#006633]" /><p className="font-bold mt-2">Disciplina {padded} concluída!</p></div><button onClick={() => handleCompleteStep(5)} className="w-full bg-[#006633] text-white font-bold py-3 rounded-xl text-xs cursor-pointer">Confirmar</button></div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};