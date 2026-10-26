import React, { useState } from 'react';
import { PlantSpeciesId, SpeciesCommunityStat, TeamSize } from '../types/ecology';
import { PLANT_SPECIES_LIST, PLANT_SPECIES } from '../utils/communityGenerator';
import { findDominantSpecies } from '../utils/quadratMath';
import { BotanicalIcon } from './PlantIllustration';
import { CheckCircle2, XCircle, Award, ArrowRight, Sparkles } from 'lucide-react';

interface DominantSpeciesStepProps {
  stats: Record<PlantSpeciesId, SpeciesCommunityStat>;
  teamSize?: TeamSize;
  selectedSpecies: PlantSpeciesId | null;
  reasoning: string;
  onSelectSpecies: (sp: PlantSpeciesId) => void;
  onChangeReasoning: (text: string) => void;
  onProceedToFinalReport: () => void;
}

export const DominantSpeciesStep: React.FC<DominantSpeciesStepProps> = ({
  stats,
  teamSize = 5,
  selectedSpecies,
  reasoning,
  onSelectSpecies,
  onChangeReasoning,
  onProceedToFinalReport,
}) => {
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState<boolean>(false);
  const correctDominant = findDominantSpecies(stats);
  const isCorrect = selectedSpecies === correctDominant;

  const handleCheck = () => {
    if (!selectedSpecies) return;
    setHasCheckedAnswer(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2 select-none">
      {/* Header Card */}
      <div className="bg-[#fcfaf5] p-5 sm:p-6 border-4 border-stone-900 shadow-[6px_6px_0px_#1c1917] space-y-2">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-600" />
          <h2 className="text-lg font-bold text-stone-900 pixel-font">
            [3단계 우점종 결정 · 협동활동] 중요치(IV) 기반 풀밭 군집의 최종 우점종 결정
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-stone-700 pixel-font leading-relaxed">
          모둠원들과 3단계에서 조사·계산한 <strong>중요치(Importance Value, IV)</strong>를 종합하여,
          이 풀밭 군집의 생태적 우위를 차지하는 <strong>우점종(Dominant species)</strong>을 최종 결정하고 그 이유를 작성해 보세요.
        </p>
      </div>

      {/* Species Selection Radio Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLANT_SPECIES_LIST.map(spec => {
          const isSelected = selectedSpecies === spec.id;
          const stat = stats[spec.id];
          const isTrueDominant = spec.id === correctDominant;

          let cardBorder = 'border-stone-900 bg-white shadow-[3px_3px_0px_#1c1917] hover:bg-stone-50';
          if (isSelected) {
            cardBorder = 'border-emerald-700 bg-emerald-50/80 shadow-[4px_4px_0px_#065f46]';
          }
          if (hasCheckedAnswer) {
            if (isTrueDominant) {
              cardBorder = 'border-emerald-700 bg-emerald-100 shadow-[5px_5px_0px_#065f46] ring-3 ring-emerald-600';
            } else if (isSelected && !isCorrect) {
              cardBorder = 'border-rose-700 bg-rose-50 shadow-[4px_4px_0px_#be123c]';
            }
          }

          return (
            <div
              key={spec.id}
              onClick={() => {
                if (!hasCheckedAnswer) onSelectSpecies(spec.id);
              }}
              className={`p-4 border-3 transition-all cursor-pointer flex flex-col justify-between ${cardBorder}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-[#1a1e12] border-2 border-stone-900 flex items-center justify-center shadow-[2px_2px_0px_#000]">
                      <BotanicalIcon species={spec.id} size={34} />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm pixel-font">{spec.koreanName}</h3>
                      <p className="text-[11px] text-stone-500 font-serif italic">
                        {spec.scientificName}
                      </p>
                    </div>
                  </div>

                  <input
                    type="radio"
                    name="dominant_species"
                    checked={isSelected}
                    onChange={() => {
                      if (!hasCheckedAnswer) onSelectSpecies(spec.id);
                    }}
                    className="w-4 h-4 text-emerald-600 cursor-pointer"
                  />
                </div>

                <div className="bg-[#f5f5f4] border border-stone-300 p-2.5 my-2 text-xs space-y-1 font-mono pixel-font">
                  <div className="flex justify-between text-stone-600">
                    <span>상대밀도:</span>
                    <span className="font-semibold">{stat.relativeDensity.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>상대빈도:</span>
                    <span className="font-semibold">{stat.relativeFrequency.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>상대피도:</span>
                    <span className="font-semibold">{stat.relativeCover.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-amber-950 font-bold pt-1 border-t border-stone-300">
                    <span>중요치 (IV):</span>
                    <span className="text-sm text-emerald-800">{stat.importanceValue.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {hasCheckedAnswer && isTrueDominant && (
                <div className="mt-2 text-xs font-bold text-emerald-800 flex items-center gap-1 pixel-font">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>★ 우점종 정답 (중요치 1위)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Student Reasoning Input */}
      <div className="bg-[#fcfaf5] p-5 border-3 border-stone-900 shadow-[5px_5px_0px_#1c1917] space-y-3">
        <label className="block text-sm font-bold text-stone-900 pixel-font">
          우점종으로 선택한 이유를 작성해 보세요
        </label>
        <textarea
          rows={3}
          value={reasoning}
          placeholder={`예: 4종의 식물 중 중요치(IV)가 ${stats[correctDominant].importanceValue.toFixed(1)}로 가장 높아, 풀밭 군집 전체에서 실질적인 점유 면적과 영향력이 가장 크기 때문입니다.`}
          onChange={e => onChangeReasoning(e.target.value)}
          className="w-full p-3 border-2 border-stone-900 text-xs sm:text-sm bg-white focus:outline-emerald-600 leading-relaxed pixel-font font-mono"
        />
        <div className="flex justify-end">
          {!hasCheckedAnswer ? (
            <button
              type="button"
              disabled={!selectedSpecies}
              onClick={handleCheck}
              className={`px-5 py-2.5 text-xs font-bold border-2 border-stone-900 pixel-btn pixel-font cursor-pointer ${
                selectedSpecies
                  ? 'bg-[#15803d] hover:bg-[#166534] text-white'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              우점종 판별 결과 확인하기
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-900 pixel-font bg-emerald-100 px-3 py-1 border-2 border-emerald-700">
              판별 확인 완료 ✓
            </span>
          )}
        </div>
      </div>

      {/* Explanation Banner after Check */}
      {hasCheckedAnswer && (
        <div className="bg-white border-4 border-stone-900 shadow-[6px_6px_0px_#1c1917] p-5 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="font-bold text-emerald-950 text-sm sm:text-base pixel-font">
                  🎉 정답입니다! {PLANT_SPECIES[correctDominant].koreanName}이(가) 이 풀밭의 우점종입니다!
                </h3>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-rose-600" />
                <h3 className="font-bold text-stone-900 text-sm sm:text-base pixel-font">
                  다시 확인해 보세요! 정답은 {PLANT_SPECIES[correctDominant].koreanName}입니다.
                </h3>
              </>
            )}
          </div>

          <div className="text-xs text-stone-800 leading-relaxed space-y-2 bg-[#f0fdf4] p-3.5 border-2 border-emerald-700 pixel-font">
            <p className="font-bold text-emerald-950">
              💡 중요치(Importance Value)와 우점종 판별의 생태적 기준:
            </p>
            <p>
              단순히 머릿수(개체수)만 많다고 해서 군집의 우점종이 되는 것은 아닙니다. 강아지풀은 개체수가 많았으나, 잎이 가늘어 풀밭 표면을 덮는 면적(피도)이 좁았습니다.
            </p>
            <p>
              반면 <strong>{PLANT_SPECIES[correctDominant].koreanName}</strong>은 둥근 잎으로 지표면을 덮는 피도(상대피도 1위)와 모든 방형구에 나타나는 높은 출현 빈도(100%)를 바탕으로, 세 상대값을 종합한 <strong>중요치(IV: {stats[correctDominant].importanceValue.toFixed(1)})</strong>에서 최고점을 기록하여 군집의 외관과 생태적 기능을 지배하는 <strong>우점종</strong>으로 판정됩니다!
            </p>
          </div>

          {/* Next Flow Navigation */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onProceedToFinalReport}
              className="flex items-center gap-2 px-6 py-3 bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs sm:text-sm border-2 border-stone-900 pixel-btn cursor-pointer pixel-font shadow-[3px_3px_0px_#000]"
            >
              <span>모둠 종합 분석 리포트 및 탐구 토론 확인하기 [NEXT]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
