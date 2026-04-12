'use client';

import { KnowledgeQuestion } from '@/types/training';
import { useKnowledgeCheck } from '@/hooks/useKnowledgeCheck';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, RotateCcw, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KnowledgeCheckProps {
  questions: KnowledgeQuestion[];
  userId: string | null;
  onPass: () => void;
}

export function KnowledgeCheck({ questions, userId, onPass }: KnowledgeCheckProps) {
  const {
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
  } = useKnowledgeCheck(questions, userId);

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500 font-body">
          This module uses practice completion as your assessment.
        </p>
      </div>
    );
  }

  // Quiz complete - show results
  if (isComplete) {
    return (
      <div className="space-y-4">
        <Card className={cn(
          'text-center',
          isPassed ? 'border-christina-green/30 bg-green-50/50' : 'border-christina-coral/30 bg-orange-50/30'
        )}>
          <CardContent className="p-6">
            <Award className={cn(
              'h-12 w-12 mx-auto mb-3',
              isPassed ? 'text-christina-green' : 'text-christina-coral'
            )} />
            <h3 className="text-lg font-heading font-bold mb-1">
              {isPassed ? 'Passed!' : 'Not quite yet'}
            </h3>
            <p className="text-2xl font-heading font-bold mb-1">
              {correctCount} of {totalQuestions} correct ({scorePercent}%)
            </p>
            <p className="text-sm text-gray-500 font-body mb-4">
              {isPassed
                ? 'You met the 80% threshold. This section is complete.'
                : 'You need 80% to pass. Review the material and try again.'}
            </p>
            {isPassed ? (
              <Button
                onClick={onPass}
                className="bg-christina-green hover:bg-christina-green/90"
              >
                <Check className="h-4 w-4 mr-2" />
                Complete Module
              </Button>
            ) : (
              <Button
                onClick={retake}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500 font-body">
        <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
        <span>{correctCount} correct so far</span>
      </div>

      {/* Question */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-heading font-semibold mb-4">
            {currentQuestion.questionText}
          </p>

          <div className="space-y-2">
            {currentQuestion.choices.map((choice) => {
              const isSelected = selectedAnswer === choice.label;
              const showCorrect = isAnswered && choice.label === currentQuestion.correctAnswer;
              const showIncorrect = isAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={choice.label}
                  onClick={() => selectAnswer(choice.label)}
                  disabled={isAnswered}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all flex items-start gap-2',
                    !isAnswered && isSelected && 'border-christina-blue bg-blue-50',
                    !isAnswered && !isSelected && 'border-gray-200 hover:border-gray-300',
                    showCorrect && 'border-christina-green bg-green-50',
                    showIncorrect && 'border-christina-coral bg-red-50',
                    isAnswered && !showCorrect && !showIncorrect && 'border-gray-200 opacity-50'
                  )}
                >
                  <span className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold',
                    !isAnswered && isSelected && 'border-christina-blue text-christina-blue bg-white',
                    !isAnswered && !isSelected && 'border-gray-300 text-gray-400',
                    showCorrect && 'border-christina-green text-white bg-christina-green',
                    showIncorrect && 'border-christina-coral text-white bg-christina-coral'
                  )}>
                    {showCorrect ? <Check className="h-3 w-3" /> : showIncorrect ? <X className="h-3 w-3" /> : choice.label}
                  </span>
                  <span className="text-sm font-body">{choice.text}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {isAnswered && (
            <div className={cn(
              'mt-4 p-3 rounded-lg text-sm font-body',
              isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            )}>
              <p className="font-semibold mb-1">
                {isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${currentQuestion.correctAnswer}.`}
              </p>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        {!isAnswered && selectedAnswer && (
          <Button onClick={submitAnswer} className="bg-christina-red hover:bg-christina-red/90">
            Submit Answer
          </Button>
        )}
        {isAnswered && (
          <Button onClick={nextQuestion} className="bg-christina-blue hover:bg-christina-blue/90">
            {currentQuestionIndex >= totalQuestions - 1 ? 'See Results' : 'Next Question'}
          </Button>
        )}
      </div>
    </div>
  );
}
