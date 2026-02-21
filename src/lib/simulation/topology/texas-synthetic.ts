/**
 * GridShield OS — Synthetic Texas Transmission Grid
 * Canonical 30-node / 60-edge grid used in all simulation scenarios.
 *
 * Node distribution:
 *   8 generators  (GEN-01 to GEN-08)
 *  12 load centers (LOAD-01 to LOAD-12)
 *   4 storage nodes (STOR-01 to STOR-04)
 *   6 substations  (SUB-01 to SUB-06)
 *
 * All coordinates within Texas bounding box:
 *   lat 25.8–36.5°N, lng -106.6 to -93.5°W
 */

import { GridNode, GridEdge } from '../types';
import { createGraph } from '../graph';

// ---------------------------------------------------------------------------
// NODES — exactly 30
// ---------------------------------------------------------------------------

export const TEXAS_NODES: GridNode[] = [
  // --- Generators (8) ---
  {
    id: 'GEN-01',
    type: 'generator',
    name: 'West Texas Wind Farm',
    lat: 32.47,
    lng: -100.41,
    capacityMW: 1200,
    populationWeight: 0.1,
  },
  {
    id: 'GEN-02',
    type: 'generator',
    name: 'Permian Basin Gas Plant',
    lat: 31.84,
    lng: -102.36,
    capacityMW: 800,
    populationWeight: 0.1,
  },
  {
    id: 'GEN-03',
    type: 'generator',
    name: 'Gulf Coast Combined Cycle',
    lat: 29.76,
    lng: -95.36,
    capacityMW: 2000,
    populationWeight: 0.3,
  },
  {
    id: 'GEN-04',
    type: 'generator',
    name: 'South Texas Gas Plant',
    lat: 29.42,
    lng: -98.49,
    capacityMW: 1500,
    populationWeight: 0.2,
  },
  {
    id: 'GEN-05',
    type: 'generator',
    name: 'Panhandle Wind Farm',
    lat: 35.22,
    lng: -101.83,
    capacityMW: 900,
    populationWeight: 0.05,
  },
  {
    id: 'GEN-06',
    type: 'generator',
    name: 'North Texas Gas Plant',
    lat: 32.78,
    lng: -96.80,
    capacityMW: 1800,
    populationWeight: 0.3,
  },
  {
    id: 'GEN-07',
    type: 'generator',
    name: 'Coastal Wind Farm',
    lat: 27.80,
    lng: -97.39,
    capacityMW: 600,
    populationWeight: 0.1,
  },
  {
    id: 'GEN-08',
    type: 'generator',
    name: 'East Texas Gas Plant',
    lat: 30.08,
    lng: -94.10,
    capacityMW: 700,
    populationWeight: 0.1,
  },

  // --- Load Centers (12) ---
  {
    id: 'LOAD-01',
    type: 'load',
    name: 'Dallas Load Center',
    lat: 32.78,
    lng: -96.80,
    capacityMW: 3000,
    populationWeight: 0.9,
  },
  {
    id: 'LOAD-02',
    type: 'load',
    name: 'Houston Load Center',
    lat: 29.76,
    lng: -95.37,
    capacityMW: 4000,
    populationWeight: 1.0,
  },
  {
    id: 'LOAD-03',
    type: 'load',
    name: 'San Antonio Load Center',
    lat: 29.43,
    lng: -98.49,
    capacityMW: 2000,
    populationWeight: 0.7,
  },
  {
    id: 'LOAD-04',
    type: 'load',
    name: 'Austin Load Center',
    lat: 30.27,
    lng: -97.74,
    capacityMW: 1800,
    populationWeight: 0.6,
  },
  {
    id: 'LOAD-05',
    type: 'load',
    name: 'Fort Worth Load Center',
    lat: 32.75,
    lng: -97.33,
    capacityMW: 1500,
    populationWeight: 0.7,
  },
  {
    id: 'LOAD-06',
    type: 'load',
    name: 'El Paso Load Center',
    lat: 31.77,
    lng: -106.45,
    capacityMW: 800,
    populationWeight: 0.3,
  },
  {
    id: 'LOAD-07',
    type: 'load',
    name: 'Lubbock Load Center',
    lat: 33.58,
    lng: -101.85,
    capacityMW: 400,
    populationWeight: 0.15,
  },
  {
    id: 'LOAD-08',
    type: 'load',
    name: 'Amarillo Load Center',
    lat: 35.22,
    lng: -101.83,
    capacityMW: 350,
    populationWeight: 0.12,
  },
  {
    id: 'LOAD-09',
    type: 'load',
    name: 'Waco Load Center',
    lat: 31.55,
    lng: -97.14,
    capacityMW: 300,
    populationWeight: 0.11,
  },
  {
    id: 'LOAD-10',
    type: 'load',
    name: 'Beaumont Load Center',
    lat: 30.09,
    lng: -94.10,
    capacityMW: 450,
    populationWeight: 0.14,
  },
  {
    id: 'LOAD-11',
    type: 'load',
    name: 'McAllen Load Center',
    lat: 26.20,
    lng: -98.23,
    capacityMW: 350,
    populationWeight: 0.12,
  },
  {
    id: 'LOAD-12',
    type: 'load',
    name: 'Odessa Load Center',
    lat: 31.85,
    lng: -102.37,
    capacityMW: 250,
    populationWeight: 0.09,
  },

  // --- Storage Nodes (4) ---
  {
    id: 'STOR-01',
    type: 'storage',
    name: 'Dallas Battery Storage',
    lat: 32.90,
    lng: -97.05,
    capacityMW: 300,
    populationWeight: 0.1,
  },
  {
    id: 'STOR-02',
    type: 'storage',
    name: 'Houston Battery Storage',
    lat: 29.65,
    lng: -95.50,
    capacityMW: 400,
    populationWeight: 0.1,
  },
  {
    id: 'STOR-03',
    type: 'storage',
    name: 'San Antonio Battery Storage',
    lat: 29.55,
    lng: -98.60,
    capacityMW: 250,
    populationWeight: 0.08,
  },
  {
    id: 'STOR-04',
    type: 'storage',
    name: 'Abilene Battery Storage',
    lat: 32.45,
    lng: -99.73,
    capacityMW: 200,
    populationWeight: 0.06,
  },

  // --- Substations (6) ---
  {
    id: 'SUB-01',
    type: 'substation',
    name: 'West Texas Substation (Abilene)',
    lat: 32.45,
    lng: -99.73,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'SUB-02',
    type: 'substation',
    name: 'Central Texas Substation (Waco)',
    lat: 31.50,
    lng: -97.20,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'SUB-03',
    type: 'substation',
    name: 'North Texas Substation (Wichita Falls)',
    lat: 33.90,
    lng: -98.50,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'SUB-04',
    type: 'substation',
    name: 'South Texas Substation (Victoria)',
    lat: 28.81,
    lng: -97.00,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'SUB-05',
    type: 'substation',
    name: 'East Texas Substation (Nacogdoches)',
    lat: 31.60,
    lng: -94.65,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'SUB-06',
    type: 'substation',
    name: 'Panhandle Substation (Childress)',
    lat: 34.43,
    lng: -100.21,
    capacityMW: 0,
    populationWeight: 0,
  },
];

// ---------------------------------------------------------------------------
// EDGES — exactly 60
// Helper: compute reactance from length (lengthKm / 10000)
// ---------------------------------------------------------------------------

export const TEXAS_EDGES: GridEdge[] = [
  // === GENERATOR → SUBSTATION / LOAD connections ===

  // GEN-01 (West TX Wind, Sweetwater) → SUB-01 (Abilene)
  {
    id: 'LINE-01',
    sourceId: 'GEN-01',
    targetId: 'SUB-01',
    capacityMW: 1000,
    reactance: 0.022,
    lengthKm: 220,
    state: 'normal',
  },
  // GEN-01 → LOAD-01 (Dallas) via DFW corridor
  {
    id: 'LINE-02',
    sourceId: 'GEN-01',
    targetId: 'LOAD-01',
    capacityMW: 1200,
    reactance: 0.030,
    lengthKm: 300,
    state: 'normal',
  },
  // GEN-02 (Permian Basin) → LOAD-12 (Odessa) local
  {
    id: 'LINE-03',
    sourceId: 'GEN-02',
    targetId: 'LOAD-12',
    capacityMW: 700,
    reactance: 0.005,
    lengthKm: 50,
    state: 'normal',
  },
  // GEN-02 → SUB-01 (Abilene)
  {
    id: 'LINE-04',
    sourceId: 'GEN-02',
    targetId: 'SUB-01',
    capacityMW: 800,
    reactance: 0.027,
    lengthKm: 270,
    state: 'normal',
  },
  // GEN-02 → LOAD-06 (El Paso)
  {
    id: 'LINE-05',
    sourceId: 'GEN-02',
    targetId: 'LOAD-06',
    capacityMW: 600,
    reactance: 0.039,
    lengthKm: 390,
    state: 'normal',
  },
  // GEN-03 (Gulf Coast CC, Houston) → LOAD-02 (Houston)
  {
    id: 'LINE-06',
    sourceId: 'GEN-03',
    targetId: 'LOAD-02',
    capacityMW: 2000,
    reactance: 0.005,
    lengthKm: 50,
    state: 'normal',
  },
  // GEN-03 → STOR-02 (Houston Storage)
  {
    id: 'LINE-07',
    sourceId: 'GEN-03',
    targetId: 'STOR-02',
    capacityMW: 800,
    reactance: 0.012,
    lengthKm: 120,
    state: 'normal',
  },
  // GEN-04 (South TX Gas, SA) → LOAD-03 (San Antonio)
  {
    id: 'LINE-08',
    sourceId: 'GEN-04',
    targetId: 'LOAD-03',
    capacityMW: 1500,
    reactance: 0.005,
    lengthKm: 50,
    state: 'normal',
  },
  // GEN-04 → STOR-03 (SA Storage)
  {
    id: 'LINE-09',
    sourceId: 'GEN-04',
    targetId: 'STOR-03',
    capacityMW: 600,
    reactance: 0.012,
    lengthKm: 120,
    state: 'normal',
  },
  // GEN-05 (Panhandle Wind) → LOAD-08 (Amarillo)
  {
    id: 'LINE-10',
    sourceId: 'GEN-05',
    targetId: 'LOAD-08',
    capacityMW: 900,
    reactance: 0.005,
    lengthKm: 50,
    state: 'normal',
  },
  // GEN-05 → SUB-06 (Panhandle Substation)
  {
    id: 'LINE-11',
    sourceId: 'GEN-05',
    targetId: 'SUB-06',
    capacityMW: 700,
    reactance: 0.012,
    lengthKm: 120,
    state: 'normal',
  },
  // GEN-06 (North TX Gas, Dallas) → LOAD-01 (Dallas)
  {
    id: 'LINE-12',
    sourceId: 'GEN-06',
    targetId: 'LOAD-01',
    capacityMW: 1800,
    reactance: 0.005,
    lengthKm: 50,
    state: 'normal',
  },
  // GEN-06 → LOAD-05 (Fort Worth)
  {
    id: 'LINE-13',
    sourceId: 'GEN-06',
    targetId: 'LOAD-05',
    capacityMW: 1200,
    reactance: 0.005,
    lengthKm: 50,
    state: 'normal',
  },
  // GEN-07 (Coastal Wind, Corpus Christi) → SUB-04 (Victoria)
  {
    id: 'LINE-14',
    sourceId: 'GEN-07',
    targetId: 'SUB-04',
    capacityMW: 600,
    reactance: 0.016,
    lengthKm: 160,
    state: 'normal',
  },
  // GEN-07 → LOAD-11 (McAllen)
  {
    id: 'LINE-15',
    sourceId: 'GEN-07',
    targetId: 'LOAD-11',
    capacityMW: 500,
    reactance: 0.018,
    lengthKm: 180,
    state: 'normal',
  },
  // GEN-08 (East TX Gas, Beaumont) → LOAD-10 (Beaumont)
  {
    id: 'LINE-16',
    sourceId: 'GEN-08',
    targetId: 'LOAD-10',
    capacityMW: 700,
    reactance: 0.005,
    lengthKm: 50,
    state: 'normal',
  },
  // GEN-08 → SUB-05 (East TX Substation)
  {
    id: 'LINE-17',
    sourceId: 'GEN-08',
    targetId: 'SUB-05',
    capacityMW: 600,
    reactance: 0.018,
    lengthKm: 180,
    state: 'normal',
  },

  // === SUBSTATION → LOAD connections ===

  // SUB-01 (Abilene) → LOAD-07 (Lubbock)
  {
    id: 'LINE-18',
    sourceId: 'SUB-01',
    targetId: 'LOAD-07',
    capacityMW: 700,
    reactance: 0.013,
    lengthKm: 130,
    state: 'normal',
  },
  // SUB-01 → LOAD-01 (Dallas)
  {
    id: 'LINE-19',
    sourceId: 'SUB-01',
    targetId: 'LOAD-01',
    capacityMW: 1000,
    reactance: 0.024,
    lengthKm: 240,
    state: 'normal',
  },
  // SUB-01 → STOR-04 (Abilene Storage)
  {
    id: 'LINE-20',
    sourceId: 'SUB-01',
    targetId: 'STOR-04',
    capacityMW: 500,
    reactance: 0.005,
    lengthKm: 50,
    state: 'normal',
  },
  // SUB-02 (Waco) → LOAD-09 (Waco)
  {
    id: 'LINE-21',
    sourceId: 'SUB-02',
    targetId: 'LOAD-09',
    capacityMW: 500,
    reactance: 0.005,
    lengthKm: 50,
    state: 'normal',
  },
  // SUB-02 → LOAD-04 (Austin)
  {
    id: 'LINE-22',
    sourceId: 'SUB-02',
    targetId: 'LOAD-04',
    capacityMW: 800,
    reactance: 0.018,
    lengthKm: 180,
    state: 'normal',
  },
  // SUB-02 → LOAD-03 (San Antonio)
  {
    id: 'LINE-23',
    sourceId: 'SUB-02',
    targetId: 'LOAD-03',
    capacityMW: 700,
    reactance: 0.022,
    lengthKm: 220,
    state: 'normal',
  },
  // SUB-03 (Wichita Falls) → LOAD-05 (Fort Worth)
  {
    id: 'LINE-24',
    sourceId: 'SUB-03',
    targetId: 'LOAD-05',
    capacityMW: 800,
    reactance: 0.014,
    lengthKm: 140,
    state: 'normal',
  },
  // SUB-03 → LOAD-01 (Dallas)
  {
    id: 'LINE-25',
    sourceId: 'SUB-03',
    targetId: 'LOAD-01',
    capacityMW: 700,
    reactance: 0.018,
    lengthKm: 180,
    state: 'normal',
  },
  // SUB-04 (Victoria) → LOAD-03 (San Antonio)
  {
    id: 'LINE-26',
    sourceId: 'SUB-04',
    targetId: 'LOAD-03',
    capacityMW: 600,
    reactance: 0.022,
    lengthKm: 220,
    state: 'normal',
  },
  // SUB-04 → LOAD-02 (Houston)
  {
    id: 'LINE-27',
    sourceId: 'SUB-04',
    targetId: 'LOAD-02',
    capacityMW: 700,
    reactance: 0.032,
    lengthKm: 320,
    state: 'normal',
  },
  // SUB-05 (Nacogdoches) → LOAD-02 (Houston)
  {
    id: 'LINE-28',
    sourceId: 'SUB-05',
    targetId: 'LOAD-02',
    capacityMW: 600,
    reactance: 0.027,
    lengthKm: 270,
    state: 'normal',
  },
  // SUB-05 → LOAD-10 (Beaumont)
  {
    id: 'LINE-29',
    sourceId: 'SUB-05',
    targetId: 'LOAD-10',
    capacityMW: 500,
    reactance: 0.008,
    lengthKm: 80,
    state: 'normal',
  },
  // SUB-06 (Childress/Panhandle) → LOAD-08 (Amarillo)
  {
    id: 'LINE-30',
    sourceId: 'SUB-06',
    targetId: 'LOAD-08',
    capacityMW: 600,
    reactance: 0.012,
    lengthKm: 120,
    state: 'normal',
  },
  // SUB-06 → LOAD-07 (Lubbock)
  {
    id: 'LINE-31',
    sourceId: 'SUB-06',
    targetId: 'LOAD-07',
    capacityMW: 700,
    reactance: 0.020,
    lengthKm: 200,
    state: 'normal',
  },

  // === INTER-LOAD connections (major urban interconnects) ===

  // LOAD-01 (Dallas) → LOAD-05 (Fort Worth)
  {
    id: 'LINE-32',
    sourceId: 'LOAD-01',
    targetId: 'LOAD-05',
    capacityMW: 1500,
    reactance: 0.005,
    lengthKm: 50,
    state: 'normal',
  },
  // LOAD-01 (Dallas) → LOAD-09 (Waco)
  {
    id: 'LINE-33',
    sourceId: 'LOAD-01',
    targetId: 'LOAD-09',
    capacityMW: 1000,
    reactance: 0.019,
    lengthKm: 190,
    state: 'normal',
  },
  // LOAD-01 (Dallas) → STOR-01 (Dallas Storage)
  {
    id: 'LINE-34',
    sourceId: 'LOAD-01',
    targetId: 'STOR-01',
    capacityMW: 800,
    reactance: 0.013,
    lengthKm: 130,
    state: 'normal',
  },
  // LOAD-02 (Houston) → LOAD-10 (Beaumont)
  {
    id: 'LINE-35',
    sourceId: 'LOAD-02',
    targetId: 'LOAD-10',
    capacityMW: 800,
    reactance: 0.013,
    lengthKm: 130,
    state: 'normal',
  },
  // LOAD-02 (Houston) → STOR-02 (Houston Storage) — redundant supply path
  {
    id: 'LINE-36',
    sourceId: 'LOAD-02',
    targetId: 'STOR-02',
    capacityMW: 600,
    reactance: 0.012,
    lengthKm: 120,
    state: 'normal',
  },
  // LOAD-02 (Houston) → LOAD-04 (Austin)
  {
    id: 'LINE-37',
    sourceId: 'LOAD-02',
    targetId: 'LOAD-04',
    capacityMW: 1000,
    reactance: 0.025,
    lengthKm: 250,
    state: 'normal',
  },
  // LOAD-03 (San Antonio) → LOAD-04 (Austin)
  {
    id: 'LINE-38',
    sourceId: 'LOAD-03',
    targetId: 'LOAD-04',
    capacityMW: 900,
    reactance: 0.013,
    lengthKm: 130,
    state: 'normal',
  },
  // LOAD-03 (San Antonio) → STOR-03 (SA Storage) — redundant supply path
  {
    id: 'LINE-39',
    sourceId: 'LOAD-03',
    targetId: 'STOR-03',
    capacityMW: 500,
    reactance: 0.012,
    lengthKm: 120,
    state: 'normal',
  },
  // LOAD-03 (San Antonio) → LOAD-11 (McAllen)
  {
    id: 'LINE-40',
    sourceId: 'LOAD-03',
    targetId: 'LOAD-11',
    capacityMW: 600,
    reactance: 0.032,
    lengthKm: 320,
    state: 'normal',
  },
  // LOAD-04 (Austin) → LOAD-09 (Waco)
  {
    id: 'LINE-41',
    sourceId: 'LOAD-04',
    targetId: 'LOAD-09',
    capacityMW: 700,
    reactance: 0.019,
    lengthKm: 190,
    state: 'normal',
  },
  // LOAD-04 (Austin) → SUB-02 (Waco Central)
  {
    id: 'LINE-42',
    sourceId: 'LOAD-04',
    targetId: 'SUB-02',
    capacityMW: 600,
    reactance: 0.018,
    lengthKm: 180,
    state: 'normal',
  },
  // LOAD-05 (Fort Worth) → SUB-03 (Wichita Falls)
  {
    id: 'LINE-43',
    sourceId: 'LOAD-05',
    targetId: 'SUB-03',
    capacityMW: 700,
    reactance: 0.014,
    lengthKm: 140,
    state: 'normal',
  },
  // LOAD-05 (Fort Worth) → STOR-01 (Dallas Storage)
  {
    id: 'LINE-44',
    sourceId: 'LOAD-05',
    targetId: 'STOR-01',
    capacityMW: 500,
    reactance: 0.009,
    lengthKm: 90,
    state: 'normal',
  },
  // LOAD-07 (Lubbock) → LOAD-08 (Amarillo)
  {
    id: 'LINE-45',
    sourceId: 'LOAD-07',
    targetId: 'LOAD-08',
    capacityMW: 600,
    reactance: 0.019,
    lengthKm: 190,
    state: 'normal',
  },
  // LOAD-07 (Lubbock) → SUB-01 (Abilene)
  {
    id: 'LINE-46',
    sourceId: 'LOAD-07',
    targetId: 'SUB-01',
    capacityMW: 700,
    reactance: 0.013,
    lengthKm: 130,
    state: 'normal',
  },

  // === STORAGE → LOAD connections (dispatch paths) ===

  // STOR-01 (Dallas Storage) → LOAD-05 (Fort Worth) — already covered LINE-44
  // STOR-02 (Houston Storage) → LOAD-04 (Austin)
  {
    id: 'LINE-47',
    sourceId: 'STOR-02',
    targetId: 'LOAD-04',
    capacityMW: 500,
    reactance: 0.025,
    lengthKm: 250,
    state: 'normal',
  },
  // STOR-03 (SA Storage) → LOAD-04 (Austin)
  {
    id: 'LINE-48',
    sourceId: 'STOR-03',
    targetId: 'LOAD-04',
    capacityMW: 400,
    reactance: 0.013,
    lengthKm: 130,
    state: 'normal',
  },
  // STOR-04 (Abilene Storage) → LOAD-01 (Dallas)
  {
    id: 'LINE-49',
    sourceId: 'STOR-04',
    targetId: 'LOAD-01',
    capacityMW: 400,
    reactance: 0.024,
    lengthKm: 240,
    state: 'normal',
  },

  // === ADDITIONAL N-1 REDUNDANCY PATHS ===

  // GEN-01 → LOAD-05 (Fort Worth) — second wind path to DFW
  {
    id: 'LINE-50',
    sourceId: 'GEN-01',
    targetId: 'LOAD-05',
    capacityMW: 900,
    reactance: 0.029,
    lengthKm: 290,
    state: 'normal',
  },
  // GEN-03 (Houston CC) → LOAD-04 (Austin)
  {
    id: 'LINE-51',
    sourceId: 'GEN-03',
    targetId: 'LOAD-04',
    capacityMW: 1000,
    reactance: 0.025,
    lengthKm: 250,
    state: 'normal',
  },
  // GEN-04 (SA Gas) → LOAD-04 (Austin)
  {
    id: 'LINE-52',
    sourceId: 'GEN-04',
    targetId: 'LOAD-04',
    capacityMW: 900,
    reactance: 0.013,
    lengthKm: 130,
    state: 'normal',
  },
  // GEN-06 (North TX Gas) → STOR-01 (Dallas Storage)
  {
    id: 'LINE-53',
    sourceId: 'GEN-06',
    targetId: 'STOR-01',
    capacityMW: 700,
    reactance: 0.013,
    lengthKm: 130,
    state: 'normal',
  },
  // GEN-08 (East TX) → LOAD-02 (Houston)
  {
    id: 'LINE-54',
    sourceId: 'GEN-08',
    targetId: 'LOAD-02',
    capacityMW: 600,
    reactance: 0.018,
    lengthKm: 180,
    state: 'normal',
  },
  // SUB-02 (Waco Central) → LOAD-01 (Dallas)
  {
    id: 'LINE-55',
    sourceId: 'SUB-02',
    targetId: 'LOAD-01',
    capacityMW: 900,
    reactance: 0.019,
    lengthKm: 190,
    state: 'normal',
  },
  // SUB-04 (Victoria) → LOAD-11 (McAllen)
  {
    id: 'LINE-56',
    sourceId: 'SUB-04',
    targetId: 'LOAD-11',
    capacityMW: 500,
    reactance: 0.022,
    lengthKm: 220,
    state: 'normal',
  },
  // LOAD-09 (Waco) → SUB-02 (Waco sub) — local mesh
  {
    id: 'LINE-57',
    sourceId: 'LOAD-09',
    targetId: 'SUB-02',
    capacityMW: 600,
    reactance: 0.005,
    lengthKm: 50,
    state: 'normal',
  },
  // LOAD-11 (McAllen) → SUB-04 (Victoria) — second supply
  {
    id: 'LINE-58',
    sourceId: 'LOAD-11',
    targetId: 'LOAD-07',
    capacityMW: 500,
    reactance: 0.072,
    lengthKm: 720,
    state: 'normal',
  },
  // LOAD-12 (Odessa) → LOAD-06 (El Paso)
  {
    id: 'LINE-59',
    sourceId: 'LOAD-12',
    targetId: 'LOAD-06',
    capacityMW: 600,
    reactance: 0.034,
    lengthKm: 340,
    state: 'normal',
  },
  // LOAD-12 (Odessa) → SUB-01 (Abilene)
  {
    id: 'LINE-60',
    sourceId: 'LOAD-12',
    targetId: 'SUB-01',
    capacityMW: 700,
    reactance: 0.027,
    lengthKm: 270,
    state: 'normal',
  },
];

// ---------------------------------------------------------------------------
// Inline sanity assertions (throw at module load if violated)
// ---------------------------------------------------------------------------
if (TEXAS_NODES.length !== 30)
  throw new Error(`Expected 30 nodes, got ${TEXAS_NODES.length}`);
if (TEXAS_EDGES.length !== 60)
  throw new Error(`Expected 60 edges, got ${TEXAS_EDGES.length}`);

// ---------------------------------------------------------------------------
// Build canonical graph
// ---------------------------------------------------------------------------
export const TEXAS_GRID = createGraph(TEXAS_NODES, TEXAS_EDGES);
