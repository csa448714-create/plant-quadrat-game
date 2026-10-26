import React from 'react';
import { RotateCcw, Users, Layers, ShieldCheck } from 'lucide-react';
import { TeamSize } from '../types/ecology';

interface HeaderProps {
  groupId: string;
  studentName?: string;
  currentStepTitle: string;
  assignedQuadratId: number;
  teamSize: TeamSize;
  onChangeTeamSize?: (size: TeamSize) => void;
  onResetCommunity: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  groupId,
  studentName,
  currentStepTitle,
  assignedQuadratId,
  teamSize,
  onChangeTeamSize,
  onResetCommunity,
}) => {
  return (
    <header className="border-b-3 border-stone-900 bg-[#252f19] text-[#f7fee7] sticky top-0 z-30 shadow-[0_2px_4px_rgba(0,0,0,0.4)] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Wordmark & Group Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="w-3.5 h-3.5 bg-[#84cc16] border-2 border-black inline-block shadow-[1px_1px_0px_#000]" />
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap pixel-font drop-shadow">
            풀밭의 우점종을 찾아라!
          </h1>

          {/* Group Badge */}
          <div className="flex items-center gap-1.5 bg-[#161d0f] px-2 py-1 border-2 border-[#3f4f24] shadow-[1px_1px_0px_#000]">
            <Users className="w-3.5 h-3.5 text-[#facc15]" />
            <span className="text-[11px] font-bold text-[#facc15] pixel-font">
              {groupId || '1모둠'}
            </span>
          </div>

          {/* Team Size Toggle Pill in Header */}
          <div className="hidden sm:flex items-center gap-1 bg-[#161d0f] p-1 border-2 border-[#3f4f24]">
            <span className="text-[10px] text-[#a3e635] font-bold px-1 pixel-font">규격:</span>
            {onChangeTeamSize ? (
              <div className="flex gap-1 text-[11px] font-bold pixel-font">
                <button
                  type="button"
                  onClick={() => onChangeTeamSize(4)}
                  className={`px-1.5 py-0.5 border cursor-pointer ${
                    teamSize === 4
                      ? 'bg-[#facc15] text-black border-black font-extrabold shadow-[1px_1px_0px_#000]'
                      : 'text-[#d9f99d] border-transparent hover:bg-[#2d381c]'
                  }`}
                >
                  4인
                </button>
                <button
                  type="button"
                  onClick={() => onChangeTeamSize(5)}
                  className={`px-1.5 py-0.5 border cursor-pointer ${
                    teamSize === 5
                      ? 'bg-[#facc15] text-black border-black font-extrabold shadow-[1px_1px_0px_#000]'
                      : 'text-[#d9f99d] border-transparent hover:bg-[#2d381c]'
                  }`}
                >
                  5인
                </button>
              </div>
            ) : (
              <span className="text-[11px] font-bold text-[#bef264] bg-[#223311] px-1.5 py-0.5 border border-[#3f4f24] pixel-font">
                {teamSize}인 모둠 ({teamSize}m²)
              </span>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation / Current phase guide */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-[#d9f99d] truncate pixel-font">
          <span className="text-[#86efac]">
            내 담당 #{assignedQuadratId}번 {studentName ? `(${studentName})` : ''}
          </span>
          <span aria-hidden="true" className="text-[#65a30d]">·</span>
          <span className="text-[#facc15] font-bold truncate">{currentStepTitle}</span>
        </div>

        {/* Zone 3: Reset Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onResetCommunity}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-900 bg-[#fde047] hover:bg-[#facc15] border-2 border-black pixel-btn whitespace-nowrap cursor-pointer pixel-font"
            title="나의 조사 및 계산 기록을 초기화합니다"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-900" />
            <span className="hidden sm:inline">조사 초기화</span>
            <span className="sm:hidden">초기화</span>
          </button>
        </div>
      </div>
    </header>
  );
};
