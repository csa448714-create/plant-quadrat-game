import { PlantIndividual, PlantSpeciesId, PlantSpeciesInfo, Quadrat } from '../types/ecology';
import { SeededRandom } from './seedRandom';

export const FIELD_WIDTH = 1000;
export const FIELD_HEIGHT = 750;
export const QUADRAT_SIZE = 150; // 1m x 1m equivalent, 5 quadrats = 5m²
export const TOTAL_QUADRATS = 5;

export const PLANT_SPECIES: Record<PlantSpeciesId, PlantSpeciesInfo> = {
  clover: {
    id: 'clover',
    koreanName: '토끼풀',
    scientificName: 'Trifolium repens',
    family: '콩과 (Fabaceae)',
    characteristics: '3개의 하트형 작은 잎에 흰색 초승달 무늬, 둥근 흰색 꽃차례, 포복경(기는줄기) 번식',
    color: '#22c55e',
    accentColor: '#15803d',
    habit: '포복경으로 땅을 덮으며 군생(무리 지어) 분포하는 집중형 분포 패턴',
  },
  dandelion: {
    id: 'dandelion',
    koreanName: '민들레',
    scientificName: 'Taraxacum platycarpum',
    family: '국화과 (Asteraceae)',
    characteristics: '뿌리에서 깃꼴로 갈라진 방석 모양(로제트) 잎, 밝은 노란색 두상화, 솜털 갓털 씨앗',
    color: '#eab308',
    accentColor: '#ca8a04',
    habit: '바람을 통해 갓털 달린 씨앗이 흩날려 풀밭 전역에 고르게 산재하는 분산형 분포',
  },
  violet: {
    id: 'violet',
    koreanName: '제비꽃',
    scientificName: 'Viola mandshurica',
    family: '제비꽃과 (Violaceae)',
    characteristics: '둥근 하트 모양 잎과 짙은 보라색 5장의 꽃잎, 꿀주머니를 가진 여러해살이풀',
    color: '#8b5cf6',
    accentColor: '#6d28d9',
    habit: '양지바른 풀밭이나 돌 틈에 아기자기하게 무리지어 피는 집중 분포 패턴',
  },
  foxtail: {
    id: 'foxtail',
    koreanName: '강아지풀',
    scientificName: 'Setaria viridis',
    family: '벼과 (Poaceae)',
    characteristics: '선형의 긴 잎과 강아지 꼬리를 닮은 녹색의 부드러운 털이 밀생한 원기둥형 이삭',
    color: '#84cc16',
    accentColor: '#4d7c0f',
    habit: '양지바른 곳에 다수의 개체가 빽빽하게 모여 자라며 개체수가 많음',
  },
};

export const PLANT_SPECIES_LIST: PlantSpeciesInfo[] = [
  PLANT_SPECIES.clover,
  PLANT_SPECIES.dandelion,
  PLANT_SPECIES.violet,
  PLANT_SPECIES.foxtail,
];

/**
 * Generate plant community based on deterministic random seed with strict non-overlapping constraint.
 * Uses spatial grid acceleration so hundreds of plants are placed with zero overlap,
 * ensuring each quadrat has a generous number of clear, distinct, countable plants.
 */
export function generatePlantCommunity(seed: number = 2026): PlantIndividual[] {
  const rng = new SeededRandom(seed);
  const plants: PlantIndividual[] = [];
  let idCounter = 1;

  // Spatial Hash Grid for fast O(1) collision detection
  const cellSize = 25;
  const gridCols = Math.ceil(FIELD_WIDTH / cellSize);
  const gridRows = Math.ceil(FIELD_HEIGHT / cellSize);
  const grid: number[][][] = Array.from({ length: gridCols }, () =>
    Array.from({ length: gridRows }, () => [])
  );

  const canPlace = (x: number, y: number, radius: number): boolean => {
    // Keep plant entirely within meadow borders
    if (x - radius < 15 || x + radius > FIELD_WIDTH - 15 || y - radius < 15 || y + radius > FIELD_HEIGHT - 15) {
      return false;
    }

    const cX = Math.floor(x / cellSize);
    const cY = Math.floor(y / cellSize);

    // Search 5x5 neighboring grid cells
    for (let dx = -2; dx <= 2; dx++) {
      const nx = cX + dx;
      if (nx < 0 || nx >= gridCols) continue;
      for (let dy = -2; dy <= 2; dy++) {
        const ny = cY + dy;
        if (ny < 0 || ny >= gridRows) continue;
        for (const existingIdx of grid[nx][ny]) {
          const other = plants[existingIdx];
          const distSq = (other.x - x) * (other.x - x) + (other.y - y) * (other.y - y);
          // Strict non-overlapping rule: distance must be >= sum of radii + 3px safety buffer
          const requiredDist = other.radius + radius + 3;
          if (distSq < requiredDist * requiredDist) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const addPlant = (species: PlantSpeciesId, x: number, y: number, radius: number): boolean => {
    if (!canPlace(x, y, radius)) return false;

    const idx = plants.length;
    plants.push({
      id: `plant-${species}-${idCounter++}`,
      species,
      x: Math.round(x),
      y: Math.round(y),
      radius,
      rotation: Math.round(rng.range(0, 360)),
      variety: rng.rangeInt(0, 2),
    });

    const cX = Math.floor(x / cellSize);
    const cY = Math.floor(y / cellSize);
    grid[cX][cY].push(idx);
    return true;
  };

  // 1. 토끼풀 (Clover): Dense creeping patches, radius 10-13px
  const cloverClusters = [
    { x: rng.range(160, 360), y: rng.range(150, 350), target: 36, spread: 110 },
    { x: rng.range(620, 840), y: rng.range(380, 600), target: 36, spread: 110 },
    { x: rng.range(620, 820), y: rng.range(120, 280), target: 30, spread: 100 },
  ];

  for (const cl of cloverClusters) {
    let placed = 0;
    let attempts = 0;
    while (placed < cl.target && attempts < 500) {
      attempts++;
      const x = rng.gaussian(cl.x, cl.spread);
      const y = rng.gaussian(cl.y, cl.spread);
      const r = rng.rangeInt(10, 13);
      if (addPlant('clover', x, y, r)) {
        placed++;
      }
    }
  }

  // 2. 민들레 (Dandelion): Scattered wind-dispersed throughout the field, radius 9-12px
  let dandelionPlaced = 0;
  let dandelionAttempts = 0;
  const targetDandelions = rng.rangeInt(90, 105);
  while (dandelionPlaced < targetDandelions && dandelionAttempts < 1200) {
    dandelionAttempts++;
    const x = rng.range(25, FIELD_WIDTH - 25);
    const y = rng.range(25, FIELD_HEIGHT - 25);
    const r = rng.rangeInt(9, 12);
    if (addPlant('dandelion', x, y, r)) {
      dandelionPlaced++;
    }
  }

  // 3. 질경이 (Plantain): Along path and open borders, radius 10-13px
  let plantainPlaced = 0;
  let plantainAttempts = 0;
  const targetPlantains = rng.rangeInt(85, 100);
  while (plantainPlaced < targetPlantains && plantainAttempts < 1400) {
    plantainAttempts++;
    const t = rng.next();
    const baseX = 80 + t * (FIELD_WIDTH - 160);
    const baseY = 100 + t * (FIELD_HEIGHT - 200) + Math.sin(t * Math.PI * 2) * 70;
    const x = rng.next() < 0.75 ? rng.gaussian(baseX, 50) : rng.range(25, FIELD_WIDTH - 25);
    const y = rng.next() < 0.75 ? rng.gaussian(baseY, 50) : rng.range(25, FIELD_HEIGHT - 25);
    const r = rng.rangeInt(10, 13);
    if (addPlant('violet', x, y, r)) {
      plantainPlaced++;
    }
  }

  // 4. 강아지풀 (Green Foxtail): Abundant in sunny grassy areas, radius 9-11px
  let foxtailPlaced = 0;
  let foxtailAttempts = 0;
  const targetFoxtails = rng.rangeInt(110, 130);
  while (foxtailPlaced < targetFoxtails && foxtailAttempts < 1800) {
    foxtailAttempts++;
    const x = rng.range(25, FIELD_WIDTH - 25);
    const y = rng.range(25, FIELD_HEIGHT - 25);
    const r = rng.rangeInt(9, 11);
    if (addPlant('foxtail', x, y, r)) {
      foxtailPlaced++;
    }
  }

  return plants;
}

/**
 * Generate 5 non-overlapping random quadrats
 */
export function generateRandomQuadrats(seed: number = Date.now()): Quadrat[] {
  const rng = new SeededRandom(seed);
  const quadrats: Quadrat[] = [];
  const padding = 15;
  const maxAttempts = 1000;
  const colors = ['#0284c7', '#059669', '#d97706', '#9333ea', '#dc2626'];

  for (let id = 1; id <= TOTAL_QUADRATS; id++) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < maxAttempts) {
      attempts++;
      const x = rng.range(padding, FIELD_WIDTH - QUADRAT_SIZE - padding);
      const y = rng.range(padding, FIELD_HEIGHT - QUADRAT_SIZE - padding);

      // Check collision with existing quadrats (maintain minimum distance of 10px)
      const collides = quadrats.some(q => {
        const minGap = 12;
        return (
          x < q.x + q.size + minGap &&
          x + QUADRAT_SIZE + minGap > q.x &&
          y < q.y + q.size + minGap &&
          y + QUADRAT_SIZE + minGap > q.y
        );
      });

      if (!collides) {
        quadrats.push({
          id,
          x: Math.round(x),
          y: Math.round(y),
          size: QUADRAT_SIZE,
          color: colors[id - 1],
        });
        placed = true;
      }
    }

    if (!placed) {
      // Fallback grid placement if random placement fails
      const gridCol = (id - 1) % 3;
      const gridRow = Math.floor((id - 1) / 3);
      quadrats.push({
        id,
        x: 60 + gridCol * 300,
        y: 60 + gridRow * 320,
        size: QUADRAT_SIZE,
        color: colors[id - 1],
      });
    }
  }

  return quadrats;
}

/**
 * Initial positions for Manual placement (waiting to be placed or initial staggered positions)
 */
export function getInitialManualQuadrats(): Quadrat[] {
  const colors = ['#0284c7', '#059669', '#d97706', '#9333ea', '#dc2626'];
  return [
    { id: 1, x: 50, y: 50, size: QUADRAT_SIZE, color: colors[0] },
    { id: 2, x: 250, y: 80, size: QUADRAT_SIZE, color: colors[1] },
    { id: 3, x: 500, y: 120, size: QUADRAT_SIZE, color: colors[2] },
    { id: 4, x: 180, y: 480, size: QUADRAT_SIZE, color: colors[3] },
    { id: 5, x: 720, y: 450, size: QUADRAT_SIZE, color: colors[4] },
  ];
}
