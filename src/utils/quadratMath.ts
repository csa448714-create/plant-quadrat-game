import {
  PlantIndividual,
  PlantSpeciesId,
  Quadrat,
  SpeciesCommunityStat,
  TruePopulationStat,
  TrueQuadratStat,
} from '../types/ecology';
import { FIELD_HEIGHT, FIELD_WIDTH } from './communityGenerator';

const ALL_SPECIES: PlantSpeciesId[] = ['clover', 'dandelion', 'violet', 'foxtail'];

/**
 * Check if a plant root point is inside a quadrat
 */
export function isPlantRootInQuadrat(plant: PlantIndividual, quadrat: Quadrat): boolean {
  return (
    plant.x >= quadrat.x &&
    plant.x <= quadrat.x + quadrat.size &&
    plant.y >= quadrat.y &&
    plant.y <= quadrat.y + quadrat.size
  );
}

/**
 * Check if a plant is completely inside the quadrat boundaries (without hanging over the borders)
 */
export function isPlantFullyInQuadrat(plant: PlantIndividual, quadrat: Quadrat): boolean {
  const margin = 1;
  return (
    plant.x - plant.radius >= quadrat.x - margin &&
    plant.x + plant.radius <= quadrat.x + quadrat.size + margin &&
    plant.y - plant.radius >= quadrat.y - margin &&
    plant.y + plant.radius <= quadrat.y + quadrat.size + margin
  );
}

/**
 * High-accuracy deterministic raster pixel sampling for canopy percent cover inside a quadrat.
 * Subdivides the quadrat into N x N sample points (e.g. 60x60 = 3600 points).
 * Strictly calculates only for plants that are completely inside the quadrat.
 */
export function calculateExactQuadratStat(
  quadrat: Quadrat,
  plants: PlantIndividual[],
  sampleResolution: number = 60
): TrueQuadratStat {
  const counts: Record<PlantSpeciesId, number> = {
    clover: 0,
    dandelion: 0,
    violet: 0,
    foxtail: 0,
  };

  // 1. Fully contained plant counts (only plants completely inside)
  for (const plant of plants) {
    if (isPlantFullyInQuadrat(plant, quadrat)) {
      counts[plant.species] = (counts[plant.species] || 0) + 1;
    }
  }

  // 2. High-resolution raster coverage sampling
  // Only sample plants that are completely contained inside the quadrat
  const candidatePlants = plants.filter(p => isPlantFullyInQuadrat(p, quadrat));

  const step = quadrat.size / sampleResolution;
  const halfStep = step / 2;
  const totalPoints = sampleResolution * sampleResolution;

  const speciesCoveredCount: Record<PlantSpeciesId, number> = {
    clover: 0,
    dandelion: 0,
    violet: 0,
    foxtail: 0,
  };

  for (let i = 0; i < sampleResolution; i++) {
    const py = quadrat.y + i * step + halfStep;
    for (let j = 0; j < sampleResolution; j++) {
      const px = quadrat.x + j * step + halfStep;

      // Track which species cover this point
      const pointSpeciesCovered = new Set<PlantSpeciesId>();

      for (const plant of candidatePlants) {
        const dx = px - plant.x;
        const dy = py - plant.y;
        if (dx * dx + dy * dy <= plant.radius * plant.radius) {
          pointSpeciesCovered.add(plant.species);
        }
      }

      for (const sp of pointSpeciesCovered) {
        speciesCoveredCount[sp]++;
      }
    }
  }

  const covers: Record<PlantSpeciesId, number> = {
    clover: Number(((speciesCoveredCount.clover / totalPoints) * 100).toFixed(1)),
    dandelion: Number(((speciesCoveredCount.dandelion / totalPoints) * 100).toFixed(1)),
    violet: Number(((speciesCoveredCount.violet / totalPoints) * 100).toFixed(1)),
    foxtail: Number(((speciesCoveredCount.foxtail / totalPoints) * 100).toFixed(1)),
  };

  return {
    quadratId: quadrat.id,
    counts,
    covers,
  };
}

/**
 * Calculate community statistics from 5 quadrat surveys
 */
export function calculateCommunityStatistics(
  data: { counts: Record<PlantSpeciesId, number>; covers: Record<PlantSpeciesId, number> }[],
  totalQuadratsCount: number = data.length || 5
): Record<PlantSpeciesId, SpeciesCommunityStat> {
  const result: Record<PlantSpeciesId, SpeciesCommunityStat> = {
    clover: createInitialSpeciesStat('clover'),
    dandelion: createInitialSpeciesStat('dandelion'),
    violet: createInitialSpeciesStat('violet'),
    foxtail: createInitialSpeciesStat('foxtail'),
  };

  // 1. Total counts, occurrences, and raw cover sum
  for (const sp of ALL_SPECIES) {
    let totalCount = 0;
    let occurrences = 0;
    let coverSum = 0;

    for (const qData of data) {
      const c = qData.counts[sp] || 0;
      const cov = qData.covers[sp] || 0;
      totalCount += c;
      if (c > 0) occurrences++;
      coverSum += cov;
    }

    result[sp].totalCount = totalCount;
    result[sp].quadratOccurrences = occurrences;
    // 밀도 = 총개체수 ÷ 5개 방형구 (개체/m²)
    result[sp].density = totalCount / totalQuadratsCount;
    // 빈도(%) = (출현 방형구 수 ÷ 5) × 100
    result[sp].frequency = (occurrences / totalQuadratsCount) * 100;
    // 피도(%) = 방형구 피도 산술평균
    result[sp].cover = coverSum / totalQuadratsCount;
  }

  // 2. Sums for relative calculations
  const totalDensity = ALL_SPECIES.reduce((acc, sp) => acc + result[sp].density, 0);
  const totalFrequency = ALL_SPECIES.reduce((acc, sp) => acc + result[sp].frequency, 0);
  const totalCover = ALL_SPECIES.reduce((acc, sp) => acc + result[sp].cover, 0);

  // 3. Relative values and Importance Value (IV)
  for (const sp of ALL_SPECIES) {
    const relDensity = totalDensity > 0 ? (result[sp].density / totalDensity) * 100 : 0;
    const relFrequency = totalFrequency > 0 ? (result[sp].frequency / totalFrequency) * 100 : 0;
    const relCover = totalCover > 0 ? (result[sp].cover / totalCover) * 100 : 0;

    result[sp].relativeDensity = relDensity;
    result[sp].relativeFrequency = relFrequency;
    result[sp].relativeCover = relCover;
    result[sp].importanceValue = relDensity + relFrequency + relCover;
  }

  return result;
}

function createInitialSpeciesStat(species: PlantSpeciesId): SpeciesCommunityStat {
  return {
    species,
    totalCount: 0,
    quadratOccurrences: 0,
    density: 0,
    frequency: 0,
    cover: 0,
    relativeDensity: 0,
    relativeFrequency: 0,
    relativeCover: 0,
    importanceValue: 0,
  };
}

/**
 * Calculate True Population statistics for the whole meadow.
 * The entire meadow (1000 x 750) is partitioned into a 10 x 8 grid of 80 equal blocks
 * to measure true spatial occurrence (frequency).
 */
export function calculateTruePopulationStatistics(
  plants: PlantIndividual[]
): Record<PlantSpeciesId, TruePopulationStat> {
  const result: Record<PlantSpeciesId, TruePopulationStat> = {
    clover: createInitialPopulationStat('clover'),
    dandelion: createInitialPopulationStat('dandelion'),
    violet: createInitialPopulationStat('violet'),
    foxtail: createInitialPopulationStat('foxtail'),
  };

  // 1. Total individuals
  for (const plant of plants) {
    result[plant.species].totalIndividuals++;
  }

  // 2. 10x8 grid occurrences (80 cells, each ~100x93.75 units)
  const cols = 10;
  const rows = 8;
  const totalCells = cols * rows;
  const cellW = FIELD_WIDTH / cols;
  const cellH = FIELD_HEIGHT / rows;

  const speciesGridPresence: Record<PlantSpeciesId, Set<string>> = {
    clover: new Set(),
    dandelion: new Set(),
    violet: new Set(),
    foxtail: new Set(),
  };

  for (const plant of plants) {
    const c = Math.min(cols - 1, Math.max(0, Math.floor(plant.x / cellW)));
    const r = Math.min(rows - 1, Math.max(0, Math.floor(plant.y / cellH)));
    speciesGridPresence[plant.species].add(`${c},${r}`);
  }

  // 3. Overall whole-field cover sampling (100x75 sample points = 7500 points)
  const sampleX = 100;
  const sampleY = 75;
  const stepX = FIELD_WIDTH / sampleX;
  const stepY = FIELD_HEIGHT / sampleY;
  const totalWholePoints = sampleX * sampleY;

  const wholeCoverPoints: Record<PlantSpeciesId, number> = {
    clover: 0,
    dandelion: 0,
    violet: 0,
    foxtail: 0,
  };

  for (let iy = 0; iy < sampleY; iy++) {
    const py = iy * stepY + stepY / 2;
    for (let ix = 0; ix < sampleX; ix++) {
      const px = ix * stepX + stepX / 2;
      const pointSpecies = new Set<PlantSpeciesId>();

      for (const plant of plants) {
        // Fast bbox check
        if (Math.abs(px - plant.x) <= plant.radius && Math.abs(py - plant.y) <= plant.radius) {
          const dx = px - plant.x;
          const dy = py - plant.y;
          if (dx * dx + dy * dy <= plant.radius * plant.radius) {
            pointSpecies.add(plant.species);
          }
        }
      }

      for (const sp of pointSpecies) {
        wholeCoverPoints[sp]++;
      }
    }
  }

  for (const sp of ALL_SPECIES) {
    const gridCount = speciesGridPresence[sp].size;
    result[sp].gridOccurrences = gridCount;
    // Frequency in population = % of 80 grid blocks occupied
    result[sp].frequency = (gridCount / totalCells) * 100;
    // Density normalized to equivalent 1m² quadrat unit (total field ~ 33.3 quadrats equivalent)
    const fieldQuadratEquivalent = (FIELD_WIDTH * FIELD_HEIGHT) / (150 * 150);
    result[sp].density = result[sp].totalIndividuals / fieldQuadratEquivalent;
    result[sp].cover = (wholeCoverPoints[sp] / totalWholePoints) * 100;
  }

  // Calculate relative & IV
  const totalDensity = ALL_SPECIES.reduce((acc, sp) => acc + result[sp].density, 0);
  const totalFrequency = ALL_SPECIES.reduce((acc, sp) => acc + result[sp].frequency, 0);
  const totalCover = ALL_SPECIES.reduce((acc, sp) => acc + result[sp].cover, 0);

  for (const sp of ALL_SPECIES) {
    const relDensity = totalDensity > 0 ? (result[sp].density / totalDensity) * 100 : 0;
    const relFrequency = totalFrequency > 0 ? (result[sp].frequency / totalFrequency) * 100 : 0;
    const relCover = totalCover > 0 ? (result[sp].cover / totalCover) * 100 : 0;

    result[sp].relativeDensity = relDensity;
    result[sp].relativeFrequency = relFrequency;
    result[sp].relativeCover = relCover;
    result[sp].importanceValue = relDensity + relFrequency + relCover;
  }

  return result;
}

function createInitialPopulationStat(species: PlantSpeciesId): TruePopulationStat {
  return {
    species,
    totalIndividuals: 0,
    density: 0,
    gridOccurrences: 0,
    frequency: 0,
    cover: 0,
    relativeDensity: 0,
    relativeFrequency: 0,
    relativeCover: 0,
    importanceValue: 0,
  };
}

/**
 * Determine dominant species (highest importance value)
 */
export function findDominantSpecies(
  stats: Record<PlantSpeciesId, { importanceValue: number }>
): PlantSpeciesId {
  let bestSpecies: PlantSpeciesId = 'clover';
  let maxIV = -1;

  for (const sp of ALL_SPECIES) {
    if (stats[sp].importanceValue > maxIV) {
      maxIV = stats[sp].importanceValue;
      bestSpecies = sp;
    }
  }

  return bestSpecies;
}

/**
 * Validation helper: checks student input against true value within tolerance
 */
export function evaluateStudentValue(
  inputStr: string,
  trueValue: number,
  tolerance: number = 0.5
): 'correct' | 'incorrect' | 'empty' {
  if (!inputStr || inputStr.trim() === '') {
    return 'empty';
  }

  const parsed = parseFloat(inputStr.trim());
  if (isNaN(parsed)) {
    return 'incorrect';
  }

  // Allow rounding to 1 decimal place or standard floating variance
  const diff = Math.abs(parsed - trueValue);
  const roundedDiff = Math.abs(parsed - Math.round(trueValue * 10) / 10);

  if (diff <= tolerance || roundedDiff <= tolerance) {
    return 'correct';
  }

  return 'incorrect';
}
