'use client';

import { useState, useCallback } from 'react';
import { KnowledgeQuestion } from '@/types/training';
import { saveKnowledgeCheckAnswer } from '@/lib/training/training-storage';

interface UseKnowledgeCheckReturn {
  currentQuestionIndex: number;
  currentQuestion: KnowledgeQuestion | null;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  isPassed: boolean;
  isComplete: boolean;
  selectAnswer: (label: string) => void;
  submitAnswer: () => Promise<void>;
  nextQuestion: () => void;
  retake: () => void;
}

const PASS_THRESHOLD = 80;

export function useKnowledgeCheck(
  questions: KnowledgeQuestion[],
  userId: string | null
): UseKnowledgeCheckReturn {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPassed = scorePercent >= PASS_THRESHOLD;

  const selectAnswer = useCallback((label: string) => {
    if (isAnswered) return;
    setSelectedAnswer(label);
  }, [isAnswered]);

  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || !selectedAnswer || isAnswered) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);
    if (correct) setCorrectCount(prev => prev + 1);

    // Save to storage
    if (userId) {
      await saveKnowledgeCheckAnswer(
        userId,
        currentQuestion.moduleId,
        currentQuestion.id,
        selectedAnswer,
        correct
      );
    }
  }, [currentQuestion, selectedAnswer, isAnswered, userId]);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex >= totalQuestions - 1) {
      setIsComplete(true);
      return;
    }
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null);
  }, [currentQuestionIndex, totalQuestions]);

  const retake = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setCorrectCount(0);
    setIsComplete(false);
  }, []);

  return {
    currentQuestionIndex,
    currentQuestion,
    selectedAnswer,
    isAnswered,
    isCorrect,
    correctCount,
    totalQuestions,
    scorePercent,
    isPassed,
    isComplete,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    retake,
  };
}
