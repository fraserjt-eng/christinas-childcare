'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import {
  ACCOUNTABILITY_DOMAINS,
  ASSESSMENT_QUESTIONS,
  ASSESSMENT_SCALE,
  PROFILE_TIERS,
  type AccountabilityDomain,
  type AccountabilityAssessment,
} from '@/types/tasks';

// ─── Storage ────────────────────────────────────────────────────────

const STORAGE_KEY = 'christinas_assessments';

function loadAssessments(): AccountabilityAssessment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAssessments(assessments: AccountabilityAssessment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));
}

// ─── Helpers ────────────────────────────────────────────────────────

function getProfileTier(percentage: number) {
  return PROFILE_TIERS.find((t) => percentage >= t.min) || PROFILE_TIERS[PROFILE_TIERS.length - 1];
}

function getDomainQuestions(domain: AccountabilityDomain) {
  return ASSESSMENT_QUESTIONS.filter((q) => q.domain === domain);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Bar Chart Component ────────────────────────────────────────────

function DomainBarChart({
  domainScores,
}: {
  domainScores: Record<string, number>;
}) {
  const maxScore = 15;

  return (
    <div className="space-y-4">
      {ACCOUNTABILITY_DOMAINS.map((domain) => {
        const score = domainScores[domain] || 0;
        const pct = Math.round((score / maxScore) * 100);
        let barColor = 'bg-red-500';
        if (pct >= 80) barColor = 'bg-green-500';
        else if (pct >= 60) barColor = 'bg-yellow-500';
        else if (pct >= 40) barColor = 'bg-orange-500';

        // Abbreviate domain names for small screens
        const shortLabel = domain
          .replace('Standard Architecture', 'Standards')
          .replace('Drift Recognition', 'Drift')
          .replace('Recovery Architecture', 'Recovery')
          .replace('Inspection Practice', 'Inspection')
          .replace('Equity Application', 'Equity');

        return (
          <div key={domain}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium truncate mr-2" title={domain}>
                {shortLabel}
              </span>
              <span className="text-sm text-muted-foreground flex-shrink-0">
                {score}/{maxScore} ({pct}%)
              </span>
            </div>
            <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────

export default function AccountabilityAssessmentPage() {
  const [assessments, setAssessments] = useState<AccountabilityAssessment[]>([]);
  const [mounted, setMounted] = useState(false);

  // Assessment mode state
  const [isAssessing, setIsAssessing] = useState(false);
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [latestResult, setLatestResult] = useState<AccountabilityAssessment | null>(null);

  useEffect(() => {
    setAssessments(loadAssessments());
    setMounted(true);
  }, []);

  const currentDomain = ACCOUNTABILITY_DOMAINS[currentDomainIndex];
  const currentQuestions = useMemo(
    () => getDomainQuestions(currentDomain),
    [currentDomain]
  );

  const totalAnswered = Object.keys(responses).length;
  const totalQuestions = ASSESSMENT_QUESTIONS.length;

  const allCurrentDomainAnswered = currentQuestions.every(
    (q) => responses[q.id] !== undefined
  );

  // ─── Actions ────────────────────────────────────────────────────

  function startAssessment() {
    setIsAssessing(true);
    setCurrentDomainIndex(0);
    setResponses({});
    setShowResults(false);
    setLatestResult(null);
  }

  function handleResponse(questionId: string, value: number) {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }

  function nextDomain() {
    if (currentDomainIndex < ACCOUNTABILITY_DOMAINS.length - 1) {
      setCurrentDomainIndex((i) => i + 1);
    } else {
      completeAssessment();
    }
  }

  function prevDomain() {
    if (currentDomainIndex > 0) {
      setCurrentDomainIndex((i) => i - 1);
    }
  }

  function completeAssessment() {
    // Calculate domain scores
    const domainScores: Record<string, number> = {};
    for (const domain of ACCOUNTABILITY_DOMAINS) {
      const questions = getDomainQuestions(domain);
      const total = questions.reduce((sum, q) => sum + (responses[q.id] || 0), 0);
      domainScores[domain] = total;
    }

    // Overall
    const maxPossible = totalQuestions * 3;
    const totalScore = Object.values(domainScores).reduce((a, b) => a + b, 0);
    const overallPct = Math.round((totalScore / maxPossible) * 100);
    const tier = getProfileTier(overallPct);

    const assessment: AccountabilityAssessment = {
      id: `assess_${Date.now()}`,
      date: new Date().toISOString(),
      responses: { ...responses },
      domain_scores: domainScores,
      overall_score: overallPct,
      profile_tier: tier.label,
      created_at: new Date().toISOString(),
    };

    const updated = [...assessments, assessment];
    setAssessments(updated);
    saveAssessments(updated);
    setLatestResult(assessment);
    setShowResults(true);
    setIsAssessing(false);
  }

  function retakeAssessment() {
    startAssessment();
  }

  function backToHub() {
    setShowResults(false);
    setIsAssessing(false);
    setLatestResult(null);
  }

  if (!mounted) {
    return (
      <>
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4" />
          <div className="h-4 bg-muted rounded w-full mb-8" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </>
    );
  }

  // ─── Results View ─────────────────────────────────────────────────

  if (showResults && latestResult) {
    const tier = getProfileTier(latestResult.overall_score);
    const totalScore = Object.values(latestResult.domain_scores).reduce((a, b) => a + b, 0);
    const maxPossible = totalQuestions * 3;

    // Find lowest-scoring domain for coaching
    const sortedDomains = [...ACCOUNTABILITY_DOMAINS].sort(
      (a, b) => (latestResult.domain_scores[a] || 0) - (latestResult.domain_scores[b] || 0)
    );

    return (
      <>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={backToHub}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assessment Hub
            </Button>
            <h1 className="text-2xl font-bold mb-1">Assessment Results</h1>
            <p className="text-muted-foreground">
              {formatDate(latestResult.date)}
            </p>
          </div>

          {/* Overall Score */}
          <Card className="mb-6 border-christina-red/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-christina-red/10 mb-4">
                  <span className="text-3xl font-bold text-christina-red">
                    {latestResult.overall_score}%
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-1">{tier.label}</h2>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                  {tier.description}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Raw score: {totalScore} / {maxPossible} points
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Domain Scores Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-christina-red" />
                Domain Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DomainBarChart domainScores={latestResult.domain_scores} />
            </CardContent>
          </Card>

          {/* Per-Domain Breakdown with Coaching */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-bold">Domain Breakdown</h3>
            {sortedDomains.map((domain, i) => {
              const score = latestResult.domain_scores[domain] || 0;
              const maxDomain = 15;
              const pct = Math.round((score / maxDomain) * 100);
              const questions = getDomainQuestions(domain);

              // Find lowest-scoring questions for coaching prompts
              const lowQuestions = questions
                .filter((q) => (latestResult.responses[q.id] || 0) <= 1)
                .slice(0, 2);

              return (
                <Card
                  key={domain}
                  className={i === 0 ? 'border-orange-300 bg-orange-50/30' : ''}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{domain}</h4>
                        {i === 0 && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-300 mt-1">
                            Lowest Domain
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold">{score}</span>
                        <span className="text-muted-foreground">/{maxDomain}</span>
                        <p className="text-xs text-muted-foreground">{pct}%</p>
                      </div>
                    </div>

                    {/* Score bar */}
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 80
                            ? 'bg-green-500'
                            : pct >= 60
                            ? 'bg-yellow-500'
                            : pct >= 40
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Individual question scores */}
                    <div className="space-y-1 mb-3">
                      {questions.map((q) => {
                        const qScore = latestResult.responses[q.id] || 0;
                        const scaleLabel = ASSESSMENT_SCALE.find((s) => s.value === qScore)?.label || '';
                        return (
                          <div key={q.id} className="flex items-start gap-2 text-sm">
                            <span
                              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                qScore >= 2
                                  ? 'bg-green-100 text-green-800'
                                  : qScore === 1
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {qScore}
                            </span>
                            <span className="text-muted-foreground flex-1 line-clamp-1">
                              {q.question}
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {scaleLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Coaching prompts for low questions */}
                    {lowQuestions.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                        <p className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Coaching Focus
                        </p>
                        {lowQuestions.map((q) => (
                          <p key={q.id} className="text-xs text-amber-700 mb-1 last:mb-0">
                            {q.coaching_prompt}
                          </p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center mb-8">
            <Button
              onClick={retakeAssessment}
              className="bg-christina-red hover:bg-christina-red/90 text-white"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Assessment
            </Button>
            <Button variant="outline" onClick={backToHub}>
              View History
            </Button>
          </div>
        </div>
      </>
    );
  }

  // ─── Assessment Mode ──────────────────────────────────────────────

  if (isAssessing) {
    const domainProgress = `${currentDomainIndex + 1} / ${ACCOUNTABILITY_DOMAINS.length}`;

    return (
      <>
        <div className="max-w-3xl mx-auto">
          {/* Progress Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Domain {domainProgress}
              </span>
              <span className="text-sm text-muted-foreground">
                {totalAnswered} / {totalQuestions} questions answered
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-christina-red rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round(
                    ((currentDomainIndex + (allCurrentDomainAnswered ? 1 : 0.5)) /
                      ACCOUNTABILITY_DOMAINS.length) *
                      100
                  )}%`,
                }}
              />
            </div>

            {/* Domain dots */}
            <div className="flex items-center gap-1 justify-center mb-4">
              {ACCOUNTABILITY_DOMAINS.map((d, i) => {
                const domainQs = getDomainQuestions(d);
                const allAnswered = domainQs.every(
                  (q) => responses[q.id] !== undefined
                );
                return (
                  <button
                    key={d}
                    onClick={() => setCurrentDomainIndex(i)}
                    className={`w-8 h-2 rounded-full transition-colors ${
                      i === currentDomainIndex
                        ? 'bg-christina-red'
                        : allAnswered
                        ? 'bg-green-400'
                        : 'bg-muted'
                    }`}
                    title={d}
                  />
                );
              })}
            </div>

            <h2 className="text-xl font-bold text-center">{currentDomain}</h2>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {currentQuestions.map((q, qi) => (
              <Card
                key={q.id}
                className={
                  responses[q.id] !== undefined
                    ? 'border-christina-red/20 bg-christina-red/5'
                    : ''
                }
              >
                <CardContent className="pt-5 pb-4">
                  <p className="text-sm font-medium mb-4">
                    {currentDomainIndex * 5 + qi + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ASSESSMENT_SCALE.map((scale) => {
                      const isSelected = responses[q.id] === scale.value;
                      return (
                        <button
                          key={scale.value}
                          onClick={() => handleResponse(q.id, scale.value)}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            isSelected
                              ? 'border-christina-red bg-christina-red text-white shadow-sm'
                              : 'border-muted hover:border-christina-red/50 hover:bg-muted/50'
                          }`}
                        >
                          <span className="text-lg font-bold block">
                            {scale.value}
                          </span>
                          <span
                            className={`text-xs block ${
                              isSelected ? 'text-white/90' : 'text-muted-foreground'
                            }`}
                          >
                            {scale.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 mb-8">
            <Button
              variant="outline"
              onClick={prevDomain}
              disabled={currentDomainIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Domain
            </Button>

            {currentDomainIndex < ACCOUNTABILITY_DOMAINS.length - 1 ? (
              <Button
                onClick={nextDomain}
                disabled={!allCurrentDomainAnswered}
                className="bg-christina-red hover:bg-christina-red/90 text-white"
              >
                Next Domain
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={completeAssessment}
                disabled={totalAnswered < totalQuestions}
                className="bg-christina-red hover:bg-christina-red/90 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Assessment
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }

  // ─── Hub View (History + Start) ───────────────────────────────────

  const sortedAssessments = [...assessments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latest = sortedAssessments[0];
  const previous = sortedAssessments[1];

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <a href="/admin/tasks" className="hover:text-christina-red transition-colors">
              Task Board
            </a>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">Accountability Assessment</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Accountability Assessment</h1>
          <p className="text-muted-foreground">
            A 25-question self-assessment across five domains of accountability culture.
            Rate each practice from Absent (0) to Embedded (3) to identify where your
            systems are strong and where drift is hiding.
          </p>
        </div>

        {/* Start Assessment CTA */}
        <Card className="mb-8 border-christina-red/20 bg-gradient-to-br from-christina-red/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="p-4 bg-christina-red/10 rounded-full">
                <ClipboardCheck className="h-10 w-10 text-christina-red" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-bold mb-1">
                  {assessments.length === 0
                    ? 'Take Your First Assessment'
                    : 'Retake Assessment'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  25 questions across {ACCOUNTABILITY_DOMAINS.length} domains.
                  Takes about 10 minutes. Your responses are saved locally.
                </p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                  {ACCOUNTABILITY_DOMAINS.map((d) => (
                    <Badge
                      key={d}
                      variant="outline"
                      className="text-xs"
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={startAssessment}
                className="bg-christina-red hover:bg-christina-red/90 text-white flex-shrink-0"
                size="lg"
              >
                {assessments.length === 0 ? 'Begin Assessment' : 'Start New Assessment'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Latest Result Summary (if exists) */}
        {latest && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-christina-red" />
                Most Recent Result
                <span className="text-sm font-normal text-muted-foreground ml-auto">
                  {formatDate(latest.date)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Score + Tier */}
                <div className="text-center md:text-left md:w-1/3">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-christina-red/10 mb-2">
                    <span className="text-2xl font-bold text-christina-red">
                      {latest.overall_score}%
                    </span>
                  </div>
                  <p className="font-semibold text-sm">{latest.profile_tier}</p>
                  {previous && (
                    <div className="flex items-center gap-1 justify-center md:justify-start mt-1">
                      {latest.overall_score > previous.overall_score ? (
                        <>
                          <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-xs text-green-600">
                            +{latest.overall_score - previous.overall_score}% from last
                          </span>
                        </>
                      ) : latest.overall_score < previous.overall_score ? (
                        <>
                          <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                          <span className="text-xs text-red-600">
                            {latest.overall_score - previous.overall_score}% from last
                          </span>
                        </>
                      ) : (
                        <>
                          <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            No change from last
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Domain Bars */}
                <div className="flex-1">
                  <DomainBarChart domainScores={latest.domain_scores} />
                </div>
              </div>

              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLatestResult(latest);
                    setShowResults(true);
                  }}
                  className="text-christina-red border-christina-red/30 hover:bg-christina-red/10"
                >
                  View Full Results
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessment History */}
        {assessments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-christina-red" />
                Assessment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedAssessments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No assessments completed yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {sortedAssessments.map((a, i) => {
                    const tier = getProfileTier(a.overall_score);
                    const prev = sortedAssessments[i + 1];
                    const trend = prev
                      ? a.overall_score - prev.overall_score
                      : null;

                    return (
                      <div
                        key={a.id}
                        className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setLatestResult(a);
                          setShowResults(true);
                        }}
                      >
                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-christina-red/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-christina-red">
                            {a.overall_score}%
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {tier.label}
                            </span>
                            {trend !== null && (
                              <span
                                className={`flex items-center gap-0.5 text-xs ${
                                  trend > 0
                                    ? 'text-green-600'
                                    : trend < 0
                                    ? 'text-red-600'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {trend > 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : trend < 0 ? (
                                  <TrendingDown className="h-3 w-3" />
                                ) : (
                                  <Minus className="h-3 w-3" />
                                )}
                                {trend > 0 ? '+' : ''}
                                {trend}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(a.date)}
                          </p>
                        </div>

                        {/* Mini domain indicators */}
                        <div className="hidden sm:flex items-center gap-1">
                          {ACCOUNTABILITY_DOMAINS.map((d) => {
                            const score = a.domain_scores[d] || 0;
                            const pct = Math.round((score / 15) * 100);
                            let bg = 'bg-red-400';
                            if (pct >= 80) bg = 'bg-green-400';
                            else if (pct >= 60) bg = 'bg-yellow-400';
                            else if (pct >= 40) bg = 'bg-orange-400';

                            return (
                              <div
                                key={d}
                                className={`w-6 h-2 rounded-full ${bg}`}
                                title={`${d}: ${score}/15`}
                              />
                            );
                          })}
                        </div>

                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {assessments.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center py-12">
              <AlertCircle className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No Assessment History</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Complete your first assessment to establish a baseline. Retake it
                monthly to track progress and identify where accountability structures
                are strengthening or slipping.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
