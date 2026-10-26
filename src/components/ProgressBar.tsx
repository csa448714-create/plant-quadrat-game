import React from 'react';
import { GameStep, TeamSize } from '../types/ecology';
import { Check, Users } from 'lucide-react';

interface ProgressBarProps {
  currentStep: GameStep;
  teamSize: TeamSize;
  assignedQuadratId: number;
  completedQuadratCount: number;
  isTableDone: boolean;
  isDominantDone: boolean;
  onSelectStep: (step: GameStep) => void;
}

interface StepItem {
  key: GameStep;
  number: number;
  label: string;
}

const STEPS: StepItem[] = [
  { key: 'intro', number: 1, label: '시작 안내' },
  { key: 'role_select', number: 2, label: '담당 선택' },
  { key: 'quadrat_survey', number: 3, label: '1단계 [개별] 조사' },
  { key: 'analysis_table', number: 4, label: '2·3단계 [협동] 분석' },
  { key: 'dominant_species', number: 5, label: '우점종 결정' },
  { key: 'final_report', number: 6, label: '모둠 리포트' },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  teamSize,
  assignedQuadratId,
  completedQuadratCount,
  isTableDone,
  isDominantDone,
  onSelectStep,
}) => {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);
  const activeCompleted = Math.min(teamSize, completedQuadratCount);
  const progressPercent = Math.round(((currentIndex + 1) / STEPS.length) * 100);

  return (
    <div className="bg-[#f5f2eb] border-b-3 border-stone-900 py-2.5 px-4 sm:px-6 select-none">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Collaborative Info & Progress Gauge */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-800 pixel-font">
          <span className="flex items-center gap-1 font-bold text-[#052e16] bg-[#86efac] px-2 py-0.5 border border-stone-900 shadow-[1px_1px_0px_#000]">
            <Users className="w-3.5 h-3.5 text-emerald-900" />
            <span>{teamSize}인 모둠</span>
          </span>
          <span className="text-stone-500">담당:</span>
          <span className="font-bold text-stone-900 bg-[#fef08a] px-2 py-0.5 border border-stone-900 shadow-[1px_1px_0px_#000]">
            #{assignedQuadratId}번
          </span>
          <span className="text-stone-500 ml-1">방형구 완료:</span>
          <span className="text-[11px] px-2 py-0.5 border border-stone-900 shadow-[1px_1px_0px_#000] font-bold bg-white text-stone-900 font-mono">
            {activeCompleted} / {teamSize}
          </span>

          {/* Mini Pixel Progress Bar */}
          <div className="hidden lg:flex items-center gap-1.5 ml-2">
            <span className="text-[10px] text-stone-500">진행률:</span>
            <div className="w-20 h-3 bg-stone-300 border border-black overflow-hidden relative">
              <div
                className="h-full bg-[#15803d]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800">{progressPercent}%</span>
          </div>
        </div>

        {/* Horizontal Step Sequence */}
        <nav aria-label="진행 단계" className="overflow-x-auto pb-1 md:pb-0">
          <ol className="flex items-center gap-1 sm:gap-1.5 text-xs min-w-max pixel-font">
            {STEPS.map((step, idx) => {
              const isActive = step.key === currentStep;
              const isPast = idx < currentIndex;
              const isClickable =
                idx <= currentIndex ||
                (currentIndex >= 1 && step.key === 'analysis_table') ||
                (step.key === 'analysis_table' && activeCompleted >= teamSize) ||
                (step.key === 'dominant_species' && isTableDone) ||
                (step.key === 'final_report' && isDominantDone);

              return (
                <li key={step.key} className="flex items-center">
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => onSelectStep(step.key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold transition-all border ${
                      isActive
                        ? 'bg-[#15803d] text-white border-black shadow-[2px_2px_0px_#000]'
                        : isPast
                        ? 'text-[#052e16] bg-[#bbf7d0] border-[#166534] hover:bg-[#86efac] shadow-[1px_1px_0px_#000]'
                        : isClickable
                        ? 'text-stone-700 hover:text-black bg-white border-stone-400 shadow-[1px_1px_0px_#000]'
                        : 'text-stone-400 cursor-not-allowed opacity-50 border-stone-300'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 flex items-center justify-center text-[10px] font-bold border border-black ${
                        isActive
                          ? 'bg-white text-emerald-950'
                          : isPast
                          ? 'bg-[#15803d] text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isPast ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : step.number}
                    </span>
                    <span className="whitespace-nowrap">{step.label}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <span className="mx-0.5 text-stone-400 font-bold select-none">▶</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};
