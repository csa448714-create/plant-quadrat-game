import React, { useState } from 'react';
import { PlantIndividual, Quadrat, TeamSize } from '../types/ecology';
import { FIELD_WIDTH, FIELD_HEIGHT, PLANT_SPECIES_LIST } from '../utils/communityGenerator';
import { PlantIllustration, BotanicalIcon } from './PlantIllustration';
import { CheckCircle2, Eye, Info, Users, Sparkles, Compass } from 'lucide-react';

interface MeadowCanvasProps {
  plants: PlantIndividual[];
  quadrats: Quadrat[];
  teamSize: TeamSize;
  assignedQuadratId: number;
  completedQuadratIds: number[];
  onSelectQuadratForInspection: (quadratId: number) => void;
  groupId?: string;
  studentName?: string;
  remoteMemberNames?: Record<number, string>;
}

export const MeadowCanvas: React.FC<MeadowCanvasProps> = ({
  plants,
  quadrats,
  teamSize,
  assignedQuadratId,
  completedQuadratIds,
  onSelectQuadratForInspection,
  groupId = '1모둠',
  studentName = '',
  remoteMemberNames = {},
}) => {
  const [selectedLegendSpecies, setSelectedLegendSpecies] = useState<string | null>(null);

  // Filter quadrats based on team size: 4-person mode uses quadrats 1~4, 5-person uses 1~5
  const activeQuadrats = quadrats.filter(q => q.id <= teamSize);
  const activeCompletedIds = completedQuadratIds.filter(id => id <= teamSize);
  const allSurveysDone = activeCompletedIds.length === teamSize;
  const isAssignedDone = completedQuadratIds.includes(assignedQuadratId);

  return (
    <div className="space-y-4">
      {/* Retro RPG Quest Banner */}
      <div className="bg-[#242b18] text-[#f7fee7] p-3.5 sm:p-4 border-3 border-[#12170b] shadow-[4px_4px_0px_#0c0f08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3f4f24] border-2 border-[#12170b] flex items-center justify-center text-[#bef264] shadow-[2px_2px_0px_#000]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#facc15] pixel-font drop-shadow">
                [{groupId} 풀밭 생태 조사]
              </span>
              <span className="text-[11px] font-bold text-[#052e16] bg-[#86efac] border border-[#166534] px-2 py-0.5 pixel-font">
                내 담당: #{assignedQuadratId}번 {studentName ? `(${studentName})` : ''}
              </span>
              <span className="text-[10px] font-bold text-[#fef08a] bg-[#713f12] px-1.5 py-0.5 border border-[#ca8a04] pixel-font">
                조사 규격: {teamSize}m² (1m×1m × {teamSize}개)
              </span>
            </div>
            <p className="text-xs text-[#d9f99d] mt-1 pixel-font">
              무작위로 선정된 {teamSize}개의 방형구를 조사합니다. 모둠원들의 조사 결과가 실시간으로 공유됩니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Real-time group sync badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-[#bef264] bg-[#161d0f] border border-[#3f4f24] pixel-font">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{groupId} 실시간 연동</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold pixel-font bg-[#161d0f] text-[#facc15] p-2 border-2 border-[#3f4f24]">
            <span className="text-[#a3e635]">진행도:</span>
            <span className="font-mono text-sm">{activeCompletedIds.length} / {teamSize}</span>
          </div>
        </div>
      </div>

      {/* 2D 16-BIT TOP-DOWN PIXEL ART MEADOW CONTAINER */}
      <div className="relative overflow-hidden border-4 border-[#1c1917] shadow-[6px_6px_0px_#1c1917] bg-[#224422] select-none">
        {/* Aspect Ratio Container for 1000 x 750 (4:3 ratio) */}
        <div
          className="relative w-full aspect-[4/3] bg-[#2e5323] overflow-hidden cursor-crosshair"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Base Layer 1: Pixel Grass Checkerboard Texture */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(45deg, #24461b 25%, transparent 25%),
                linear-gradient(-45deg, #24461b 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #24461b 75%),
                linear-gradient(-45deg, transparent 75%, #24461b 75%)
              `,
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          />

          {/* Base Layer 2: Pixel Soil & Dirt Paths (산책로 / 흙길) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 750"
            shapeRendering="crispEdges"
          >
            {/* Main meandering dirt trail */}
            <path
              d="M 40 100 Q 380 220 540 430 T 960 670"
              stroke="#854d0e"
              strokeWidth="68"
              strokeLinecap="square"
              fill="none"
              opacity="0.85"
            />
            <path
              d="M 40 100 Q 380 220 540 430 T 960 670"
              stroke="#a16207"
              strokeWidth="52"
              strokeLinecap="square"
              fill="none"
              opacity="0.9"
            />
            {/* Trail center worn path */}
            <path
              d="M 40 100 Q 380 220 540 430 T 960 670"
              stroke="#ca8a04"
              strokeWidth="24"
              strokeLinecap="square"
              fill="none"
              strokeDasharray="20 12"
              opacity="0.6"
            />

            {/* Branching path to south */}
            <path
              d="M 540 430 Q 500 580 340 740"
              stroke="#854d0e"
              strokeWidth="48"
              strokeLinecap="square"
              fill="none"
              opacity="0.8"
            />
            <path
              d="M 540 430 Q 500 580 340 740"
              stroke="#a16207"
              strokeWidth="32"
              strokeLinecap="square"
              fill="none"
              opacity="0.85"
            />

            {/* Stepping Stones / Cobblestones in pixel style along paths */}
            {[
              { x: 120, y: 140, r: 12 },
              { x: 230, y: 180, r: 14 },
              { x: 380, y: 280, r: 15 },
              { x: 480, y: 370, r: 16 },
              { x: 620, y: 490, r: 14 },
              { x: 740, y: 550, r: 15 },
              { x: 860, y: 620, r: 13 },
              { x: 490, y: 530, r: 12 },
              { x: 430, y: 620, r: 14 },
            ].map((stone, idx) => (
              <g key={`stone-${idx}`}>
                <rect x={stone.x - stone.r} y={stone.y - stone.r} width={stone.r * 2} height={stone.r * 2} fill="#44403c" />
                <rect x={stone.x - stone.r + 2} y={stone.y - stone.r + 2} width={stone.r * 2 - 4} height={stone.r * 2 - 4} fill="#78716c" />
                <rect x={stone.x - stone.r + 4} y={stone.y - stone.r + 4} width={stone.r} height={stone.r - 2} fill="#a8a29e" />
              </g>
            ))}

            {/* Scattered Decorative Pixel Grass Tufts (Ambient Nature details) */}
            {[
              [80, 260], [180, 50], [320, 60], [450, 110], [600, 70], [780, 120], [890, 80],
              [80, 480], [190, 680], [620, 220], [750, 310], [880, 420], [920, 260],
              [710, 690], [820, 710], [250, 450], [670, 420],
            ].map(([gx, gy], i) => (
              <g key={`tuft-${i}`}>
                <rect x={gx} y={gy} width="4" height="12" fill="#15803d" />
                <rect x={gx - 4} y={gy + 4} width="4" height="8" fill="#4ade80" />
                <rect x={gx + 4} y={gy + 6} width="4" height="6" fill="#86efac" />
              </g>
            ))}
          </svg>

          {/* Plant Individuals Rendering (16-bit Pixel Sprites) */}
          <div className="absolute inset-0 pointer-events-none">
            {plants.map(plant => {
              const leftPct = (plant.x / FIELD_WIDTH) * 100;
              const topPct = (plant.y / FIELD_HEIGHT) * 100;
              const widthPct = ((plant.radius * 2) / FIELD_WIDTH) * 100;
              const heightPct = ((plant.radius * 2) / FIELD_HEIGHT) * 100;

              return (
                <div
                  key={plant.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                  }}
                >
                  <PlantIllustration
                    species={plant.species}
                    radius={plant.radius}
                    rotation={plant.rotation}
                    variety={plant.variety}
                    className="w-full h-full"
                  />
                </div>
              );
            })}
          </div>

          {/* Fixed Quadrats Rendering with VISIBLE 10x10 WIRE GRID */}
          {activeQuadrats.map(quadrat => {
            const leftPct = (quadrat.x / FIELD_WIDTH) * 100;
            const topPct = (quadrat.y / FIELD_HEIGHT) * 100;
            const widthPct = (quadrat.size / FIELD_WIDTH) * 100;
            const heightPct = (quadrat.size / FIELD_HEIGHT) * 100;
            const isCompleted = activeCompletedIds.includes(quadrat.id);
            const isAssigned = quadrat.id === assignedQuadratId;

            return (
              <div
                key={quadrat.id}
                onClick={() => onSelectQuadratForInspection(quadrat.id)}
                className={`absolute border-[3px] transition-all flex flex-col justify-between p-1 select-none cursor-pointer ${
                  isAssigned
                    ? 'ring-4 ring-[#facc15] shadow-[6px_6px_0px_#000] z-20 hover:scale-[1.02]'
                    : 'hover:ring-3 hover:ring-white/90 shadow-[4px_4px_0px_#000] z-10 hover:scale-[1.01]'
                }`}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                  borderColor: isAssigned ? '#facc15' : quadrat.color,
                  backgroundColor: `${quadrat.color}25`,
                }}
              >
                {/* 10x10 Wire Grid Lines - ALWAYS clearly visible directly on the meadow */}
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none opacity-50">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-r border-b"
                      style={{ borderColor: quadrat.color }}
                    />
                  ))}
                </div>

                {/* Corner Pixel Reinforcement Brackets */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white pointer-events-none" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-white pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-white pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white pointer-events-none" />

                {/* Quadrat Header Badge */}
                <div className="relative z-10 flex items-center justify-between text-white drop-shadow">
                  <div className="flex items-center gap-1">
                    <span
                      className="text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000] flex items-center gap-1 pixel-font"
                      style={{ backgroundColor: quadrat.color }}
                    >
                      <span>#{quadrat.id}번 방형구</span>
                    </span>

                    {isAssigned && (
                      <span className="bg-[#facc15] text-[#1c1917] font-bold px-1.5 py-0.5 text-[9px] border border-black shadow-[1px_1px_0px_#000] pixel-font">
                        내 담당 ★
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000] flex items-center gap-1 pixel-font ${
                      isCompleted
                        ? 'bg-[#15803d] text-white'
                        : 'bg-[#1c1917] text-[#facc15]'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-[#86efac]" />
                        <span>완료 {remoteMemberNames[quadrat.id] ? `(${remoteMemberNames[quadrat.id]})` : ''}</span>
                      </>
                    ) : (
                      <span>조사 대기</span>
                    )}
                  </span>
                </div>

                {/* Center Click Prompt in Survey Mode */}
                <div className="relative z-10 self-center my-auto bg-[#0c0a09] text-white text-[10px] font-bold px-2 py-1 border-2 border-[#4ade80] shadow-[2px_2px_0px_#000] flex items-center gap-1.5 pixel-font hover:bg-[#14532d] transition-colors">
                  <Eye className="w-3.5 h-3.5 text-[#4ade80]" />
                  <span>클릭하여 확대 조사</span>
                </div>

                {/* Bottom dimension tag */}
                <div className="relative z-10 text-[9px] text-white font-mono text-right pointer-events-none drop-shadow">
                  1m × 1m (100칸)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Retro RPG Botanical Identification Guide / Legend (퀘스트 도감 창) */}
      <div className="bg-[#fcfaf5] p-4 border-3 border-stone-900 shadow-[4px_4px_0px_#1c1917]">
        <div className="flex items-center justify-between mb-3 border-b-2 border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-800" />
            <h3 className="text-sm font-bold text-stone-900 pixel-font">
              [식물 도감] 조사 대상 4종 픽셀 스프라이트 가이드
            </h3>
          </div>
          <span className="text-xs text-stone-600 pixel-font">카드를 클릭하여 상세 형태를 확인하세요</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLANT_SPECIES_LIST.map(spec => {
            const isSelected = selectedLegendSpecies === spec.id;
            return (
              <div
                key={spec.id}
                onClick={() => setSelectedLegendSpecies(isSelected ? null : spec.id)}
                className={`p-3 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-100/70 shadow-[3px_3px_0px_#047857]'
                    : 'border-stone-900 bg-stone-50 hover:bg-white shadow-[2px_2px_0px_#1c1917]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BotanicalIcon species={spec.id} size={42} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-stone-900 pixel-font">{spec.koreanName}</h4>
                      <span className="text-[10px] text-stone-500 font-serif italic">
                        {spec.scientificName}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 line-clamp-1 pixel-font">{spec.family}</p>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-300 text-[11px] text-stone-700 leading-relaxed pixel-font">
                  <p className="line-clamp-2"><strong>특징:</strong> {spec.characteristics}</p>
                  <p className="mt-1 text-emerald-900 font-medium"><strong>분포:</strong> {spec.habit}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
