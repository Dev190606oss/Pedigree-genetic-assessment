import React from 'react';
import { Check } from 'lucide-react';

export const Stepper = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="w-full py-4 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[680px]">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <React.Fragment key={step.id || index}>
              <div
                onClick={() => onStepClick && isCompleted && onStepClick(index)}
                className={`flex flex-col items-center group ${
                  onStepClick && isCompleted ? 'cursor-pointer' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-xs transition-all duration-200 ${
                    isCompleted
                      ? 'bg-brand-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-brand-50 text-brand-700 border-2 border-brand-600 ring-4 ring-brand-50'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : index + 1}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent
                      ? 'text-brand-700 font-semibold'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 -mt-5 transition-all duration-200 ${
                    index < currentStep ? 'bg-brand-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
