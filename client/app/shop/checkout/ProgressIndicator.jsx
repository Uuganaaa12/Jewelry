import { Check } from 'lucide-react';

export default function ProgressIndicator({ step }) {
  return (
    <div className='mt-4 flex items-center gap-2'>
      <StepCircle step={1} currentStep={step} />
      <StepLine active={step >= 2} />
      <StepCircle step={2} currentStep={step} />
      <StepLine active={step >= 3} />
      <StepCircle step={3} currentStep={step} />
    </div>
  );
}

function StepCircle({ step, currentStep }) {
  const isActive = currentStep >= step;
  const isComplete = currentStep > step;

  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${
        isActive
          ? 'border-[#0d0d0d] bg-[#0d0d0d] text-white'
          : 'border-[#0d0d0d]/30 text-[#0d0d0d]/30'
      }`}>
      {isComplete ? <Check size={16} /> : step}
    </div>
  );
}

function StepLine({ active }) {
  return (
    <div
      className={`h-0.5 w-12 ${active ? 'bg-[#0d0d0d]' : 'bg-[#0d0d0d]/30'}`}
    />
  );
}
