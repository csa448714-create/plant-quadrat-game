import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  GameStep,
  PlantSpeciesId,
  QuadratInspection,
  StudentTableInput,
  TeamSize,
} from './types/ecology';
import {
  FIXED_PLANTS,
  FIXED_QUADRATS,
  FIXED_TRUE_QUADRAT_STATS,
} from './data/fixedEcologyData';
import {
  calculateCommunityStatistics,
  calculateExactQuadratStat,
} from './utils/quadratMath';
import {
  fetchGroupData,
  saveQuadratToGroup,
  initGroupConfig,
  resetGroupData,
} from './utils/groupSync';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { IntroStep } from './components/IntroStep';
import { RoleSelectStep } from './components/RoleSelectStep';
import { MeadowCanvas } from './components/MeadowCanvas';
import { QuadratZoomModal } from './components/QuadratZoomModal';
import { CommunityTableStep } from './components/CommunityTableStep';
import { DominantSpeciesStep } from './components/DominantSpeciesStep';
import { FinalReportStep } from './components/FinalReportStep';

const STORAGE_KEY = 'quadrat_retro_pixel_game_v4';

const INITIAL_TABLE_INPUT: StudentTableInput = {
  totalCount: '',
  quadratOccurrences: '',
  totalCover: '',
  density: '',
  frequency: '',
  cover: '',
  relativeDensity: '',
  relativeFrequency: '',
  relativeCover: '',
  importanceValue: '',
};

export default function App() {
  // 1. Group & Identity State (모둠명 및 모둠원 식별)
  const [groupId, setGroupId] = useState<string>('1모둠');
  const [studentName, setStudentName] = useState<string>('1번 학생');
  const [remoteMemberNames, setRemoteMemberNames] = useState<Record<number, string>>({});

  // 2. Core Game State
  const [teamSize, setTeamSize] = useState<TeamSize>(5);
  const [assignedQuadratId, setAssignedQuadratId] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<GameStep>('intro');
  const [inspections, setInspections] = useState<Record<number, QuadratInspection>>({});
  const [studentTableInputs, setStudentTableInputs] = useState<Record<PlantSpeciesId, StudentTableInput>>({
    clover: { ...INITIAL_TABLE_INPUT },
    dandelion: { ...INITIAL_TABLE_INPUT },
    violet: { ...INITIAL_TABLE_INPUT },
    foxtail: { ...INITIAL_TABLE_INPUT },
  });
  const [selectedDominantSpecies, setSelectedDominantSpecies] = useState<PlantSpeciesId | null>(null);
  const [dominantReasoning, setDominantReasoning] = useState<string>('');
  const [inspectingQuadratId, setInspectingQuadratId] = useState<number | null>(null);

  // 3. Load from localStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.groupId) setGroupId(parsed.groupId);
        if (parsed.studentName) setStudentName(parsed.studentName);
        if (parsed.teamSize === 4 || parsed.teamSize === 5) setTeamSize(parsed.teamSize);
        if (parsed.assignedQuadratId) setAssignedQuadratId(parsed.assignedQuadratId);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.inspections) setInspections(parsed.inspections);
        if (parsed.remoteMemberNames) setRemoteMemberNames(parsed.remoteMemberNames);
        if (parsed.studentTableInputs && parsed.studentTableInputs.violet) {
          setStudentTableInputs(parsed.studentTableInputs);
        }
        if (parsed.selectedDominantSpecies) setSelectedDominantSpecies(parsed.selectedDominantSpecies);
        if (parsed.dominantReasoning) setDominantReasoning(parsed.dominantReasoning);
      }
    } catch {
      // ignore
    }
  }, []);

  // 4. Save to localStorage on state changes
  useEffect(() => {
    try {
      const payload = {
        groupId,
        studentName,
        teamSize,
        assignedQuadratId,
        currentStep,
        inspections,
        remoteMemberNames,
        studentTableInputs,
        selectedDominantSpecies,
        dominantReasoning,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [
    groupId,
    studentName,
    teamSize,
    assignedQuadratId,
    currentStep,
    inspections,
    remoteMemberNames,
    studentTableInputs,
    selectedDominantSpecies,
    dominantReasoning,
  ]);

  // 5. Real-Time Group Data Synchronization Polling
  const syncWithRemoteGroup = useCallback(async () => {
    if (!groupId) return;
    const remoteData = await fetchGroupData(groupId);
    if (!remoteData) return;

    if (remoteData.teamSize && (remoteData.teamSize === 4 || remoteData.teamSize === 5)) {
      setTeamSize(remoteData.teamSize);
    }

    if (remoteData.quadrats) {
      setRemoteMemberNames(prev => {
        const updated = { ...prev };
        Object.values(remoteData.quadrats).forEach(q => {
          updated[q.quadratId] = q.studentName;
        });
        return updated;
      });

      setInspections(prev => {
        let changed = false;
        const merged = { ...prev };

        Object.values(remoteData.quadrats).forEach(rem => {
          const existing = prev[rem.quadratId];
          if (!existing || (rem.updatedAt && (!existing.updatedAt || rem.updatedAt > existing.updatedAt))) {
            merged[rem.quadratId] = {
              quadratId: rem.quadratId,
              studentName: rem.studentName,
              speciesCounts: rem.speciesCounts as any,
              speciesCovers: rem.speciesCovers as any,
              checkedPlantIds: existing?.checkedPlantIds || [],
              updatedAt: rem.updatedAt,
            };
            changed = true;
          }
        });

        return changed ? merged : prev;
      });
    }
  }, [groupId]);

  // Poll group sync every 2.5 seconds & listen to BroadcastChannel for instant local tab sync
  useEffect(() => {
    syncWithRemoteGroup();
    const interval = setInterval(syncWithRemoteGroup, 2500);

    let ch: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window && groupId) {
      try {
        ch = new BroadcastChannel(`quadrat_group_${groupId.trim()}`);
        ch.onmessage = event => {
          if (event.data?.type === 'QUADRAT_UPDATE') {
            syncWithRemoteGroup();
          }
        };
      } catch {
        // ignore
      }
    }

    return () => {
      clearInterval(interval);
      ch?.close();
    };
  }, [groupId, syncWithRemoteGroup]);

  // Active quadrats based on teamSize (4-person uses 1~4, 5-person uses 1~5)
  const activeQuadrats = useMemo(() => {
    return FIXED_QUADRATS.filter(q => q.id <= teamSize);
  }, [teamSize]);

  // Completed inspections list for active quadrats
  const completedQuadratIds = useMemo(() => {
    return Object.keys(inspections)
      .map(k => parseInt(k, 10))
      .filter(id => id <= teamSize);
  }, [inspections, teamSize]);

  // 6. Community Statistics computed for active quadrats
  const currentCommunityTrueStats = useMemo(() => {
    const quadratData = activeQuadrats.map(q => {
      const studentInsp = inspections[q.id];
      if (studentInsp) {
        return {
          counts: studentInsp.speciesCounts,
          covers: studentInsp.speciesCovers,
        };
      }
      const fixedStat = FIXED_TRUE_QUADRAT_STATS.find(f => f.quadratId === q.id);
      if (fixedStat) {
        return {
          counts: fixedStat.counts,
          covers: fixedStat.covers,
        };
      }
      const exact = calculateExactQuadratStat(q, FIXED_PLANTS, 60);
      return {
        counts: exact.counts,
        covers: exact.covers,
      };
    });

    return calculateCommunityStatistics(quadratData, teamSize);
  }, [activeQuadrats, inspections, teamSize]);

  // Handlers for steps
  const handleStartGame = () => {
    setCurrentStep('role_select');
  };

  const handleChangeGroupId = (newGroupId: string) => {
    const trimmed = newGroupId.trim() || '1모둠';
    setGroupId(trimmed);
    setInspections({});
    setRemoteMemberNames({});
    initGroupConfig(trimmed, teamSize);
  };

  const handleChangeStudentName = (name: string) => {
    setStudentName(name);
  };

  const handleSelectAssignedQuadrat = (id: number) => {
    setAssignedQuadratId(id);
  };

  const handleChangeTeamSize = (size: TeamSize) => {
    setTeamSize(size);
    if (size === 4 && assignedQuadratId === 5) {
      setAssignedQuadratId(1);
    }
    initGroupConfig(groupId, size);
  };

  const handleProceedToSurvey = () => {
    setCurrentStep('quadrat_survey');
  };

  // Save quadrat inspection: saves locally and uploads to group backend
  const handleSaveInspection = (inspection: QuadratInspection) => {
    const updatedInspection: QuadratInspection = {
      ...inspection,
      studentName: studentName.trim() || `학생 #${inspection.quadratId}`,
      updatedAt: Date.now(),
    };

    setInspections(prev => ({
      ...prev,
      [inspection.quadratId]: updatedInspection,
    }));

    setRemoteMemberNames(prev => ({
      ...prev,
      [inspection.quadratId]: updatedInspection.studentName || `학생 #${inspection.quadratId}`,
    }));

    // Post to remote group server
    saveQuadratToGroup(groupId, updatedInspection, updatedInspection.studentName || '');
  };

  const handleUpdateTableInput = (
    species: PlantSpeciesId,
    field: keyof StudentTableInput,
    val: string
  ) => {
    setStudentTableInputs(prev => ({
      ...prev,
      [species]: {
        ...prev[species],
        [field]: val,
      },
    }));
  };

  const handleProceedToDominantSpecies = () => {
    setCurrentStep('dominant_species');
  };

  const handleSelectDominantSpecies = (sp: PlantSpeciesId) => {
    setSelectedDominantSpecies(sp);
  };

  const handleChangeDominantReasoning = (text: string) => {
    setDominantReasoning(text);
  };

  const handleProceedToFinalReport = () => {
    setCurrentStep('final_report');
  };

  // Reset local student survey data
  const handleResetCurrentSurvey = () => {
    if (
      confirm(
        `[${groupId}] 모둠의 나의 조사 및 계산 기록을 초기화하시겠습니까? (식물 군집과 방형구 좌표는 그대로 유지됩니다)`
      )
    ) {
      setInspections({});
      setRemoteMemberNames({});
      setStudentTableInputs({
        clover: { ...INITIAL_TABLE_INPUT },
        dandelion: { ...INITIAL_TABLE_INPUT },
        violet: { ...INITIAL_TABLE_INPUT },
        foxtail: { ...INITIAL_TABLE_INPUT },
      });
      setSelectedDominantSpecies(null);
      setDominantReasoning('');
      setCurrentStep('role_select');
      resetGroupData(groupId);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  // Active step title for header
  const getStepTitle = () => {
    switch (currentStep) {
      case 'intro':
        return '시뮬레이션 소개';
      case 'role_select':
        return '모둠 및 방형구 선택';
      case 'quadrat_survey':
        return '1단계 [개별활동] 방형구 조사 (개체수 및 차지한 면적)';
      case 'analysis_table':
        return '2단계(모둠 취합) & 3단계(지표 계산) [협동활동]';
      case 'dominant_species':
        return '3단계 후속 [협동활동] 우점종 판별 및 결정';
      case 'final_report':
        return '모둠 종합 분석 리포트 및 패들렛';
      default:
        return '';
    }
  };

  const inspectingQuadrat = FIXED_QUADRATS.find(q => q.id === inspectingQuadratId);
  const currentInspectionData: QuadratInspection = inspectingQuadrat
    ? inspections[inspectingQuadrat.id] || {
        quadratId: inspectingQuadrat.id,
        studentName: studentName || `학생 #${inspectingQuadrat.id}`,
        speciesCounts: { clover: 0, dandelion: 0, violet: 0, foxtail: 0 },
        speciesCovers: { clover: 0, dandelion: 0, violet: 0, foxtail: 0 },
        checkedPlantIds: [],
      }
    : ({} as any);

  const isTableDone = Object.values(studentTableInputs).some(
    row => row.importanceValue.trim() !== ''
  );
  const isDominantDone = selectedDominantSpecies !== null;

  return (
    <div className="min-h-screen flex flex-col bg-[#eef0e5] font-sans text-stone-900 selection:bg-emerald-300 selection:text-emerald-950">
      {/* 1. Header (RPG Top Bar with Group Badge & Team Size Indicator) */}
      <Header
        groupId={groupId}
        studentName={studentName}
        currentStepTitle={getStepTitle()}
        assignedQuadratId={assignedQuadratId}
        teamSize={teamSize}
        onChangeTeamSize={currentStep === 'role_select' || currentStep === 'intro' ? handleChangeTeamSize : undefined}
        onResetCommunity={handleResetCurrentSurvey}
      />

      {/* 2. Top Progress Tracker (6-step cooperative lifecycle with progress gauge) */}
      <ProgressBar
        currentStep={currentStep}
        teamSize={teamSize}
        assignedQuadratId={assignedQuadratId}
        completedQuadratCount={completedQuadratIds.length}
        isTableDone={isTableDone}
        isDominantDone={isDominantDone}
        onSelectStep={step => setCurrentStep(step)}
      />

      {/* 3. Main Stage Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-7">
        {currentStep === 'intro' && (
          <IntroStep
            teamSize={teamSize}
            onChangeTeamSize={handleChangeTeamSize}
            onStartGame={handleStartGame}
          />
        )}

        {currentStep === 'role_select' && (
          <RoleSelectStep
            groupId={groupId}
            onChangeGroupId={handleChangeGroupId}
            studentName={studentName}
            onChangeStudentName={handleChangeStudentName}
            teamSize={teamSize}
            onChangeTeamSize={handleChangeTeamSize}
            assignedQuadratId={assignedQuadratId}
            onSelectAssignedQuadrat={handleSelectAssignedQuadrat}
            onProceedToSurvey={handleProceedToSurvey}
            completedQuadratIds={completedQuadratIds}
            remoteMemberNames={remoteMemberNames}
          />
        )}

        {currentStep === 'quadrat_survey' && (
          <div className="space-y-4">
            <MeadowCanvas
              plants={FIXED_PLANTS}
              quadrats={FIXED_QUADRATS}
              teamSize={teamSize}
              assignedQuadratId={assignedQuadratId}
              completedQuadratIds={completedQuadratIds}
              onSelectQuadratForInspection={id => setInspectingQuadratId(id)}
              groupId={groupId}
              studentName={studentName}
              remoteMemberNames={remoteMemberNames}
            />

            {/* Bottom Proceed to Analysis Table Banner */}
            <div className="bg-[#fcfaf5] p-4 border-3 border-stone-900 shadow-[5px_5px_0px_#1c1917] flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
              <div className="text-xs text-stone-700 pixel-font space-y-0.5">
                {completedQuadratIds.length >= teamSize ? (
                  <span className="font-bold text-[#14532d]">
                    ✓ [{groupId}] 모둠의 {teamSize}개 방형구 조사가 모두 완료되었습니다! 이제 2단계(모둠 자료 취합 및 합산)로 이동하세요.
                  </span>
                ) : (
                  <span>
                    [{groupId}] 내 담당 방형구(#{assignedQuadratId}번)를 조사하세요. 같은 모둠원들이 조사를 완료하면 실시간으로 연동됩니다. (현재 완료: {completedQuadratIds.length} / {teamSize})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep('analysis_table')}
                  className="px-5 py-2.5 text-xs font-bold border-2 border-stone-900 pixel-btn pixel-font bg-[#15803d] hover:bg-[#166534] text-white cursor-pointer shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
                >
                  <span>[2단계: 협동활동] 모둠 자료 취합 및 합산 계산으로 이동</span>
                  <span>▶</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'analysis_table' && (
          <CommunityTableStep
            trueStats={currentCommunityTrueStats}
            teamSize={teamSize}
            inputs={studentTableInputs}
            onUpdateInput={handleUpdateTableInput}
            onProceedToDominantSpecies={handleProceedToDominantSpecies}
            inspections={inspections}
            remoteMemberNames={remoteMemberNames}
            groupId={groupId}
            assignedQuadratId={assignedQuadratId}
          />
        )}

        {currentStep === 'dominant_species' && (
          <DominantSpeciesStep
            stats={currentCommunityTrueStats}
            teamSize={teamSize}
            selectedSpecies={selectedDominantSpecies}
            reasoning={dominantReasoning}
            onSelectSpecies={handleSelectDominantSpecies}
            onChangeReasoning={handleChangeDominantReasoning}
            onProceedToFinalReport={handleProceedToFinalReport}
          />
        )}

        {currentStep === 'final_report' && (
          <FinalReportStep
            groupId={groupId}
            studentName={studentName}
            stats={currentCommunityTrueStats}
            assignedQuadratId={assignedQuadratId}
            teamSize={teamSize}
            onRestart={() => {
              setCurrentStep('role_select');
            }}
          />
        )}
      </main>

      {/* 4. Zoom Modal for Enlarged Quadrat Inspection */}
      {inspectingQuadrat && (
        <QuadratZoomModal
          quadrat={inspectingQuadrat}
          plants={FIXED_PLANTS}
          inspection={currentInspectionData}
          onSaveInspection={handleSaveInspection}
          onClose={() => setInspectingQuadratId(null)}
          onNavigateQuadrat={targetId => setInspectingQuadratId(targetId)}
          allQuadrats={activeQuadrats}
          teamSize={teamSize}
        />
      )}

      {/* Footer */}
      <footer className="border-t-3 border-stone-900 bg-[#252f19] text-[#d9f99d] py-3.5 text-center text-xs pixel-font select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>[{groupId}] 풀밭의 우점종을 찾아라! · 고등학교 생명과학 {teamSize}인 1모둠 협동 방형구법</span>
          <span className="font-mono text-[11px] text-[#bef264]">
            Trifolium repens · Taraxacum · Viola mandshurica · Setaria viridis
          </span>
        </div>
      </footer>
    </div>
  );
}
