import React, { useState } from 'react';
import { FIXED_QUADRATS } from '../data/fixedEcologyData';
import { TeamSize } from '../types/ecology';
import { Users, ArrowRight, CheckCircle2, Crosshair, Sparkles, Shield, UserCheck } from 'lucide-react';

interface RoleSelectStepProps {
  groupId: string;
  onChangeGroupId: (id: string) => void;
  studentName: string;
  onChangeStudentName: (name: string) => void;
  teamSize: TeamSize;
  onChangeTeamSize: (size: TeamSize) => void;
  assignedQuadratId: number;
  onSelectAssignedQuadrat: (id: number) => void;
  onProceedToSurvey: () => void;
  completedQuadratIds?: number[];
  remoteMemberNames?: Record<number, string>;
}

export const RoleSelectStep: React.FC<RoleSelectStepProps> = ({
  groupId,
  onChangeGroupId,
  studentName,
  onChangeStudentName,
  teamSize,
  onChangeTeamSize,
  assignedQuadratId,
  onSelectAssignedQuadrat,
  onProceedToSurvey,
  completedQuadratIds = [],
  remoteMemberNames = {},
}) => {
  const [customGroupInput, setCustomGroupInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  const defaultGroups = ['1모둠', '2모둠', '3모둠', '4모둠', '5모둠', '6모둠'];

  const quadratDescriptions = [
    { id: 1, name: '1번 방형구', desc: '중앙 북쪽 초지 (4종 혼합 서식 구역)', color: '#0284c7' },
    { id: 2, name: '2번 방형구', desc: '중앙 동쪽 초지 (제비꽃 집중 서식 구역)', color: '#059669' },
    { id: 3, name: '3번 방형구', desc: '북서쪽 풀밭 가장자리 (토끼풀·제비꽃 구역)', color: '#d97706' },
    { id: 4, name: '4번 방형구', desc: '서쪽 양지 (민들레 중심 서식지)', color: '#9333ea' },
    { id: 5, name: '5번 방형구', desc: '남쪽 양지 초원 (강아지풀 다수 서식 구역)', color: '#dc2626' },
  ];

  const handleSelectTeamSize = (size: TeamSize) => {
    onChangeTeamSize(size);
    if (size === 4 && assignedQuadratId === 5) {
      onSelectAssignedQuadrat(1);
    }
  };

  const handleSelectPresetGroup = (name: string) => {
    onChangeGroupId(name);
    setShowCustomInput(false);
  };

  const handleApplyCustomGroup = () => {
    if (customGroupInput.trim()) {
      onChangeGroupId(customGroupInput.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-3 select-none">
      {/* 1. Group Selection & Isolation Card (모둠 선택 및 데이터 격리 안내) */}
      <div className="bg-[#242b18] text-white p-5 border-4 border-stone-900 shadow-[6px_6px_0px_#1c1917] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#3f4f24] pb-3">
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[#bef264]" />
            <h2 className="text-base sm:text-lg font-bold text-[#facc15] pixel-font">
              [모둠 선택] 우리 모둠(조) 지정 및 모둠원 등록
            </h2>
          </div>
          <span className="text-xs bg-[#161d0f] text-[#a3e635] px-2.5 py-1 border border-[#3f4f24] pixel-font">
            현재 선택된 모둠: <strong className="text-[#facc15]">{groupId || '1모둠'}</strong>
          </span>
        </div>

        <div className="bg-[#192210] p-3.5 border-2 border-[#3f4f24] text-xs text-[#d9f99d] pixel-font space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-[#bef264]">
            <Users className="w-4 h-4" />
            <span>같은 모둠 학생들끼리만 조사 결과가 실시간으로 공유됩니다!</span>
          </div>
          <p className="text-[11px] text-[#a3e635]">
            • 같은 모둠(예: <strong>{groupId || '1모둠'}</strong>)에 접속한 학생들의 방형구 조사 결과만 모둠 전체 분석표에 합산됩니다.<br />
            • 다른 모둠의 조사 내용은 공유되지 않으며, 완전히 독립적으로 분리 관리됩니다.
          </p>
        </div>

        {/* Group Selector Quick Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#bef264] pixel-font block">
            소속 모둠을 선택하세요:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {defaultGroups.map(name => {
              const isSelected = groupId === name && !showCustomInput;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelectPresetGroup(name)}
                  className={`py-2 px-2 text-xs font-bold border-2 pixel-btn cursor-pointer pixel-font transition-all ${
                    isSelected
                      ? 'bg-[#facc15] text-stone-950 border-black shadow-[2px_2px_0px_#000] scale-[1.02]'
                      : 'bg-[#1b2212] text-[#d9f99d] border-[#3f4f24] hover:bg-[#2d381c]'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>

          {/* Custom Group Code Option */}
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-[11px] text-[#fef08a] hover:underline pixel-font cursor-pointer"
            >
              [직접 모둠명 입력하기...]
            </button>
            {showCustomInput && (
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="예: 2반 3모둠, 솔잎조"
                  value={customGroupInput}
                  onChange={e => setCustomGroupInput(e.target.value)}
                  className="bg-[#12170b] text-white border-2 border-[#3f4f24] px-2.5 py-1 text-xs pixel-font focus:outline-none focus:border-[#bef264]"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomGroup}
                  className="px-3 py-1 bg-[#15803d] text-white text-xs font-bold border border-black pixel-btn pixel-font cursor-pointer"
                >
                  적용
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Student Name Input */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-[#bef264] pixel-font block">
            내 이름 또는 출석 번호:
          </label>
          <div className="flex items-center gap-2 max-w-sm">
            <UserCheck className="w-4 h-4 text-[#a3e635]" />
            <input
              type="text"
              placeholder="예: 김민준, 15번 학생"
              value={studentName}
              onChange={e => onChangeStudentName(e.target.value)}
              className="w-full bg-[#12170b] text-[#facc15] font-bold border-2 border-[#3f4f24] px-3 py-1.5 text-xs pixel-font focus:outline-none focus:border-[#bef264]"
            />
          </div>
        </div>
      </div>

      {/* 2. Team Size Selector Card (4인 모둠 vs 5인 모둠) */}
      <div className="bg-[#242b18] text-white p-5 border-4 border-stone-900 shadow-[6px_6px_0px_#1c1917] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#3f4f24] pb-3">
          <div className="flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#bef264]" />
            <h2 className="text-base sm:text-lg font-bold text-[#facc15] pixel-font">
              [모둠 규모 설정] 조사 인원 선택 (4인 / 5인 모둠)
            </h2>
          </div>
          <span className="text-xs bg-[#161d0f] text-[#a3e635] px-2.5 py-1 border border-[#3f4f24] pixel-font">
            선택: {teamSize}인 모둠 (방형구 1~{teamSize}번)
          </span>
        </div>

        {/* 4-person / 5-person Switch Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSelectTeamSize(4)}
            className={`p-3.5 border-3 transition-all cursor-pointer text-left flex items-center justify-between ${
              teamSize === 4
                ? 'bg-[#fef08a] text-stone-950 border-black shadow-[4px_4px_0px_#000] scale-[1.01]'
                : 'bg-[#1b2212] text-[#d9f99d] border-[#3f4f24] hover:bg-[#2d381c]'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm pixel-font">👥 4인 1모둠 협동 모드</span>
                {teamSize === 4 && <span className="bg-[#15803d] text-white text-[10px] px-1.5 py-0.5 pixel-font">선택됨</span>}
              </div>
              <p className="text-xs mt-1 pixel-font opacity-90">
                1~4번 방형구 조사 · 총 면적 4m² · 모둠원 4명 분담
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTeamSize(5)}
            className={`p-3.5 border-3 transition-all cursor-pointer text-left flex items-center justify-between ${
              teamSize === 5
                ? 'bg-[#fef08a] text-stone-950 border-black shadow-[4px_4px_0px_#000] scale-[1.01]'
                : 'bg-[#1b2212] text-[#d9f99d] border-[#3f4f24] hover:bg-[#2d381c]'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm pixel-font">👥 5인 1모둠 협동 모드</span>
                {teamSize === 5 && <span className="bg-[#15803d] text-white text-[10px] px-1.5 py-0.5 pixel-font">선택됨</span>}
              </div>
              <p className="text-xs mt-1 pixel-font opacity-90">
                1~5번 방형구 조사 · 총 면적 5m² · 모둠원 5명 분담
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Quadrat Selection Prompt Card */}
      <div className="bg-[#fcfaf5] p-5 border-3 border-stone-900 shadow-[5px_5px_0px_#1c1917] space-y-2">
        <div className="flex items-center gap-2 text-stone-900 font-bold">
          <Crosshair className="w-5 h-5 text-emerald-800" />
          <h3 className="text-base font-bold pixel-font">
            나의 담당 방형구 번호(1~{teamSize})를 선택하세요
          </h3>
        </div>
        <p className="text-xs text-stone-600 pixel-font leading-relaxed">
          모둠원 각자가 담당할 방형구를 1개씩 선택합니다. 같은 번호의 방형구는 어떤 기기에서든 동일한 식물 분포가 제공됩니다.
        </p>
      </div>

      {/* Active Quadrat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quadratDescriptions.map(q => {
          const isAvailable = q.id <= teamSize;
          const isSelected = assignedQuadratId === q.id && isAvailable;
          const isDone = completedQuadratIds.includes(q.id);
          const investigator = remoteMemberNames[q.id];

          if (!isAvailable) {
            return (
              <div
                key={q.id}
                className="bg-stone-200 border-2 border-dashed border-stone-400 p-4 opacity-50 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-500 pixel-font">#{q.id}번 방형구</span>
                    <span className="text-[10px] bg-stone-300 text-stone-600 px-1.5 py-0.5 pixel-font">
                      4인 모드 미사용
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 pixel-font">5인 모드에서만 조사합니다</p>
                </div>
              </div>
            );
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectAssignedQuadrat(q.id)}
              className={`p-4 border-3 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[#fefce8] border-stone-900 shadow-[4px_4px_0px_#1c1917] scale-[1.02]'
                  : 'bg-white border-stone-400 hover:border-stone-800 hover:bg-stone-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 border border-black inline-block"
                      style={{ backgroundColor: q.color }}
                    />
                    <h4 className="font-bold text-sm text-stone-900 pixel-font">
                      {q.name}
                    </h4>
                  </div>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-600 pixel-font">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      내 담당
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 pixel-font leading-relaxed">
                  {q.desc}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-stone-300 flex items-center justify-between text-[11px] pixel-font">
                <span className="text-stone-500">규격: 1m × 1m</span>
                {isDone ? (
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 border border-emerald-500">
                    ✓ 완료 {investigator ? `(${investigator})` : ''}
                  </span>
                ) : (
                  <span className="text-amber-800 font-bold">
                    조사 대기
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Start Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#fcfaf5] p-5 border-3 border-stone-900 shadow-[5px_5px_0px_#1c1917]">
        <div className="text-xs text-stone-700 pixel-font space-y-0.5">
          <p>
            선택 모둠: <strong className="text-emerald-800">{groupId}</strong> ·
            담당: <strong className="text-emerald-800">#{assignedQuadratId}번 방형구</strong> {studentName ? `(${studentName})` : ''}
          </p>
          <p className="text-[11px] text-stone-500">
            동일한 모둠을 선택한 모둠원들의 조사 데이터가 자동으로 연동됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={onProceedToSurvey}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#15803d] hover:bg-[#166534] border-2 border-stone-900 pixel-btn cursor-pointer pixel-font shadow-[2px_2px_0px_#000]"
        >
          <span>방형구 생태 조사 시작하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
