export type PlantSpeciesId = 'clover' | 'dandelion' | 'violet' | 'foxtail';
export type TeamSize = 4 | 5;

export interface PlantSpeciesInfo {
  id: PlantSpeciesId;
  koreanName: string;
  scientificName: string;
  family: string;
  characteristics: string;
  color: string;
  accentColor: string;
  habit: string; // 생태적 특성
}

export interface PlantIndividual {
  id: string;
  species: PlantSpeciesId;
  x: number; // 0 to 1000
  y: number; // 0 to 800
  radius: number; // foliage projection radius in field units (12 - 32)
  rotation: number; // 0 - 360 degrees
  variety: number; // 0, 1, 2 (e.g. flower, seed head, leaf only)
}

export interface Quadrat {
  id: number; // 1 to 5
  x: number; // top-left x
  y: number; // top-left y
  size: number; // width & height (e.g. 160)
  color: string;
}

export interface QuadratInspection {
  quadratId: number;
  studentName?: string;
  speciesCounts: Record<PlantSpeciesId, number>; // student entered count
  speciesCovers: Record<PlantSpeciesId, number>; // student entered percent cover (0-100)
  checkedPlantIds?: string[]; // IDs of plants clicked/marked by student
  updatedAt?: number;
}

export interface TrueQuadratStat {
  quadratId: number;
  counts: Record<PlantSpeciesId, number>;
  covers: Record<PlantSpeciesId, number>; // exact % cover (0-100)
}

export interface SpeciesCommunityStat {
  species: PlantSpeciesId;
  totalCount: number; // 총개체수
  quadratOccurrences: number; // 출현 방형구 수 (0-5)
  density: number; // 밀도 (개체/m²: 총개체수 / 5)
  frequency: number; // 빈도 (%: 출현 방형구 수 / 5 * 100)
  cover: number; // 피도 (%: 5개 방형구 피도 합 / 5)
  relativeDensity: number; // 상대밀도 (%)
  relativeFrequency: number; // 상대빈도 (%)
  relativeCover: number; // 상대피도 (%)
  importanceValue: number; // 중요치 (상대밀도 + 상대빈도 + 상대피도)
}

export interface StudentTableInput {
  // 2단계: 모둠별 취합 자료 계산 (총개체수, 출현 방형구 수, 차지한 면적 합)
  totalCount?: string;
  quadratOccurrences?: string;
  totalCover?: string;

  // 3단계: 지표 계산 (밀도, 빈도, 피도, 상대값, 중요치)
  density: string;
  frequency: string;
  cover: string;
  relativeDensity: string;
  relativeFrequency: string;
  relativeCover: string;
  importanceValue: string;
}

export type TableEvaluationStatus = 'correct' | 'incorrect' | 'empty';

export interface StudentTableEvaluation {
  totalCount?: TableEvaluationStatus;
  quadratOccurrences?: TableEvaluationStatus;
  totalCover?: TableEvaluationStatus;
  density: TableEvaluationStatus;
  frequency: TableEvaluationStatus;
  cover: TableEvaluationStatus;
  relativeDensity: TableEvaluationStatus;
  relativeFrequency: TableEvaluationStatus;
  relativeCover: TableEvaluationStatus;
  importanceValue: TableEvaluationStatus;
}

export interface TruePopulationStat {
  species: PlantSpeciesId;
  totalIndividuals: number; // 전체 군집 총개체수
  density: number; // 전체 밀도 (개체 / 전체면적)
  gridOccurrences: number; // 전체 100개 격자 중 출현 격자 수
  frequency: number; // 모집단 빈도 (%)
  cover: number; // 전체 모집단 피도 (%)
  relativeDensity: number;
  relativeFrequency: number;
  relativeCover: number;
  importanceValue: number;
}

export type SamplingMode = 'manual' | 'random';

export interface UserSession {
  teamSize: TeamSize; // 4 or 5 members
  assignedQuadratId: number; // 1 to 5
  inspections: Record<number, QuadratInspection>;
  studentTableInputs: Record<PlantSpeciesId, StudentTableInput>;
  isTableSubmitted: boolean;
  selectedDominantSpecies: PlantSpeciesId | null;
  dominantReasoning: string;
  isCompleted: boolean;
}

export type GameStep = 
  | 'intro'           // 1. 게임 시작 및 5인 1모둠 협동 안내
  | 'role_select'     // 2. 담당 방형구 번호 선택 (1~5)
  | 'quadrat_survey'  // 3. 방형구 조사 (무작위 선정 고정 방형구 5개)
  | 'analysis_table'  // 4. 식물 군집 분석표 작성 및 자동 채점
  | 'dominant_species'// 5. 중요치 계산 및 우점종 판별
  | 'final_report'    // 6. 모둠 최종 결과 보고서 및 탐구 토론
;
