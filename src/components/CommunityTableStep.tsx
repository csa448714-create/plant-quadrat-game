import React, { useState } from 'react';
import {
  PlantSpeciesId,
  QuadratInspection,
  SpeciesCommunityStat,
  StudentTableEvaluation,
  StudentTableInput,
  TeamSize,
} from '../types/ecology';
import { PLANT_SPECIES_LIST, PLANT_SPECIES } from '../utils/communityGenerator';
import { evaluateStudentValue } from '../utils/quadratMath';
import { BotanicalIcon } from './PlantIllustration';
import { FIXED_TRUE_QUADRAT_STATS } from '../data/fixedEcologyData';
import {
  Calculator,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Users,
  Check,
  AlertCircle,
  Eye,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CommunityTableStepProps {
  trueStats: Record<PlantSpeciesId, SpeciesCommunityStat>;
  teamSize?: TeamSize;
  inputs: Record<PlantSpeciesId, StudentTableInput>;
  onUpdateInput: (species: PlantSpeciesId, field: keyof StudentTableInput, val: string) => void;
  onProceedToDominantSpecies: () => void;
  inspections?: Record<number, QuadratInspection>;
  remoteMemberNames?: Record<number, string>;
  groupId?: string;
  assignedQuadratId?: number;
}

export const CommunityTableStep: React.FC<CommunityTableStepProps> = ({
  trueStats,
  teamSize = 5,
  inputs,
  onUpdateInput,
  onProceedToDominantSpecies,
  inspections = {},
  remoteMemberNames = {},
  groupId = '1모둠',
  assignedQuadratId = 1,
}) => {
  // activeStage: 'step2' (모둠 자료 취합 및 합산 계산) vs 'step3' (6대 지표 및 중요치 계산)
  const [activeStage, setActiveStage] = useState<'step2' | 'step3'>('step2');

  // Stage 2 evaluation status
  const [stage2Checked, setStage2Checked] = useState<boolean>(false);

  // Stage 3 view mode: 'input' (학생 직접 계산 입력) vs 'comparison' (정답 채점 및 오차 비교)
  const [viewMode, setViewMode] = useState<'input' | 'comparison'>('input');
  // Stage 3 layout: 'table' (통합 스프레드시트 표) vs 'cards' (식물별 개별 카드)
  const [inputLayoutMode, setInputLayoutMode] = useState<'table' | 'cards'>('table');

  // Stage 3 Evaluation status
  const [evaluation, setEvaluation] = useState<Record<PlantSpeciesId, StudentTableEvaluation> | null>(null);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [showFormulas, setShowFormulas] = useState<boolean>(true);

  // Build the list of active quadrats data for Stage 2 team matrix
  const quadratRows = Array.from({ length: teamSize }, (_, idx) => {
    const qId = idx + 1;
    const insp = inspections[qId];
    const fixed = FIXED_TRUE_QUADRAT_STATS.find(f => f.quadratId === qId);

    const counts: Record<PlantSpeciesId, number> =
      insp?.speciesCounts || fixed?.counts || { clover: 0, dandelion: 0, violet: 0, foxtail: 0 };
    const covers: Record<PlantSpeciesId, number> =
      insp?.speciesCovers || fixed?.covers || { clover: 0, dandelion: 0, violet: 0, foxtail: 0 };
    const memberName = remoteMemberNames[qId] || insp?.studentName || `모둠원 #${qId}`;
    const isAssigned = qId === assignedQuadratId;

    return {
      quadratId: qId,
      memberName,
      isAssigned,
      counts,
      covers,
    };
  });

  // Handle Stage 2 sum validation
  const handleCheckStage2 = () => {
    setStage2Checked(true);
  };

  // Perform Stage 3 Evaluation & Transition to Comparison Mode
  const handleProceedToComparison = () => {
    const newEval: Record<PlantSpeciesId, StudentTableEvaluation> = {} as any;

    for (const spec of PLANT_SPECIES_LIST) {
      const spId = spec.id;
      const trueStat = trueStats[spId];
      const studentIn = inputs[spId];

      newEval[spId] = {
        density: evaluateStudentValue(studentIn.density, trueStat.density, 0.3),
        frequency: evaluateStudentValue(studentIn.frequency, trueStat.frequency, 0.5),
        cover: evaluateStudentValue(studentIn.cover, trueStat.cover, 0.4),
        relativeDensity: evaluateStudentValue(studentIn.relativeDensity, trueStat.relativeDensity, 0.5),
        relativeFrequency: evaluateStudentValue(
          studentIn.relativeFrequency,
          trueStat.relativeFrequency,
          0.5
        ),
        relativeCover: evaluateStudentValue(studentIn.relativeCover, trueStat.relativeCover, 0.5),
        importanceValue: evaluateStudentValue(
          studentIn.importanceValue,
          trueStat.importanceValue,
          0.8
        ),
      };
    }

    setEvaluation(newEval);
    setViewMode('comparison');

    // Check if all passed
    const total = PLANT_SPECIES_LIST.length * 7;
    let correct = 0;
    for (const spec of PLANT_SPECIES_LIST) {
      const row = newEval[spec.id];
      Object.values(row).forEach(status => {
        if (status === 'correct') correct++;
      });
    }
    if (correct === total) {
      setShowVictoryModal(true);
    }
  };

  // Grade Counts for Stage 3
  const totalGradedCells = PLANT_SPECIES_LIST.length * 7;
  let correctCount = 0;
  if (evaluation) {
    for (const spec of PLANT_SPECIES_LIST) {
      const row = evaluation[spec.id];
      Object.values(row).forEach(status => {
        if (status === 'correct') correctCount++;
      });
    }
  }

  return (
    <div className="space-y-5 select-none">
      {/* Prominent Stage Navigation Bar (2단계 협동활동 vs 3단계 협동활동) */}
      <div className="flex border-4 border-stone-900 bg-[#e7e5e4] p-1.5 shadow-[5px_5px_0px_#1c1917] gap-2">
        <button
          type="button"
          onClick={() => setActiveStage('step2')}
          className={`flex-1 py-3 px-3 text-xs sm:text-sm font-bold pixel-font flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer transition-all border-2 ${
            activeStage === 'step2'
              ? 'bg-[#15803d] text-white shadow-[2px_2px_0px_#000] border-black ring-2 ring-emerald-300'
              : 'bg-white text-stone-800 hover:bg-stone-100 border-stone-800 shadow-[1px_1px_0px_#000]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span className="bg-black/20 px-1.5 py-0.5 text-[11px]">2단계 [협동활동]</span>
          </div>
          <span>모둠 자료 취합 및 합산 계산 (개체수·방형구수·면적합)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStage('step3')}
          className={`flex-1 py-3 px-3 text-xs sm:text-sm font-bold pixel-font flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer transition-all border-2 ${
            activeStage === 'step3'
              ? 'bg-[#1e40af] text-white shadow-[2px_2px_0px_#000] border-black ring-2 ring-blue-300'
              : 'bg-white text-stone-800 hover:bg-stone-100 border-stone-800 shadow-[1px_1px_0px_#000]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Calculator className="w-4 h-4" />
            <span className="bg-black/20 px-1.5 py-0.5 text-[11px]">3단계 [협동활동]</span>
          </div>
          <span>6대 생태 지표 계산, 중요치 및 우점종 판별</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2단계 [협동활동]: 모둠 자료 취합 및 전체 방형구 합산 계산 */}
      {/* ========================================================================= */}
      {activeStage === 'step2' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Card */}
          <div className="bg-[#fcfaf5] p-5 border-4 border-stone-900 shadow-[6px_6px_0px_#1c1917] space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-800" />
                <h2 className="text-base sm:text-lg font-bold text-stone-900 pixel-font">
                  [2단계 · 협동활동] 모둠별 자료 취합 및 전체 방형구 합산 계산
                </h2>
              </div>
              <span className="text-xs font-bold text-[#052e16] bg-[#86efac] border border-stone-900 px-2.5 py-1 pixel-font">
                모둠 규모: {teamSize}인 1모둠 ({teamSize}m² 협동)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 pixel-font leading-relaxed">
              모둠원별로 1단계에서 각자 맡아 조사한 방형구(1번~{teamSize}번) 자료를 모아,
              전체 방형구에서 각 식물 종의 <strong>총 개체수</strong>, <strong>출현한 방형구 수</strong>, <strong>차지한 면적(피도합, %)</strong>을 모둠원들과 함께 계산하여 아래 표에 기록하세요.
            </p>
          </div>

          {/* 2-Column Responsive Grid: Left (취합표) & Right (전체 합산 계산) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {/* Section A: 모둠원별 방형구 조사 결과 취합표 */}
            <div className="bg-white border-4 border-stone-900 shadow-[5px_5px_0px_#1c1917] p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2 border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-bold text-stone-900 pixel-font">
                  [{groupId}] 모둠원별 방형구 조사 결과 취합표 (1m × 1m 방형구별 관측치)
                </h3>
              </div>
              <span className="text-[11px] text-stone-500 pixel-font">
                ※ 모둠원들이 1단계(개별활동)에서 조사·입력한 수치입니다.
              </span>
            </div>

            <div className="overflow-x-auto border-2 border-stone-900">
              <table className="w-full text-xs pixel-font border-collapse">
                <thead>
                  <tr className="bg-[#242b18] text-white">
                    <th className="p-2.5 border-r border-stone-700 text-center w-28">방형구 번호 / 담당자</th>
                    {PLANT_SPECIES_LIST.map(spec => (
                      <th key={spec.id} className="p-2 border-r border-stone-700 text-center" colSpan={2}>
                        <div className="flex items-center justify-center gap-1.5">
                          <BotanicalIcon species={spec.id} size={20} />
                          <span>{spec.koreanName}</span>
                        </div>
                        <div className="grid grid-cols-2 text-[10px] text-stone-300 font-mono mt-1 pt-1 border-t border-stone-700">
                          <span>개체수</span>
                          <span>면적(%)</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-300">
                  {quadratRows.map(row => (
                    <tr
                      key={row.quadratId}
                      className={
                        row.isAssigned
                          ? 'bg-[#fef9c3] font-bold text-stone-950'
                          : 'bg-white hover:bg-stone-50 text-stone-800'
                      }
                    >
                      <td className="p-2.5 border-r border-stone-300 text-center font-bold">
                        <div className="flex items-center justify-center gap-1">
                          <span>#{row.quadratId}번</span>
                          {row.isAssigned && (
                            <span className="bg-[#facc15] text-[10px] text-black px-1 border border-black">
                              ★내 담당
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-500 block font-normal">
                          ({row.memberName})
                        </span>
                      </td>

                      {PLANT_SPECIES_LIST.map(spec => {
                        const cnt = row.counts[spec.id] ?? 0;
                        const cov = row.covers[spec.id] ?? 0;
                        return (
                          <React.Fragment key={spec.id}>
                            <td className="p-2 border-r border-stone-200 text-center font-mono font-bold text-stone-900">
                              {cnt}
                            </td>
                            <td className="p-2 border-r border-stone-300 text-center font-mono text-stone-700 bg-stone-50/50">
                              {Math.round(cov)}%
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: 전체 방형구 합산 계산 입력란 (학생들이 직접 계산하여 작성) */}
          <div className="bg-[#fcfaf5] border-4 border-stone-900 shadow-[5px_5px_0px_#1c1917] p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2 border-stone-800 pb-2">
              <div>
                <h3 className="text-sm font-bold text-stone-900 pixel-font flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-800" />
                  <span>전체 방형구 합산 계산 (모둠원과 함께 계산하여 입력하세요)</span>
                </h3>
                <p className="text-[11px] text-stone-600 pixel-font mt-0.5">
                  위 취합표를 바탕으로, 전체 {teamSize}개 방형구의 [총 개체수], [출현한 방형구 수], [차지한 면적(피도합)]을 계산해 아래 표에 적어 넣으세요.
                </p>
              </div>
            </div>

            {/* Stage 2 Input Table */}
            <div className="overflow-x-auto border-2 border-stone-900">
              <table className="w-full text-xs pixel-font border-collapse bg-white">
                <thead>
                  <tr className="bg-[#1c1917] text-[#facc15]">
                    <th className="p-2.5 border-r border-stone-700 text-left w-36">식물 종명</th>
                    <th className="p-2.5 border-r border-stone-700 text-center">
                      ① 전체 방형구 총 개체수 (개체)
                      <span className="block text-[10px] text-stone-400 font-normal mt-0.5">
                        방형구 1~{teamSize}번 개체수의 합
                      </span>
                    </th>
                    <th className="p-2.5 border-r border-stone-700 text-center">
                      ② 출현한 방형구 수 (개)
                      <span className="block text-[10px] text-stone-400 font-normal mt-0.5">
                        해당 식물이 1개 이상 나타난 방형구의 개수 (0~{teamSize})
                      </span>
                    </th>
                    <th className="p-2.5 border-r border-stone-700 text-center">
                      ③ 차지한 면적(피도)의 합 (%)
                      <span className="block text-[10px] text-stone-400 font-normal mt-0.5">
                        방형구 1~{teamSize}번 면적(%)의 총합
                      </span>
                    </th>
                    {stage2Checked && (
                      <th className="p-2.5 text-center w-28 bg-[#242b18] text-white">확인 결과</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-300">
                  {PLANT_SPECIES_LIST.map(spec => {
                    const spId = spec.id;
                    const trueStat = trueStats[spId];
                    const inputRow = inputs[spId];

                    const studentTotalCount = inputRow.totalCount ?? '';
                    const studentOccurrences = inputRow.quadratOccurrences ?? '';
                    const studentTotalCover = inputRow.totalCover ?? '';

                    const trueTotalCover = trueStat.cover * teamSize;

                    // Accuracy checks
                    const isCountCorrect =
                      studentTotalCount.trim() !== '' &&
                      parseInt(studentTotalCount, 10) === trueStat.totalCount;
                    const isOccCorrect =
                      studentOccurrences.trim() !== '' &&
                      parseInt(studentOccurrences, 10) === trueStat.quadratOccurrences;
                    const isCoverCorrect =
                      studentTotalCover.trim() !== '' &&
                      Math.abs(parseFloat(studentTotalCover) - trueTotalCover) <= 0.6;

                    const allRowCorrect = isCountCorrect && isOccCorrect && isCoverCorrect;

                    return (
                      <tr key={spId} className="hover:bg-stone-50">
                        <td className="p-3 border-r border-stone-300">
                          <div className="flex items-center gap-2">
                            <BotanicalIcon species={spId} size={28} />
                            <div>
                              <strong className="text-stone-900 block">{spec.koreanName}</strong>
                              <span className="text-[10px] text-stone-500 italic font-mono">
                                {spec.scientificName}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Total Count Input */}
                        <td className="p-2.5 border-r border-stone-300 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={studentTotalCount}
                              placeholder="합산값 입력"
                              onChange={e => onUpdateInput(spId, 'totalCount', e.target.value)}
                              className={`w-28 py-1 px-2 text-center font-mono font-bold text-sm border-2 ${
                                stage2Checked
                                  ? isCountCorrect
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                                    : 'border-rose-600 bg-rose-50 text-rose-900'
                                  : 'border-stone-800 bg-white focus:outline-emerald-600'
                              }`}
                            />
                            {stage2Checked && !isCountCorrect && (
                              <span className="text-[10px] font-mono text-stone-500">
                                (정답: {trueStat.totalCount})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Quadrat Occurrences Input */}
                        <td className="p-2.5 border-r border-stone-300 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={studentOccurrences}
                              placeholder="0~5 입력"
                              onChange={e => onUpdateInput(spId, 'quadratOccurrences', e.target.value)}
                              className={`w-28 py-1 px-2 text-center font-mono font-bold text-sm border-2 ${
                                stage2Checked
                                  ? isOccCorrect
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                                    : 'border-rose-600 bg-rose-50 text-rose-900'
                                  : 'border-stone-800 bg-white focus:outline-emerald-600'
                              }`}
                            />
                            {stage2Checked && !isOccCorrect && (
                              <span className="text-[10px] font-mono text-stone-500">
                                (정답: {trueStat.quadratOccurrences})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total Cover Input */}
                        <td className="p-2.5 border-r border-stone-300 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={studentTotalCover}
                                placeholder="합산 %"
                                onChange={e => onUpdateInput(spId, 'totalCover', e.target.value)}
                                className={`w-28 py-1 px-2 text-center font-mono font-bold text-sm pr-6 border-2 ${
                                  stage2Checked
                                    ? isCoverCorrect
                                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                                    : 'border-rose-600 bg-rose-50 text-rose-900'
                                    : 'border-stone-800 bg-white focus:outline-emerald-600'
                                }`}
                              />
                              <span className="absolute right-2 top-1.5 text-xs text-stone-500 font-mono font-bold">
                                %
                              </span>
                            </div>
                            {stage2Checked && !isCoverCorrect && (
                              <span className="text-[10px] font-mono text-stone-500">
                                (정답: {Math.round(trueTotalCover)}%)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Check Column */}
                        {stage2Checked && (
                          <td className="p-2.5 text-center">
                            {allRowCorrect ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-600">
                                ✓ 일치
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 border border-rose-600">
                                ✕ 재확인
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Button directly below Stage 2 input table */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#f5f2eb] p-3 border-2 border-stone-800">
              <div className="text-xs text-stone-700 pixel-font">
                {stage2Checked ? (
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>합산값 확인이 완료되었습니다! 일치 여부를 대조한 후 3단계로 이동하세요.</span>
                  </span>
                ) : (
                  <span>
                    총 개체수, 출현 방형구 수, 면적(피도)합을 모두 입력한 후 오른쪽 <strong>[합산값 정답 확인]</strong> 버튼을 누르세요.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleCheckStage2}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#065f46] hover:bg-[#047857] border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <Check className="w-4 h-4" />
                <span>합산값 정답 확인</span>
              </button>
            </div>

            {/* Bottom Proceed to Step 3 Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t-2 border-stone-800">
              <span className="text-xs text-stone-600 pixel-font">
                모둠 합산 계산을 마친 후 3단계로 이동하여 밀도·빈도·피도 및 중요치를 계산하세요.
              </span>

              <button
                type="button"
                onClick={() => setActiveStage('step3')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1d4ed8] border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[3px_3px_0px_#000]"
              >
                <span>[2단계 완료] 3단계 생태 지표 및 중요치 계산으로 이동</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3단계 [협동활동]: 6대 생태 지표 계산, 중요치 산출 및 우점종 결정 */}
      {/* ========================================================================= */}
      {activeStage === 'step3' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Top Instructions & Action Bar */}
          <div className="bg-[#fcfaf5] p-5 border-4 border-stone-900 shadow-[6px_6px_0px_#1c1917] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-5 h-5 text-blue-800" />
                <h2 className="text-base sm:text-lg font-bold text-stone-900 pixel-font">
                  [3단계 · 협동활동] 통합 식물 군집 계산표 (밀도·빈도·피도 및 중요치 산출)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 pixel-font">
                2단계에서 합산한 자료를 바탕으로 공식을 활용하여 [밀도], [빈도], [피도], [상대밀도], [상대빈도], [상대피도], [중요치]를 계산해 아래 통합 표에 입력하세요.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveStage('step2')}
                className="px-3 py-1.5 text-xs font-bold text-stone-800 bg-stone-200 hover:bg-stone-300 border-2 border-stone-800 pixel-btn pixel-font cursor-pointer shadow-[1px_1px_0px_#000]"
              >
                ◀ 2단계 취합자료 보기
              </button>
              {viewMode === 'input' && (
                <button
                  type="button"
                  onClick={() => setInputLayoutMode(prev => (prev === 'table' ? 'cards' : 'table'))}
                  className="px-3 py-1.5 text-xs font-bold text-stone-900 bg-amber-200 hover:bg-amber-300 border-2 border-stone-800 pixel-btn pixel-font cursor-pointer shadow-[1px_1px_0px_#000]"
                >
                  {inputLayoutMode === 'table' ? '📋 종별 카드로 입력' : '📊 통합 표로 입력'}
                </button>
              )}
            </div>
          </div>

          {/* 3. 소수점 계산 규칙 안내 배너 (Requirement 3) */}
          <div className="bg-[#fefce8] border-3 border-[#ca8a04] p-4 shadow-[4px_4px_0px_#854d0e] text-stone-900 pixel-font space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#854d0e]">
              <span className="text-base">📌</span>
              <span>계산 안내 (소수점 반올림 및 정답 판정 기준)</span>
            </div>
            <ul className="text-xs text-stone-800 space-y-1 pl-4 list-disc leading-relaxed">
              <li>
                <strong>소수점 반올림:</strong> 계산 결과가 딱 떨어지지 않는 경우 <strong>소수점 아래 셋째 자리에서 반올림하여 둘째 자리까지</strong> 나타내세요. (예: 25 ÷ 3 = 8.33, 100 ÷ 6 = 16.67)
              </li>
              <li>
                <strong>정수 입력:</strong> 계산 결과가 정수인 경우 그대로 입력하거나 .00을 붙여도 모두 정답으로 인정됩니다. (예: <strong>5</strong> 또는 <strong>5.00</strong> 모두 정답)
              </li>
              <li>
                <strong>상대값 오차 방지:</strong> 중간 계산 과정의 오차를 줄이기 위해 상대값 계산 시 가능한 한 반올림 전의 값을 활용하세요.
              </li>
              <li>
                <strong>자동 채점:</strong> 학생들의 반올림 오차(±0.05~0.1 범위)를 폭넓게 감안하여 정확하게 정답을 판정합니다.
              </li>
            </ul>
          </div>

          {/* Collapsible Formula Accordion (Requirement 5-4) */}
          <div className="bg-white border-3 border-stone-900 shadow-[4px_4px_0px_#1c1917] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowFormulas(!showFormulas)}
              className="w-full p-3.5 bg-stone-100 hover:bg-stone-200 border-b border-stone-300 flex items-center justify-between text-xs sm:text-sm font-bold text-stone-900 pixel-font cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-700" />
                <span>📐 [교과서 공식 안내] 6대 지표 및 중요치(IV) 계산 공식 확인하기</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600 text-xs">
                <span>{showFormulas ? '접기 ▲' : '펼치기 ▼'}</span>
                {showFormulas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showFormulas && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pixel-font bg-[#fafaf9]">
                <div className="p-2.5 bg-white border-2 border-stone-300 space-y-1">
                  <strong className="text-emerald-800 block text-xs">① 밀도 (Density)</strong>
                  <p className="text-stone-700 font-mono text-[11px]">= 개체수 ÷ 전체 면적 ({teamSize}m²)</p>
                  <span className="text-[10px] text-stone-500 block">단위: 개체/m²</span>
                </div>
                <div className="p-2.5 bg-white border-2 border-stone-300 space-y-1">
                  <strong className="text-emerald-800 block text-xs">② 빈도 (Frequency)</strong>
                  <p className="text-stone-700 font-mono text-[11px]">= (출현 방형구 수 ÷ {teamSize}) × 100</p>
                  <span className="text-[10px] text-stone-500 block">단위: %</span>
                </div>
                <div className="p-2.5 bg-white border-2 border-stone-300 space-y-1">
                  <strong className="text-emerald-800 block text-xs">③ 피도 (Coverage)</strong>
                  <p className="text-stone-700 font-mono text-[11px]">= 차지 면적의 합(%) ÷ {teamSize}</p>
                  <span className="text-[10px] text-stone-500 block">단위: %</span>
                </div>
                <div className="p-2.5 bg-white border-2 border-stone-300 space-y-1">
                  <strong className="text-blue-800 block text-xs">④ 상대밀도 (RD)</strong>
                  <p className="text-stone-700 font-mono text-[11px]">= (특정 종의 밀도 ÷ 총 밀도) × 100</p>
                  <span className="text-[10px] text-stone-500 block">단위: % (합계: 100%)</span>
                </div>
                <div className="p-2.5 bg-white border-2 border-stone-300 space-y-1">
                  <strong className="text-blue-800 block text-xs">⑤ 상대빈도 (RF)</strong>
                  <p className="text-stone-700 font-mono text-[11px]">= (특정 종의 빈도 ÷ 총 빈도) × 100</p>
                  <span className="text-[10px] text-stone-500 block">단위: % (합계: 100%)</span>
                </div>
                <div className="p-2.5 bg-white border-2 border-stone-300 space-y-1">
                  <strong className="text-blue-800 block text-xs">⑥ 상대피도 (RC)</strong>
                  <p className="text-stone-700 font-mono text-[11px]">= (특정 종의 피도 ÷ 총 피도) × 100</p>
                  <span className="text-[10px] text-stone-500 block">단위: % (합계: 100%)</span>
                </div>
                <div className="p-2.5 bg-[#fefce8] border-2 border-amber-500 col-span-1 sm:col-span-2 lg:col-span-3 space-y-1">
                  <strong className="text-amber-900 block font-bold text-xs">★ 중요치 (Importance Value, IV)</strong>
                  <p className="text-stone-900 font-mono font-bold text-xs">
                    = 상대밀도(%) + 상대빈도(%) + 상대피도(%)
                  </p>
                  <span className="text-[11px] text-stone-700 block">
                    ※ 3대 상대값의 합이며, 중요치가 가장 높은 종이 그 군집의 <strong>우점종</strong>이 됩니다. (합계: 300)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Reference Ribbon: 2단계에서 계산한 합산 수치들 */}
          <div className="bg-[#242b18] text-[#f7fee7] border-4 border-stone-900 p-4 shadow-[6px_6px_0px_#1c1917] space-y-2.5 pixel-font">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3f4f24] pb-2">
              <span className="text-xs font-bold text-[#facc15] flex items-center gap-1.5">
                <span>★ [2단계 모둠 합산 기준 자료]</span>
                <span className="text-stone-200">아래 자료를 이용하여 지표를 계산하세요:</span>
              </span>
              <span className="text-[11px] text-stone-300 font-mono">
                조사 총면적: {teamSize}m² (방형구 {teamSize}개)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              {PLANT_SPECIES_LIST.map(spec => {
                const stat = trueStats[spec.id];
                return (
                  <div key={spec.id} className="bg-[#1a2211] border border-[#3f4f24] p-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-stone-200 font-bold border-b border-[#3f4f24] pb-1">
                      <BotanicalIcon species={spec.id} size={18} />
                      <span>{spec.koreanName}</span>
                    </div>
                    <div className="grid grid-cols-3 text-[10px] text-stone-400 font-mono pt-0.5">
                      <div>
                        총개체: <strong className="text-white">{stat.totalCount}</strong>
                      </div>
                      <div>
                        출현: <strong className="text-white">{stat.quadratOccurrences}개</strong>
                      </div>
                      <div>
                        면적합: <strong className="text-white">{Math.round(stat.cover * teamSize)}%</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MODE 1: STUDENT INPUT (수기 계산 입력 모드) */}
          {viewMode === 'input' && (
            <>
              {/* OPTION A: SPECIES CARD VIEW */}
              {inputLayoutMode === 'cards' && (
                <div className="space-y-4">
                  {PLANT_SPECIES_LIST.map(spec => {
                    const spId = spec.id;
                    const trueStat = trueStats[spId];
                    const inputRow = inputs[spId];

                    return (
                      <div
                        key={spId}
                        className="bg-white border-4 border-stone-900 shadow-[5px_5px_0px_#1c1917] p-4 sm:p-5 space-y-4"
                      >
                        {/* Species Header & Raw Data Summary */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b-2 border-stone-800 pb-3">
                          <div className="flex items-center gap-3">
                            <BotanicalIcon species={spId} size={36} />
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-base text-stone-900 pixel-font">
                                  {spec.koreanName}
                                </h3>
                                <span className="text-xs text-stone-500 italic font-mono">
                                  ({spec.scientificName})
                                </span>
                              </div>
                              <span className="text-xs text-stone-600 pixel-font">
                                {spec.characteristics}
                              </span>
                            </div>
                          </div>

                          {/* Raw Observations Summary Badges */}
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono pixel-font bg-[#f4f2eb] p-2 border-2 border-stone-800">
                            <div className="text-stone-700">
                              총개체수: <strong className="text-stone-900">{trueStat.totalCount}개</strong>
                            </div>
                            <span className="text-stone-400">|</span>
                            <div className="text-stone-700">
                              출현 방형구: <strong className="text-stone-900">{trueStat.quadratOccurrences}/{teamSize}개</strong>
                            </div>
                            <span className="text-stone-400">|</span>
                            <div className="text-stone-700">
                              차지면적 합: <strong className="text-stone-900">{Math.round(trueStat.cover * teamSize)}%</strong>
                            </div>
                          </div>
                        </div>

                        {/* 6 Ecological Indices + Importance Value Form Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pixel-font">
                          {/* 1. Density */}
                          <div className="bg-[#f0fdf4] border-2 border-emerald-800 p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="font-bold text-emerald-950">① 밀도 (Density)</label>
                              <span className="text-[10px] text-emerald-800 font-mono font-bold">개체/m²</span>
                            </div>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={inputRow.density}
                              placeholder="수치 입력"
                              onChange={e => onUpdateInput(spId, 'density', e.target.value)}
                              className="w-full py-1 px-2 text-sm font-mono font-bold border-2 border-stone-900 bg-white focus:outline-emerald-600"
                            />
                          </div>

                          {/* 2. Frequency */}
                          <div className="bg-[#f0fdf4] border-2 border-emerald-800 p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="font-bold text-emerald-950">② 빈도 (Frequency)</label>
                              <span className="text-[10px] text-emerald-800 font-mono font-bold">%</span>
                            </div>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={inputRow.frequency}
                              placeholder="수치 입력"
                              onChange={e => onUpdateInput(spId, 'frequency', e.target.value)}
                              className="w-full py-1 px-2 text-sm font-mono font-bold border-2 border-stone-900 bg-white focus:outline-emerald-600"
                            />
                          </div>

                          {/* 3. Cover */}
                          <div className="bg-[#f0fdf4] border-2 border-emerald-800 p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="font-bold text-emerald-950">③ 피도 (Coverage)</label>
                              <span className="text-[10px] text-emerald-800 font-mono font-bold">%</span>
                            </div>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={inputRow.cover}
                              placeholder="수치 입력"
                              onChange={e => onUpdateInput(spId, 'cover', e.target.value)}
                              className="w-full py-1 px-2 text-sm font-mono font-bold border-2 border-stone-900 bg-white focus:outline-emerald-600"
                            />
                          </div>

                          {/* 4. Relative Density */}
                          <div className="bg-[#fefce8] border-2 border-amber-700 p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="font-bold text-amber-950">④ 상대밀도 (RD)</label>
                              <span className="text-[10px] text-amber-800 font-mono font-bold">%</span>
                            </div>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={inputRow.relativeDensity}
                              placeholder="수치 입력"
                              onChange={e => onUpdateInput(spId, 'relativeDensity', e.target.value)}
                              className="w-full py-1 px-2 text-sm font-mono font-bold border-2 border-stone-900 bg-white focus:outline-amber-600"
                            />
                          </div>

                          {/* 5. Relative Frequency */}
                          <div className="bg-[#fefce8] border-2 border-amber-700 p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="font-bold text-amber-950">⑤ 상대빈도 (RF)</label>
                              <span className="text-[10px] text-amber-800 font-mono font-bold">%</span>
                            </div>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={inputRow.relativeFrequency}
                              placeholder="수치 입력"
                              onChange={e => onUpdateInput(spId, 'relativeFrequency', e.target.value)}
                              className="w-full py-1 px-2 text-sm font-mono font-bold border-2 border-stone-900 bg-white focus:outline-amber-600"
                            />
                          </div>

                          {/* 6. Relative Cover */}
                          <div className="bg-[#fefce8] border-2 border-amber-700 p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="font-bold text-amber-950">⑥ 상대피도 (RC)</label>
                              <span className="text-[10px] text-amber-800 font-mono font-bold">%</span>
                            </div>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={inputRow.relativeCover}
                              placeholder="수치 입력"
                              onChange={e => onUpdateInput(spId, 'relativeCover', e.target.value)}
                              className="w-full py-1 px-2 text-sm font-mono font-bold border-2 border-stone-900 bg-white focus:outline-amber-600"
                            />
                          </div>

                          {/* 7. Importance Value */}
                          <div className="bg-[#eff6ff] border-2 border-blue-900 p-2.5 space-y-1.5 sm:col-span-2">
                            <div className="flex items-center justify-between">
                              <label className="font-bold text-blue-950">⑦ 중요치 (Importance Value, IV)</label>
                              <span className="text-[10px] text-blue-800 font-mono font-bold">최대 300</span>
                            </div>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={inputRow.importanceValue}
                              placeholder="상대값 합산 수치 입력"
                              onChange={e => onUpdateInput(spId, 'importanceValue', e.target.value)}
                              className="w-full py-1.5 px-2 text-sm font-mono font-extrabold border-2 border-stone-900 bg-white text-blue-950 focus:outline-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* OPTION B: COMPREHENSIVE SPREADSHEET TABLE VIEW */}
              {inputLayoutMode === 'table' && (
                <div className="bg-white border-4 border-stone-900 shadow-[5px_5px_0px_#1c1917] p-4 sm:p-5 space-y-3">
                  <div className="overflow-x-auto border-2 border-stone-900">
                    <table className="w-full text-xs pixel-font border-collapse">
                      <thead>
                        <tr className="bg-[#242b18] text-[#f7fee7]">
                          <th className="p-2 border-r border-stone-700 text-left min-w-[120px]">식물종명</th>
                          <th className="p-2 border-r border-stone-700 text-center min-w-[75px]">밀도(개체/m²)</th>
                          <th className="p-2 border-r border-stone-700 text-center min-w-[75px]">빈도(%)</th>
                          <th className="p-2 border-r border-stone-700 text-center min-w-[75px]">피도(%)</th>
                          <th className="p-2 border-r border-stone-700 text-center min-w-[80px]">상대밀도(%)</th>
                          <th className="p-2 border-r border-stone-700 text-center min-w-[80px]">상대빈도(%)</th>
                          <th className="p-2 border-r border-stone-700 text-center min-w-[80px]">상대피도(%)</th>
                          <th className="p-2 text-center min-w-[90px] bg-[#1e3a8a] text-white">중요치(IV)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-300">
                        {PLANT_SPECIES_LIST.map(spec => {
                          const spId = spec.id;
                          const inRow = inputs[spId];

                          return (
                            <tr key={spId} className="hover:bg-stone-50">
                              <td className="p-2.5 border-r border-stone-300 font-bold text-stone-900">
                                <div className="flex items-center gap-1.5">
                                  <BotanicalIcon species={spId} size={22} />
                                  <span>{spec.koreanName}</span>
                                </div>
                              </td>
                              <td className="p-1 border-r border-stone-300 text-center">
                                <TableCellInput
                                  value={inRow.density}
                                  placeholder="밀도"
                                  onChange={v => onUpdateInput(spId, 'density', v)}
                                />
                              </td>
                              <td className="p-1 border-r border-stone-300 text-center">
                                <TableCellInput
                                  value={inRow.frequency}
                                  placeholder="빈도"
                                  onChange={v => onUpdateInput(spId, 'frequency', v)}
                                />
                              </td>
                              <td className="p-1 border-r border-stone-300 text-center">
                                <TableCellInput
                                  value={inRow.cover}
                                  placeholder="피도"
                                  onChange={v => onUpdateInput(spId, 'cover', v)}
                                />
                              </td>
                              <td className="p-1 border-r border-stone-300 text-center">
                                <TableCellInput
                                  value={inRow.relativeDensity}
                                  placeholder="상대밀도"
                                  onChange={v => onUpdateInput(spId, 'relativeDensity', v)}
                                />
                              </td>
                              <td className="p-1 border-r border-stone-300 text-center">
                                <TableCellInput
                                  value={inRow.relativeFrequency}
                                  placeholder="상대빈도"
                                  onChange={v => onUpdateInput(spId, 'relativeFrequency', v)}
                                />
                              </td>
                              <td className="p-1 border-r border-stone-300 text-center">
                                <TableCellInput
                                  value={inRow.relativeCover}
                                  placeholder="상대피도"
                                  onChange={v => onUpdateInput(spId, 'relativeCover', v)}
                                />
                              </td>
                              <td className="p-1 text-center bg-blue-50/50">
                                <TableCellInput
                                  value={inRow.importanceValue}
                                  placeholder="중요치"
                                  onChange={v => onUpdateInput(spId, 'importanceValue', v)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bottom Proceed to Comparison Mode Button */}
              <div className="bg-[#fcfaf5] p-5 border-4 border-stone-900 shadow-[6px_6px_0px_#1c1917] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-stone-600 pixel-font space-y-0.5">
                  <span className="font-bold text-stone-900 block">
                    수기 계산값을 모두 입력한 후 아래 버튼을 클릭하세요:
                  </span>
                  <span>
                    자신이 계산한 값과 실제 정밀 측정값을 비교하여 오차 여부를 즉시 피드백받을 수 있습니다.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToComparison}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-[#15803d] hover:bg-[#166534] border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[3px_3px_0px_#000]"
                >
                  <Eye className="w-4 h-4" />
                  <span>내 계산값과 실제 측정값 비교·채점하기 ▶</span>
                </button>
              </div>
            </>
          )}

          {/* MODE 2: COMPARISON & VERIFICATION MODE */}
          {viewMode === 'comparison' && evaluation && (
            <div className="space-y-4">
              {/* Comparison Summary Banner */}
              <div className="bg-[#242b18] text-[#f7fee7] border-4 border-stone-900 p-4 shadow-[5px_5px_0px_#1c1917] flex flex-wrap items-center justify-between gap-3 pixel-font">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3f4f24] border-2 border-black flex items-center justify-center text-[#bef264] shadow-[2px_2px_0px_#000]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#facc15]">
                      측정값 대비 채점 결과: {correctCount} / {totalGradedCells} 칸 일치
                    </h3>
                    <p className="text-xs text-[#d9f99d] mt-0.5">
                      오차가 있는 항목(✕)은 종이 학습지의 공식을 확인한 후 다시 수정해 보세요.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('input')}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-900 bg-[#fde047] hover:bg-[#facc15] border-2 border-black pixel-btn cursor-pointer shadow-[2px_2px_0px_#000]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>계산표 다시 수정하기</span>
                  </button>
                </div>
              </div>

              {/* Detailed Feedback Cards for 4 Species */}
              <div className="space-y-4">
                {PLANT_SPECIES_LIST.map(spec => {
                  const spId = spec.id;
                  const stat = trueStats[spId];
                  const inRow = inputs[spId];
                  const evalRow = evaluation[spId];

                  const metrics: Array<{
                    key: keyof StudentTableInput;
                    name: string;
                    unit: string;
                    studentVal: string;
                    trueVal: number;
                  }> = [
                    { key: 'density', name: '밀도', unit: '개체/m²', studentVal: inRow.density, trueVal: stat.density },
                    { key: 'frequency', name: '빈도', unit: '%', studentVal: inRow.frequency, trueVal: stat.frequency },
                    { key: 'cover', name: '피도', unit: '%', studentVal: inRow.cover, trueVal: stat.cover },
                    { key: 'relativeDensity', name: '상대밀도', unit: '%', studentVal: inRow.relativeDensity, trueVal: stat.relativeDensity },
                    { key: 'relativeFrequency', name: '상대빈도', unit: '%', studentVal: inRow.relativeFrequency, trueVal: stat.relativeFrequency },
                    { key: 'relativeCover', name: '상대피도', unit: '%', studentVal: inRow.relativeCover, trueVal: stat.relativeCover },
                    { key: 'importanceValue', name: '중요치(IV)', unit: '', studentVal: inRow.importanceValue, trueVal: stat.importanceValue },
                  ];

                  return (
                    <div
                      key={spId}
                      className="bg-white border-4 border-stone-900 shadow-[5px_5px_0px_#1c1917] p-4 sm:p-5 space-y-3"
                    >
                      <div className="flex items-center gap-2.5 border-b-2 border-stone-800 pb-2">
                        <BotanicalIcon species={spId} size={32} />
                        <div>
                          <h4 className="text-base font-bold text-stone-900 pixel-font">{spec.koreanName}</h4>
                          <span className="text-[11px] text-stone-500 font-serif italic">{spec.scientificName}</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto border-2 border-stone-800">
                        <table className="w-full text-xs pixel-font border-collapse">
                          <thead>
                            <tr className="bg-stone-100 border-b border-stone-800 text-stone-800">
                              <th className="p-2 border-r border-stone-300 text-left">생태 지표</th>
                              <th className="p-2 border-r border-stone-300 text-center">내 계산값</th>
                              <th className="p-2 border-r border-stone-300 text-center">실제 측정값</th>
                              <th className="p-2 border-r border-stone-300 text-center">판정</th>
                              <th className="p-2 text-left">피드백</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200">
                            {metrics.map(m => {
                              const status = evalRow[m.key as keyof StudentTableEvaluation];
                              const isCorrect = status === 'correct';

                              return (
                                <tr key={m.key} className={isCorrect ? 'bg-emerald-50/40' : 'bg-rose-50/40'}>
                                  <td className="p-2 border-r border-stone-200 font-bold text-stone-900">
                                    {m.name}
                                  </td>
                                  <td className="p-2 border-r border-stone-200 text-center font-mono font-bold">
                                    {m.studentVal || '(미입력)'} {m.unit}
                                  </td>
                                  <td className="p-2 border-r border-stone-200 text-center font-mono text-stone-600 bg-stone-100/50">
                                    {m.trueVal.toFixed(1)} {m.unit}
                                  </td>
                                  <td className="p-2 border-r border-stone-200 text-center">
                                    {isCorrect ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 border border-emerald-600">
                                        ✓ 일치
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 border border-rose-500">
                                        ✕ 오차
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2 text-stone-700 text-[11px] pixel-font">
                                    {isCorrect ? (
                                      <span className="text-emerald-800 font-medium">✓ 참값과 정확하게 일치합니다.</span>
                                    ) : (
                                      <span className="text-rose-700 font-medium">
                                        ✕ 학습지의 공식을 확인하고 나눗셈을 다시 계산해 보세요.
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Footer for Comparison View */}
              <div className="bg-[#fcfaf5] p-5 border-4 border-stone-900 shadow-[6px_6px_0px_#1c1917] flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setViewMode('input')}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-stone-800 bg-white hover:bg-stone-100 border-2 border-stone-900 pixel-btn pixel-font cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>계산표 다시 수정하기</span>
                </button>

                <button
                  type="button"
                  onClick={onProceedToDominantSpecies}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#15803d] hover:bg-[#166534] border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[3px_3px_0px_#000]"
                >
                  <span>우점종 판별 단계로 이동 [NEXT]</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Victory Celebration Modal */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in select-none">
          <div className="bg-[#fefce8] border-4 border-black p-6 shadow-[8px_8px_0px_#000] max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 bg-[#facc15] border-2 border-black mx-auto flex items-center justify-center text-stone-950 shadow-[2px_2px_0px_#000]">
              <CheckCircle2 className="w-8 h-8 text-emerald-800" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-stone-900 pixel-font">
                ★ QUEST CLEAR! 채점 완료! ★
              </h3>
              <p className="text-xs text-stone-700 pixel-font mt-1.5 leading-relaxed">
                축하합니다! 4종 식물의 모든 생태 지수(밀도·빈도·피도·상대값·중요치)를 한 칸의 오차도 없이 정확하게 계산했습니다!
              </p>
            </div>
            <div className="bg-[#f0fdf4] p-2.5 border-2 border-emerald-700 text-xs text-emerald-950 font-bold pixel-font">
              정답률 100% ({totalGradedCells}/{totalGradedCells}) 완벽 달성!
            </div>
            <button
              type="button"
              onClick={() => {
                setShowVictoryModal(false);
                onProceedToDominantSpecies();
              }}
              className="w-full py-2.5 text-xs font-bold text-white bg-[#15803d] hover:bg-[#166534] border-2 border-black pixel-btn pixel-font cursor-pointer"
            >
              우점종 판별하러 가기 ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface TableCellInputProps {
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
}

const TableCellInput: React.FC<TableCellInputProps> = ({
  value,
  placeholder = '',
  onChange,
}) => {
  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full py-1 px-1.5 text-xs font-mono rounded-none border-2 border-stone-400 bg-white focus:outline-emerald-600 focus:bg-emerald-50/30"
    />
  );
};
