import { Module, Discipline, Lesson } from '../types/index.ts';

export const MODULES: Module[] = [
  {
    id: 1,
    title: 'Módulo I — Fundamentos de Computação e Matemática para IA',
    subtitle: 'Nivelamento técnico, pensamento computacional e introdução à inteligência artificial',
    total_hours: 60,
    description: 'Bases sólidas de sistemas, programação em Python, dados e ferramentas matemáticas essenciais.',
    order: 1,
  },
  {
    id: 2,
    title: 'Módulo II — Aprendizado de Máquina, Deep Learning e PLN',
    subtitle: 'Modelagem preditiva, redes neurais e processamento de linguagem natural',
    total_hours: 60,
    description: 'Aprofundamento prático em algoritmos de Machine Learning, Deep Learning, Visão e PLN.',
    order: 2,
  },
  {
    id: 3,
    title: 'Módulo III — MLOps, LLMs, Governança e Aplicações Avançadas',
    subtitle: 'Engenharia de modelos, implantação em produção, segurança e projetos práticos',
    total_hours: 80,
    description: 'Ciclo de vida de IA em produção, grandes modelos de linguagem, ética, LGPD e projeto final.',
    order: 3,
  },
];

export const DISCIPLINES: Discipline[] = [
  { id: 'disc-01', order: 1, code: 'INF-101', moduleId: 1, title: 'Fundamentos de Informática, Sistemas Operacionais e Ferramentas de Programação', hours: 10, summary: 'Arquitetura básica de computadores, ecossistema Linux/CLI, Git/GitHub, ambientes virtuais e ferramentas do desenvolvedor moderno.', competencies: ['Operar sistemas operacionais Linux via linha de comando','Configurar ambientes de desenvolvimento e controle de versão Git','Compreender fundamentos de arquitetura de hardware para aceleração computacional'], localMaterialPath: '/cursos/modulo-1/01-fundamentos', totalLessons: 4 },
  { id: 'disc-02', order: 2, code: 'LOG-102', moduleId: 1, title: 'Lógica de Programação e Algoritmos', hours: 10, summary: 'Construção de pensamento algorítmico, estruturas condicionais e de repetição, vetores, matrizes, funções e modularização.', competencies: ['Construir algoritmos estruturados para resolução de problemas reais','Dominar estruturas de controle e manipulação de conjuntos de dados','Calcular complexidade assintótica básica de algoritmos'], localMaterialPath: '/cursos/modulo-1/02-logica', totalLessons: 4 },
  { id: 'disc-03', order: 3, code: 'PYT-103', moduleId: 1, title: 'Programação em Python', hours: 10, summary: 'Sintaxe fundamental de Python, tipos de dados avançados, manipulação de arquivos, orientação a objetos e boas práticas de código.', competencies: ['Desenvolver scripts e programas modulares em Python 3','Trabalhar com Programação Orientada a Objetos e tratamento de exceções','Manipular estruturas de dados eficientes'], localMaterialPath: '/cursos/modulo-1/03-python', totalLessons: 5 },
  { id: 'disc-04', order: 4, code: 'BD-104', moduleId: 1, title: 'Banco de Dados e Big Data', hours: 10, summary: 'Modelagem relacional, consultas SQL avançadas em PostgreSQL, introdução a bancos NoSQL e conceitos fundamentais de Big Data.', competencies: ['Projetar esquemas relacionais normalizados','Elaborar consultas analíticas complexas','Compreender o ecossistema e pipelines de Big Data'], localMaterialPath: '/cursos/modulo-1/04-banco-dados', totalLessons: 3 },
  { id: 'disc-05', order: 5, code: 'MAT-105', moduleId: 1, title: 'Matemática e Estatística Aplicada à IA', hours: 10, summary: 'Álgebra linear, cálculo diferencial básico para gradiente descendente, probabilidade e inferência estatística.', competencies: ['Operar matrizes e transformações lineares','Aplicar derivadas e gradientes','Realizar análise exploratória de dados'], localMaterialPath: '/cursos/modulo-1/05-matematica-estatistica', totalLessons: 4 },
  { id: 'disc-06', order: 6, code: 'FIA-106', moduleId: 1, title: 'Fundamentos de IA e Aprendizado de Máquina', hours: 10, summary: 'História e taxonomia da inteligência artificial, agentes inteligentes, paradigmas de aprendizado.', competencies: ['Classificar os diferentes paradigmas de IA','Distinguir tarefas de regressão e classificação','Avaliar métricas de desempenho'], localMaterialPath: '/cursos/modulo-1/06-fundamentos-ia', totalLessons: 4 },
  { id: 'disc-07', order: 7, code: 'CD-201', moduleId: 2, title: 'Python para Ciência de Dados', hours: 10, summary: 'Manipulação e análise de dados tabulares com NumPy e Pandas; visualização técnica com Matplotlib e Seaborn.', competencies: ['Limpar e transformar dados','Criar visualizações gráficas','Construir pipelines de features'], localMaterialPath: '/cursos/modulo-2/07-python-ciencia-dados', totalLessons: 4 },
  { id: 'disc-08', order: 8, code: 'MLA-202', moduleId: 2, title: 'Machine Learning Aplicado', hours: 10, summary: 'Algoritmos clássicos com Scikit-Learn: regressão, árvores, florestas, SVM, KNN, K-Means e PCA.', competencies: ['Treinar e validar modelos','Aplicar validação cruzada','Interpretar curvas ROC/AUC'], localMaterialPath: '/cursos/modulo-2/08-ml-aplicado', totalLessons: 4 },
  { id: 'disc-09', order: 9, code: 'DL-203', moduleId: 2, title: 'Redes Neurais Artificiais e Deep Learning', hours: 10, summary: 'Perceptrons, backpropagation, redes densas, CNN e RNN com PyTorch/TensorFlow.', competencies: ['Construir redes neurais profundas','Configurar otimizadores','Aplicar Transfer Learning'], localMaterialPath: '/cursos/modulo-2/09-deep-learning', totalLessons: 5 },
  { id: 'disc-10', order: 10, code: 'PLN-204', moduleId: 2, title: 'Processamento de Linguagem Natural (PLN) Chatbots', hours: 10, summary: 'Tokenização, lematização, embeddings, análise de sentimentos e construção de agentes conversacionais.', competencies: ['Processar textos para PLN','Treinar classificadores de intenções','Implementar interfaces conversacionais'], localMaterialPath: '/cursos/modulo-2/10-pln-chatbots', totalLessons: 3 },
  { id: 'disc-11', order: 11, code: 'MET-205', moduleId: 2, title: 'Metodologia para Elaboração de Produções Técnicas', hours: 10, summary: 'Normas ABNT, elaboração de relatórios técnicos de IA, documentação de experimentos.', competencies: ['Redigir relatórios técnicos','Garantir reprodutibilidade','Comunicar resultados complexos'], localMaterialPath: '/cursos/modulo-2/11-metodologia', totalLessons: 3 },
  { id: 'disc-12', order: 12, code: 'PPS-206', moduleId: 2, title: 'Prática Profissional Supervisionada I', hours: 10, summary: 'Desenvolvimento de projeto prático integrador aplicando ciência de dados e ML.', competencies: ['Conceber projeto ponta a ponta','Integrar técnicas de coleta e modelagem','Apresentar produto técnico'], localMaterialPath: '/cursos/modulo-2/12-pratica-supervisionada-1', totalLessons: 3 },
  { id: 'disc-13', order: 13, code: 'SEG-301', moduleId: 3, title: 'Noções de Segurança, Governança de Dados LGPD Aplicada a Dados', hours: 10, summary: 'LGPD, anonimização, viés algorítmico, ética em IA, cibersegurança.', competencies: ['Identificar requisitos da LGPD','Detectar e mitigar vieses','Aplicar práticas de segurança'], localMaterialPath: '/cursos/modulo-3/13-seguranca-lgpd', totalLessons: 3 },
  { id: 'disc-14', order: 14, code: 'ES-302', moduleId: 3, title: 'Engenharia de Software para IA', hours: 10, summary: 'Padrões de projeto para IA, TDD, APIs RESTful, microsserviços e Docker.', competencies: ['Empacotar modelos em Docker','Construir APIs performáticas','Escrever testes automatizados'], localMaterialPath: '/cursos/modulo-3/14-engenharia-software-ia', totalLessons: 3 },
  { id: 'disc-15', order: 15, code: 'MLO-303', moduleId: 3, title: 'MLOPS e Deploy', hours: 10, summary: 'CI/CD para modelos, MLflow, monitoramento de drift e deploy no Render.', competencies: ['Implementar pipelines CI/CD','Monitorar degradação de acurácia','Executar deploy em nuvem'], localMaterialPath: '/cursos/modulo-3/15-mlops-deploy', totalLessons: 3 },
  { id: 'disc-16', order: 16, code: 'ASS-304', moduleId: 3, title: 'Planejamento de Assistentes em Inteligência Artificial', hours: 10, summary: 'Arquitetura de agentes autônomos, Function Calling, orquestração de diálogos.', competencies: ['Projetar fluxos de conversação','Conectar assistentes a APIs','Garantir guardrails'], localMaterialPath: '/cursos/modulo-3/16-assistentes-ia', totalLessons: 3 },
  { id: 'disc-17', order: 17, code: 'LLM-305', moduleId: 3, title: 'LLMs e Inteligência Artificial', hours: 10, summary: 'Transformers, Prompt Engineering, RAG, fine-tuning e modelos Gemini.', competencies: ['Arquitetar sistemas RAG','Aplicar prompt engineering','Utilizar SDK @google/genai'], localMaterialPath: '/cursos/modulo-3/17-llms-ia', totalLessons: 3 },
  { id: 'disc-18', order: 18, code: 'VIS-306', moduleId: 3, title: 'Visão Computacional Aplicada', hours: 10, summary: 'OpenCV, detecção YOLO, segmentação, reconhecimento facial.', competencies: ['Pré-processar imagens','Treinar modelos de detecção','Integrar visão com automação'], localMaterialPath: '/cursos/modulo-3/18-visao-computacional', totalLessons: 3 },
  { id: 'disc-19', order: 19, code: 'GP-307', moduleId: 3, title: 'Gestão de Projetos em Inteligência Artificial', hours: 10, summary: 'Metodologias ágeis aplicadas ao ciclo de vida de dados (CRISP-DM).', competencies: ['Gerenciar sprints de IA','Alinhar métricas técnicas a negócio','Mapear riscos técnicos'], localMaterialPath: '/cursos/modulo-3/19-gestao-projetos-ia', totalLessons: 3 },
  { id: 'disc-20', order: 20, code: 'PPS-308', moduleId: 3, title: 'Prática Profissional Supervisionada II', hours: 10, summary: 'TCC aplicado: desenvolvimento, implantação em produção e defesa.', competencies: ['Desenvolver solução full-stack','Defender projeto perante banca','Elaborar documentação final'], localMaterialPath: '/cursos/modulo-3/20-pratica-supervisionada-2', totalLessons: 4 },
];

export function getDisciplineLessons(disciplineId: string): Lesson[] {
  const discipline = DISCIPLINES.find((d) => d.id === disciplineId);
  if (!discipline) return [];
  const count = discipline.totalLessons;
  const lessons: Lesson[] = [];

  for (let i = 1; i <= count; i++) {
    lessons.push({
      id: `${disciplineId}-aula-${i}`,
      disciplineId,
      order: i,
      title: `Aula 0${i}: ${getLessonTitle(discipline.code, i)}`,
      summary: `Estudo guiado dos conceitos fundamentais, laboratório prático e avaliação de fixação da Aula 0${i}.`,
      steps: [
        {
          stepNumber: 1,
          type: 'video',
          title: 'Vídeo-Aula Explicativa',
          description: 'Aula gravada - conteúdo completo da apostila técnica.',
          requiredTimeMinutes: 25,
          assetUrl: `${discipline.localMaterialPath}/video-aula-0${i}.mp4`,
          isAvailable: true,
        },
        {
          stepNumber: 2,
          type: 'slides',
          title: 'Slides de Apresentação',
          description: 'Lâminas didáticas sintetizadas em PDF.',
          requiredTimeMinutes: 15,
          assetUrl: `${discipline.localMaterialPath}/slides-aula-0${i}.pdf`,
          isAvailable: true,
        },
        {
          stepNumber: 3,
          type: 'pdf',
          title: 'Material Didático em PDF',
          description: 'Apostila técnica completa.',
          requiredTimeMinutes: 30,
          assetUrl: `${discipline.localMaterialPath}/apostila-aula-0${i}.pdf`,
          isAvailable: true,
        },
        {
          stepNumber: 4,
          type: 'pdf',
          title: 'Material Complementar',
          description: 'Material complementar e referências.',
          requiredTimeMinutes: 15,
          assetUrl: `${discipline.localMaterialPath}/material-complementar-0${i}.pdf`,
          isAvailable: true,
        },
        {
          stepNumber: 5,
          type: 'quiz',
          title: 'Teste de Fixação',
          description: 'Avaliação conceitual com nota mínima 7.0',
          requiredTimeMinutes: 10,
          isAvailable: true,
        },
        {
          stepNumber: 6,
          type: 'next_unlock',
          title: 'Liberação da Próxima Aula',
          description: 'Conclusão registrada e desbloqueio do próximo conteúdo.',
          isAvailable: true,
        },
      ],
    });
  }
  return lessons;
}

function getLessonTitle(code: string, lessonNumber: number): string {
  const titles: Record<string, string[]> = {
    'INF-101': ['Introdução à Arquitetura de Computadores e SO','Dominando o Terminal Linux','Git e GitHub','Ambientes Virtuais e Pacotes'],
    'LOG-102': ['Raciocínio Algorítmico e Pseudocódigo','Estruturas Condicionais','Laços de Repetição','Vetores, Matrizes e Funções'],
    'PYT-103': ['Sintaxe Python Moderna','Estruturas de Dados Nativas','Funções e Lambdas','POO: Classes e Objetos','Arquivos, JSON e Exceções'],
  };
  const defaultTitles = ['Conceitos Teóricos e Fundamentos','Laboratório Prático','Estudo de Casos Reais','Tópicos Avançados e Integração','Síntese Curricular e Avaliação'];
  if (titles[code]?.[lessonNumber - 1]) return titles[code][lessonNumber - 1];
  return defaultTitles[lessonNumber - 1] || `Tópico Temático da Aula 0${lessonNumber}`;
}

export function calculateTotalHours(): number {
  return DISCIPLINES.reduce((acc, curr) => acc + curr.hours, 0);
}