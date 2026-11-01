import React, { useState, useEffect } from 'react';
import { Discipline, Lesson, User, FinalExamQuestion } from '../types/index.ts';
import { 
  ArrowLeft, 
  Video, 
  SlidersHorizontal, 
  FileText, 
  CheckSquare, 
  Unlock, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  Download, 
  Award,
  FileCheck
} from 'lucide-react';

interface ClassroomProps {
  disciplineId: string;
  user: User;
  onBack: () => void;
  openTutorWithContext: (disciplineId: string, lessonId: string) => void;
  onProgressUpdated: () => void;
  onSelectDiscipline?: (disciplineId: string) => void;
  allDisciplines?: Discipline[];
}

export const Classroom: React.FC<ClassroomProps> = ({
  disciplineId,
  user,
  onBack,
  openTutorWithContext,
  onProgressUpdated,
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
        if (data.lessons && data.lessons.length > 0) {
          setActiveLessonId(data.lessons[0].id);
        }
        const progRes = await fetch('/api/v1/progress');
        const progData = await progRes.json();
        const map: Record<string, boolean> = {};
        if (progData.rawProgress) {
          progData.rawProgress.forEach((p: any) => {
            if (p.disciplineId === disciplineId && p.completed) {
              map[`${p.lessonId}:${p.stepNumber}`] = true;
            }
          });
        }
        setProgressMap(map);
        const approval = progData.approvals?.find((a: any) => a.disciplineId === disciplineId && a.approved);
        if (approval) {
          setIsDisciplineApproved(true);
          setFinalGrade(approval.finalGrade);
        }
      } catch (err) {
        console.error('Erro ao carregar dados da disciplina:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [disciplineId]);

  if (loading || !disciplineData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#006633] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-600">Carregando ambiente da sala de aula...</p>
        </div>
      </div>
    );
  }

  const { discipline, lessons } = disciplineData;
  const currentLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  // --- INICIO DA CORRECAO PARA TODOS OS ARQUIVOS ---
  const normalizePath = (path: string): string =>
    path.replace(/\\/g, '/').replace(/\/+$/, '');

  const materialBase = normalizePath(discipline.localMaterialPath || '');

  // Número da aula dentro da disciplina (1, 2, 3...)
  const lessonIndex = lessons.findIndex((l) => l.id === currentLesson.id) + 1;
  const paddedLesson = String(lessonIndex).padStart(2, '0');
  
  // Mantém compatibilidade com seu seed que usa -aula-01, -aula-02
  const padded = paddedLesson;
  // --- FIM DA CORRECAO ---

  const areAllLessonsCompleted = lessons.every((l) => Boolean(progressMap[`${l.id}:5`]));

  const isStepUnlocked = (stepNum: number) => {
    if (stepNum === 1) return true;
    return Boolean(progressMap[`${currentLesson.id}:${stepNum - 1}`]);
  };

  const isStepCompleted = (stepNum: number) => {
    return Boolean(progressMap[`${currentLesson.id}:${stepNum}`]);
  };

  const handleCompleteStep = async (stepNum: number) => {
    try {
      setActionLoading(true);
      setFeedbackMessage(null);
      setProgressMap((prev) => ({
        ...prev,
        [`${currentLesson.id}:${stepNum}`]: true,
      }));
      if (stepNum < 5) {
        setActiveStepNumber(stepNum + 1);
      }
      const res = await fetch('/api/v1/progress/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disciplineId: discipline.id,
          lessonId: currentLesson.id,
          stepNumber: stepNum,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedbackMessage({ type: 'info', text: result.message || result.error || `Etapa ${stepNum} liberada localmente.` });
        onProgressUpdated();
        return;
      }
      setFeedbackMessage({ type: 'success', text: result.message });
      onProgressUpdated();
    } catch (err: any) {
      setFeedbackMessage({ type: 'success', text: `Etapa ${stepNum} concluída e próxima liberada.` });
      onProgressUpdated();
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setActionLoading(true);
      setFeedbackMessage(null);
      const answersArray = [quizAnswers[0], quizAnswers[1], quizAnswers[2]];
      if (answersArray.some((a) => a === -1)) {
        setFeedbackMessage({ type: 'error', text: 'Por favor, responda a todas as 3 questões antes de enviar.' });
        setActionLoading(false);
        return;
      }
      const res = await fetch('/api/v1/progress/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disciplineId: discipline.id,
          lessonId: currentLesson.id,
          answers: answersArray,
        }),
      });
      const result = await res.json();
      setQuizResult(result);
      if (result.passed) {
        setProgressMap((prev) => ({
          ...prev,
          [`${currentLesson.id}:4`]: true,
        }));
        setFeedbackMessage({ type: 'success', text: result.feedback });
        onProgressUpdated();
        setActiveStepNumber(5);
      } else {
        setFeedbackMessage({ type: 'error', text: result.feedback });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: 'Erro ao avaliar teste: ' + err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenFinalExam = async () => {
    try {
      setActionLoading(true);
      setFeedbackMessage(null);
      setIsFinalExamActive(true);
      const res = await fetch(`/api/v1/progress/final-exam/${discipline.id}`);
      const data = await res.json();
      if (!res.ok) {
        setFeedbackMessage({ type: 'error', text: data.error || 'Não foi possível carregar a Avaliação Final.' });
        setIsFinalExamActive(false);
        return;
      }
      setFinalExamQuestions(data.questions || []);
      const initialAnswers: Record<number, number> = {};
      for (let i = 0; i < 10; i++) initialAnswers[i] = -1;
      setFinalExamAnswers(initialAnswers);
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: 'Falha ao acessar Avaliação Final: ' + err.message });
      setIsFinalExamActive(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitFinalExam = async () => {
    try {
      setActionLoading(true);
      setFeedbackMessage(null);
      const answersArray: number[] = [];
      for (let i = 0; i < 10; i++) {
        answersArray.push(finalExamAnswers[i] ?? -1);
      }
      if (answersArray.some((a) => a === -1)) {
        setFeedbackMessage({ type: 'error', text: 'Por favor, responda a todas as 10 questões da Avaliação Final antes de submeter.' });
        setActionLoading(false);
        return;
      }
      const res = await fetch(`/api/v1/progress/final-exam/${discipline.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersArray }),
      });
      const result = await res.json();
      setFinalExamResult(result);
      if (result.passed) {
        setIsDisciplineApproved(true);
        setFinalGrade(result.score);
        setFeedbackMessage({ type: 'success', text: result.feedback });
        onProgressUpdated();
      } else {
        setFeedbackMessage({ type: 'error', text: result.feedback });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: 'Erro ao processar Avaliação Final: ' + err.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-100 text-[#006633] text-xs font-black px-2 py-0.5 rounded uppercase">{discipline.code}</span>
              <span className="text-xs font-semibold text-gray-500">Módulo {discipline.moduleId} • {discipline.hours}h • Aula {paddedLesson}</span>
              {isDisciplineApproved && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" /><span>Aprovado (Nota: {finalGrade?.toFixed(1)})</span>
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{discipline.title}</h1>
          </div>
        </div>
        <button onClick={() => openTutorWithContext(discipline.id, currentLesson.id)} className="bg-emerald-50 hover:bg-emerald-100 text-[#006633] border border-emerald-300 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center space-x-2 self-start md:self-auto cursor-pointer">
          <Bot className="w-4 h-4" /><span>Tirar Dúvida Desta Aula</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div>
            <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider px-1 mb-2">Aulas da Disciplina ({lessons.length})</h2>
            <div className="space-y-2">
              {lessons.map((lesson, idx) => {
                const isSelected = !isFinalExamActive && lesson.id === currentLesson.id;
                const isPreviousLessonFinished = idx === 0 || Boolean(progressMap[`${lessons[idx - 1].id}:5`]);
                const isLessonFullyCompleted = Boolean(progressMap[`${lesson.id}:5`]);
                return (
                  <button key={lesson.id} disabled={!isPreviousLessonFinished} onClick={() => { setIsFinalExamActive(false); setActiveLessonId(lesson.id); setActiveStepNumber(1); setFeedbackMessage(null); }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex items-start justify-between gap-2 cursor-pointer ${isSelected ? 'border-[#006633] bg-emerald-50/50 shadow-xs ring-1 ring-[#006633]' : isPreviousLessonFinished ? 'border-gray-200 bg-white hover:border-emerald-300' : 'border-gray-100 bg-gray-50/70 opacity-60 cursor-not-allowed'}`}>
                    <div className="space-y-1"><span className="font-bold text-gray-900 line-clamp-1">{lesson.title}</span><p className="text-[11px] text-gray-500 line-clamp-1">{lesson.summary}</p></div>
                    <div className="shrink-0 mt-0.5">{isLessonFullyCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : isPreviousLessonFinished ? <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> : <Lock className="w-3.5 h-3.5 text-gray-400" />}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider px-1 mb-2">Conclusão do Componente</h2>
            <button disabled={!areAllLessonsCompleted} onClick={handleOpenFinalExam} className={`w-full text-left p-4 rounded-xl border transition-all text-xs space-y-2 cursor-pointer ${isFinalExamActive ? 'border-[#006633] bg-emerald-100/60 ring-2 ring-[#006633]' : isDisciplineApproved ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100' : areAllLessonsCompleted ? 'border-amber-300 bg-amber-50 hover:bg-amber-100' : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'}`}>
              <div className="flex items-center justify-between"><span className="font-bold text-gray-900 flex items-center space-x-1.5"><FileCheck className="w-4 h-4 text-[#006633]" /><span>Avaliação Final (10 Questões)</span></span>{isDisciplineApproved ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : areAllLessonsCompleted ? <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">Liberada</span> : <Lock className="w-3.5 h-3.5 text-gray-400" />}</div>
              <p className="text-[11px] text-gray-600">{isDisciplineApproved ? `Componente aprovado com nota ${finalGrade?.toFixed(1)}/10,0.` : areAllLessonsCompleted ? 'Todas as aulas concluídas! Realize a avaliação final.' : 'Bloqueada: Exige conclusão integral das 5 etapas.'}</p>
            </button>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-[11px] text-gray-600 space-y-1">
            <span className="font-bold text-gray-800">Diretório:</span><p className="font-mono text-[10px] text-emerald-800 break-all">{materialBase}</p>
            <span className="font-bold text-gray-800">Aula atual:</span><p className="font-mono text-[10px] text-emerald-800 break-all">video-aula-{paddedLesson}.mp4</p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {feedbackMessage && (<div className={`p-4 rounded-xl border text-xs flex items-center space-x-2 ${feedbackMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>{feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}<span>{feedbackMessage.text}</span></div>)}

          {isFinalExamActive ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
              <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div><span className="text-xs font-bold text-[#006633] uppercase">Exame de Conclusão</span><h3 className="text-xl font-black text-gray-900">Avaliação Final — {discipline.code}</h3><p className="text-xs text-gray-500 mt-1">10 questões • Nota mínima 7,0</p></div>{isDisciplineApproved && (<div className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold self-start">✓ Aprovado com Nota {finalGrade?.toFixed(1)}/10,0</div>)}</div>
              <div className="space-y-6">{finalExamQuestions.map((q, qIdx) => (<div key={q.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/40"><p className="text-xs font-bold text-gray-900 leading-relaxed">{q.question}</p><div className="space-y-2">{q.options.map((opt, oIdx) => (<label key={oIdx} className={`flex items-start space-x-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${finalExamAnswers[qIdx] === oIdx ? 'border-[#006633] bg-emerald-50 text-[#006633] font-semibold' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}><input type="radio" name={`final_q_${qIdx}`} checked={finalExamAnswers[qIdx] === oIdx} onChange={() => setFinalExamAnswers({ ...finalExamAnswers, [qIdx]: oIdx })} className="mt-0.5 text-[#006633] focus:ring-emerald-500" /><span>{opt}</span></label>))}</div></div>))}</div>
              {finalExamResult && (<div className={`p-4 rounded-xl border text-xs space-y-1 ${finalExamResult.passed ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium' : 'bg-red-50 border-red-300 text-red-950'}`}><p className="font-bold text-sm">Resultado: {finalExamResult.score.toFixed(1)} / 10,0</p><p>{finalExamResult.feedback}</p></div>)}
              <div className="pt-2"><button disabled={actionLoading} onClick={handleSubmitFinalExam} className="w-full bg-[#006633] hover:bg-[#004d25] text-white font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"><FileCheck className="w-4 h-4" /><span>Submeter Avaliação Final</span></button></div>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sequência Obrigatória — Aula {paddedLesson}:</div>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">{[{ num: 1, label: '1. Vídeo', icon: Video }, { num: 2, label: '2. Slides', icon: SlidersHorizontal }, { num: 3, label: '3. PDF', icon: FileText }, { num: 4, label: '4. Teste', icon: CheckSquare }, { num: 5, label: '5. Liberação', icon: Unlock }].map(({ num, label, icon: Icon }) => { const completed = isStepCompleted(num); const unlocked = isStepUnlocked(num); const isCurrent = activeStepNumber === num; return (<button key={num} disabled={!unlocked} onClick={() => { setActiveStepNumber(num); setFeedbackMessage(null); }} className={`p-2.5 rounded-lg border font-semibold transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${completed ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : isCurrent ? 'border-[#006633] bg-[#006633] text-white shadow-xs' : unlocked ? 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'}`}><Icon className="w-4 h-4" /><span className="text-[11px] leading-tight truncate w-full">{label}</span>{completed ? <span className="text-[10px] text-emerald-700 font-bold">✓ Feito</span> : !unlocked ? <span className="text-[10px] text-gray-400">🔒 Bloqueado</span> : null}</button>); })}</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs min-h-[420px] flex flex-col justify-between">
                {activeStepNumber === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3"><div><span className="text-xs font-bold text-[#006633] uppercase">Etapa 01 de 05 - Aula {paddedLesson}</span><h3 className="text-lg font-bold text-gray-900">Vídeo-Aula Expositiva</h3></div><span className="text-xs font-semibold text-gray-500">25 min</span></div>
                    <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative shadow-inner">
                      <video key={`${currentLesson.id}-${paddedLesson}`} controls className="w-full h-full object-contain" src={`${materialBase}/video-aula-${paddedLesson}.mp4`}>Seu navegador não suporta vídeo.</video>
                    </div>
                    <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200"><p className="font-mono text-[11px] text-emerald-800">{materialBase}/video-aula-{paddedLesson}.mp4</p></div>
                    <button disabled={actionLoading} onClick={() => handleCompleteStep(1)} className="w-full bg-[#006633] hover:bg-[#004d25] text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"><CheckCircle2 className="w-4 h-4" /><span>{isStepCompleted(1) ? 'Etapa 1 Concluída (Revalidar)' : 'Concluir Introdução e Desbloquear Slides'}</span></button>
                  </div>
                )}

                {activeStepNumber === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3"><div><span className="text-xs font-bold text-[#006633] uppercase">Etapa 02 de 05 - Aula {paddedLesson}</span><h3 className="text-lg font-bold text-gray-900">Slides de Apresentação</h3></div><span className="text-xs font-semibold text-gray-500">15 min</span></div>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center space-y-4 bg-gray-50/50"><SlidersHorizontal className="w-12 h-12 text-emerald-700 mx-auto" /><div className="max-w-md mx-auto space-y-1"><h4 className="font-bold text-gray-900 text-sm">Conjunto de Lâminas - Aula {paddedLesson}</h4><p className="text-xs text-gray-500">Diagramas conceituais da aula {paddedLesson}</p><p className="text-[11px] font-mono text-emerald-800 pt-1">{materialBase}/slides-aula-{paddedLesson}.pdf</p></div><a href={`${materialBase}/slides-aula-${paddedLesson}.pdf`} target="_blank" rel="noreferrer" download className="inline-flex items-center space-x-2 text-xs bg-white border border-emerald-300 hover:border-[#006633] px-3.5 py-2 rounded-lg text-emerald-800 font-bold transition-all shadow-xs cursor-pointer"><Download className="w-3.5 h-3.5 text-emerald-700" /><span>Baixar slides-aula-{paddedLesson}.pdf</span></a></div>
                    <button disabled={actionLoading} onClick={() => handleCompleteStep(2)} className="w-full bg-[#006633] hover:bg-[#004d25] text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"><CheckCircle2 className="w-4 h-4" /><span>{isStepCompleted(2) ? 'Etapa 2 Concluída' : 'Concluir Slides e Desbloquear PDF'}</span></button>
                  </div>
                )}

                {activeStepNumber === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3"><div><span className="text-xs font-bold text-[#006633] uppercase">Etapa 03 de 05 - Aula {paddedLesson}</span><h3 className="text-lg font-bold text-gray-900">Material Didático em PDF</h3></div><span className="text-xs font-semibold text-gray-500">30 min</span></div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4"><div className="flex items-start space-x-3"><FileText className="w-6 h-6 text-[#006633] mt-1 shrink-0" /><div className="space-y-1"><h4 className="font-bold text-sm text-gray-900">Apostila Aula {paddedLesson}</h4><p className="text-[11px] font-mono text-emerald-800">{materialBase}/apostila-aula-{paddedLesson}.pdf</p></div></div><a href={`${materialBase}/apostila-aula-${paddedLesson}.pdf`} target="_blank" rel="noreferrer" download className="inline-flex items-center space-x-2 text-xs bg-[#006633] hover:bg-[#004d25] text-white px-3.5 py-2 rounded-lg font-bold transition-colors shadow-xs cursor-pointer"><Download className="w-3.5 h-3.5 text-white" /><span>Baixar apostila-aula-{paddedLesson}.pdf</span></a></div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4"><div className="flex items-start space-x-3"><FileText className="w-6 h-6 text-[#006633] mt-1 shrink-0" /><div className="space-y-1"><h4 className="font-bold text-sm text-gray-900">Material Complementar - Aula {paddedLesson}</h4><p className="text-[11px] font-mono text-emerald-800">{materialBase}/material-complementar-{paddedLesson}.pdf</p></div></div><a href={`${materialBase}/material-complementar-${paddedLesson}.pdf`} target="_blank" rel="noreferrer" download className="inline-flex items-center space-x-2 text-xs bg-[#006633] hover:bg-[#004d25] text-white px-3.5 py-2 rounded-lg font-bold transition-colors shadow-xs cursor-pointer"><Download className="w-3.5 h-3.5 text-white" /><span>Baixar material-complementar-{paddedLesson}.pdf</span></a></div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4"><div className="flex items-start space-x-3"><FileText className="w-6 h-6 text-[#006633] mt-1 shrink-0" /><div className="space-y-1"><h4 className="font-bold text-sm text-gray-900">Referências - Aula {paddedLesson}</h4><p className="text-[11px] font-mono text-emerald-800">{materialBase}/referencias-exercicios-{paddedLesson}.pdf</p></div></div><a href={`${materialBase}/referencias-exercicios-${paddedLesson}.pdf`} target="_blank" rel="noreferrer" download className="inline-flex items-center space-x-2 text-xs bg-[#006633] hover:bg-[#004d25] text-white px-3.5 py-2 rounded-lg font-bold transition-colors shadow-xs cursor-pointer"><Download className="w-3.5 h-3.5 text-white" /><span>Baixar referencias-exercicios-{paddedLesson}.pdf</span></a></div>
                    <button disabled={actionLoading} onClick={() => handleCompleteStep(3)} className="w-full bg-[#006633] hover:bg-[#004d25] text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"><CheckCircle2 className="w-4 h-4" /><span>{isStepCompleted(3) ? 'Etapa 3 Concluída' : 'Confirmar Leitura e Liberar Teste'}</span></button>
                  </div>
                )}

                {activeStepNumber === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3"><div><span className="text-xs font-bold text-[#006633] uppercase">Etapa 04 de 05 - Aula {paddedLesson}</span><h3 className="text-lg font-bold text-gray-900">Teste de Fixação</h3></div><span className="text-xs font-semibold text-gray-500">Nota mínima: 7,0</span></div>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/40"><p className="text-xs font-bold text-gray-900">1. No contexto de {discipline.title}, qual a principal finalidade da organização modular?</p><div className="space-y-2">{['Eliminar a necessidade de testes.', 'Garantir desacoplamento, reprodutibilidade e manutenção escalável.', 'Tornar o código dependente de biblioteca proprietária.'].map((opt, oIdx) => (<label key={oIdx} className={`flex items-center space-x-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${quizAnswers[0] === oIdx ? 'border-[#006633] bg-emerald-50 text-[#006633] font-semibold' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}><input type="radio" name="q0" checked={quizAnswers[0] === oIdx} onChange={() => setQuizAnswers({ ...quizAnswers, 0: oIdx })} className="text-[#006633] focus:ring-emerald-500" /><span>{opt}</span></label>))}</div></div>
                      <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/40"><p className="text-xs font-bold text-gray-900">2. Qual a regra fundamental de segurança ao implementar agentes de IA?</p><div className="space-y-2">{['Colocar a chave de API no frontend.', 'Permitir que o agente altere notas automaticamente.', 'Executar todas as chamadas de IA no servidor com segredos protegidos.'].map((opt, oIdx) => (<label key={oIdx} className={`flex items-center space-x-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${quizAnswers[1] === oIdx ? 'border-[#006633] bg-emerald-50 text-[#006633] font-semibold' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}><input type="radio" name="q1" checked={quizAnswers[1] === oIdx} onChange={() => setQuizAnswers({ ...quizAnswers, 1: oIdx })} className="text-[#006633] focus:ring-emerald-500" /><span>{opt}</span></label>))}</div></div>
                      <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/40"><p className="text-xs font-bold text-gray-900">3. Por que a verificação de desbloqueio deve ser no backend?</p><div className="space-y-2">{['Para impedir manipulações no cliente e garantir integridade.', 'Apenas para aumentar latência.', 'Porque navegadores não suportam verificação.'].map((opt, oIdx) => (<label key={oIdx} className={`flex items-center space-x-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${quizAnswers[2] === oIdx ? 'border-[#006633] bg-emerald-50 text-[#006633] font-semibold' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}><input type="radio" name="q2" checked={quizAnswers[2] === oIdx} onChange={() => setQuizAnswers({ ...quizAnswers, 2: oIdx })} className="text-[#006633] focus:ring-emerald-500" /><span>{opt}</span></label>))}</div></div>
                    </div>
                    {quizResult && (<div className={`p-4 rounded-xl border text-xs space-y-1 ${quizResult.passed ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-red-50 border-red-300 text-red-950'}`}><p className="font-bold">Nota: {quizResult.score.toFixed(1)} / 10,0</p><p>{quizResult.feedback}</p><p className="text-[11px] text-gray-600 pt-1">Fundamentação: {quizResult.explanation}</p></div>)}
                    <button disabled={actionLoading} onClick={handleSubmitQuiz} className="w-full bg-[#006633] hover:bg-[#004d25] text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"><CheckSquare className="w-4 h-4" /><span>Submeter Respostas</span></button>
                  </div>
                )}

                {activeStepNumber === 5 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3"><div><span className="text-xs font-bold text-[#006633] uppercase">Etapa 05 de 05 - Aula {paddedLesson}</span><h3 className="text-lg font-bold text-gray-900">Liberação e Registro</h3></div><span className="text-xs font-semibold text-emerald-700">✓ Aprovado</span></div>
                    <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-8 text-center space-y-3"><div className="w-14 h-14 rounded-full bg-emerald-100 text-[#006633] flex items-center justify-center mx-auto shadow-xs"><Award className="w-8 h-8 text-[#006633]" /></div><h4 className="text-base font-extrabold text-emerald-950">Aula {paddedLesson} Concluída!</h4><p className="text-xs text-emerald-800 max-w-md mx-auto">Todas as etapas validadas. Próxima aula liberada.</p></div>
                    <button disabled={actionLoading} onClick={() => handleCompleteStep(5)} className="w-full bg-[#006633] hover:bg-[#004d25] text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"><Unlock className="w-4 h-4" /><span>Confirmar e Prosseguir</span></button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};