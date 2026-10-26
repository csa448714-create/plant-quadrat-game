import React from 'react';
import { PLANT_SPECIES_LIST } from '../utils/communityGenerator';
import { BotanicalIcon } from './PlantIllustration';
import { TeamSize } from '../types/ecology';
import { Play, Sparkles, BookOpen, Users, CheckCircle2 } from 'lucide-react';

interface IntroStepProps {
  teamSize: TeamSize;
  onChangeTeamSize: (size: TeamSize) => void;
  onStartGame: () => void;
}

export const IntroStep: React.FC<IntroStepProps> = ({
  teamSize,
  onChangeTeamSize,
  onStartGame,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-7 py-3 select-none">
      {/* Hero Banner (16-bit Retro RPG Theme) */}
      <div className="relative overflow-hidden bg-[#242b18] text-white p-7 sm:p-10 border-4 border-stone-900 shadow-[8px_8px_0px_#1c1917]">
        {/* Subtle Pixel Background Pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #3f4f24 25%, transparent 25%),
              linear-gradient(-45deg, #3f4f24 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #3f4f24 75%),
              linear-gradient(-45deg, transparent 75%, #3f4f24 75%)
            `,
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          }}
        />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#161d0f] border-2 border-[#84cc16] shadow-[2px_2px_0px_#000] text-[#bef264] text-xs font-bold pixel-font">
            <Sparkles className="w-3.5 h-3.5" />
            <span>고등학교 생명과학 16비트 레트로 RPG 생태 시뮬레이션</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#facc15] leading-tight pixel-font drop-shadow-[3px_3px_0px_#000]">
            풀밭의 우점종을 찾아라!
          </h1>

          <p className="text-[#f7fee7] text-xs sm:text-sm leading-relaxed pixel-font">
            따뜻한 초원으로 생태 탐험을 떠나보세요! 모둠원들과 함께 무작위로 선정된 방형구를 나누어 조사하고,<br />
            식물들의 <strong>개체수</strong>와 <strong>피도(%)</strong>를 정밀 측정하여 <strong>밀도, 빈도, 피도, 중요치(Importance Value)</strong>를 계산한 뒤,<br />
            이 풀밭 군집을 지배하는 <strong>우점종(Dominant species)</strong>을 판별해 보세요!
          </p>

          {/* Team Size Selection in Intro */}
          <div className="bg-[#1a2113] p-3 border-2 border-[#3f4f24] space-y-2">
            <span className="text-xs font-bold text-[#facc15] pixel-font block">
              [모둠 인원 선택]
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onChangeTeamSize(4)}
                className={`px-3 py-1.5 text-xs font-bold border-2 pixel-btn cursor-pointer pixel-font ${
                  teamSize === 4
                    ? 'bg-[#fef08a] text-black border-black shadow-[2px_2px_0px_#000]'
                    : 'bg-[#28321c] text-[#d9f99d] border-[#3f4f24] hover:bg-[#344125]'
                }`}
              >
                👥 4인 1모둠 (방형구 1~4번 · 4m²)
              </button>

              <button
                type="button"
                onClick={() => onChangeTeamSize(5)}
                className={`px-3 py-1.5 text-xs font-bold border-2 pixel-btn cursor-pointer pixel-font ${
                  teamSize === 5
                    ? 'bg-[#fef08a] text-black border-black shadow-[2px_2px_0px_#000]'
                    : 'bg-[#28321c] text-[#d9f99d] border-[#3f4f24] hover:bg-[#344125]'
                }`}
              >
                👥 5인 1모둠 (방형구 1~5번 · 5m²)
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onStartGame}
              className="flex items-center gap-2 px-6 py-3 bg-[#84cc16] hover:bg-[#a3e635] text-stone-950 font-extrabold text-sm border-3 border-black pixel-btn cursor-pointer pixel-font shadow-[3px_3px_0px_#000]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>담당 방형구 선택하고 시작하기 [START]</span>
            </button>
            <span className="text-xs text-[#a3e635] font-mono bg-black/60 px-2.5 py-1.5 border border-[#3f4f24] pixel-font">
              ✓ 전 기기 100% 동일한 고정 군집
            </span>
          </div>
        </div>

        {/* Ambient botanical illustration background accents */}
        <div className="absolute right-4 bottom-4 opacity-50 pointer-events-none hidden sm:block">
          <div className="flex gap-4">
            <BotanicalIcon species="clover" size={68} />
            <BotanicalIcon species="dandelion" size={68} />
            <BotanicalIcon species="violet" size={68} />
            <BotanicalIcon species="foxtail" size={68} />
          </div>
        </div>
      </div>

      {/* 4 Investigation Species Specimen Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-base pixel-font">
          <BookOpen className="w-5 h-5 text-emerald-800" />
          <h2>오늘 조사할 풀밭의 대표 식물 4종</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANT_SPECIES_LIST.map(spec => (
            <div
              key={spec.id}
              className="bg-[#fcfaf5] p-4 border-3 border-stone-900 shadow-[4px_4px_0px_#1c1917] flex flex-col justify-between hover:bg-white transition-colors"
            >
              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-12 h-12 bg-[#1a1e12] border-2 border-stone-900 flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <BotanicalIcon species={spec.id} size={42} />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm pixel-font">{spec.koreanName}</h3>
                    <p className="text-[11px] text-stone-500 font-serif italic">{spec.scientificName}</p>
                  </div>
                </div>
                <p className="text-[11px] text-stone-700 leading-relaxed mb-2 pixel-font">
                  {spec.characteristics}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-300 text-[11px] text-emerald-900 font-bold pixel-font">
                {spec.habit}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Learning Objectives Card */}
      <div className="bg-[#fcfaf5] p-5 border-3 border-stone-900 shadow-[5px_5px_0px_#1c1917] space-y-3.5">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 pixel-font">
          <Sparkles className="w-5 h-5 text-emerald-800" />
          <span>방형구법 탐구 활동 및 생태 지표 학습 순서</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-700 pixel-font">
          <div className="bg-white p-3.5 border-2 border-stone-900 shadow-[2px_2px_0px_#1c1917] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-stone-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>1. 담당 방형구 정밀 관측</span>
            </div>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              자신이 맡은 방형구를 클릭하여 확대하고, 10×10 격자에서 4종 식물의 개체수와 피도(%)를 관측·저장합니다.
            </p>
          </div>

          <div className="bg-white p-3.5 border-2 border-stone-900 shadow-[2px_2px_0px_#1c1917] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-stone-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>2. 모둠 자료 종합 및 계산</span>
            </div>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              {teamSize}개 방형구 데이터를 합산하여 밀도, 빈도, 피도 및 상대값과 중요치(최대 300)를 직접 계산합니다.
            </p>
          </div>

          <div className="bg-white p-3.5 border-2 border-stone-900 shadow-[2px_2px_0px_#1c1917] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-stone-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>3. 우점종 판별 및 모둠 토론</span>
            </div>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              중요치가 가장 높은 우점종을 판정하고, 4가지 핵심 생태 탐구 토론 질문에 대해 모둠원과 함께 토의합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
