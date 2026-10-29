import React from 'react';
import { PlantIndividual, Quadrat, TeamSize } from '../types/ecology';
import { FIELD_WIDTH, FIELD_HEIGHT } from '../utils/communityGenerator';
import { PlantIllustration } from './PlantIllustration';
import { CheckCircle2, Eye, Compass } from 'lucide-react';

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

  // Filter quadrats based on team size: 4-person mode uses quadrats 1~4, 5-person uses 1~5
  const activeQuadrats = quadrats.filter(q => q.id <= teamSize);
  const activeCompletedIds = completedQuadratIds.filter(id => id <= teamSize);
  const allSurveysDone = activeCompletedIds.length === teamSize;
  const isAssignedDone = completedQuadratIds.includes(assignedQuadratId);

  return (
    <div className="space-y-4">
      {/* 1단계 안내 & 내 담당 방형구 강조 배너 */}
      <div className="bg-[#1c2414] text-[#f7fee7] p-4 sm:p-5 border-4 border-[#12170b] shadow-[5px_5px_0px_#0c0f08] space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-[#2e3e18] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#3f4f24] border-2 border-[#12170b] flex items-center justify-center text-[#bef264] shadow-[3px_3px_0px_#000]">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#facc15] pixel-font drop-shadow">
                  [{groupId} 풀밭 생태 조사]
                </span>
                <span className="text-xs font-bold text-[#052e16] bg-[#86efac] border border-[#166534] px-2.5 py-0.5 pixel-font">
                  {studentName ? `${studentName} 학생` : '모둠원'}
                </span>
                <span className="text-xs font-bold text-[#fef08a] bg-[#713f12] px-2 py-0.5 border border-[#ca8a04] pixel-font">
                  총 {teamSize}개 방형구 ({teamSize}m²)
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm sm:text-base font-extrabold text-[#facc15] pixel-font">
                  🎯 내 담당 방형구: {assignedQuadratId}번
                </span>
                {isAssignedDone && (
                  <span className="text-xs bg-[#15803d] text-white px-2 py-0.5 border border-white font-bold pixel-font">
                    ✓ 조사 완료
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Real-time group sync badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#bef264] bg-[#12180d] border border-[#3f4f24] pixel-font">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{groupId} 실시간 연동</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold pixel-font bg-[#12180d] text-[#facc15] px-3 py-1.5 border border-[#3f4f24]">
              <span className="text-[#a3e635]">진행:</span>
              <span className="font-mono text-sm">{activeCompletedIds.length} / {teamSize}</span>
            </div>
          </div>
        </div>

        {/* Large Prominent Click Guidance Banner */}
        <div className="bg-[#2a3617] border-2 border-[#a3e635] p-3 text-center shadow-[3px_3px_0px_#000]">
          <p className="text-sm sm:text-base md:text-lg font-extrabold text-[#fef08a] pixel-font flex items-center justify-center gap-2 flex-wrap">
            <span className="animate-bounce">👇</span>
            <span>아래 지도에서 <strong className="text-white bg-[#ca8a04] px-2 py-0.5 border border-white shadow-[1px_1px_0px_#000]">{assignedQuadratId}번 방형구</strong>를 클릭하여 조사하세요!</span>
          </p>
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
                className={`absolute transition-all flex flex-col justify-between p-1 select-none cursor-pointer ${
                  isAssigned
                    ? 'border-4 border-[#facc15] ring-4 ring-[#fef08a] shadow-[0_0_24px_rgba(250,204,21,0.95),_6px_6px_0px_#000] z-30 scale-[1.02]'
                    : 'border-2 border-dashed border-white/60 opacity-60 hover:opacity-100 shadow-[3px_3px_0px_#000] z-10 hover:border-solid hover:scale-[1.01]'
                }`}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                  borderColor: isAssigned ? '#facc15' : quadrat.color,
                  backgroundColor: isAssigned ? `${quadrat.color}45` : `${quadrat.color}20`,
                }}
              >
                {/* 10x10 Wire Grid Lines */}
                <div
                  className={`absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none ${
                    isAssigned ? 'opacity-70' : 'opacity-35'
                  }`}
                >
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-r border-b"
                      style={{ borderColor: isAssigned ? '#facc15' : quadrat.color }}
                    />
                  ))}
                </div>

                {/* Corner Pixel Reinforcement Brackets */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white pointer-events-none" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white pointer-events-none" />

                {/* Floating Bouncing Pointer Arrow for Assigned Quadrat */}
                {isAssigned && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none animate-bounce">
                    <span className="bg-[#facc15] text-[#1c1917] font-extrabold text-[10px] px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_#000] pixel-font">
                      👇 내 담당 방형구 클릭!
                    </span>
                  </div>
                )}

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
                      <span className="bg-[#facc15] text-[#1c1917] font-black px-1.5 py-0.5 text-[9px] sm:text-[10px] border border-black shadow-[1px_1px_0px_#000] pixel-font animate-pulse">
                        ★ 내 담당
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
                <div
                  className={`relative z-10 self-center my-auto text-white text-[10px] font-bold px-2 py-1 border-2 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 pixel-font transition-all ${
                    isAssigned
                      ? 'bg-[#15803d] border-[#facc15] ring-2 ring-[#86efac] hover:bg-[#166534] scale-105'
                      : 'bg-[#0c0a09]/90 border-stone-500 hover:bg-[#14532d]'
                  }`}
                >
                  <Eye className={`w-3.5 h-3.5 ${isAssigned ? 'text-[#facc15]' : 'text-[#4ade80]'}`} />
                  <span>{isAssigned ? '클릭하여 내 방형구 조사 시작' : '클릭하여 방형구 확인'}</span>
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
    </div>
  );
};
