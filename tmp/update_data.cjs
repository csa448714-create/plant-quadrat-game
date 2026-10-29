const fs = require('fs');

const quadrats = [
  { id: 1, x: 388, y: 191, size: 150, color: '#0284c7' },
  { id: 2, x: 557, y: 368, size: 150, color: '#059669' },
  { id: 3, x: 140, y: 141, size: 150, color: '#d97706' },
  { id: 4, x: 70, y: 368, size: 150, color: '#9333ea' },
  { id: 5, x: 348, y: 540, size: 150, color: '#dc2626' }
];

const src = fs.readFileSync('./src/data/fixedEcologyData.ts', 'utf8');
const plantMatch = src.match(/export const FIXED_PLANTS: PlantIndividual\[\] = (\[[\s\S]*?\]);\s*\/\*\*/);
if (!plantMatch) {
  console.error('Could not match FIXED_PLANTS');
  process.exit(1);
}

const currentPlants = JSON.parse(plantMatch[1]);
console.log('Total current plants in file:', currentPlants.length);

// Keep plants strictly outside the 5 quadrat boxes
const outsidePlants = currentPlants.filter(p => {
  return !quadrats.some(q => 
    p.x >= q.x - 4 && p.x <= q.x + q.size + 4 &&
    p.y >= q.y - 4 && p.y <= q.y + q.size + 4
  );
});
console.log('Kept outside plants:', outsidePlants.length);

const plans = [
  {
    qId: 1,
    clover: [ [35, 38, 16], [105, 42, 16], [70, 110, 16] ],
    dandelion: [ [30, 95, 12], [115, 105, 12] ],
    violet: [ [70, 68, 11] ],
    foxtail: [ [22, 18, 7], [68, 20, 8], [128, 22, 7], [22, 132, 8], [128, 68, 8], [102, 132, 7] ]
  },
  {
    qId: 2,
    clover: [ [38, 38, 16], [112, 38, 16], [38, 112, 16], [112, 112, 16] ],
    dandelion: [ [75, 40, 12] ],
    violet: [ [42, 75, 11], [108, 75, 11] ],
    foxtail: [ [75, 15, 7], [18, 75, 8], [132, 75, 7], [75, 85, 8], [75, 132, 8] ]
  },
  {
    qId: 3,
    clover: [ [40, 42, 16], [110, 42, 16], [75, 112, 16] ],
    dandelion: [ [35, 95, 12], [115, 95, 12], [75, 30, 12] ],
    violet: [ [42, 68, 11], [108, 68, 11] ],
    foxtail: []
  },
  {
    qId: 4,
    clover: [ [40, 42, 16], [110, 42, 16], [75, 108, 16] ],
    dandelion: [ [38, 95, 12], [112, 95, 12] ],
    violet: [ [75, 70, 11] ],
    foxtail: [ [20, 20, 8], [75, 20, 7], [130, 20, 8], [20, 130, 7], [130, 130, 8], [20, 68, 8], [130, 68, 7] ]
  },
  {
    qId: 5,
    clover: [ [38, 40, 16], [112, 40, 16], [40, 112, 16], [110, 112, 16] ],
    dandelion: [ [75, 38, 12], [75, 115, 12] ],
    violet: [ [75, 76, 11] ],
    foxtail: [ [20, 20, 8], [130, 20, 7], [20, 130, 8], [130, 130, 7], [20, 75, 8], [130, 75, 7], [48, 76, 8], [102, 76, 7] ]
  }
];

const insidePlants = [];

plans.forEach(plan => {
  const q = quadrats.find(item => item.id === plan.qId);
  ['clover', 'dandelion', 'violet', 'foxtail'].forEach(sp => {
    (plan[sp] || []).forEach((pt, idx) => {
      insidePlants.push({
        id: 'plant-' + sp + '-q' + plan.qId + '-' + (idx + 1),
        species: sp,
        x: q.x + pt[0],
        y: q.y + pt[1],
        radius: pt[2],
        rotation: (idx * 67 + plan.qId * 43) % 360,
        variety: idx % 3
      });
    });
  });
});

console.log('Inside plants created:', insidePlants.length);
const allPlants = [...outsidePlants, ...insidePlants];

const fixedStats = [
  {
    quadratId: 1,
    counts: { clover: 3, dandelion: 2, violet: 1, foxtail: 6 },
    covers: { clover: 10, dandelion: 4, violet: 2, foxtail: 3 }
  },
  {
    quadratId: 2,
    counts: { clover: 4, dandelion: 1, violet: 2, foxtail: 5 },
    covers: { clover: 12, dandelion: 2, violet: 4, foxtail: 3 }
  },
  {
    quadratId: 3,
    counts: { clover: 3, dandelion: 3, violet: 2, foxtail: 0 },
    covers: { clover: 10, dandelion: 6, violet: 4, foxtail: 0 }
  },
  {
    quadratId: 4,
    counts: { clover: 3, dandelion: 2, violet: 1, foxtail: 7 },
    covers: { clover: 10, dandelion: 4, violet: 2, foxtail: 4 }
  },
  {
    quadratId: 5,
    counts: { clover: 4, dandelion: 2, violet: 1, foxtail: 8 },
    covers: { clover: 13, dandelion: 4, violet: 3, foxtail: 5 }
  }
];

const newContent = `import { PlantIndividual, Quadrat, TrueQuadratStat } from '../types/ecology';

/**
 * 고등학교 생명과학 4인/5인 협동 학습용 완전 고정 식물 군집 데이터
 * 모든 학생이 어느 기기에서 접속하더라도 100% 동일한 식물 분포를 가집니다.
 */
export const FIXED_PLANTS: PlantIndividual[] = ` + JSON.stringify(allPlants, null, 2) + `;

/**
 * 무작위 표본 추출 방식으로 최초 선정 후 영구 고정된 5개의 방형구 좌표
 */
export const FIXED_QUADRATS: Quadrat[] = ` + JSON.stringify(quadrats, null, 2) + `;

/**
 * 고정된 식물 데이터와 고정된 방형구로부터 도출된 불변의 정답 관측치
 * (모든 피도는 순수 정수 % 단위로 설계됨)
 */
export const FIXED_TRUE_QUADRAT_STATS: TrueQuadratStat[] = ` + JSON.stringify(fixedStats, null, 2) + `;
`;

fs.writeFileSync('./src/data/fixedEcologyData.ts', newContent, 'utf8');
console.log('Successfully written to ./src/data/fixedEcologyData.ts');
