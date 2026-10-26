import React, { useState, useMemo } from 'react';
import { PlantIndividual, PlantSpeciesId, Quadrat, QuadratInspection, TeamSize } from '../types/ecology';
import { PLANT_SPECIES_LIST, PLANT_SPECIES } from '../utils/communityGenerator';
import { isPlantFullyInQuadrat } from '../utils/quadratMath';
import { PlantIllustration, BotanicalIcon } from './PlantIllustration';
import {
  X,
  Grid,
  Check,
  ChevronLeft,
  ChevronRight,
  Save,
  HelpCircle,
  Crosshair,
  Eye,
} from 'lucide-react';

interface QuadratZoomModalProps {
  quadrat: Quadrat;
  plants: PlantIndividual[];
  inspection: QuadratInspection;
  onSaveInspection: (inspection: QuadratInspection) => void;
  onClose: () => void;
  onNavigateQuadrat: (targetId: number) => void;
  allQuadrats: Quadrat[];
  teamSize?: TeamSize;
}

export const QuadratZoomModal: React.FC<QuadratZoomModalProps> = ({
  quadrat,
  plants,
  inspection,
  onSaveInspection,
  onClose,
  onNavigateQuadrat,
  allQuadrats,
  teamSize = 5,
}) => {
  // Local state for counts and covers
  const [counts, setCounts] = useState<Record<PlantSpeciesId, number>>(inspection.speciesCounts);
  const [covers, setCovers] = useState<Record<PlantSpeciesId, number>>(inspection.speciesCovers);
  const [checkedPlantIds, setCheckedPlantIds] = useState<string[]>(
    inspection.checkedPlantIds || []
  );

  const [showGrid10x10, setShowGrid10x10] = useState<boolean>(true);
  const [showRootPoints, setShowRootPoints] = useState<boolean>(true);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [showHelpNotice, setShowHelpNotice] = useState<boolean>(false);
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);

  // Filter only plants that are completely inside the quadrat boundaries (no hanging over borders)
  const visiblePlants = useMemo(() => {
    return plants.filter(p => isPlantFullyInQuadrat(p, quadrat));
  }, [plants, quadrat]);

  const maxQuadratId = Math.min(teamSize, allQuadrats.length);

  const togglePlantChecked = (plantId: string) => {
    setSelectedPlantId(plantId);
    setCheckedPlantIds(prev =>
      prev.includes(plantId) ? prev.filter(id => id !== plantId) : [...prev, plantId]
    );
  };

  const handleCountChange = (species: PlantSpeciesId, valStr: string) => {
    const val = parseInt(valStr, 10);
    setCounts(prev => ({
      ...prev,
      [species]: isNaN(val) ? 0 : Math.max(0, val),
    }));
  };

  const handleCoverChange = (species: PlantSpeciesId, valStr: string) => {
    const val = parseFloat(valStr);
    setCovers(prev => ({
      ...prev,
      [species]: isNaN(val) ? 0 : Math.max(0, Math.min(100, val)),
    }));
  };

  const handleSave = () => {
    onSaveInspection({
      quadratId: quadrat.id,
      speciesCounts: counts,
      speciesCovers: covers,
      checkedPlantIds,
    });
    setShowSaveToast(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const selectedPlant = plants.find(p => p.id === selectedPlantId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="bg-[#fcfaf5] border-4 border-stone-900 shadow-[8px_8px_0px_#1c1917] w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header (Pixel RPG Quest style) */}
        <div className="px-4 py-3 border-b-3 border-stone-900 bg-[#354323] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-bold text-white px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] pixel-font"
              style={{ backgroundColor: quadrat.color }}
            >
              #{quadrat.id}번 방형구
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-[#facc15] pixel-font">
              [1단계 · 개별활동] #{quadrat.id}번 방형구 조사 (개체수 및 차지한 면적 기록)
            </h2>
          </div>

          {/* Quick navigation between active quadrats */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#1a1e12] border-2 border-black p-0.5 shadow-[1px_1px_0px_#000]">
              <button
                type="button"
                disabled={quadrat.id <= 1}
                onClick={() => onNavigateQuadrat(quadrat.id - 1)}
                className="p-1 text-[#a3e635] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="이전 방형구"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold px-1.5 text-[#facc15] pixel-font font-mono">
                {quadrat.id} / {maxQuadratId}
              </span>
              <button
                type="button"
                disabled={quadrat.id >= maxQuadratId}
                onClick={() => onNavigateQuadrat(quadrat.id + 1)}
                className="p-1 text-[#a3e635] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="다음 방형구"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="p-1 text-stone-900 bg-[#f87171] hover:bg-[#ef4444] border-2 border-black pixel-btn cursor-pointer"
              title="닫기"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Enlarged Quadrat Viewport (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* Viewport Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowGrid10x10(!showGrid10x10)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold border-2 border-stone-900 pixel-btn pixel-font cursor-pointer ${
                    showGrid10x10
                      ? 'bg-[#86efac] text-[#052e16]'
                      : 'bg-white text-stone-700 hover:bg-stone-100'
                  }`}
                  title="피도 측정을 위한 10x10 보조 격자 (1칸 = 1% 피도)"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>10×10 피도 격자 (1칸=1%)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRootPoints(!showRootPoints)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold border-2 border-stone-900 pixel-btn pixel-font cursor-pointer ${
                    showRootPoints
                      ? 'bg-[#fef08a] text-[#713f12]'
                      : 'bg-white text-stone-700 hover:bg-stone-100'
                  }`}
                  title="식물의 뿌리 중심점 표시"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>뿌리 기준점</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowHelpNotice(!showHelpNotice)}
                className="text-stone-700 hover:text-black flex items-center gap-1 text-[11px] pixel-font cursor-pointer underline"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-800" />
                <span>조사 규칙 안내</span>
              </button>
            </div>

            {/* Helper Notice Collapsible */}
            {showHelpNotice && (
              <div className="bg-[#fef9c3] border-2 border-amber-600 p-3 text-xs text-amber-950 space-y-1 pixel-font">
                <p>
                  <strong>• 명확한 조사 기준:</strong> 방형구 테두리 안에 완전히 들어와 있는 식물만 표시됩니다. 경계에 걸쳐진 식물은 배제되어 헷갈리지 않고 정확히 셀 수 있습니다.
                </p>
                <p>
                  <strong>• 피도(%) 추정 기준:</strong> 잎과 꽃이 방형구 바닥을 덮는 수직 투영 면적입니다. 10×10 격자에서 사각형 1칸이 전체 면적의 <strong>1%</strong>입니다.
                </p>
                <p>
                  <strong>• 중복 집계 방지:</strong> 화면의 식물을 클릭하면 체크 표시가 되어 중복 계산을 방지할 수 있습니다.
                </p>
              </div>
            )}

            {/* Enlarged 1m x 1m Quadrat Square (16-bit RPG Top-down Tile View) */}
            <div className="relative w-full aspect-square bg-[#224422] overflow-hidden border-4 border-stone-900 shadow-[4px_4px_0px_#1c1917] select-none">
              {/* Organic ground texture */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #1b3815 25%, transparent 25%),
                    linear-gradient(-45deg, #1b3815 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #1b3815 75%),
                    linear-gradient(-45deg, transparent 75%, #1b3815 75%)
                  `,
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                }}
              />

              {/* 10x10 Cover Auxiliary Grid (1 cell = 1% cover) */}
              {showGrid10x10 && (
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none z-20 opacity-55">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-r border-b border-white/60"
                    />
                  ))}
                </div>
              )}

              {/* Plants Rendered in Local Quadrat Coordinates */}
              <div className="absolute inset-0 overflow-hidden">
                {visiblePlants.map(plant => {
                  const relX = ((plant.x - quadrat.x) / quadrat.size) * 100;
                  const relY = ((plant.y - quadrat.y) / quadrat.size) * 100;
                  const relDiameter = ((plant.radius * 2) / quadrat.size) * 100;

                  const isChecked = checkedPlantIds.includes(plant.id);
                  const isSelected = selectedPlantId === plant.id;

                  return (
                    <div
                      key={plant.id}
                      onClick={e => {
                        e.stopPropagation();
                        togglePlantChecked(plant.id);
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-105 ${
                        isSelected ? 'z-30' : 'z-10'
                      }`}
                      style={{
                        left: `${relX}%`,
                        top: `${relY}%`,
                        width: `${relDiameter}%`,
                        height: `${relDiameter}%`,
                      }}
                      title={`${PLANT_SPECIES[plant.species].koreanName} (클릭하여 체크)`}
                    >
                      <PlantIllustration
                        species={plant.species}
                        radius={plant.radius}
                        rotation={plant.rotation}
                        variety={plant.variety}
                        showRootPoint={showRootPoints}
                        isInspected={isChecked}
                        className="w-full h-full"
                      />

                      {/* Checked Visual Badge */}
                      {isChecked && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                          <div className="bg-[#15803d] text-white border-2 border-white shadow-[1px_1px_0px_#000] p-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quadrat Outer Boundary Rulers */}
              <div className="absolute inset-0 border-2 border-dashed border-white/70 pointer-events-none" />
              <div className="absolute bottom-2 left-2 text-[10px] text-white font-mono bg-black/80 px-2 py-0.5 border border-white/40 pointer-events-none pixel-font">
                규격: 1m × 1m (100칸) · 완입 개체만 표시
              </div>
            </div>

            {/* Selected Plant Specimen Detail Bar */}
            {selectedPlant ? (
              <div className="bg-white border-2 border-stone-900 p-2.5 flex items-center justify-between text-xs pixel-font shadow-[2px_2px_0px_#1c1917]">
                <div className="flex items-center gap-2">
                  <BotanicalIcon species={selectedPlant.species} size={32} />
                  <div>
                    <span className="font-bold text-stone-900">
                      선택 개체: {PLANT_SPECIES[selectedPlant.species].koreanName}
                    </span>
                    <span className="text-emerald-800 ml-2 font-medium">
                      (방형구 내 완입 개체 ✓)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => togglePlantChecked(selectedPlant.id)}
                  className="px-2.5 py-1 text-xs font-bold bg-[#15803d] text-white border border-black pixel-btn cursor-pointer"
                >
                  {checkedPlantIds.includes(selectedPlant.id) ? '체크 해제' : '체크 완료'}
                </button>
              </div>
            ) : (
              <p className="text-stone-500 text-xs italic text-center pixel-font">
                방형구 안의 식물을 클릭하면 체크 표시 및 식별 정보를 확인할 수 있습니다.
              </p>
            )}
          </div>

          {/* Right Column: Quadrat Survey Input Table (5 cols) styled like Retro RPG Inventory */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#f5f2eb] border-3 border-stone-900 p-4 shadow-[4px_4px_0px_#1c1917]">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 pixel-font">
                    [1단계 · 개별활동] #{quadrat.id}번 방형구 관측 기록
                  </h3>
                  <p className="text-[11px] text-stone-600 pixel-font">
                    토끼풀, 민들레, 제비꽃, 강아지풀의 개체수와 차지한 면적(%) 기록
                  </p>
                </div>
                <div
                  className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 bg-[#dcfce7] px-2.5 py-1 border border-emerald-700 pixel-font shadow-[2px_2px_0px_#14532d]"
                  title="10×10 격자와 식물 클릭 체크를 활용하여 직접 관측합니다"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                  <span>개별 관측 기록</span>
                </div>
              </div>

              {/* Clarification banner about ecological metrics flow */}
              <div className="bg-[#eff6ff] border-2 border-blue-600 p-2.5 text-xs text-blue-950 pixel-font space-y-1">
                <div className="font-bold text-blue-900 flex items-center gap-1">
                  <span>📌</span>
                  <span>[1단계: 개별활동 안내]</span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-900">
                  모둠원별로 자신이 맡은 방형구에 대한 <strong>토끼풀, 민들레, 제비꽃, 강아지풀</strong>의 <strong>개체수</strong>와 <strong>차지한 면적(피도, %)</strong>을 직접 세고 측정하여 기록합니다.
                </p>
              </div>

              {/* 4 Species Input Cards */}
              <div className="space-y-2.5">
                {PLANT_SPECIES_LIST.map(spec => {
                  const cVal = counts[spec.id] ?? 0;
                  const covVal = covers[spec.id] ?? 0;

                  return (
                    <div
                      key={spec.id}
                      className="bg-white p-2.5 border-2 border-stone-800 shadow-[2px_2px_0px_#000] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BotanicalIcon species={spec.id} size={28} />
                          <span className="text-xs font-bold text-stone-900 pixel-font">
                            {spec.koreanName}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono pixel-font">
                          1칸 = 1% 차지 면적
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-0.5 pixel-font">
                            개체수 (개체)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={cVal === 0 ? '' : cVal}
                            placeholder="0"
                            onChange={e => handleCountChange(spec.id, e.target.value)}
                            className="w-full px-2 py-1 border-2 border-stone-800 bg-[#fafaf9] font-mono font-bold text-sm focus:outline-emerald-600 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-0.5 pixel-font">
                            차지한 면적 (피도, %)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={covVal === 0 ? '' : covVal}
                              placeholder="0"
                              onChange={e => handleCoverChange(spec.id, e.target.value)}
                              className="w-full px-2 py-1 border-2 border-stone-800 bg-[#fafaf9] font-mono font-bold text-sm pr-6 focus:outline-emerald-600 focus:bg-white"
                            />
                            <span className="absolute right-2 top-1.5 text-xs text-stone-500 font-mono font-bold">
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t-2 border-stone-800 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-bold text-stone-800 bg-stone-200 hover:bg-stone-300 border-2 border-stone-900 pixel-btn pixel-font cursor-pointer"
              >
                닫기
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#15803d] hover:bg-[#166534] border-2 border-stone-900 pixel-btn pixel-font cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>[1단계 저장] #{quadrat.id}번 개체수 및 차지한 면적 저장</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Toast Animation */}
        {showSaveToast && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none">
            <div className="bg-[#fef08a] border-4 border-black p-4 shadow-[6px_6px_0px_#000] text-stone-950 font-bold pixel-font text-center animate-bounce">
              <div className="text-base text-emerald-900">★ INVESTIGATION SAVED! ★</div>
              <div className="text-xs text-stone-800 mt-1">#{quadrat.id}번 방형구 조사가 완료되었습니다!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
