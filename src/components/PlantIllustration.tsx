import React from 'react';
import { PlantSpeciesId } from '../types/ecology';

interface PlantIllustrationProps {
  species: PlantSpeciesId;
  radius: number;
  rotation?: number;
  variety?: number;
  showRootPoint?: boolean;
  isInspected?: boolean;
  className?: string;
}

export const PlantIllustration: React.FC<PlantIllustrationProps> = ({
  species,
  rotation = 0,
  variety = 0,
  showRootPoint = false,
  isInspected = false,
  className = '',
}) => {
  return (
    <div
      className={`relative select-none ${className}`}
      style={{
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full overflow-visible"
        shapeRendering="crispEdges"
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
          filter: isInspected
            ? 'drop-shadow(0 0 3px #4ade80) drop-shadow(1px 1px 0px #052e16)'
            : 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.5))',
        }}
      >
        {species === 'clover' && renderPixelClover(variety)}
        {species === 'dandelion' && renderPixelDandelion(variety)}
        {species === 'violet' && renderPixelViolet(variety)}
        {species === 'foxtail' && renderPixelFoxtail(variety)}
      </svg>

      {/* Root point marker for educational inspection */}
      {showRootPoint && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
          style={{ left: '50%', top: '50%' }}
          title="식물의 뿌리 중심점"
        >
          <div className="w-2.5 h-2.5 bg-amber-400 border border-black shadow-[1px_1px_0px_#000]" />
        </div>
      )}
    </div>
  );
};

/**
 * 16-bit Retro Pixel Specimen Icon for legends, modal badges, and tables
 */
export const BotanicalIcon: React.FC<{
  species: PlantSpeciesId;
  size?: number;
  showDetails?: boolean;
}> = ({ species, size = 44 }) => {
  return (
    <div
      className="relative flex items-center justify-center shrink-0 p-1 bg-[#1a1e12] border-2 border-[#364323] rounded-sm shadow-[2px_2px_0px_#0c0f08]"
      style={{ width: size, height: size, imageRendering: 'pixelated' }}
    >
      <svg
        width={size - 8}
        height={size - 8}
        viewBox="0 0 24 24"
        shapeRendering="crispEdges"
        className="w-full h-full overflow-visible"
      >
        {species === 'clover' && renderPixelClover(1)}
        {species === 'dandelion' && renderPixelDandelion(1)}
        {species === 'violet' && renderPixelViolet(1)}
        {species === 'foxtail' && renderPixelFoxtail(1)}
      </svg>
    </div>
  );
};

/* =========================================================================
   16-BIT RETRO RPG PIXEL ART SPRITES (24x24 Coordinate Grid, crispEdges)
   ========================================================================= */

/**
 * 1. 토끼풀 (White Clover, Trifolium repens) - 16-bit Retro Pixel Art
 * 3 heart-shaped leaflets in a trifoliate cluster with white chevron band + white blossom
 */
function renderPixelClover(variety: number) {
  return (
    <g>
      {/* Creeping stolon stems */}
      <rect x="11" y="11" width="2" height="7" fill="#14532d" />
      <rect x="13" y="16" width="4" height="2" fill="#166534" />
      <rect x="8" y="15" width="3" height="2" fill="#14532d" />

      {/* Center connection node */}
      <rect x="11" y="10" width="2" height="2" fill="#052e16" />

      {/* Leaflet 1: Top Leaf */}
      <rect x="10" y="3" width="4" height="2" fill="#15803d" />
      <rect x="9" y="5" width="6" height="5" fill="#22c55e" />
      <rect x="10" y="5" width="4" height="1" fill="#86efac" />
      <rect x="11" y="6" width="2" height="1" fill="#ffffff" /> {/* Pale crescent */}
      <rect x="10" y="8" width="4" height="2" fill="#166534" />

      {/* Leaflet 2: Bottom-Left Leaf */}
      <rect x="3" y="9" width="2" height="4" fill="#15803d" />
      <rect x="5" y="8" width="5" height="6" fill="#22c55e" />
      <rect x="5" y="9" width="1" height="4" fill="#86efac" />
      <rect x="6" y="10" width="1" height="2" fill="#ffffff" /> {/* Pale crescent */}
      <rect x="8" y="10" width="3" height="3" fill="#166534" />

      {/* Leaflet 3: Bottom-Right Leaf */}
      <rect x="19" y="9" width="2" height="4" fill="#15803d" />
      <rect x="14" y="8" width="5" height="6" fill="#22c55e" />
      <rect x="18" y="9" width="1" height="4" fill="#86efac" />
      <rect x="17" y="10" width="1" height="2" fill="#ffffff" /> {/* Pale crescent */}
      <rect x="13" y="10" width="3" height="3" fill="#166534" />

      {/* Flower variety: Round white clover flower ball with cream/pale pink touches */}
      {variety === 1 && (
        <g transform="translate(3, -2)">
          {/* Flower stem */}
          <rect x="12" y="7" width="2" height="5" fill="#15803d" />
          {/* Flower head */}
          <rect x="11" y="2" width="4" height="5" fill="#ffffff" />
          <rect x="10" y="3" width="6" height="3" fill="#ffffff" />
          <rect x="12" y="3" width="2" height="2" fill="#fef08a" />
          <rect x="10" y="4" width="1" height="1" fill="#fbcfe8" />
          <rect x="15" y="4" width="1" height="1" fill="#fbcfe8" />
          <rect x="12" y="6" width="2" height="1" fill="#cbd5e1" />
        </g>
      )}
    </g>
  );
}

/**
 * 2. 민들레 (Dandelion, Taraxacum) - 16-bit Retro Pixel Art
 * Deeply lobed jagged rosette leaves + bright yellow flower head or fluffy white seed clock
 */
function renderPixelDandelion(variety: number) {
  return (
    <g>
      {/* Sawtooth Jagged Rosette Leaves */}
      {/* Left Rosette Arm */}
      <rect x="2" y="11" width="4" height="2" fill="#3f6212" />
      <rect x="5" y="10" width="5" height="4" fill="#65a30d" />
      <rect x="6" y="11" width="4" height="2" fill="#a3e635" />
      <rect x="3" y="13" width="3" height="2" fill="#365314" />

      {/* Right Rosette Arm */}
      <rect x="18" y="11" width="4" height="2" fill="#3f6212" />
      <rect x="14" y="10" width="5" height="4" fill="#65a30d" />
      <rect x="14" y="11" width="4" height="2" fill="#a3e635" />
      <rect x="18" y="13" width="3" height="2" fill="#365314" />

      {/* Top Rosette Arm */}
      <rect x="11" y="2" width="2" height="4" fill="#3f6212" />
      <rect x="10" y="5" width="4" height="5" fill="#65a30d" />
      <rect x="11" y="6" width="2" height="4" fill="#a3e635" />

      {/* Bottom Rosette Arm */}
      <rect x="11" y="18" width="2" height="4" fill="#3f6212" />
      <rect x="10" y="14" width="4" height="5" fill="#65a30d" />
      <rect x="11" y="14" width="2" height="4" fill="#a3e635" />

      {/* Diagonal Spreading Lobes */}
      <rect x="5" y="5" width="3" height="3" fill="#4d7c0f" />
      <rect x="16" y="5" width="3" height="3" fill="#4d7c0f" />
      <rect x="5" y="16" width="3" height="3" fill="#4d7c0f" />
      <rect x="16" y="16" width="3" height="3" fill="#4d7c0f" />

      {/* Center Crown / Flower */}
      {variety === 1 ? (
        // Bright Yellow Composite Flower
        <g>
          <rect x="9" y="7" width="6" height="6" fill="#ca8a04" />
          <rect x="8" y="8" width="8" height="4" fill="#ca8a04" />
          <rect x="9" y="8" width="6" height="4" fill="#facc15" />
          <rect x="10" y="7" width="4" height="6" fill="#facc15" />
          {/* Inner Golden Florets */}
          <rect x="10" y="9" width="4" height="2" fill="#fef08a" />
          <rect x="11" y="9" width="2" height="2" fill="#854d0e" />
        </g>
      ) : variety === 2 ? (
        // Fluffy White Round Seed Head (Pappus Clock / 갓털)
        <g>
          <rect x="9" y="7" width="6" height="6" fill="#e2e8f0" />
          <rect x="8" y="8" width="8" height="4" fill="#e2e8f0" />
          <rect x="10" y="6" width="4" height="8" fill="#ffffff" />
          <rect x="10" y="9" width="4" height="2" fill="#94a3b8" />
          <rect x="11" y="10" width="2" height="1" fill="#451a03" />
        </g>
      ) : (
        // Closed bud
        <rect x="10" y="10" width="4" height="4" fill="#365314" />
      )}
    </g>
  );
}

/**
 * 3. 제비꽃 (Violet, Viola mandshurica) - 16-bit Retro Pixel Art
 * Charming rounded heart-shaped leaves + striking 5-petaled purple/violet flower with yellow center
 */
function renderPixelViolet(variety: number) {
  return (
    <g>
      {/* Basal Heart-shaped Leaves radiating outward */}
      {/* Top Left Leaf */}
      <rect x="4" y="5" width="5" height="4" fill="#15803d" />
      <rect x="5" y="6" width="4" height="3" fill="#22c55e" />
      <rect x="6" y="6" width="1" height="2" fill="#86efac" />

      {/* Top Right Leaf */}
      <rect x="15" y="5" width="5" height="4" fill="#15803d" />
      <rect x="15" y="6" width="4" height="3" fill="#22c55e" />
      <rect x="17" y="6" width="1" height="2" fill="#86efac" />

      {/* Bottom Left Leaf */}
      <rect x="4" y="14" width="5" height="4" fill="#15803d" />
      <rect x="5" y="14" width="4" height="3" fill="#22c55e" />
      <rect x="6" y="15" width="1" height="2" fill="#86efac" />

      {/* Bottom Right Leaf */}
      <rect x="15" y="14" width="5" height="4" fill="#15803d" />
      <rect x="15" y="14" width="4" height="3" fill="#22c55e" />
      <rect x="17" y="15" width="1" height="2" fill="#86efac" />

      {/* Petiole Leaf Stems to Center */}
      <rect x="9" y="8" width="2" height="4" fill="#14532d" />
      <rect x="13" y="8" width="2" height="4" fill="#14532d" />
      <rect x="9" y="12" width="2" height="4" fill="#14532d" />
      <rect x="13" y="12" width="2" height="4" fill="#14532d" />

      {/* Striking Purple Violet Flower (5 petals: 2 upper, 2 lateral, 1 lower bearded lip) */}
      {variety >= 1 ? (
        <g>
          {/* Flower drop shadow pixel backing */}
          <rect x="8" y="7" width="8" height="8" fill="#3b0764" />

          {/* 2 Upper Petals */}
          <rect x="9" y="6" width="3" height="3" fill="#7c3aed" />
          <rect x="12" y="6" width="3" height="3" fill="#7c3aed" />
          <rect x="10" y="6" width="1" height="2" fill="#a78bfa" />
          <rect x="13" y="6" width="1" height="2" fill="#a78bfa" />

          {/* 2 Lateral Petals */}
          <rect x="7" y="9" width="3" height="4" fill="#8b5cf6" />
          <rect x="14" y="9" width="3" height="4" fill="#8b5cf6" />
          <rect x="8" y="10" width="1" height="2" fill="#c4b5fd" />
          <rect x="15" y="10" width="1" height="2" fill="#c4b5fd" />

          {/* 1 Lower Broad Petal (Lip) */}
          <rect x="9" y="12" width="6" height="4" fill="#7c3aed" />
          <rect x="10" y="13" width="4" height="2" fill="#9333ea" />
          <rect x="11" y="14" width="2" height="1" fill="#c4b5fd" />

          {/* Bright Yellow / White Throat (Center Eye) */}
          <rect x="10" y="9" width="4" height="3" fill="#facc15" />
          <rect x="11" y="10" width="2" height="2" fill="#ffffff" />
          <rect x="11" y="12" width="2" height="1" fill="#4c1d95" /> {/* Dark violet throat veins */}
        </g>
      ) : (
        // Variety 0: Violet Bud in center
        <g>
          <rect x="10" y="9" width="4" height="5" fill="#6d28d9" />
          <rect x="11" y="8" width="2" height="2" fill="#8b5cf6" />
          <rect x="11" y="14" width="2" height="2" fill="#15803d" />
        </g>
      )}
    </g>
  );
}

/**
 * 4. 강아지풀 (Green Foxtail, Setaria viridis) - 16-bit Retro Pixel Art
 * Slender grassy arching blades + nodding fuzzy bristly cylindrical spike (이삭)
 */
function renderPixelFoxtail(variety: number) {
  return (
    <g>
      {/* Arching Grassy Blades radiating from tufted base */}
      {/* Tuft Base */}
      <rect x="10" y="16" width="4" height="4" fill="#14532d" />
      <rect x="9" y="17" width="6" height="2" fill="#052e16" />

      {/* Left arched blades */}
      <rect x="7" y="14" width="3" height="2" fill="#3f6212" />
      <rect x="4" y="12" width="3" height="3" fill="#65a30d" />
      <rect x="2" y="9" width="2" height="4" fill="#84cc16" />
      <rect x="1" y="8" width="2" height="2" fill="#a3e635" />

      {/* Right arched blades */}
      <rect x="14" y="14" width="3" height="2" fill="#3f6212" />
      <rect x="17" y="12" width="3" height="3" fill="#65a30d" />
      <rect x="20" y="9" width="2" height="4" fill="#84cc16" />
      <rect x="21" y="8" width="2" height="2" fill="#a3e635" />

      {/* Slender culm (stem) arching upwards */}
      <rect x="11" y="11" width="2" height="5" fill="#4d7c0f" />
      <rect x="12" y="8" width="2" height="4" fill="#65a30d" />
      <rect x="13" y="5" width="3" height="3" fill="#84cc16" />

      {/* Nodding Fuzzy Foxtail Spikelet (Cylindrical bristly spike) */}
      <g transform={variety === 1 ? 'translate(1, -1)' : ''}>
        {/* Shadow base of spike */}
        <rect x="14" y="2" width="6" height="5" fill="#4d7c0f" />
        {/* Main fuzzy body */}
        <rect x="15" y="1" width="5" height="6" fill="#84cc16" />
        <rect x="15" y="2" width="4" height="4" fill="#bef264" />

        {/* Bristly awns (pixel bristles protruding in all directions) */}
        <rect x="14" y="0" width="1" height="2" fill="#ecfccb" />
        <rect x="17" y="0" width="1" height="1" fill="#ecfccb" />
        <rect x="20" y="1" width="1" height="2" fill="#ecfccb" />
        <rect x="21" y="3" width="2" height="1" fill="#ecfccb" />
        <rect x="20" y="5" width="2" height="1" fill="#ecfccb" />
        <rect x="18" y="7" width="2" height="1" fill="#ecfccb" />
        <rect x="15" y="7" width="1" height="1" fill="#ecfccb" />
        <rect x="13" y="4" width="1" height="2" fill="#ecfccb" />
      </g>
    </g>
  );
}
