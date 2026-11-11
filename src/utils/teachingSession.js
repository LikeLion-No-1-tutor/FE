const SESSION_KEY = "teachingSession";

export function getFileTitle(fileName) {
  if (!fileName) return "";

  return fileName.replace(/\.[^.]+$/, "");
}

export function createTeachingSession({
  title,
  fileName,
  studentId,
  terms = [],
}) {
  return {
    id: crypto.randomUUID(),
    title,
    fileName,
    studentId,
    createdAt: new Date().toISOString(),
    terms: terms.map((term, index) => ({
      id: term.id || `term-${index + 1}`,
      name: term.name,
      concept: term.concept || "",
      questions: [],
    })),
  };
}

export function saveTeachingSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getTeachingSession() {
  const saved = sessionStorage.getItem(SESSION_KEY);

  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function addTeachingQuestion(termId, question) {
  const session = getTeachingSession();
  if (!session) return null;

  const questionId = crypto.randomUUID();

  session.terms = session.terms.map((term) => {
    if (term.id !== termId) return term;

    return {
      ...term,
      questions: [
        ...term.questions,
        {
          id: questionId,
          question,
          answer: null,
          status: "unanswered",
        },
      ],
    };
  });

  saveTeachingSession(session);

  return questionId;
}

export function answerTeachingQuestion(questionId, answer) {
  const session = getTeachingSession();
  if (!session) return;

  session.terms = session.terms.map((term) => ({
    ...term,
    questions: term.questions.map((item) =>
      item.id === questionId
        ? {
            ...item,
            answer,
            status: "answered",
          }
        : item,
    ),
  }));

  saveTeachingSession(session);
}
