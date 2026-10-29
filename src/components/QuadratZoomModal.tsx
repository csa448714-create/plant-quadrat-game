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
  const [hoveredPlantId, setHoveredPlantId] = useState<string | null>(null);
  const [hoveredSpeciesId, setHoveredSpeciesId] = useState<PlantSpeciesId | null>(null);
  const [showHelpNotice, setShowHelpNotice] = useState<boolean>(false);
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);

  // Filter only plants that are completely inside the quadrat boundaries (no hanging over borders)
  const visiblePlants = useMemo(() => {
    return plants.filter(p => isPlantFullyInQuadrat(p, quadrat));
  }, [plants, quadrat]);

  // Map each plant inside the quadrat to its discrete occupied 10x10 cells
  const plantOccupiedCellsMap = useMemo(() => {
    const map = new Map<string, { col: number; row: number; key: string }[]>();
    for (const p of visiblePlants) {
      const relX = ((p.x - quadrat.x) / quadrat.size) * 10;
      const relY = ((p.y - quadrat.y) / quadrat.size) * 10;
      const c = Math.min(9, Math.max(0, Math.floor(relX)));
      const r = Math.min(9, Math.max(0, Math.floor(relY)));

      const cells: { col: number; row: number; key: string }[] = [];
      const add = (col: number, row: number) => {
        if (col >= 0 && col < 10 && row >= 0 && row < 10) {
          const key = `${col}-${row}`;
          if (!cells.some(item => item.key === key)) {
            cells.push({ col, row, key });
          }
        }
      };

      add(c, r);

      if (p.species === 'dandelion') {
        // Dandelion occupies exactly 2 cells (2%)
        add(c < 9 ? c + 1 : c - 1, r);
      } else if (p.species === 'violet') {
        // Violet occupies 2 cells (or 3 in special large specimens)
        if (p.radius > 12) {
          add(c < 9 ? c + 1 : c - 1, r);
          add(c, r < 9 ? r + 1 : r - 1);
        } else {
          add(c < 9 ? c + 1 : c - 1, r);
        }
      } else if (p.species === 'clover') {
        // Clover occupies 3~4 spreading cells
        add(c < 9 ? c + 1 : c - 1, r);
        add(c, r < 9 ? r + 1 : r - 1);
        if (p.radius > 11) {
          add(c < 9 ? c + 1 : c - 1, r < 9 ? r + 1 : r - 1);
        }
      } else if (p.species === 'foxtail') {
        // Foxtail occupies 1 slender blade cell
      }

      map.set(p.id, cells);
    }
    return map;
  }, [visiblePlants, quadrat]);

  // Set of all currently highlighted cells (due to plant hover/selection or species hover)
  const highlightedCellKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const p of visiblePlants) {
      const isTarget =
        p.id === hoveredPlantId ||
        p.id === selectedPlantId ||
        p.species === hoveredSpeciesId;
      if (isTarget) {
        const cells = plantOccupiedCellsMap.get(p.id) || [];
        cells.forEach(c => keys.add(c.key));
      }
    }
    return keys;
  }, [visiblePlants, hoveredPlantId, selectedPlantId, hoveredSpeciesId, plantOccupiedCellsMap]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="bg-[#fcfaf5] border-4 border-stone-900 shadow-[8px_8px_0px_#1c1917] w-full max-w-5xl md:max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header (Pixel RPG Quest style) */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b-3 border-stone-900 bg-[#354323] text-white flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
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

        {/* Modal Body: Side-by-side on tablet (md:) and desktop (lg:) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 grid grid-cols-1 md:grid-cols-12 gap-3.5 md:gap-4 lg:gap-5">
          {/* Left Column: Enlarged Quadrat Viewport (6 cols on tablet, 7 cols on desktop) */}
          <div className="md:col-span-6 lg:col-span-7 flex flex-col gap-2.5 sm:gap-3">
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
            <div className="relative w-full aspect-square bg-[#1f3d1b] overflow-hidden border-4 border-stone-900 shadow-[5px_5px_0px_#1c1917] select-none">
              {/* Organic ground texture */}
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #162f12 25%, transparent 25%),
                    linear-gradient(-45deg, #162f12 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #162f12 75%),
                    linear-gradient(-45deg, transparent 75%, #162f12 75%)
                  `,
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                }}
              />

              {/* 10x10 Cover Auxiliary Grid (1 cell = 1% cover) with 5-unit distinct dividers */}
              {showGrid10x10 && (
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none z-20">
                  {Array.from({ length: 100 }).map((_, i) => {
                    const col = i % 10;
                    const row = Math.floor(i / 10);
                    const key = `${col}-${row}`;
                    const isHighlighted = highlightedCellKeys.has(key);
                    const isCol5Divider = col === 4;
                    const isRow5Divider = row === 4;

                    return (
                      <div
                        key={key}
                        className={`transition-colors duration-150 relative ${
                          isCol5Divider ? 'border-r-2 border-r-[#facc15]/80' : 'border-r border-r-white/35'
                        } ${
                          isRow5Divider ? 'border-b-2 border-b-[#facc15]/80' : 'border-b border-b-white/35'
                        } ${
                          isHighlighted
                            ? 'bg-[#facc15]/45 ring-2 ring-[#fef08a] ring-inset z-10'
                            : (col + row) % 2 === 0
                            ? 'bg-black/5'
                            : 'bg-transparent'
                        }`}
                      >
                        {/* Subtle coordinates or cell indicator when highlighted */}
                        {isHighlighted && (
                          <span className="absolute bottom-0 right-0 text-[8px] font-mono font-bold text-black bg-[#facc15] px-0.5 leading-none pointer-events-none">
                            1%
                          </span>
                        )}
                      </div>
                    );
                  })}
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
                  const isHovered = hoveredPlantId === plant.id || hoveredSpeciesId === plant.species;

                  return (
                    <div
                      key={plant.id}
                      onClick={e => {
                        e.stopPropagation();
                        togglePlantChecked(plant.id);
                      }}
                      onMouseEnter={() => setHoveredPlantId(plant.id)}
                      onMouseLeave={() => setHoveredPlantId(null)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform ${
                        isSelected || isHovered ? 'z-30 scale-110' : 'z-10 hover:scale-105'
                      }`}
                      style={{
                        left: `${relX}%`,
                        top: `${relY}%`,
                        width: `${relDiameter}%`,
                        height: `${relDiameter}%`,
                      }}
                      title={`${PLANT_SPECIES[plant.species].koreanName} (클릭하여 체크 / 마우스 올려 격자 확인)`}
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
              <div className="absolute bottom-2 left-2 text-[10px] text-white font-mono bg-black/85 px-2 py-0.5 border border-white/40 pointer-events-none pixel-font">
                규격: 1m × 1m (총 100칸) · 5칸 구분선 표시
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
                💡 식물에 마우스를 올리면 차지하는 격자 칸(%)이 노란색으로 하이라이트됩니다!
              </p>
            )}
          </div>

          {/* Right Column: Quadrat Survey Input Table & Mini Guide (6 cols on tablet, 5 cols on desktop) */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between bg-[#f5f2eb] border-3 border-stone-900 p-3 sm:p-4 shadow-[4px_4px_0px_#1c1917]">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 pixel-font">
                    [1단계 · 개별활동] #{quadrat.id}번 방형구 관측 기록
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-stone-600 pixel-font">
                    식물별 개체수와 차지한 면적(피도, %) 기록
                  </p>
                </div>
                <div
                  className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-emerald-900 bg-[#dcfce7] px-2 sm:px-2.5 py-1 border border-emerald-700 pixel-font shadow-[2px_2px_0px_#14532d] shrink-0"
                  title="10×10 격자와 식물 클릭 체크를 활용하여 직접 관측합니다"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                  <span>개별 관측</span>
                </div>
              </div>

              {/* 2-1 & 2-3 Visual Calculation Guide Box */}
              <div className="bg-[#fefce8] border-2 border-[#ca8a04] p-2.5 sm:p-3 text-xs text-stone-900 pixel-font space-y-1.5 sm:space-y-2 shadow-[2px_2px_0px_#a16207]">
                <div className="flex items-center justify-between border-b border-[#fef08a] pb-1">
                  <div className="font-extrabold text-[#713f12] flex items-center gap-1 text-[11px] sm:text-xs">
                    <span>🌱</span>
                    <span>식물이 차지한 면적(피도) 계산 안내</span>
                  </div>
                  <span className="text-[10px] bg-[#fef08a] text-[#854d0e] px-1.5 py-0.5 border border-[#ca8a04] font-bold">
                    1칸 = 1%
                  </span>
                </div>

                <div className="flex items-start gap-2.5 sm:gap-3">
                  {/* Mini 10x10 Pixel Grid Illustration */}
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#14532d] border border-black grid grid-cols-5 grid-rows-5 gap-[1px] p-[1px] shadow-[1px_1px_0px_#000]">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          className={
                            i < 4
                              ? 'bg-[#facc15] border border-[#a16207]'
                              : 'bg-[#1e3a17] border border-[#2d5623]'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-[9px] text-[#713f12] font-mono mt-0.5 font-bold">100칸 중 4칸=4%</span>
                  </div>

                  <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-[11px] text-stone-800 leading-snug">
                    <p>
                      • <strong>방형구:</strong> 10×10 = <strong>총 100칸 (1칸=1%)</strong>
                    </p>
                    <p className="text-[#92400e]">
                      • <strong>총면적 = 한 개체 면적 × 개체수</strong>
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-stone-600 bg-white/70 p-1 border border-stone-300">
                      예: 한 개체가 4칸 차지, 5개체이면 <strong className="text-black">4칸 × 5 = 20칸(20%)</strong>
                    </p>
                    <p>
                      • <strong>피도(%) = 차지한 칸수 ÷ 100 × 100</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Species Input Cards */}
              <div className="space-y-1.5 sm:space-y-2">
                {PLANT_SPECIES_LIST.map(spec => {
                  const cVal = counts[spec.id] ?? 0;
                  const covVal = covers[spec.id] ?? 0;
                  const isHovered = hoveredSpeciesId === spec.id;

                  return (
                    <div
                      key={spec.id}
                      onMouseEnter={() => setHoveredSpeciesId(spec.id)}
                      onMouseLeave={() => setHoveredSpeciesId(null)}
                      className={`p-2 border-2 transition-all ${
                        isHovered
                          ? 'border-[#15803d] bg-[#f0fdf4] shadow-[3px_3px_0px_#15803d]'
                          : 'border-stone-800 bg-white shadow-[2px_2px_0px_#000]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <BotanicalIcon species={spec.id} size={24} />
                          <div>
                            <span className="text-xs font-bold text-stone-900 pixel-font">
                              {spec.koreanName}
                            </span>
                            <span className="text-[10px] text-stone-500 ml-1 font-mono hidden sm:inline">
                              (마우스 올리면 위치 표시)
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 border border-emerald-300 font-mono font-bold">
                          1칸 = 1%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-700 mb-0.5 pixel-font truncate">
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
                          <label className="block text-[10px] font-bold text-stone-700 mb-0.5 pixel-font truncate">
                            차지한 면적 (피도, %)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={covVal === 0 ? '' : covVal}
                              placeholder="0"
                              onChange={e => handleCoverChange(spec.id, e.target.value)}
                              className="w-full px-2 py-1 border-2 border-stone-800 bg-[#fafaf9] font-mono font-bold text-sm pr-6 focus:outline-emerald-600 focus:bg-white"
                            />
                            <span className="absolute right-2 top-1 text-xs text-stone-500 font-mono font-bold">
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
            <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t-2 border-stone-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 sm:px-3.5 py-2 text-xs font-bold text-stone-800 bg-stone-200 hover:bg-stone-300 border-2 border-stone-900 pixel-btn pixel-font cursor-pointer shrink-0"
              >
                닫기
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold text-white bg-[#15803d] hover:bg-[#166534] border-2 border-stone-900 pixel-btn pixel-font cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">[1단계 저장] #{quadrat.id}번 개체수 및 차지한 면적 저장</span>
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
