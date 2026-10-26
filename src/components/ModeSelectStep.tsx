import React from 'react';
import { SamplingMode } from '../types/ecology';
import { MousePointer, Shuffle, CheckCircle, ArrowRight, Layers } from 'lucide-react';

interface ModeSelectStepProps {
  currentMode: SamplingMode;
  manualDone: boolean;
  randomDone: boolean;
  onSelectMode: (mode: SamplingMode) => void;
  onGoToComparison: () => void;
}

export const ModeSelectStep: React.FC<ModeSelectStepProps> = ({
  currentMode,
  manualDone,
  randomDone,
  onSelectMode,
  onGoToComparison,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Step Header */}
      <div className="bg-white p-6 border-3 border-stone-900 shadow-[5px_5px_0px_#1c1917] space-y-2">
        <h2 className="text-lg sm:text-xl font-bold text-stone-900 pixel-font">
          [QUEST] 표본 조사 방식(Sampling Method) 선택
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pixel-font">
          두 가지 방식 중 먼저 수행할 조사 방식을 선택하세요. 어느 방식을 먼저 선택하든{' '}
          <strong className="text-emerald-800 underline decoration-emerald-400">
            동일한 풀밭 식물 군집
          </strong>
          에서 두 조사를 모두 진행한 후 최종 비교하게 됩니다.
        </p>
      </div>

      {/* Mode Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Mode A: Manual Sampling */}
        <div
          onClick={() => onSelectMode('manual')}
          className={`p-6 border-3 transition-all cursor-pointer flex flex-col justify-between ${
            currentMode === 'manual'
              ? 'border-sky-700 bg-sky-50/50 shadow-[5px_5px_0px_#0369a1]'
              : 'border-stone-900 bg-white hover:bg-stone-50 shadow-[4px_4px_0px_#1c1917]'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-sky-100 text-sky-800 border-2 border-stone-900 flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <MousePointer className="w-6 h-6" />
              </div>
              {manualDone ? (
                <span className="flex items-center gap-1 text-xs font-bold text-sky-950 bg-sky-200 border-2 border-stone-900 px-2 py-0.5 shadow-[1px_1px_0px_#000] pixel-font">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>조사 완료 [CLEAR]</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-stone-500 border border-stone-400 px-1.5 py-0.5 pixel-font">미완료</span>
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900 pixel-font">A. 자유 배치 모드 (Manual)</h3>
              <p className="text-xs text-stone-500 mt-1 pixel-font">학생이 원하는 위치에 직접 배치</p>
            </div>

            <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-sky-600 font-bold">•</span>
                <span>학생이 마우스나 터치로 방형구 5개를 원하는 위치로 드래그하여 설치합니다.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-sky-600 font-bold">•</span>
                <span>방형구끼리 서로 겹치지 않도록 주의하며 풀밭 안쪽으로 배치합니다.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-sky-600 font-bold">•</span>
                <span>연구자의 주관이 개입되었을 때 어떤 편향이 생길지 관찰해 볼 수 있습니다.</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => onSelectMode('manual')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-2xs transition-colors"
            >
              <span>자유 배치 모드로 조사하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mode B: Random Sampling */}
        <div
          onClick={() => onSelectMode('random')}
          className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            currentMode === 'random'
              ? 'border-emerald-600 bg-emerald-50/30 shadow-md ring-2 ring-emerald-500/20'
              : 'border-stone-200 bg-white hover:border-emerald-300 shadow-xs'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Shuffle className="w-6 h-6" />
              </div>
              {randomDone ? (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>조사 완료</span>
                </span>
              ) : (
                <span className="text-xs font-semibold text-stone-400">미완료</span>
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900">B. 무작위 배치 모드 (Random Sampling)</h3>
              <p className="text-xs text-stone-500 mt-1">균등 확률로 자동 무작위 배치</p>
            </div>

            <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>알고리즘이 식물 밀도나 선호와 무관하게 균등한 확률로 5개 위치를 선정합니다.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>'다시 배치' 버튼으로 새로운 무작위 위치를 재추출할 수 있습니다.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>조사자의 주관적 편향을 배제하고 모집단의 특성을 추정할 수 있습니다.</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => onSelectMode('random')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition-colors"
            >
              <span>무작위 배치 모드로 조사하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Direct link to comparison if both are done */}
      {manualDone && randomDone && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-emerald-950">
                두 조사 방식(자유 & 무작위)이 모두 완료되었습니다!
              </p>
              <p className="text-xs text-emerald-700">
                언제든지 비교 및 탐구 화면으로 이동하여 결과를 비교해 볼 수 있습니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onGoToComparison}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm whitespace-nowrap"
          >
            <span>비교 분석 화면으로 이동</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
