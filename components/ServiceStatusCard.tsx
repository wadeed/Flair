import React from 'react';
import { ServiceStatusEnum } from '../types';
import type { ServiceStatus } from '../types';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, QuestionMarkCircleIcon, ChevronDownIcon, ExternalLinkIcon } from './Icons';

interface ServiceStatusCardProps {
  service: ServiceStatus;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const statusConfig = {
  [ServiceStatusEnum.OPERATIONAL]: {
    label: 'Operational',
    icon: <CheckCircleIcon className="w-6 h-6 text-flair-green" />,
    borderColor: 'border-flair-green',
    textColor: 'text-flair-green',
  },
  [ServiceStatusEnum.DEGRADED]: {
    label: 'Degraded Performance',
    icon: <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />,
    borderColor: 'border-amber-500',
    textColor: 'text-amber-500',
  },
  [ServiceStatusEnum.OUTAGE]: {
    label: 'Major Outage',
    icon: <XCircleIcon className="w-6 h-6 text-red-500" />,
    borderColor: 'border-red-500',
    textColor: 'text-red-500',
  },
  [ServiceStatusEnum.UNKNOWN]: {
    label: 'Unknown',
    icon: <QuestionMarkCircleIcon className="w-6 h-6 text-gray-500" />,
    borderColor: 'border-gray-400',
    textColor: 'text-gray-500',
  },
};

const smallStatusConfig = {
  [ServiceStatusEnum.OPERATIONAL]: {
    icon: <CheckCircleIcon className="w-5 h-5 text-flair-green" />,
    label: 'Operational',
  },
  [ServiceStatusEnum.DEGRADED]: {
    icon: <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />,
    label: 'Degraded',
  },
  [ServiceStatusEnum.OUTAGE]: {
    icon: <XCircleIcon className="w-5 h-5 text-red-500" />,
    label: 'Outage',
  },
  [ServiceStatusEnum.UNKNOWN]: {
    icon: <QuestionMarkCircleIcon className="w-5 h-5 text-gray-500" />,
    label: 'Unknown',
  },
};


const ServiceStatusCard: React.FC<ServiceStatusCardProps> = ({ service, isExpanded, onToggleExpand }) => {
  const config = statusConfig[service.status] || statusConfig[ServiceStatusEnum.UNKNOWN];

  return (
    <div
      className={`
        bg-flair-surface/80 backdrop-blur-sm border border-white/10 border-t-4 ${config.borderColor} rounded-lg p-5 flex flex-col 
        h-full transition-all duration-300 hover:shadow-2xl hover:border-white/20
        hover:-translate-y-1 cursor-pointer
      `}
      onClick={onToggleExpand}
      aria-expanded={isExpanded}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggleExpand()}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-text-light">{service.name}</h2>
        <div className="flex items-center space-x-3 shrink-0">
          {config.icon}
          <ChevronDownIcon className={`w-5 h-5 text-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Card Body */}
      <div className={`text-sm font-semibold mb-3 ${config.textColor}`}>
        {config.label}
      </div>
      <p className="text-text-muted text-sm flex-grow min-h-[40px]">
        {service.summary}
      </p>

      {/* Collapsible Details Section */}
      <div className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[40rem]' : 'max-h-0'}`}>
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
          
          {(service.details && service.details.trim() !== '') && (
            <div>
              <h3 className="text-sm font-semibold text-text-light mb-2">Details</h3>
              <p className="text-text-muted text-sm whitespace-pre-wrap">{service.details}</p>
            </div>
          )}

          {service.subServices && service.subServices.length > 0 && (
             <div>
              <h3 className="text-sm font-semibold text-text-light mb-2">Component Status</h3>
              <ul className="space-y-2">
                {service.subServices.map((sub, index) => {
                  const subConfig = smallStatusConfig[sub.status] || smallStatusConfig[ServiceStatusEnum.UNKNOWN];
                  return (
                    <li key={index} className="flex items-center justify-between text-sm">
                      <span className="text-text-light">{sub.name}</span>
                      <div className="flex items-center space-x-2">
                        {subConfig.icon}
                        <span className="text-text-muted text-xs w-16">{subConfig.label}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {service.history && service.history.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-light mb-2">24-Hour History</h3>
              <ul className="space-y-3">
                {service.history.map((item, index) => {
                  const historyConfig = smallStatusConfig[item.status] || smallStatusConfig[ServiceStatusEnum.UNKNOWN];
                  return (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 pt-0.5">{historyConfig.icon}</div>
                      <div>
                        <p className="text-sm font-medium text-text-light">{item.description}</p>
                        <p className="text-xs text-text-muted">{item.timestamp}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {service.statusPageUrl && (
            <div>
              <a
                href={service.statusPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center space-x-2 text-sm text-flair-blue hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-flair-surface focus:ring-flair-blue rounded"
              >
                <span>Official Status Page</span>
                <ExternalLinkIcon className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceStatusCard;