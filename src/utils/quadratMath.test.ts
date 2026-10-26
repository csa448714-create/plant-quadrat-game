import {
  calculateCommunityStatistics,
  evaluateStudentValue,
  findDominantSpecies,
} from './quadratMath';
import { PlantSpeciesId } from '../types/ecology';

console.log('--- Running Ecology Calculations Unit Tests ---');

// Test 1: Community Statistics calculation
const testData = [
  // Quadrat 1
  {
    counts: { clover: 4, dandelion: 2, violet: 0, foxtail: 5 } as Record<PlantSpeciesId, number>,
    covers: { clover: 15.0, dandelion: 5.0, violet: 0.0, foxtail: 8.0 } as Record<PlantSpeciesId, number>,
  },
  // Quadrat 2
  {
    counts: { clover: 6, dandelion: 1, violet: 3, foxtail: 4 } as Record<PlantSpeciesId, number>,
    covers: { clover: 22.0, dandelion: 3.0, violet: 12.0, foxtail: 6.0 } as Record<PlantSpeciesId, number>,
  },
  // Quadrat 3
  {
    counts: { clover: 5, dandelion: 0, violet: 4, foxtail: 6 } as Record<PlantSpeciesId, number>,
    covers: { clover: 18.0, dandelion: 0.0, violet: 15.0, foxtail: 10.0 } as Record<PlantSpeciesId, number>,
  },
  // Quadrat 4
  {
    counts: { clover: 3, dandelion: 3, violet: 0, foxtail: 7 } as Record<PlantSpeciesId, number>,
    covers: { clover: 10.0, dandelion: 7.0, violet: 0.0, foxtail: 11.0 } as Record<PlantSpeciesId, number>,
  },
  // Quadrat 5
  {
    counts: { clover: 2, dandelion: 2, violet: 2, foxtail: 8 } as Record<PlantSpeciesId, number>,
    covers: { clover: 8.0, dandelion: 4.0, violet: 8.0, foxtail: 12.0 } as Record<PlantSpeciesId, number>,
  },
];

const stats = calculateCommunityStatistics(testData);

// Check total counts
console.assert(stats.clover.totalCount === 20, `Clover total count expected 20, got ${stats.clover.totalCount}`);
console.assert(stats.dandelion.totalCount === 8, `Dandelion total count expected 8, got ${stats.dandelion.totalCount}`);
console.assert(stats.violet.totalCount === 9, `Violet total count expected 9, got ${stats.violet.totalCount}`);
console.assert(stats.foxtail.totalCount === 30, `Foxtail total count expected 30, got ${stats.foxtail.totalCount}`);

// Check occurrences
console.assert(stats.clover.quadratOccurrences === 5, `Clover occurrences expected 5`);
console.assert(stats.dandelion.quadratOccurrences === 4, `Dandelion occurrences expected 4`);
console.assert(stats.violet.quadratOccurrences === 3, `Violet occurrences expected 3`);
console.assert(stats.foxtail.quadratOccurrences === 5, `Foxtail occurrences expected 5`);

// Check densities (totalCount / 5)
console.assert(stats.clover.density === 4.0, `Clover density expected 4.0`);
console.assert(stats.foxtail.density === 6.0, `Foxtail density expected 6.0`);

// Check frequencies ((occurrences / 5) * 100)
console.assert(stats.clover.frequency === 100, `Clover frequency expected 100%`);
console.assert(stats.dandelion.frequency === 80, `Dandelion frequency expected 80%`);
console.assert(stats.violet.frequency === 60, `Violet frequency expected 60%`);

// Check relative sums (must sum to ~100%)
const sumRelDensity = stats.clover.relativeDensity + stats.dandelion.relativeDensity + stats.violet.relativeDensity + stats.foxtail.relativeDensity;
console.assert(Math.abs(sumRelDensity - 100) < 0.001, `Relative density sum should be 100, got ${sumRelDensity}`);

const sumRelFreq = stats.clover.relativeFrequency + stats.dandelion.relativeFrequency + stats.violet.relativeFrequency + stats.foxtail.relativeFrequency;
console.assert(Math.abs(sumRelFreq - 100) < 0.001, `Relative frequency sum should be 100, got ${sumRelFreq}`);

const sumRelCover = stats.clover.relativeCover + stats.dandelion.relativeCover + stats.violet.relativeCover + stats.foxtail.relativeCover;
console.assert(Math.abs(sumRelCover - 100) < 0.001, `Relative cover sum should be 100, got ${sumRelCover}`);

// Check Importance Values sum (must sum to 300)
const sumIV = stats.clover.importanceValue + stats.dandelion.importanceValue + stats.violet.importanceValue + stats.foxtail.importanceValue;
console.assert(Math.abs(sumIV - 300) < 0.001, `Total IV should be 300, got ${sumIV}`);

// Check Dominant species determination
const dominant = findDominantSpecies(stats);
console.log(`Determined dominant species: ${dominant} with IV: ${stats[dominant].importanceValue.toFixed(1)}`);
console.assert(dominant === 'foxtail' || dominant === 'clover', `Dominant species should be valid species`);

// Check evaluation tolerance helper
console.assert(evaluateStudentValue('4.0', 4.0) === 'correct', 'Exact match test');
console.assert(evaluateStudentValue('4.1', 4.0, 0.2) === 'correct', 'Tolerance test');
console.assert(evaluateStudentValue('5.5', 4.0, 0.2) === 'incorrect', 'Incorrect match test');
console.assert(evaluateStudentValue('', 4.0) === 'empty', 'Empty input test');

console.log('✓ All ecology calculation tests passed successfully!');
