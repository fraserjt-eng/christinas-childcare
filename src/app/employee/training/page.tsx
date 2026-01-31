'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  getCurrentEmployee,
  getTrainingModules,
  getEmployeeTraining,
} from '@/lib/employee-storage';
import {
  Employee,
  TrainingModule,
  EmployeeTraining,
  TrainingStatus,
} from '@/types/employee';
import {
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  PlayCircle,
  Award,
  Calendar,
} from 'lucide-react';

export default function EmployeeTrainingPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [employeeTraining, setEmployeeTraining] = useState<EmployeeTraining[]>([]);

  useEffect(() => {
    async function loadData() {
      const emp = getCurrentEmployee();
      setEmployee(emp);

      const mods = await getTrainingModules();
      setModules(mods);

      if (emp) {
        const training = await getEmployeeTraining(emp.id);
        setEmployeeTraining(training);
      }
    }
    loadData();
  }, []);

  const getTrainingForModule = (moduleId: string): EmployeeTraining | undefined => {
    return employeeTraining.find((t) => t.module_id === moduleId);
  };

  const getStatusBadge = (status: TrainingStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <PlayCircle className="h-3 w-3 mr-1" />
            Not Started
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate overall progress
  const requiredModules = modules.filter((m) => m.category === 'required');
  const completedRequired = requiredModules.filter((m) => {
    const training = getTrainingForModule(m.id);
    return training?.status === 'completed';
  });
  const progressPercentage =
    requiredModules.length > 0
      ? (completedRequired.length / requiredModules.length) * 100
      : 0;

  // Check for expiring soon (within 30 days)
  const expiringSoon = employeeTraining.filter((t) => {
    if (!t.expires_at) return false;
    const expiresAt = new Date(t.expires_at);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiresAt <= thirtyDaysFromNow && t.status !== 'expired';
  });

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Training
        </h1>
        <p className="text-muted-foreground">
          Complete required training and certifications
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Training Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Required Training</span>
            <span className="font-medium">
              {completedRequired.length} of {requiredModules.length} completed
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />

          {expiringSoon.length > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">
                  {expiringSoon.length} certification{expiringSoon.length > 1 ? 's' : ''} expiring soon
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Modules */}
      <div className="grid gap-4">
        {/* Required Training */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Required Training</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {modules
              .filter((m) => m.category === 'required')
              .map((module) => {
                const training = getTrainingForModule(module.id);
                return (
                  <div
                    key={module.id}
                    className="flex items-start justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{module.title}</h3>
                        {getStatusBadge(training?.status || 'not_started')}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {module.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {module.duration_hours}h duration
                        </span>
                        {training?.completed_at && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completed {formatDate(training.completed_at)}
                          </span>
                        )}
                        {training?.expires_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Expires {formatDate(training.expires_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    {training?.score && (
                      <div className="text-center ml-4">
                        <p className="text-2xl font-bold">{training.score}%</p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    )}
                  </div>
                );
              })}
          </CardContent>
        </Card>

        {/* Recommended Training */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-yellow-600">Recommended Training</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {modules
              .filter((m) => m.category === 'recommended')
              .map((module) => {
                const training = getTrainingForModule(module.id);
                return (
                  <div
                    key={module.id}
                    className="flex items-start justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{module.title}</h3>
                        {getStatusBadge(training?.status || 'not_started')}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {module.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {module.duration_hours}h duration
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Start
                    </Button>
                  </div>
                );
              })}
          </CardContent>
        </Card>

        {/* Optional Training */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Optional Training</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {modules
              .filter((m) => m.category === 'optional')
              .map((module) => {
                const training = getTrainingForModule(module.id);
                return (
                  <div
                    key={module.id}
                    className="flex items-start justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{module.title}</h3>
                        {getStatusBadge(training?.status || 'not_started')}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {module.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {module.duration_hours}h duration
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Start
                    </Button>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      {/* Certifications on File */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            My Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employee.certifications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No certifications on file
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {employee.certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">{cert}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
