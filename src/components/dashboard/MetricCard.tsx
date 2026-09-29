import React from 'react';
import { LucideIcon } from 'lucide-react';
import { sound } from '../../utils/sound';

interface MetricCardProps {
  title: string;
  titleMr?: string;
  value: string | number;
  subtitle?: string;
  subtitleMr?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
  onClick?: () => void;
  isMarathi?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  titleMr,
  value,
  subtitle,
  subtitleMr,
  icon: Icon,
  variant = 'blue',
  onClick,
  isMarathi = false,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'green':
        return {
          bg: 'bg-green-50/80',
          text: 'text-success-600',
          iconBg: 'bg-green-100 text-success-600',
          border: 'border-green-200/60',
          glow: 'group-hover:border-green-300',
        };
      case 'orange':
        return {
          bg: 'bg-amber-50/80',
          text: 'text-warning-600',
          iconBg: 'bg-amber-100 text-warning-600',
          border: 'border-amber-200/60',
          glow: 'group-hover:border-amber-300',
        };
      case 'red':
        return {
          bg: 'bg-red-50/80',
          text: 'text-danger-600',
          iconBg: 'bg-red-100 text-danger-600',
          border: 'border-red-200/60',
          glow: 'group-hover:border-red-300',
        };
      case 'purple':
        return {
          bg: 'bg-indigo-50/80',
          text: 'text-indigo-700',
          iconBg: 'bg-indigo-100 text-indigo-700',
          border: 'border-indigo-200/60',
          glow: 'group-hover:border-indigo-300',
        };
      case 'gray':
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          iconBg: 'bg-gray-200 text-gray-700',
          border: 'border-gray-200',
          glow: 'group-hover:border-gray-300',
        };
      case 'blue':
      default:
        return {
          bg: 'bg-blue-50/80',
          text: 'text-brand-800',
          iconBg: 'bg-blue-100 text-brand-700',
          border: 'border-blue-200/60',
          glow: 'group-hover:border-blue-300',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      onClick={() => {
        if (onClick) {
          sound.playClick();
          onClick();
        }
      }}
      className={`group relative p-3.5 sm:p-4 rounded-2xl bg-white border ${colors.border} ${colors.glow} shadow-card hover:shadow-elevated transition-all duration-200 select-none ${
        onClick ? 'cursor-pointer active-press' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-gray-600 tracking-tight leading-snug">
          {isMarathi && titleMr ? titleMr : title}
        </span>
        <div className={`w-8 h-8 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
          <Icon className="w-4 h-4 stroke-[2.2]" />
        </div>
      </div>

      <div className="mt-2.5">
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${colors.text}`}>
          {value}
        </div>
        {(subtitle || subtitleMr) && (
          <p className="mt-1 text-[11px] text-gray-600 font-medium">
            {isMarathi && subtitleMr ? subtitleMr : subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
