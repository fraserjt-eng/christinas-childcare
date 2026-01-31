'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { TimeEntry } from '@/types/employee';

interface ClockInOutButtonProps {
  isClockedIn: boolean;
  activeEntry?: TimeEntry | null;
  onClockIn: () => Promise<void>;
  onClockOut: () => Promise<void>;
  loading?: boolean;
  className?: string;
}

export function ClockInOutButton({
  isClockedIn,
  activeEntry,
  onClockIn,
  onClockOut,
  loading = false,
  className,
}: ClockInOutButtonProps) {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [elapsedTime, setElapsedTime] = React.useState('00:00:00');

  // Update current time every second
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate elapsed time if clocked in
  React.useEffect(() => {
    if (!isClockedIn || !activeEntry) {
      setElapsedTime('00:00:00');
      return;
    }

    const calculateElapsed = () => {
      const start = new Date(activeEntry.clock_in);
      const now = new Date();
      const diff = now.getTime() - start.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, activeEntry]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatClockInTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-6 p-8 rounded-2xl',
        isClockedIn
          ? 'bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800'
          : 'bg-muted/50 border-2 border-muted',
        className
      )}
    >
      {/* Current Time Display */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
          Current Time
        </p>
        <p className="text-4xl font-bold tabular-nums">{formatTime(currentTime)}</p>
      </div>

      {/* Status */}
      {isClockedIn && activeEntry && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Clocked In</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Since {formatClockInTime(activeEntry.clock_in)}
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums mt-1">
            {elapsedTime}
          </p>
        </div>
      )}

      {/* Clock Button */}
      <Button
        size="lg"
        className={cn(
          'w-48 h-48 rounded-full text-xl font-bold shadow-lg transition-all duration-300',
          isClockedIn
            ? 'bg-red-500 hover:bg-red-600 text-white hover:scale-105'
            : 'bg-green-500 hover:bg-green-600 text-white hover:scale-105'
        )}
        onClick={isClockedIn ? onClockOut : onClockIn}
        disabled={loading}
      >
        <div className="flex flex-col items-center gap-2">
          {loading ? (
            <Clock className="h-12 w-12 animate-spin" />
          ) : isClockedIn ? (
            <>
              <LogOut className="h-12 w-12" />
              <span>Clock Out</span>
            </>
          ) : (
            <>
              <LogIn className="h-12 w-12" />
              <span>Clock In</span>
            </>
          )}
        </div>
      </Button>

      {/* Instructions */}
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {isClockedIn
          ? 'Tap the button to clock out when your shift ends'
          : 'Tap the button to start your shift'}
      </p>
    </div>
  );
}
