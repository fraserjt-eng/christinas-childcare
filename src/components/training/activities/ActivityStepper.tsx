'use client';

import { useState } from 'react';
import { TrainingActivity } from '@/types/training';
import { WalkthroughActivity } from './WalkthroughActivity';
import { ScenarioActivity } from './ScenarioActivity';
import { SpotlightActivity } from './SpotlightActivity';
import { ExploreActivity } from './ExploreActivity';
import { ReflectionActivity } from './ReflectionActivity';
import { Check, BookOpen, MapPin, Lightbulb, MessageCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityStepperProps {
  activities: TrainingActivity[];
  onAllComplete: () => void;
}

const activityIcons: Record<string, typeof BookOpen> = {
  walkthrough: BookOpen,
  scenario: HelpCircle,
  spotlight: Lightbulb,
  explore: MapPin,
  reflection: MessageCircle,
};

const activityLabels: Record<string, string> = {
  walkthrough: 'Walkthrough',
  scenario: 'Scenario',
  spotlight: 'Key Concept',
  explore: 'Explore',
  reflection: 'Reflection',
};

export function ActivityStepper({ activities, onAllComplete }: ActivityStepperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());

  const handleComplete = (index: number) => {
    const newCompleted = new Set(completedSet).add(index);
    setCompletedSet(newCompleted);

    if (newCompleted.size === activities.length) {
      onAllComplete();
    } else {
      // Advance to next incomplete activity
      const nextIncomplete = activities.findIndex((_, i) => !newCompleted.has(i) && i > index);
      if (nextIncomplete !== -1) {
        setCurrentIndex(nextIncomplete);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Activity progress dots */}
      <div className="flex items-center gap-2 flex-wrap">
        {activities.map((activity, i) => {
          const isCompleted = completedSet.has(i);
          const isCurrent = i === currentIndex;
          const Icon = activityIcons[activity.type] || BookOpen;

          return (
            <button
              key={activity.id}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-heading font-semibold transition-all',
                isCompleted && 'bg-green-100 text-christina-green',
                isCurrent && !isCompleted && 'bg-christina-red/10 text-christina-red ring-1 ring-christina-red/30',
                !isCurrent && !isCompleted && 'bg-gray-100 text-gray-400'
              )}
            >
              {isCompleted ? (
                <Check className="h-3 w-3" />
              ) : (
                <Icon className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">{activityLabels[activity.type]}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-christina-green rounded-full transition-all duration-300"
          style={{ width: `${(completedSet.size / activities.length) * 100}%` }}
        />
      </div>

      {/* Current activity */}
      {activities.map((activity, i) => {
        if (i !== currentIndex) return null;

        return (
          <div key={activity.id} className="border border-gray-200 rounded-xl p-4 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-400 font-body">
                Activity {i + 1} of {activities.length}
              </span>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs text-christina-red font-heading font-semibold">
                {activityLabels[activity.type]}
              </span>
            </div>
            <h4 className="font-heading font-bold text-gray-900 mb-4">{activity.title}</h4>

            {activity.type === 'walkthrough' && activity.steps && (
              <WalkthroughActivity
                title={activity.title}
                steps={activity.steps}
                onComplete={() => handleComplete(i)}
              />
            )}
            {activity.type === 'scenario' && activity.scenario && (
              <ScenarioActivity
                title={activity.title}
                situation={activity.scenario.situation}
                options={activity.scenario.options}
                onComplete={() => handleComplete(i)}
              />
            )}
            {activity.type === 'spotlight' && activity.spotlight && (
              <SpotlightActivity
                title={activity.title}
                concept={activity.spotlight.concept}
                detail={activity.spotlight.detail}
                whyItMatters={activity.spotlight.whyItMatters}
                onComplete={() => handleComplete(i)}
              />
            )}
            {activity.type === 'explore' && activity.pages && (
              <ExploreActivity
                title={activity.title}
                pages={activity.pages}
                onComplete={() => handleComplete(i)}
              />
            )}
            {activity.type === 'reflection' && activity.prompt && (
              <ReflectionActivity
                title={activity.title}
                prompt={activity.prompt}
                onComplete={() => handleComplete(i)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
