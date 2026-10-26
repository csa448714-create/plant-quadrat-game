import React, { useState } from 'react';
import {
  PlantSpeciesId,
  SpeciesCommunityStat,
  TruePopulationStat,
} from '../types/ecology';
import { PLANT_SPECIES_LIST, PLANT_SPECIES } from '../utils/communityGenerator';
import { findDominantSpecies } from '../utils/quadratMath';
import { BotanicalIcon } from './PlantIllustration';
import {
  BarChart3,
  Layers,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ComparisonStepProps {
  manualStats: Record<PlantSpeciesId, SpeciesCommunityStat> | null;
  randomStats: Record<PlantSpeciesId, SpeciesCommunityStat> | null;
  populationStats: Record<PlantSpeciesId, TruePopulationStat>;
  onRestartNewGame: () => void;
}

export const ComparisonStep: React.FC<ComparisonStepProps> = ({
  manualStats,
  randomStats,
  populationStats,
  onRestartNewGame,
}) => {
  const [activeMetricTab, setActiveMetricTab] = useState<'iv' | 'density' | 'frequency' | 'cover'>(
    'iv'
  );
  const [openInquiryIdx, setOpenInquiryIdx] = useState<number | null>(0);
  const [studentInquiryAnswers, setStudentInquiryAnswers] = useState<Record<number, string>>({
    0: '',
    1: '',
    2: '',
    3: '',
  });

  const manualDominant = manualStats ? findDominantSpecies(manualStats) : null;
  const randomDominant = randomStats ? findDominantSpecies(randomStats) : null;
  const trueDominant = findDominantSpecies(populationStats as any);

  // Inquiry Questions definition
  const inquiryQuestions = [
    {
      id: 0,
      question: '1. 자유 배치와 무작위 배치의 조사 결과가 다른 이유는 무엇일까요?',
      modelAnswer:
        '자유 배치는 조사자가 눈에 잘 띄거나 식물이 풍성한 특정 지점을 주관적으로 고르기 쉬워 "표본 추출 편향(Sampling bias)"이 발생합니다. 반면 무작위 배치는 주관적 선호 없이 풀밭 전체에 균등한 확률로 방형구를 배치하므로 조사자의 의도적 개입이 배제되기 때문입니다.',
    },
    {
      id: 1,
      question: '2. 학생이 식물이 많은 곳을 의도적으로 선택하면 어떤 편향이 발생할까요?',
      modelAnswer:
        '개체수가 밀집된 군생 구역에 방형구를 주로 놓게 되면, 밀도와 피도가 실제 전체 군집의 평균보다 과대평가(Overestimation)되는 양의 편향이 발생합니다. 반대로 듬성듬성 자라는 다른 종은 과소평가될 수 있습니다.',
    },
    {
      id: 2,
      question: '3. 어느 조사 방식이 전체 식물 군집의 특성을 더 잘 반영했나요?',
      modelAnswer:
        '이론적으로는 무작위 배치가 주관적 편향이 없어 모집단을 대표할 가능성이 높습니다. 다만 방형구 개수(N=5)가 적을 때는 우연한 위치 선정에 의한 "표본 오차(Sampling error)"가 발생할 수 있습니다. 따라서 무작위 추출법에 충분한 표본 크기를 확보하는 것이 가장 이상적입니다.',
    },
    {
      id: 3,
      question: '4. 방형구의 개수를 늘리면 조사 결과의 신뢰도는 어떻게 달라질까요?',
      modelAnswer:
        '방형구의 개수(표본 크기)를 5개에서 10개, 20개로 늘릴수록 대수의 법칙에 의해 우연에 의한 표본 오차가 급격히 줄어들고, 표본 평균이 전체 군집의 실제 참값에 더욱 정밀하게 수렴하게 됩니다.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Summary Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-emerald-700" />
          <h2 className="text-lg sm:text-xl font-bold text-stone-900">
            동일 군집에서의 표본 조사 방식 비교 및 종합 분석
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          동일한 식물 군집(시드 고정)에서 수행한 <strong>자유 배치(Manual)</strong>와{' '}
          <strong>무작위 배치(Random)</strong>, 그리고 전체 풀밭 전수 조사를 통한{' '}
          <strong className="text-emerald-800">실제 모집단 참값(True Population)</strong>을 직접
          비교해 보세요.
        </p>

        {/* Dominant Species Comparison Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-sky-700 block">자유 배치 우점종</span>
              <span className="text-sm font-bold text-sky-950">
                {manualDominant ? PLANT_SPECIES[manualDominant].koreanName : '미조사'}
              </span>
            </div>
            {manualDominant && <BotanicalIcon species={manualDominant} size={32} />}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-amber-700 block">무작위 배치 우점종</span>
              <span className="text-sm font-bold text-amber-950">
                {randomDominant ? PLANT_SPECIES[randomDominant].koreanName : '미조사'}
              </span>
            </div>
            {randomDominant && <BotanicalIcon species={randomDominant} size={32} />}
          </div>

          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-800 block">
                풀밭 전체 실제 우점종 (참값)
              </span>
              <span className="text-sm font-bold text-emerald-950">
                {PLANT_SPECIES[trueDominant].koreanName}
              </span>
            </div>
            <BotanicalIcon species={trueDominant} size={32} />
          </div>
        </div>
      </div>

      {/* Visual Bar Chart Comparison */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-stone-900">식물별 생태 지표 비교 차트</h3>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveMetricTab('iv')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeMetricTab === 'iv'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              중요치 (IV)
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricTab('density')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeMetricTab === 'density'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              밀도 (개체/m²)
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricTab('frequency')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeMetricTab === 'frequency'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              빈도 (%)
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricTab('cover')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeMetricTab === 'cover'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              피도 (%)
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-4 text-xs font-medium text-stone-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-sky-500" />
            <span>자유 배치 (Manual)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span>무작위 배치 (Random)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-600" />
            <span>전체 군집 참값 (Population)</span>
          </div>
        </div>

        {/* 4 Species Comparison Rows */}
        <div className="space-y-5 pt-2">
          {PLANT_SPECIES_LIST.map(spec => {
            const spId = spec.id;
            let mVal = manualStats ? getMetricValue(manualStats[spId], activeMetricTab) : 0;
            let rVal = randomStats ? getMetricValue(randomStats[spId], activeMetricTab) : 0;
            let pVal = getMetricValue(populationStats[spId] as any, activeMetricTab);

            const maxBarVal = activeMetricTab === 'iv' ? 180 : activeMetricTab === 'density' ? 16 : 100;

            const mPct = Math.min(100, (mVal / maxBarVal) * 100);
            const rPct = Math.min(100, (rVal / maxBarVal) * 100);
            const pPct = Math.min(100, (pVal / maxBarVal) * 100);

            return (
              <div key={spec.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                  <div className="flex items-center gap-2">
                    <BotanicalIcon species={spec.id} size={24} />
                    <span>{spec.koreanName}</span>
                    <span className="font-normal text-stone-400 font-serif italic text-[11px]">
                      {spec.scientificName}
                    </span>
                  </div>
                </div>

                {/* 3 Comparative Bars */}
                <div className="space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  {/* Manual Bar */}
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="w-20 text-stone-500 shrink-0">자유 배치:</span>
                    <div className="flex-1 bg-stone-200 h-3.5 rounded overflow-hidden">
                      <div
                        className="bg-sky-500 h-full rounded transition-all duration-300"
                        style={{ width: `${mPct}%` }}
                      />
                    </div>
                    <span className="w-14 text-right font-semibold text-stone-700">
                      {manualStats ? mVal.toFixed(1) : '-'}
                    </span>
                  </div>

                  {/* Random Bar */}
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="w-20 text-stone-500 shrink-0">무작위 배치:</span>
                    <div className="flex-1 bg-stone-200 h-3.5 rounded overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded transition-all duration-300"
                        style={{ width: `${rPct}%` }}
                      />
                    </div>
                    <span className="w-14 text-right font-semibold text-stone-700">
                      {randomStats ? rVal.toFixed(1) : '-'}
                    </span>
                  </div>

                  {/* True Population Bar */}
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="w-20 text-emerald-800 font-semibold shrink-0">전체 참값:</span>
                    <div className="flex-1 bg-emerald-100 h-3.5 rounded overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded transition-all duration-300"
                        style={{ width: `${pPct}%` }}
                      />
                    </div>
                    <span className="w-14 text-right font-bold text-emerald-900">
                      {pVal.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Population Grid Methodology Note */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-600 leading-relaxed">
          <p>
            <strong>ℹ️ 전체 군집 참값 산출 기준 안내:</strong>
            풀밭 전체 면적(1000×750)을 동일 면적의 <strong>80개 격자(10×8 블록)</strong>로 분할하여
            모집단 빈도(% 출현 격자 비율)를 산출하였으며, 전체 식물 개체 총수 및 전수 투영 면적으로
            밀도와 피도를 정밀 계산하였습니다.
          </p>
        </div>
      </div>

      {/* Inquiry Questions & Ecological Discussion */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-stone-900">
            생태학적 탐구 토론 및 심화 질문
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-stone-600">
          표본 조사 결과를 바탕으로 질문에 대한 자신의 생각을 적어보고, 예시 모범 답안을 확인해
          보세요.
        </p>

        <div className="space-y-3">
          {inquiryQuestions.map((q, idx) => {
            const isOpen = openInquiryIdx === idx;
            return (
              <div key={q.id} className="border border-stone-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenInquiryIdx(isOpen ? null : idx)}
                  className="w-full text-left p-4 bg-stone-50 hover:bg-stone-100 flex items-center justify-between gap-3 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-stone-900">{q.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-stone-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white space-y-3 text-xs">
                    <div>
                      <label className="block text-stone-600 font-medium mb-1.5">
                        나의 탐구 의견 작성:
                      </label>
                      <textarea
                        rows={2}
                        value={studentInquiryAnswers[idx]}
                        placeholder="자유롭게 자신의 분석 의견을 작성해 보세요..."
                        onChange={e =>
                          setStudentInquiryAnswers({
                            ...studentInquiryAnswers,
                            [idx]: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs focus:bg-white focus:outline-emerald-600"
                      />
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>생태학적 해석 및 모범 해설:</span>
                      </div>
                      <p className="leading-relaxed text-stone-700">{q.modelAnswer}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Synthesis Summary: Sampling Bias vs Sampling Error */}
      <div className="bg-gradient-to-r from-emerald-900 to-green-950 text-white rounded-2xl p-6 shadow-md space-y-3">
        <h3 className="text-base font-bold flex items-center gap-2">
          <span>🌿 학습 정리: 표본 추출 편향(Bias)과 표본 오차(Error)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-emerald-100 leading-relaxed">
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
            <h4 className="font-bold text-white mb-1">1. 표본 추출 편향 (Sampling Bias)</h4>
            <p>
              자유 배치처럼 연구자의 주관이나 시각적 매력도가 작용하면 표본이 모집단의 특정 구역으로
              체계적으로 치우치는 현상입니다. 이는 표본의 개수를 늘려도 주관적 기준이 유지되는 한
              해소되지 않습니다.
            </p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
            <h4 className="font-bold text-white mb-1">2. 표본 오차 (Sampling Error)</h4>
            <p>
              무작위 배치를 하더라도 표본 수(N=5)가 적으면 우연에 의해 식물이 적은 곳만 뽑히거나 특정
              종이 과다하게 뽑힐 수 있습니다. 이는 편향과 달리 방형구 수를 충분히 늘리면 자연스럽게
              해소됩니다.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onRestartNewGame}
            className="px-5 py-2.5 text-xs font-bold text-emerald-950 bg-white hover:bg-emerald-50 rounded-lg shadow-sm transition-colors"
          >
            새로운 풀밭 군집으로 다시 탐구하기
          </button>
        </div>
      </div>
    </div>
  );
};

function getMetricValue(
  stat: SpeciesCommunityStat,
  tab: 'iv' | 'density' | 'frequency' | 'cover'
): number {
  if (tab === 'iv') return stat.importanceValue;
  if (tab === 'density') return stat.density;
  if (tab === 'frequency') return stat.frequency;
  if (tab === 'cover') return stat.cover;
  return 0;
}
