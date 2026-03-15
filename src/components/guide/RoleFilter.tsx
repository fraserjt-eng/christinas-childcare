'use client';

import { Heart, Users, Shield, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleFilterProps {
  selectedRole: string | null;
  onRoleChange: (role: string | null) => void;
}

const roles = [
  {
    id: 'parent',
    label: "I'm a Parent",
    icon: Heart,
    color: 'christina-blue',
    hex: '#2196F3',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    activeBorder: 'border-[#2196F3]',
    activeBg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-[#2196F3]',
    labelColor: 'text-[#1565C0]',
    ringColor: 'ring-blue-300',
    description:
      "See daily photos, read newsletters, track your child\u2019s progress, and stay connected with the center.",
    count: '5 features',
  },
  {
    id: 'staff',
    label: "I'm a Staff Member",
    icon: Users,
    color: 'christina-green',
    hex: '#4CAF50',
    bg: 'bg-green-50',
    border: 'border-green-200',
    activeBorder: 'border-[#4CAF50]',
    activeBg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-[#4CAF50]',
    labelColor: 'text-[#2E7D32]',
    ringColor: 'ring-green-300',
    description:
      'Clock in, enter meal counts, upload photos, manage your schedule, and grow your career.',
    count: '8 features',
  },
  {
    id: 'admin',
    label: "I'm Christina (Admin)",
    icon: Shield,
    color: 'christina-red',
    hex: '#C62828',
    bg: 'bg-red-50',
    border: 'border-red-200',
    activeBorder: 'border-[#C62828]',
    activeBg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-[#C62828]',
    labelColor: 'text-[#B71C1C]',
    ringColor: 'ring-red-300',
    description:
      'Run both centers from one dashboard. Schedule staff, track revenue, manage compliance, and lead your team.',
    count: '20 features',
  },
];

export function RoleFilter({ selectedRole, onRoleChange }: RoleFilterProps) {
  return (
    <div id="role-filter" className="py-10 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Who are you today?
          </h2>
          <p className="text-gray-500 text-sm">
            Pick your role to see only what matters to you, or browse
            everything.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            const Icon = role.icon;

            return (
              <button
                key={role.id}
                onClick={() =>
                  onRoleChange(isSelected ? null : role.id)
                }
                className={cn(
                  'relative text-left p-5 rounded-xl border-2 transition-all duration-200 group',
                  'hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  role.ringColor,
                  isSelected
                    ? [role.activeBorder, role.activeBg, 'shadow-md scale-[1.02]']
                    : ['border-gray-200 bg-white hover:border-gray-300']
                )}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <div
                    className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: role.hex }}
                  >
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}

                <div
                  className={cn(
                    'w-11 h-11 rounded-lg flex items-center justify-center mb-3 transition-colors',
                    isSelected ? role.iconBg : 'bg-gray-100 group-hover:' + role.iconBg
                  )}
                  style={isSelected ? { backgroundColor: role.hex + '1A' } : {}}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isSelected ? role.iconColor : 'text-gray-500'
                    )}
                    style={isSelected ? { color: role.hex } : {}}
                  />
                </div>

                <div
                  className={cn(
                    'font-semibold text-base mb-1 transition-colors',
                    isSelected ? role.labelColor : 'text-gray-800'
                  )}
                >
                  {role.label}
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mb-3">
                  {role.description}
                </p>

                <span
                  className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
                  style={
                    isSelected
                      ? {
                          backgroundColor: role.hex + '18',
                          color: role.hex,
                        }
                      : { backgroundColor: '#F3F4F6', color: '#6B7280' }
                  }
                >
                  {role.count}
                </span>
              </button>
            );
          })}
        </div>

        {selectedRole && (
          <div className="flex justify-center">
            <button
              onClick={() => onRoleChange(null)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors border border-gray-200 rounded-full px-4 py-1.5 hover:border-gray-300 hover:bg-gray-50"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Show Everything
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
