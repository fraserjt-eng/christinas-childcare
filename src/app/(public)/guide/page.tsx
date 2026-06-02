'use client';

import { useState, useEffect } from 'react';
import {
  Rocket,
  Sun,
  MessageSquare,
  Calendar,
  TrendingUp,
  LogIn,
  UserCheck,
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Users,
  Camera,
  Eye,
  LayoutGrid,
  Moon,
  Image,
  Newspaper,
  Archive,
  Megaphone,
  Bell,
  CalendarDays,
  CalendarRange,
  BookOpen,
  GraduationCap,
  UserPlus,
  Package,
  ShoppingCart,
  Filter,
  FileCheck,
  MapPin,
  Building2,
  AlertTriangle,
  ClipboardCheck,
} from 'lucide-react';
import { GuideHero } from '@/components/guide/GuideHero';
import { RoleFilter } from '@/components/guide/RoleFilter';
import { FeatureCard, type FeatureCardProps } from '@/components/guide/FeatureCard';
import { GuideSection } from '@/components/guide/GuideSection';
import { getTourProgress } from '@/lib/tour-progress';
import { useT } from '@/contexts/LanguageContext';

// ---------------------------------------------------------------------------
// Color constants
// ---------------------------------------------------------------------------
const RED = '#C62828';
const BLUE = '#2196F3';
const GREEN = '#4CAF50';
const CORAL = '#FF7043';
const PURPLE = '#7B1FA2';

// ---------------------------------------------------------------------------
// Feature card data
//
// Text fields below hold i18n KEYS (not literal copy). They are resolved with
// t() inside the component render before being passed to child components.
// ---------------------------------------------------------------------------

type CardDef = Omit<FeatureCardProps, 'categoryColor'> & { sectionColor: string };

const allCards: CardDef[] = [
  // ─── Section 1: Getting Started ─────────────────────────────────────────
  {
    icon: LogIn,
    title: 'guide.parentLoginTitle',
    description: 'guide.parentLoginDesc',
    whyItExists: 'guide.parentLoginWhy',
    howItHelps: 'guide.parentLoginHow',
    route: '/login',
    steps: [
      'guide.parentLoginStep1',
      'guide.parentLoginStep2',
      'guide.parentLoginStep3',
      'guide.parentLoginStep4',
    ],
    roles: ['parent'],
    category: 'Getting Started',
    sectionColor: RED,
  },
  {
    icon: UserCheck,
    title: 'guide.employeeLoginTitle',
    description: 'guide.employeeLoginDesc',
    whyItExists: 'guide.employeeLoginWhy',
    howItHelps: 'guide.employeeLoginHow',
    route: '/employee-login',
    steps: [
      'guide.employeeLoginStep1',
      'guide.employeeLoginStep2',
      'guide.employeeLoginStep3',
      'guide.employeeLoginStep4',
    ],
    roles: ['staff'],
    category: 'Getting Started',
    sectionColor: RED,
  },
  {
    icon: LayoutDashboard,
    title: 'guide.adminDashTitle',
    description: 'guide.adminDashDesc',
    whyItExists: 'guide.adminDashWhy',
    howItHelps: 'guide.adminDashHow',
    route: '/admin',
    tourId: 'admin-dashboard',
    steps: [
      'guide.adminDashStep1',
      'guide.adminDashStep2',
      'guide.adminDashStep3',
      'guide.adminDashStep4',
    ],
    roles: ['admin'],
    category: 'Getting Started',
    sectionColor: RED,
  },

  // ─── Section 2: Daily Essentials ────────────────────────────────────────
  {
    icon: UtensilsCrossed,
    title: 'guide.mealCountTitle',
    description: 'guide.mealCountDesc',
    whyItExists: 'guide.mealCountWhy',
    howItHelps: 'guide.mealCountHow',
    route: '/employee/meal-count',
    tourId: 'meal-count',
    steps: [
      'guide.mealCountStep1',
      'guide.mealCountStep2',
      'guide.mealCountStep3',
      'guide.mealCountStep4',
    ],
    roles: ['staff'],
    category: 'Daily Essentials',
    sectionColor: GREEN,
  },
  {
    icon: ClipboardList,
    title: 'guide.foodCountsTitle',
    description: 'guide.foodCountsDesc',
    whyItExists: 'guide.foodCountsWhy',
    howItHelps: 'guide.foodCountsHow',
    route: '/admin/food-counts',
    tourId: 'food-counts-compliance',
    steps: [
      'guide.foodCountsStep1',
      'guide.foodCountsStep2',
      'guide.foodCountsStep3',
      'guide.foodCountsStep4',
    ],
    roles: ['admin'],
    category: 'Daily Essentials',
    sectionColor: GREEN,
  },
  {
    icon: Users,
    title: 'guide.attendanceTitle',
    description: 'guide.attendanceDesc',
    whyItExists: 'guide.attendanceWhy',
    howItHelps: 'guide.attendanceHow',
    route: '/admin/attendance',
    steps: [
      'guide.attendanceStep1',
      'guide.attendanceStep2',
      'guide.attendanceStep3',
      'guide.attendanceStep4',
    ],
    roles: ['admin'],
    category: 'Daily Essentials',
    sectionColor: GREEN,
  },
  {
    icon: Camera,
    title: 'guide.photoUploadTitle',
    description: 'guide.photoUploadDesc',
    whyItExists: 'guide.photoUploadWhy',
    howItHelps: 'guide.photoUploadHow',
    route: '/employee/photos',
    tourId: 'photo-upload',
    steps: [
      'guide.photoUploadStep1',
      'guide.photoUploadStep2',
      'guide.photoUploadStep3',
      'guide.photoUploadStep4',
    ],
    roles: ['staff'],
    category: 'Daily Essentials',
    sectionColor: GREEN,
  },
  {
    icon: Eye,
    title: 'guide.photoReviewTitle',
    description: 'guide.photoReviewDesc',
    whyItExists: 'guide.photoReviewWhy',
    howItHelps: 'guide.photoReviewHow',
    route: '/admin/communications/photos',
    tourId: 'photo-review',
    steps: [
      'guide.photoReviewStep1',
      'guide.photoReviewStep2',
      'guide.photoReviewStep3',
      'guide.photoReviewStep4',
    ],
    roles: ['admin'],
    category: 'Daily Essentials',
    sectionColor: GREEN,
  },
  {
    icon: LayoutGrid,
    title: 'guide.taskBoardTitle',
    description: 'guide.taskBoardDesc',
    whyItExists: 'guide.taskBoardWhy',
    howItHelps: 'guide.taskBoardHow',
    route: '/admin/tasks',
    tourId: 'task-kanban',
    steps: [
      'guide.taskBoardStep1',
      'guide.taskBoardStep2',
      'guide.taskBoardStep3',
      'guide.taskBoardStep4',
    ],
    roles: ['admin'],
    category: 'Daily Essentials',
    sectionColor: GREEN,
  },
  {
    icon: Moon,
    title: 'guide.napTasksTitle',
    description: 'guide.napTasksDesc',
    whyItExists: 'guide.napTasksWhy',
    howItHelps: 'guide.napTasksHow',
    route: '/employee/nap-tasks',
    tourId: 'nap-tasks',
    steps: [
      'guide.napTasksStep1',
      'guide.napTasksStep2',
      'guide.napTasksStep3',
      'guide.napTasksStep4',
    ],
    roles: ['staff'],
    category: 'Daily Essentials',
    sectionColor: GREEN,
  },

  // ─── Section 3: Communication ───────────────────────────────────────────
  {
    icon: Image,
    title: 'guide.parentGalleryTitle',
    description: 'guide.parentGalleryDesc',
    whyItExists: 'guide.parentGalleryWhy',
    howItHelps: 'guide.parentGalleryHow',
    route: '/dashboard/photos',
    tourId: 'parent-photos',
    steps: [
      'guide.parentGalleryStep1',
      'guide.parentGalleryStep2',
      'guide.parentGalleryStep3',
      'guide.parentGalleryStep4',
    ],
    roles: ['parent'],
    category: 'Communication',
    sectionColor: BLUE,
  },
  {
    icon: Newspaper,
    title: 'guide.newsletterBuilderTitle',
    description: 'guide.newsletterBuilderDesc',
    whyItExists: 'guide.newsletterBuilderWhy',
    howItHelps: 'guide.newsletterBuilderHow',
    route: '/admin/communications',
    tourId: 'newsletter-builder',
    steps: [
      'guide.newsletterBuilderStep1',
      'guide.newsletterBuilderStep2',
      'guide.newsletterBuilderStep3',
      'guide.newsletterBuilderStep4',
    ],
    roles: ['admin'],
    category: 'Communication',
    sectionColor: BLUE,
  },
  {
    icon: Archive,
    title: 'guide.newsletterArchiveTitle',
    description: 'guide.newsletterArchiveDesc',
    whyItExists: 'guide.newsletterArchiveWhy',
    howItHelps: 'guide.newsletterArchiveHow',
    route: '/dashboard/news',
    tourId: 'parent-newsletter',
    steps: [
      'guide.newsletterArchiveStep1',
      'guide.newsletterArchiveStep2',
      'guide.newsletterArchiveStep3',
      'guide.newsletterArchiveStep4',
    ],
    roles: ['parent'],
    category: 'Communication',
    sectionColor: BLUE,
  },
  {
    icon: Megaphone,
    title: 'guide.commHubTitle',
    description: 'guide.commHubDesc',
    whyItExists: 'guide.commHubWhy',
    howItHelps: 'guide.commHubHow',
    route: '/admin/communications',
    steps: [
      'guide.commHubStep1',
      'guide.commHubStep2',
      'guide.commHubStep3',
      'guide.commHubStep4',
    ],
    roles: ['admin'],
    category: 'Communication',
    sectionColor: BLUE,
  },
  {
    icon: Bell,
    title: 'guide.notifPrefsTitle',
    description: 'guide.notifPrefsDesc',
    whyItExists: 'guide.notifPrefsWhy',
    howItHelps: 'guide.notifPrefsHow',
    route: '/dashboard/notifications',
    tourId: 'notification-prefs',
    steps: [
      'guide.notifPrefsStep1',
      'guide.notifPrefsStep2',
      'guide.notifPrefsStep3',
      'guide.notifPrefsStep4',
    ],
    roles: ['parent'],
    category: 'Communication',
    sectionColor: BLUE,
  },

  // ─── Section 4: Scheduling & Staff ──────────────────────────────────────
  {
    icon: CalendarDays,
    title: 'guide.scheduleBoardTitle',
    description: 'guide.scheduleBoardDesc',
    whyItExists: 'guide.scheduleBoardWhy',
    howItHelps: 'guide.scheduleBoardHow',
    route: '/admin/scheduling',
    tourId: 'schedule-board',
    steps: [
      'guide.scheduleBoardStep1',
      'guide.scheduleBoardStep2',
      'guide.scheduleBoardStep3',
      'guide.scheduleBoardStep4',
    ],
    roles: ['admin'],
    category: 'Scheduling & Staff',
    sectionColor: CORAL,
  },
  {
    icon: CalendarRange,
    title: 'guide.employeeScheduleTitle',
    description: 'guide.employeeScheduleDesc',
    whyItExists: 'guide.employeeScheduleWhy',
    howItHelps: 'guide.employeeScheduleHow',
    route: '/employee/schedule',
    tourId: 'my-schedule',
    steps: [
      'guide.employeeScheduleStep1',
      'guide.employeeScheduleStep2',
      'guide.employeeScheduleStep3',
      'guide.employeeScheduleStep4',
    ],
    roles: ['staff'],
    category: 'Scheduling & Staff',
    sectionColor: CORAL,
  },
  {
    icon: BookOpen,
    title: 'guide.knowledgeBaseTitle',
    description: 'guide.knowledgeBaseDesc',
    whyItExists: 'guide.knowledgeBaseWhy',
    howItHelps: 'guide.knowledgeBaseHow',
    route: '/admin/staff/knowledge-base',
    tourId: 'knowledge-base',
    steps: [
      'guide.knowledgeBaseStep1',
      'guide.knowledgeBaseStep2',
      'guide.knowledgeBaseStep3',
      'guide.knowledgeBaseStep4',
    ],
    roles: ['admin', 'staff'],
    category: 'Scheduling & Staff',
    sectionColor: CORAL,
  },
  {
    icon: GraduationCap,
    title: 'guide.staffDevTitle',
    description: 'guide.staffDevDesc',
    whyItExists: 'guide.staffDevWhy',
    howItHelps: 'guide.staffDevHow',
    route: '/admin/staff/development',
    tourId: 'staff-development',
    steps: [
      'guide.staffDevStep1',
      'guide.staffDevStep2',
      'guide.staffDevStep3',
      'guide.staffDevStep4',
    ],
    roles: ['admin'],
    category: 'Scheduling & Staff',
    sectionColor: CORAL,
  },
  {
    icon: UserPlus,
    title: 'guide.onboardingTitle',
    description: 'guide.onboardingDesc',
    whyItExists: 'guide.onboardingWhy',
    howItHelps: 'guide.onboardingHow',
    route: '/admin/hr/onboarding',
    tourId: 'onboarding',
    steps: [
      'guide.onboardingStep1',
      'guide.onboardingStep2',
      'guide.onboardingStep3',
      'guide.onboardingStep4',
    ],
    roles: ['admin'],
    category: 'Scheduling & Staff',
    sectionColor: CORAL,
  },
  {
    icon: Package,
    title: 'guide.supplyMgmtTitle',
    description: 'guide.supplyMgmtDesc',
    whyItExists: 'guide.supplyMgmtWhy',
    howItHelps: 'guide.supplyMgmtHow',
    route: '/admin/supplies',
    tourId: 'inventory',
    steps: [
      'guide.supplyMgmtStep1',
      'guide.supplyMgmtStep2',
      'guide.supplyMgmtStep3',
      'guide.supplyMgmtStep4',
    ],
    roles: ['admin'],
    category: 'Scheduling & Staff',
    sectionColor: CORAL,
  },
  {
    icon: ShoppingCart,
    title: 'guide.requestSuppliesTitle',
    description: 'guide.requestSuppliesDesc',
    whyItExists: 'guide.requestSuppliesWhy',
    howItHelps: 'guide.requestSuppliesHow',
    route: '/employee/supplies',
    tourId: 'supply-request',
    steps: [
      'guide.requestSuppliesStep1',
      'guide.requestSuppliesStep2',
      'guide.requestSuppliesStep3',
      'guide.requestSuppliesStep4',
    ],
    roles: ['staff'],
    category: 'Scheduling & Staff',
    sectionColor: CORAL,
  },

  // ─── Section 5: Business & Growth ───────────────────────────────────────
  {
    icon: Filter,
    title: 'guide.enrollmentFunnelTitle',
    description: 'guide.enrollmentFunnelDesc',
    whyItExists: 'guide.enrollmentFunnelWhy',
    howItHelps: 'guide.enrollmentFunnelHow',
    route: '/admin/pipeline/enrollment',
    tourId: 'enrollment-funnel',
    steps: [
      'guide.enrollmentFunnelStep1',
      'guide.enrollmentFunnelStep2',
      'guide.enrollmentFunnelStep3',
      'guide.enrollmentFunnelStep4',
    ],
    roles: ['admin'],
    category: 'Business & Growth',
    sectionColor: PURPLE,
  },
  {
    icon: FileCheck,
    title: 'guide.authTrackingTitle',
    description: 'guide.authTrackingDesc',
    whyItExists: 'guide.authTrackingWhy',
    howItHelps: 'guide.authTrackingHow',
    route: '/admin/pipeline/authorizations',
    steps: [
      'guide.authTrackingStep1',
      'guide.authTrackingStep2',
      'guide.authTrackingStep3',
      'guide.authTrackingStep4',
    ],
    roles: ['admin'],
    category: 'Business & Growth',
    sectionColor: PURPLE,
  },
  {
    icon: MapPin,
    title: 'guide.tourManagerTitle',
    description: 'guide.tourManagerDesc',
    whyItExists: 'guide.tourManagerWhy',
    howItHelps: 'guide.tourManagerHow',
    route: '/admin/pipeline/tours',
    tourId: 'tour-manager',
    steps: [
      'guide.tourManagerStep1',
      'guide.tourManagerStep2',
      'guide.tourManagerStep3',
      'guide.tourManagerStep4',
    ],
    roles: ['admin'],
    category: 'Business & Growth',
    sectionColor: PURPLE,
  },
  {
    icon: TrendingUp,
    title: 'guide.revenueForecastTitle',
    description: 'guide.revenueForecastDesc',
    whyItExists: 'guide.revenueForecastWhy',
    howItHelps: 'guide.revenueForecastHow',
    route: '/admin/financial/forecasting',
    tourId: 'revenue-forecast',
    steps: [
      'guide.revenueForecastStep1',
      'guide.revenueForecastStep2',
      'guide.revenueForecastStep3',
      'guide.revenueForecastStep4',
    ],
    roles: ['admin'],
    category: 'Business & Growth',
    sectionColor: PURPLE,
  },
  {
    icon: Building2,
    title: 'guide.crossSiteTitle',
    description: 'guide.crossSiteDesc',
    whyItExists: 'guide.crossSiteWhy',
    howItHelps: 'guide.crossSiteHow',
    route: '/admin/operations',
    tourId: 'cross-site-ops',
    steps: [
      'guide.crossSiteStep1',
      'guide.crossSiteStep2',
      'guide.crossSiteStep3',
      'guide.crossSiteStep4',
    ],
    roles: ['admin'],
    category: 'Business & Growth',
    sectionColor: PURPLE,
  },
  {
    icon: AlertTriangle,
    title: 'guide.incidentLogTitle',
    description: 'guide.incidentLogDesc',
    whyItExists: 'guide.incidentLogWhy',
    howItHelps: 'guide.incidentLogHow',
    route: '/admin/incidents/log',
    tourId: 'incident-log',
    steps: [
      'guide.incidentLogStep1',
      'guide.incidentLogStep2',
      'guide.incidentLogStep3',
      'guide.incidentLogStep4',
    ],
    roles: ['admin'],
    category: 'Business & Growth',
    sectionColor: PURPLE,
  },
  {
    icon: ClipboardCheck,
    title: 'guide.meetingEfficiencyTitle',
    description: 'guide.meetingEfficiencyDesc',
    whyItExists: 'guide.meetingEfficiencyWhy',
    howItHelps: 'guide.meetingEfficiencyHow',
    route: '/admin/meetings/efficiency',
    tourId: 'meeting-efficiency',
    steps: [
      'guide.meetingEfficiencyStep1',
      'guide.meetingEfficiencyStep2',
      'guide.meetingEfficiencyStep3',
      'guide.meetingEfficiencyStep4',
    ],
    roles: ['admin'],
    category: 'Business & Growth',
    sectionColor: PURPLE,
  },
];

// ---------------------------------------------------------------------------
// Section definitions (text fields hold i18n keys, resolved in render)
// ---------------------------------------------------------------------------
const sections = [
  {
    id: 'getting-started',
    title: 'guide.sectionGettingStartedTitle',
    description: 'guide.sectionGettingStartedDesc',
    icon: Rocket,
    color: RED,
    category: 'Getting Started',
  },
  {
    id: 'daily-essentials',
    title: 'guide.sectionDailyEssentialsTitle',
    description: 'guide.sectionDailyEssentialsDesc',
    icon: Sun,
    color: GREEN,
    category: 'Daily Essentials',
  },
  {
    id: 'communication',
    title: 'guide.sectionCommunicationTitle',
    description: 'guide.sectionCommunicationDesc',
    icon: MessageSquare,
    color: BLUE,
    category: 'Communication',
  },
  {
    id: 'scheduling-staff',
    title: 'guide.sectionSchedulingStaffTitle',
    description: 'guide.sectionSchedulingStaffDesc',
    icon: Calendar,
    color: CORAL,
    category: 'Scheduling & Staff',
  },
  {
    id: 'business-growth',
    title: 'guide.sectionBusinessGrowthTitle',
    description: 'guide.sectionBusinessGrowthDesc',
    icon: TrendingUp,
    color: PURPLE,
    category: 'Business & Growth',
  },
];

// ---------------------------------------------------------------------------
// Total tours count (cards that have a tourId)
// ---------------------------------------------------------------------------
const TOTAL_GUIDES = allCards.filter((c) => c.tourId).length;

// ---------------------------------------------------------------------------
// Walkthrough video data (text fields hold i18n keys, resolved in render)
// ---------------------------------------------------------------------------
const walkthroughVideos = [
  {
    titleKey: 'guide.videoPublicTitle',
    descriptionKey: 'guide.videoPublicDesc',
    src: '/videos/walkthroughs/public-final.mp4',
    color: 'border-christina-red',
    durationKey: 'guide.videoPublicDuration',
  },
  {
    titleKey: 'guide.videoEmployeeTitle',
    descriptionKey: 'guide.videoEmployeeDesc',
    src: '/videos/walkthroughs/employee-final.mp4',
    color: 'border-christina-green',
    durationKey: 'guide.videoEmployeeDuration',
  },
  {
    titleKey: 'guide.videoAdminTitle',
    descriptionKey: 'guide.videoAdminDesc',
    src: '/videos/walkthroughs/admin-final.mp4',
    color: 'border-christina-blue',
    durationKey: 'guide.videoAdminDuration',
  },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function GuidePage() {
  const t = useT();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [exploredCount, setExploredCount] = useState(0);

  useEffect(() => {
    const progress = getTourProgress();
    const completedTourIds = new Set(
      Array.from(Object.entries(progress.tours))
        .filter(([, t]) => t.lastStepReached === t.totalSteps)
        .map(([id]) => id)
    );
    setExploredCount(completedTourIds.size);
  }, []);

  const filteredCards = selectedRole
    ? allCards.filter((c) => c.roles.includes(selectedRole as 'parent' | 'staff' | 'admin'))
    : allCards;

  const progressPct =
    TOTAL_GUIDES > 0 ? Math.round((exploredCount / TOTAL_GUIDES) * 100) : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <GuideHero />

      <RoleFilter selectedRole={selectedRole} onRoleChange={setSelectedRole} />

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 max-w-xl mx-auto">
            <span className="text-xs text-gray-500 whitespace-nowrap font-medium shrink-0">
              {t('guide.guidesExplored')
                .replace('{count}', String(exploredCount))
                .replace('{total}', String(TOTAL_GUIDES))}
            </span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(to right, #C62828, #FF7043)',
                }}
              />
            </div>
            <span className="text-xs font-bold text-christina-red shrink-0 w-9 text-right">
              {progressPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const cards = filteredCards.filter(
          (c) => c.category === section.category
        );

        if (cards.length === 0) return null;

        return (
          <GuideSection
            key={section.id}
            id={section.id}
            title={t(section.title as Parameters<typeof t>[0])}
            description={t(section.description as Parameters<typeof t>[0])}
            icon={section.icon}
            accentColor={section.color}
          >
            {cards.map((card) => (
              <FeatureCard
                key={card.title}
                icon={card.icon}
                title={t(card.title as Parameters<typeof t>[0])}
                description={t(card.description as Parameters<typeof t>[0])}
                whyItExists={t(card.whyItExists as Parameters<typeof t>[0])}
                howItHelps={t(card.howItHelps as Parameters<typeof t>[0])}
                route={card.route}
                tourId={card.tourId}
                steps={card.steps.map((s) => t(s as Parameters<typeof t>[0]))}
                roles={card.roles}
                categoryColor={section.color}
              />
            ))}
          </GuideSection>
        );
      })}

      {/* Empty state */}
      {filteredCards.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-gray-400 text-lg">
            {t('guide.emptyStateMessage')}
          </p>
          <button
            onClick={() => setSelectedRole(null)}
            className="mt-4 text-sm text-christina-red underline"
          >
            {t('guide.showEverything')}
          </button>
        </div>
      )}

      {/* Video Walkthroughs Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('guide.watchInActionTitle')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('guide.watchInActionDesc')}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {walkthroughVideos.map((video) => (
              <div key={video.titleKey} className={`bg-white rounded-xl shadow-sm border-t-4 ${video.color} overflow-hidden`}>
                <div className="aspect-video bg-gray-900 relative">
                  <video
                    controls
                    preload="metadata"
                    className="w-full h-full object-cover"
                    poster=""
                  >
                    <source src={video.src} type="video/mp4" />
                    {t('guide.videoNoSupport')}
                  </video>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900">{t(video.titleKey as Parameters<typeof t>[0])}</h3>
                    <span className="text-xs text-gray-400">{t(video.durationKey as Parameters<typeof t>[0])}</span>
                  </div>
                  <p className="text-sm text-gray-600">{t(video.descriptionKey as Parameters<typeof t>[0])}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer nudge */}
      <div className="py-14 bg-gradient-to-br from-christina-red via-red-800 to-red-950 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-white mb-3">
            {t('guide.footerTitle')}
          </h3>
          <p className="text-red-200 text-sm max-w-lg mx-auto">
            {t('guide.footerBeforeTour')}{' '}
            <span className="font-semibold text-amber-300">{t('guide.footerTakeTour')}</span>{' '}
            {t('guide.footerAfterTour')}
          </p>
        </div>
      </div>
    </main>
  );
}
