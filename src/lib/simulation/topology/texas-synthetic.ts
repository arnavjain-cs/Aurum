/**
 * GridShield OS — Synthetic Texas Transmission Grid
 * Canonical 30-node / 60-edge grid used in all simulation scenarios.
 *
 * Node distribution:
 *  22 generators  (GEN-01 to GEN-22)
 *  48 load centers (LOAD-01 to LOAD-48)
 *  12 storage nodes (STOR-01 to STOR-12)
 *  18 substations  (SUB-01 to SUB-18)
 *
 * Austin metro additions: LOAD-13..28, GEN-09..14, SUB-07..11, STOR-05..07
 * Statewide additions:     LOAD-29..35, GEN-15..18, SUB-12..14, STOR-08..09
 * Expansion round 3:       LOAD-36..48, GEN-19..22, SUB-15..18, STOR-10..12
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

  // ---------------------------------------------------------------------------
  // AUSTIN METRO ADDITIONS (9 nodes)
  // ---------------------------------------------------------------------------

  {
    id: 'LOAD-13',
    type: 'load',
    name: 'Travis County Load Center (Downtown Austin)',
    lat: 30.267,
    lng: -97.743,
    capacityMW: 1800,
    populationWeight: 0.11,
  },
  {
    id: 'LOAD-14',
    type: 'load',
    name: 'Round Rock Load Center (North Austin)',
    lat: 30.508,
    lng: -97.678,
    capacityMW: 1200,
    populationWeight: 0.07,
  },
  {
    id: 'LOAD-15',
    type: 'load',
    name: 'Cedar Park Load Center (NW Austin)',
    lat: 30.558,
    lng: -97.820,
    capacityMW: 900,
    populationWeight: 0.055,
  },
  {
    id: 'LOAD-16',
    type: 'load',
    name: 'Kyle Load Center (South Austin)',
    lat: 30.039,
    lng: -97.881,
    capacityMW: 800,
    populationWeight: 0.045,
  },
  {
    id: 'GEN-09',
    type: 'generator',
    name: 'Bastrop Energy Center (SE Austin)',
    lat: 30.110,
    lng: -97.310,
    capacityMW: 1600,
    populationWeight: 0.06,
  },
  {
    id: 'GEN-10',
    type: 'generator',
    name: 'Spicewood Gas Plant (W Austin)',
    lat: 30.418,
    lng: -98.168,
    capacityMW: 1400,
    populationWeight: 0.05,
  },
  {
    id: 'SUB-07',
    type: 'substation',
    name: 'Pflugerville Substation (NE Austin)',
    lat: 30.435,
    lng: -97.600,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'SUB-08',
    type: 'substation',
    name: 'East Austin Substation',
    lat: 30.273,
    lng: -97.652,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'STOR-05',
    type: 'storage',
    name: 'Austin Battery Storage (Central)',
    lat: 30.321,
    lng: -97.754,
    capacityMW: 200,
    populationWeight: 0,
  },

  // --- Greater Austin expansion (9 more nodes) ---

  {
    id: 'LOAD-17',
    type: 'load',
    name: 'Georgetown Load Center (N Austin)',
    lat: 30.633,
    lng: -97.677,
    capacityMW: 750,
    populationWeight: 0.04,
  },
  {
    id: 'LOAD-18',
    type: 'load',
    name: 'Leander Load Center (NW Austin)',
    lat: 30.578,
    lng: -97.853,
    capacityMW: 680,
    populationWeight: 0.035,
  },
  {
    id: 'LOAD-19',
    type: 'load',
    name: 'Elgin Load Center (E Austin)',
    lat: 30.349,
    lng: -97.370,
    capacityMW: 520,
    populationWeight: 0.027,
  },
  {
    id: 'LOAD-20',
    type: 'load',
    name: 'San Marcos Load Center (S Austin)',
    lat: 29.883,
    lng: -97.941,
    capacityMW: 900,
    populationWeight: 0.05,
  },
  {
    id: 'LOAD-21',
    type: 'load',
    name: 'Buda Load Center (SSW Austin)',
    lat: 30.085,
    lng: -97.840,
    capacityMW: 620,
    populationWeight: 0.032,
  },
  {
    id: 'GEN-11',
    type: 'generator',
    name: 'Georgetown Gas Plant (N Austin)',
    lat: 30.680,
    lng: -97.600,
    capacityMW: 1100,
    populationWeight: 0.04,
  },
  {
    id: 'GEN-12',
    type: 'generator',
    name: 'Manor Solar Farm (E Austin)',
    lat: 30.340,
    lng: -97.540,
    capacityMW: 800,
    populationWeight: 0.03,
  },
  {
    id: 'SUB-09',
    type: 'substation',
    name: 'Marble Falls Substation (W Austin)',
    lat: 30.578,
    lng: -98.273,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'STOR-06',
    type: 'storage',
    name: 'South Austin Battery Storage',
    lat: 30.167,
    lng: -97.793,
    capacityMW: 180,
    populationWeight: 0,
  },

  // --- Greater Austin outer ring (12 more nodes) ---

  {
    id: 'LOAD-22',
    type: 'load',
    name: 'Hutto Load Center (NE Austin)',
    lat: 30.543,
    lng: -97.540,
    capacityMW: 620,
    populationWeight: 0.033,
  },
  {
    id: 'LOAD-23',
    type: 'load',
    name: 'Taylor Load Center (E Austin)',
    lat: 30.571,
    lng: -97.409,
    capacityMW: 570,
    populationWeight: 0.028,
  },
  {
    id: 'LOAD-24',
    type: 'load',
    name: 'Lockhart Load Center (SE Austin)',
    lat: 29.884,
    lng: -97.672,
    capacityMW: 540,
    populationWeight: 0.027,
  },
  {
    id: 'LOAD-25',
    type: 'load',
    name: 'Wimberley Load Center (SW Austin)',
    lat: 30.058,
    lng: -98.099,
    capacityMW: 490,
    populationWeight: 0.024,
  },
  {
    id: 'LOAD-26',
    type: 'load',
    name: 'Liberty Hill Load Center (NW Austin)',
    lat: 30.664,
    lng: -97.922,
    capacityMW: 530,
    populationWeight: 0.027,
  },
  {
    id: 'LOAD-27',
    type: 'load',
    name: 'Dripping Springs Load Center (W Austin)',
    lat: 30.190,
    lng: -98.093,
    capacityMW: 510,
    populationWeight: 0.025,
  },
  {
    id: 'LOAD-28',
    type: 'load',
    name: 'Lockhart South Load Center',
    lat: 29.768,
    lng: -97.672,
    capacityMW: 440,
    populationWeight: 0.021,
  },
  {
    id: 'GEN-13',
    type: 'generator',
    name: 'Bertram Wind Farm (N Austin)',
    lat: 30.746,
    lng: -97.992,
    capacityMW: 1050,
    populationWeight: 0.035,
  },
  {
    id: 'GEN-14',
    type: 'generator',
    name: 'Johnson City Solar Farm (W Austin)',
    lat: 30.276,
    lng: -98.410,
    capacityMW: 920,
    populationWeight: 0.028,
  },
  {
    id: 'SUB-10',
    type: 'substation',
    name: 'Burnet Substation (NW Austin)',
    lat: 30.758,
    lng: -98.229,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'SUB-11',
    type: 'substation',
    name: 'Lago Vista Substation (W Lake Travis)',
    lat: 30.465,
    lng: -97.977,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'STOR-07',
    type: 'storage',
    name: 'Hutto Battery Storage (NE Austin)',
    lat: 30.524,
    lng: -97.567,
    capacityMW: 160,
    populationWeight: 0,
  },

  // ---------------------------------------------------------------------------
  // STATEWIDE ADDITIONS (15 nodes)
  // ---------------------------------------------------------------------------

  // --- East Texas ---
  {
    id: 'GEN-15',
    type: 'generator',
    name: 'Henderson Wind Farm (E Texas)',
    lat: 32.153,
    lng: -95.853,
    capacityMW: 850,
    populationWeight: 0.07,
  },
  {
    id: 'LOAD-29',
    type: 'load',
    name: 'Tyler Load Center',
    lat: 32.351,
    lng: -95.301,
    capacityMW: 780,
    populationWeight: 0.06,
  },
  {
    id: 'LOAD-30',
    type: 'load',
    name: 'Longview Load Center',
    lat: 32.500,
    lng: -94.739,
    capacityMW: 640,
    populationWeight: 0.05,
  },
  {
    id: 'LOAD-35',
    type: 'load',
    name: 'Texarkana Load Center',
    lat: 33.430,
    lng: -94.048,
    capacityMW: 520,
    populationWeight: 0.04,
  },
  {
    id: 'SUB-12',
    type: 'substation',
    name: 'Tyler Substation (E Texas)',
    lat: 32.352,
    lng: -95.790,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'STOR-08',
    type: 'storage',
    name: 'Lufkin Battery Storage (E Texas)',
    lat: 31.340,
    lng: -94.729,
    capacityMW: 190,
    populationWeight: 0,
  },

  // --- North Texas (DFW suburbs) ---
  {
    id: 'LOAD-33',
    type: 'load',
    name: 'Denton Load Center',
    lat: 33.215,
    lng: -97.133,
    capacityMW: 860,
    populationWeight: 0.07,
  },
  {
    id: 'LOAD-34',
    type: 'load',
    name: 'Sherman Load Center',
    lat: 33.636,
    lng: -96.609,
    capacityMW: 620,
    populationWeight: 0.05,
  },

  // --- South Texas Coast ---
  {
    id: 'GEN-16',
    type: 'generator',
    name: 'South Texas Nuclear Plant (Bay City)',
    lat: 28.722,
    lng: -96.068,
    capacityMW: 2700,
    populationWeight: 0.25,
  },
  {
    id: 'LOAD-31',
    type: 'load',
    name: 'Corpus Christi Load Center',
    lat: 27.800,
    lng: -97.396,
    capacityMW: 1100,
    populationWeight: 0.18,
  },
  {
    id: 'LOAD-32',
    type: 'load',
    name: 'Laredo Load Center',
    lat: 27.506,
    lng: -99.507,
    capacityMW: 650,
    populationWeight: 0.09,
  },
  {
    id: 'SUB-13',
    type: 'substation',
    name: 'Corpus Christi Substation',
    lat: 27.851,
    lng: -97.500,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'STOR-09',
    type: 'storage',
    name: 'Gulf Coast Battery Storage (Freeport)',
    lat: 28.950,
    lng: -95.362,
    capacityMW: 320,
    populationWeight: 0,
  },

  // --- West Texas / Permian Basin ---
  {
    id: 'GEN-17',
    type: 'generator',
    name: 'Midland Gas Plant',
    lat: 31.997,
    lng: -102.078,
    capacityMW: 1100,
    populationWeight: 0.12,
  },
  {
    id: 'SUB-14',
    type: 'substation',
    name: 'Midland-Odessa Substation',
    lat: 32.000,
    lng: -102.150,
    capacityMW: 0,
    populationWeight: 0,
  },

  // ---------------------------------------------------------------------------
  // EXPANSION ROUND 3 — 25 nodes filling coverage gaps
  // ---------------------------------------------------------------------------

  // --- Generators ---
  {
    id: 'GEN-18',
    type: 'generator',
    name: 'Big Spring Wind Farm (W Texas)',
    lat: 32.250,
    lng: -101.480,
    capacityMW: 1050,
    populationWeight: 0.07,
  },
  {
    id: 'GEN-19',
    type: 'generator',
    name: 'Offshore Wind Platform (Gulf Coast)',
    lat: 27.500,
    lng: -97.000,
    capacityMW: 750,
    populationWeight: 0.06,
  },
  {
    id: 'GEN-20',
    type: 'generator',
    name: 'Big Bend Solar Farm (SW Texas)',
    lat: 29.250,
    lng: -103.250,
    capacityMW: 900,
    populationWeight: 0.05,
  },
  {
    id: 'GEN-21',
    type: 'generator',
    name: 'Concho Valley Gas Plant (W Central TX)',
    lat: 31.440,
    lng: -100.440,
    capacityMW: 1000,
    populationWeight: 0.08,
  },
  {
    id: 'GEN-22',
    type: 'generator',
    name: 'Comanche Peak Nuclear Plant (Glen Rose)',
    lat: 32.298,
    lng: -97.785,
    capacityMW: 2400,
    populationWeight: 0.22,
  },

  // --- Load Centers ---
  {
    id: 'LOAD-36',
    type: 'load',
    name: 'Midland Load Center',
    lat: 31.999,
    lng: -102.078,
    capacityMW: 680,
    populationWeight: 0.06,
  },
  {
    id: 'LOAD-37',
    type: 'load',
    name: 'Abilene Load Center',
    lat: 32.449,
    lng: -99.733,
    capacityMW: 740,
    populationWeight: 0.065,
  },
  {
    id: 'LOAD-38',
    type: 'load',
    name: 'Killeen-Temple Load Center',
    lat: 31.117,
    lng: -97.728,
    capacityMW: 870,
    populationWeight: 0.075,
  },
  {
    id: 'LOAD-39',
    type: 'load',
    name: 'College Station Load Center',
    lat: 30.628,
    lng: -96.334,
    capacityMW: 820,
    populationWeight: 0.07,
  },
  {
    id: 'LOAD-40',
    type: 'load',
    name: 'Victoria Load Center',
    lat: 28.805,
    lng: -97.003,
    capacityMW: 590,
    populationWeight: 0.05,
  },
  {
    id: 'LOAD-41',
    type: 'load',
    name: 'Galveston Load Center',
    lat: 29.301,
    lng: -94.797,
    capacityMW: 560,
    populationWeight: 0.045,
  },
  {
    id: 'LOAD-42',
    type: 'load',
    name: 'Jacksonville Load Center (E Texas)',
    lat: 31.962,
    lng: -95.271,
    capacityMW: 510,
    populationWeight: 0.042,
  },
  {
    id: 'LOAD-43',
    type: 'load',
    name: 'Brownsville Load Center',
    lat: 25.902,
    lng: -97.497,
    capacityMW: 750,
    populationWeight: 0.065,
  },
  {
    id: 'LOAD-44',
    type: 'load',
    name: 'Del Rio Load Center',
    lat: 29.360,
    lng: -100.897,
    capacityMW: 440,
    populationWeight: 0.038,
  },
  {
    id: 'LOAD-45',
    type: 'load',
    name: 'Stephenville Load Center (N Central TX)',
    lat: 32.220,
    lng: -98.202,
    capacityMW: 530,
    populationWeight: 0.044,
  },
  {
    id: 'LOAD-46',
    type: 'load',
    name: 'Palestine Load Center (E Central TX)',
    lat: 31.762,
    lng: -95.631,
    capacityMW: 490,
    populationWeight: 0.04,
  },
  {
    id: 'LOAD-47',
    type: 'load',
    name: 'Gainesville Load Center (N Texas)',
    lat: 33.625,
    lng: -97.133,
    capacityMW: 520,
    populationWeight: 0.043,
  },
  {
    id: 'LOAD-48',
    type: 'load',
    name: 'Midlothian Load Center (DFW suburb)',
    lat: 32.483,
    lng: -96.993,
    capacityMW: 730,
    populationWeight: 0.063,
  },

  // --- Substations ---
  {
    id: 'SUB-15',
    type: 'substation',
    name: 'Bryan-College Station Substation',
    lat: 30.640,
    lng: -96.370,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'SUB-16',
    type: 'substation',
    name: 'Brownsville Substation (Deep South TX)',
    lat: 25.950,
    lng: -97.450,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'SUB-17',
    type: 'substation',
    name: 'Del Rio Substation (SW Texas)',
    lat: 29.380,
    lng: -100.920,
    capacityMW: 0,
    populationWeight: 0,
  },
  {
    id: 'SUB-18',
    type: 'substation',
    name: 'Sweetwater Substation (W Texas)',
    lat: 32.470,
    lng: -100.420,
    capacityMW: 0,
    populationWeight: 0,
  },

  // --- Storage ---
  {
    id: 'STOR-10',
    type: 'storage',
    name: 'Galveston Bay Battery Storage',
    lat: 29.291,
    lng: -94.820,
    capacityMW: 240,
    populationWeight: 0,
  },
  {
    id: 'STOR-11',
    type: 'storage',
    name: 'Killeen Battery Storage',
    lat: 31.100,
    lng: -97.750,
    capacityMW: 210,
    populationWeight: 0,
  },
  {
    id: 'STOR-12',
    type: 'storage',
    name: 'Sweetwater Battery Storage (W Texas)',
    lat: 32.460,
    lng: -100.430,
    capacityMW: 220,
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

  // ---------------------------------------------------------------------------
  // AUSTIN METRO EDGES (11 edges, LINE-61 to LINE-71)
  // ---------------------------------------------------------------------------

  // GEN-09 (Bastrop, SE Austin) → LOAD-13 (Downtown Austin)
  {
    id: 'LINE-61',
    sourceId: 'GEN-09',
    targetId: 'LOAD-13',
    capacityMW: 1200,
    reactance: 0.0075,
    lengthKm: 75,
    state: 'normal',
  },
  // GEN-09 (Bastrop) → SUB-08 (East Austin Substation)
  {
    id: 'LINE-62',
    sourceId: 'GEN-09',
    targetId: 'SUB-08',
    capacityMW: 1000,
    reactance: 0.0055,
    lengthKm: 55,
    state: 'normal',
  },
  // LOAD-13 (Downtown Austin) → SUB-07 (Pflugerville)
  {
    id: 'LINE-63',
    sourceId: 'LOAD-13',
    targetId: 'SUB-07',
    capacityMW: 800,
    reactance: 0.003,
    lengthKm: 30,
    state: 'normal',
  },
  // LOAD-13 (Downtown Austin) → SUB-08 (East Austin)
  {
    id: 'LINE-64',
    sourceId: 'LOAD-13',
    targetId: 'SUB-08',
    capacityMW: 1500,
    reactance: 0.0015,
    lengthKm: 15,
    state: 'normal',
  },
  // SUB-07 (Pflugerville) → LOAD-14 (Round Rock)
  {
    id: 'LINE-65',
    sourceId: 'SUB-07',
    targetId: 'LOAD-14',
    capacityMW: 700,
    reactance: 0.002,
    lengthKm: 20,
    state: 'normal',
  },
  // SUB-07 (Pflugerville) → LOAD-15 (Cedar Park)
  {
    id: 'LINE-66',
    sourceId: 'SUB-07',
    targetId: 'LOAD-15',
    capacityMW: 600,
    reactance: 0.0035,
    lengthKm: 35,
    state: 'normal',
  },
  // GEN-10 (Spicewood, W Austin) → LOAD-15 (Cedar Park)
  {
    id: 'LINE-67',
    sourceId: 'GEN-10',
    targetId: 'LOAD-15',
    capacityMW: 900,
    reactance: 0.0045,
    lengthKm: 45,
    state: 'normal',
  },
  // GEN-10 (Spicewood) → LOAD-13 (Downtown Austin)
  {
    id: 'LINE-68',
    sourceId: 'GEN-10',
    targetId: 'LOAD-13',
    capacityMW: 1000,
    reactance: 0.006,
    lengthKm: 60,
    state: 'normal',
  },
  // LOAD-16 (Kyle/South Austin) → LOAD-13 (Downtown Austin)
  {
    id: 'LINE-69',
    sourceId: 'LOAD-16',
    targetId: 'LOAD-13',
    capacityMW: 700,
    reactance: 0.005,
    lengthKm: 50,
    state: 'normal',
  },
  // STOR-05 (Austin Battery Storage) → LOAD-13 (Downtown Austin)
  {
    id: 'LINE-70',
    sourceId: 'STOR-05',
    targetId: 'LOAD-13',
    capacityMW: 500,
    reactance: 0.001,
    lengthKm: 10,
    state: 'normal',
  },
  // SUB-08 (East Austin) → LOAD-16 (Kyle/South Austin)
  {
    id: 'LINE-71',
    sourceId: 'SUB-08',
    targetId: 'LOAD-16',
    capacityMW: 600,
    reactance: 0.004,
    lengthKm: 40,
    state: 'normal',
  },

  // --- Greater Austin expansion edges (LINE-72 to LINE-83) ---

  // GEN-11 (Georgetown Gas) → LOAD-17 (Georgetown)
  {
    id: 'LINE-72',
    sourceId: 'GEN-11',
    targetId: 'LOAD-17',
    capacityMW: 900,
    reactance: 0.003,
    lengthKm: 12,
    state: 'normal',
  },
  // LOAD-17 (Georgetown) → LOAD-14 (Round Rock)
  {
    id: 'LINE-73',
    sourceId: 'LOAD-17',
    targetId: 'LOAD-14',
    capacityMW: 700,
    reactance: 0.016,
    lengthKm: 16,
    state: 'normal',
  },
  // LOAD-17 (Georgetown) → SUB-07 (Pflugerville)
  {
    id: 'LINE-74',
    sourceId: 'LOAD-17',
    targetId: 'SUB-07',
    capacityMW: 600,
    reactance: 0.022,
    lengthKm: 22,
    state: 'normal',
  },
  // LOAD-18 (Leander) → LOAD-15 (Cedar Park)
  {
    id: 'LINE-75',
    sourceId: 'LOAD-18',
    targetId: 'LOAD-15',
    capacityMW: 550,
    reactance: 0.003,
    lengthKm: 8,
    state: 'normal',
  },
  // LOAD-18 (Leander) → SUB-09 (Marble Falls)
  {
    id: 'LINE-76',
    sourceId: 'LOAD-18',
    targetId: 'SUB-09',
    capacityMW: 500,
    reactance: 0.043,
    lengthKm: 43,
    state: 'normal',
  },
  // GEN-12 (Manor Solar) → LOAD-19 (Elgin)
  {
    id: 'LINE-77',
    sourceId: 'GEN-12',
    targetId: 'LOAD-19',
    capacityMW: 600,
    reactance: 0.018,
    lengthKm: 18,
    state: 'normal',
  },
  // GEN-12 (Manor Solar) → SUB-08 (East Austin)
  {
    id: 'LINE-78',
    sourceId: 'GEN-12',
    targetId: 'SUB-08',
    capacityMW: 700,
    reactance: 0.019,
    lengthKm: 19,
    state: 'normal',
  },
  // LOAD-19 (Elgin) → SUB-08 (East Austin)
  {
    id: 'LINE-79',
    sourceId: 'LOAD-19',
    targetId: 'SUB-08',
    capacityMW: 500,
    reactance: 0.037,
    lengthKm: 37,
    state: 'normal',
  },
  // LOAD-20 (San Marcos) → LOAD-16 (Kyle)
  {
    id: 'LINE-80',
    sourceId: 'LOAD-20',
    targetId: 'LOAD-16',
    capacityMW: 650,
    reactance: 0.025,
    lengthKm: 25,
    state: 'normal',
  },
  // LOAD-21 (Buda) → LOAD-16 (Kyle)
  {
    id: 'LINE-81',
    sourceId: 'LOAD-21',
    targetId: 'LOAD-16',
    capacityMW: 600,
    reactance: 0.008,
    lengthKm: 8,
    state: 'normal',
  },
  // LOAD-21 (Buda) → STOR-06 (South Austin Battery)
  {
    id: 'LINE-82',
    sourceId: 'LOAD-21',
    targetId: 'STOR-06',
    capacityMW: 450,
    reactance: 0.012,
    lengthKm: 12,
    state: 'normal',
  },
  // STOR-06 (South Austin Battery) → LOAD-13 (Downtown Austin)
  {
    id: 'LINE-83',
    sourceId: 'STOR-06',
    targetId: 'LOAD-13',
    capacityMW: 400,
    reactance: 0.016,
    lengthKm: 16,
    state: 'normal',
  },

  // --- Greater Austin outer ring edges (LINE-84 to LINE-100) ---

  // LOAD-22 (Hutto) → SUB-07 (Pflugerville)
  {
    id: 'LINE-84',
    sourceId: 'LOAD-22',
    targetId: 'SUB-07',
    capacityMW: 550,
    reactance: 0.015,
    lengthKm: 15,
    state: 'normal',
  },
  // LOAD-22 (Hutto) → LOAD-23 (Taylor)
  {
    id: 'LINE-85',
    sourceId: 'LOAD-22',
    targetId: 'LOAD-23',
    capacityMW: 480,
    reactance: 0.013,
    lengthKm: 13,
    state: 'normal',
  },
  // LOAD-23 (Taylor) → GEN-12 (Manor Solar)
  {
    id: 'LINE-86',
    sourceId: 'LOAD-23',
    targetId: 'GEN-12',
    capacityMW: 560,
    reactance: 0.026,
    lengthKm: 26,
    state: 'normal',
  },
  // STOR-07 (Hutto Battery) → LOAD-22 (Hutto)
  {
    id: 'LINE-87',
    sourceId: 'STOR-07',
    targetId: 'LOAD-22',
    capacityMW: 380,
    reactance: 0.003,
    lengthKm: 3,
    state: 'normal',
  },
  // GEN-13 (Bertram Wind) → LOAD-17 (Georgetown)
  {
    id: 'LINE-88',
    sourceId: 'GEN-13',
    targetId: 'LOAD-17',
    capacityMW: 800,
    reactance: 0.012,
    lengthKm: 12,
    state: 'normal',
  },
  // GEN-13 (Bertram Wind) → SUB-10 (Burnet)
  {
    id: 'LINE-89',
    sourceId: 'GEN-13',
    targetId: 'SUB-10',
    capacityMW: 700,
    reactance: 0.026,
    lengthKm: 26,
    state: 'normal',
  },
  // SUB-10 (Burnet) → GEN-10 (Spicewood)
  {
    id: 'LINE-90',
    sourceId: 'SUB-10',
    targetId: 'GEN-10',
    capacityMW: 650,
    reactance: 0.040,
    lengthKm: 40,
    state: 'normal',
  },
  // SUB-10 (Burnet) → LOAD-26 (Liberty Hill)
  {
    id: 'LINE-91',
    sourceId: 'SUB-10',
    targetId: 'LOAD-26',
    capacityMW: 560,
    reactance: 0.025,
    lengthKm: 25,
    state: 'normal',
  },
  // LOAD-26 (Liberty Hill) → LOAD-18 (Leander)
  {
    id: 'LINE-92',
    sourceId: 'LOAD-26',
    targetId: 'LOAD-18',
    capacityMW: 520,
    reactance: 0.022,
    lengthKm: 22,
    state: 'normal',
  },
  // SUB-11 (Lago Vista) → GEN-10 (Spicewood)
  {
    id: 'LINE-93',
    sourceId: 'SUB-11',
    targetId: 'GEN-10',
    capacityMW: 580,
    reactance: 0.022,
    lengthKm: 22,
    state: 'normal',
  },
  // SUB-11 (Lago Vista) → LOAD-18 (Leander)
  {
    id: 'LINE-94',
    sourceId: 'SUB-11',
    targetId: 'LOAD-18',
    capacityMW: 540,
    reactance: 0.018,
    lengthKm: 18,
    state: 'normal',
  },
  // GEN-14 (Johnson City Solar) → LOAD-25 (Wimberley)
  {
    id: 'LINE-95',
    sourceId: 'GEN-14',
    targetId: 'LOAD-25',
    capacityMW: 700,
    reactance: 0.043,
    lengthKm: 43,
    state: 'normal',
  },
  // LOAD-25 (Wimberley) → LOAD-27 (Dripping Springs)
  {
    id: 'LINE-96',
    sourceId: 'LOAD-25',
    targetId: 'LOAD-27',
    capacityMW: 480,
    reactance: 0.012,
    lengthKm: 12,
    state: 'normal',
  },
  // LOAD-27 (Dripping Springs) → GEN-10 (Spicewood)
  {
    id: 'LINE-97',
    sourceId: 'LOAD-27',
    targetId: 'GEN-10',
    capacityMW: 520,
    reactance: 0.027,
    lengthKm: 27,
    state: 'normal',
  },
  // LOAD-24 (Lockhart) → LOAD-20 (San Marcos)
  {
    id: 'LINE-98',
    sourceId: 'LOAD-24',
    targetId: 'LOAD-20',
    capacityMW: 540,
    reactance: 0.028,
    lengthKm: 28,
    state: 'normal',
  },
  // LOAD-24 (Lockhart) → LOAD-28 (Lockhart South)
  {
    id: 'LINE-99',
    sourceId: 'LOAD-24',
    targetId: 'LOAD-28',
    capacityMW: 460,
    reactance: 0.013,
    lengthKm: 13,
    state: 'normal',
  },
  // LOAD-28 (Lockhart South) → STOR-06 (South Austin Battery)
  {
    id: 'LINE-100',
    sourceId: 'LOAD-28',
    targetId: 'STOR-06',
    capacityMW: 420,
    reactance: 0.039,
    lengthKm: 39,
    state: 'normal',
  },

  // ---------------------------------------------------------------------------
  // STATEWIDE EXPANSION EDGES (LINE-101 to LINE-120)
  // ---------------------------------------------------------------------------

  // --- East Texas corridor ---
  // GEN-15 (Henderson Wind) → LOAD-29 (Tyler)
  {
    id: 'LINE-101',
    sourceId: 'GEN-15',
    targetId: 'LOAD-29',
    capacityMW: 700,
    reactance: 0.025,
    lengthKm: 25,
    state: 'normal',
  },
  // LOAD-29 (Tyler) → SUB-12 (Tyler Substation)
  {
    id: 'LINE-102',
    sourceId: 'LOAD-29',
    targetId: 'SUB-12',
    capacityMW: 600,
    reactance: 0.007,
    lengthKm: 7,
    state: 'normal',
  },
  // SUB-12 (Tyler Sub) → LOAD-30 (Longview)
  {
    id: 'LINE-103',
    sourceId: 'SUB-12',
    targetId: 'LOAD-30',
    capacityMW: 560,
    reactance: 0.045,
    lengthKm: 45,
    state: 'normal',
  },
  // LOAD-30 (Longview) → LOAD-35 (Texarkana)
  {
    id: 'LINE-104',
    sourceId: 'LOAD-30',
    targetId: 'LOAD-35',
    capacityMW: 490,
    reactance: 0.082,
    lengthKm: 82,
    state: 'normal',
  },
  // LOAD-35 (Texarkana) → SUB-05 (Nacogdoches)
  {
    id: 'LINE-105',
    sourceId: 'LOAD-35',
    targetId: 'SUB-05',
    capacityMW: 450,
    reactance: 0.095,
    lengthKm: 95,
    state: 'normal',
  },
  // GEN-15 (Henderson Wind) → SUB-05 (Nacogdoches)
  {
    id: 'LINE-106',
    sourceId: 'GEN-15',
    targetId: 'SUB-05',
    capacityMW: 520,
    reactance: 0.088,
    lengthKm: 88,
    state: 'normal',
  },
  // STOR-08 (Lufkin Battery) → LOAD-10 (Beaumont)
  {
    id: 'LINE-107',
    sourceId: 'STOR-08',
    targetId: 'LOAD-10',
    capacityMW: 400,
    reactance: 0.037,
    lengthKm: 37,
    state: 'normal',
  },

  // --- North Texas (DFW suburbs) ---
  // LOAD-33 (Denton) → LOAD-01 (Dallas)
  {
    id: 'LINE-108',
    sourceId: 'LOAD-33',
    targetId: 'LOAD-01',
    capacityMW: 750,
    reactance: 0.037,
    lengthKm: 37,
    state: 'normal',
  },
  // LOAD-33 (Denton) → LOAD-05 (Fort Worth)
  {
    id: 'LINE-109',
    sourceId: 'LOAD-33',
    targetId: 'LOAD-05',
    capacityMW: 700,
    reactance: 0.025,
    lengthKm: 25,
    state: 'normal',
  },
  // LOAD-34 (Sherman) → LOAD-33 (Denton)
  {
    id: 'LINE-110',
    sourceId: 'LOAD-34',
    targetId: 'LOAD-33',
    capacityMW: 600,
    reactance: 0.048,
    lengthKm: 48,
    state: 'normal',
  },
  // LOAD-34 (Sherman) → SUB-03 (Wichita Falls - nearest statewide sub N)
  {
    id: 'LINE-111',
    sourceId: 'LOAD-34',
    targetId: 'SUB-03',
    capacityMW: 540,
    reactance: 0.080,
    lengthKm: 80,
    state: 'normal',
  },

  // --- South Texas coast ---
  // GEN-16 (S TX Nuclear) → LOAD-02 (Houston)
  {
    id: 'LINE-112',
    sourceId: 'GEN-16',
    targetId: 'LOAD-02',
    capacityMW: 2000,
    reactance: 0.026,
    lengthKm: 160,
    state: 'normal',
  },
  // GEN-16 (S TX Nuclear) → STOR-09 (Gulf Coast Battery)
  {
    id: 'LINE-113',
    sourceId: 'GEN-16',
    targetId: 'STOR-09',
    capacityMW: 800,
    reactance: 0.022,
    lengthKm: 22,
    state: 'normal',
  },
  // STOR-09 (Gulf Coast Battery) → LOAD-02 (Houston)
  {
    id: 'LINE-114',
    sourceId: 'STOR-09',
    targetId: 'LOAD-02',
    capacityMW: 600,
    reactance: 0.065,
    lengthKm: 65,
    state: 'normal',
  },
  // GEN-16 (S TX Nuclear) → SUB-13 (Corpus Christi Sub)
  {
    id: 'LINE-115',
    sourceId: 'GEN-16',
    targetId: 'SUB-13',
    capacityMW: 900,
    reactance: 0.135,
    lengthKm: 135,
    state: 'normal',
  },
  // SUB-13 (Corpus Sub) → LOAD-31 (Corpus Christi)
  {
    id: 'LINE-116',
    sourceId: 'SUB-13',
    targetId: 'LOAD-31',
    capacityMW: 800,
    reactance: 0.007,
    lengthKm: 7,
    state: 'normal',
  },
  // LOAD-31 (Corpus Christi) → LOAD-11 (McAllen)
  {
    id: 'LINE-117',
    sourceId: 'LOAD-31',
    targetId: 'LOAD-11',
    capacityMW: 600,
    reactance: 0.175,
    lengthKm: 175,
    state: 'normal',
  },
  // LOAD-32 (Laredo) → LOAD-11 (McAllen)
  {
    id: 'LINE-118',
    sourceId: 'LOAD-32',
    targetId: 'LOAD-11',
    capacityMW: 500,
    reactance: 0.195,
    lengthKm: 195,
    state: 'normal',
  },

  // --- West Texas / Permian Basin ---
  // GEN-17 (Midland Gas) → SUB-14 (Midland-Odessa Sub)
  {
    id: 'LINE-119',
    sourceId: 'GEN-17',
    targetId: 'SUB-14',
    capacityMW: 950,
    reactance: 0.007,
    lengthKm: 7,
    state: 'normal',
  },
  // SUB-14 (Midland-Odessa Sub) → LOAD-12 (Odessa)
  {
    id: 'LINE-120',
    sourceId: 'SUB-14',
    targetId: 'LOAD-12',
    capacityMW: 850,
    reactance: 0.003,
    lengthKm: 3,
    state: 'normal',
  },

  // ---------------------------------------------------------------------------
  // EXPANSION ROUND 3 EDGES (LINE-121 to LINE-154)
  // ---------------------------------------------------------------------------

  // --- West Texas / Big Spring corridor ---
  // GEN-18 (Big Spring Wind) → SUB-18 (Sweetwater Sub)
  {
    id: 'LINE-121',
    sourceId: 'GEN-18',
    targetId: 'SUB-18',
    capacityMW: 900,
    reactance: 0.095,
    lengthKm: 95,
    state: 'normal',
  },
  // SUB-18 (Sweetwater) → LOAD-37 (Abilene)
  {
    id: 'LINE-122',
    sourceId: 'SUB-18',
    targetId: 'LOAD-37',
    capacityMW: 800,
    reactance: 0.078,
    lengthKm: 78,
    state: 'normal',
  },
  // GEN-18 (Big Spring Wind) → LOAD-12 (Odessa)
  {
    id: 'LINE-123',
    sourceId: 'GEN-18',
    targetId: 'LOAD-12',
    capacityMW: 750,
    reactance: 0.107,
    lengthKm: 107,
    state: 'normal',
  },
  // STOR-12 (Sweetwater Battery) → SUB-18 (Sweetwater Sub)
  {
    id: 'LINE-124',
    sourceId: 'STOR-12',
    targetId: 'SUB-18',
    capacityMW: 450,
    reactance: 0.003,
    lengthKm: 3,
    state: 'normal',
  },
  // GEN-21 (Concho Valley Gas) → LOAD-37 (Abilene)
  {
    id: 'LINE-125',
    sourceId: 'GEN-21',
    targetId: 'LOAD-37',
    capacityMW: 850,
    reactance: 0.088,
    lengthKm: 88,
    state: 'normal',
  },
  // LOAD-36 (Midland) → SUB-14 (Midland-Odessa Sub)
  {
    id: 'LINE-126',
    sourceId: 'LOAD-36',
    targetId: 'SUB-14',
    capacityMW: 700,
    reactance: 0.010,
    lengthKm: 10,
    state: 'normal',
  },

  // --- N Central Texas corridor ---
  // LOAD-37 (Abilene) → LOAD-45 (Stephenville)
  {
    id: 'LINE-127',
    sourceId: 'LOAD-37',
    targetId: 'LOAD-45',
    capacityMW: 620,
    reactance: 0.100,
    lengthKm: 100,
    state: 'normal',
  },
  // GEN-22 (Comanche Peak Nuclear) → LOAD-45 (Stephenville)
  {
    id: 'LINE-128',
    sourceId: 'GEN-22',
    targetId: 'LOAD-45',
    capacityMW: 1800,
    reactance: 0.015,
    lengthKm: 15,
    state: 'normal',
  },
  // GEN-22 (Comanche Peak) → LOAD-05 (Fort Worth)
  {
    id: 'LINE-129',
    sourceId: 'GEN-22',
    targetId: 'LOAD-05',
    capacityMW: 2000,
    reactance: 0.085,
    lengthKm: 85,
    state: 'normal',
  },
  // LOAD-45 (Stephenville) → LOAD-05 (Fort Worth)
  {
    id: 'LINE-130',
    sourceId: 'LOAD-45',
    targetId: 'LOAD-05',
    capacityMW: 600,
    reactance: 0.130,
    lengthKm: 130,
    state: 'normal',
  },

  // --- DFW outer suburbs ---
  // LOAD-47 (Gainesville) → LOAD-34 (Sherman)
  {
    id: 'LINE-131',
    sourceId: 'LOAD-47',
    targetId: 'LOAD-34',
    capacityMW: 570,
    reactance: 0.050,
    lengthKm: 50,
    state: 'normal',
  },
  // LOAD-47 (Gainesville) → LOAD-33 (Denton)
  {
    id: 'LINE-132',
    sourceId: 'LOAD-47',
    targetId: 'LOAD-33',
    capacityMW: 560,
    reactance: 0.055,
    lengthKm: 55,
    state: 'normal',
  },
  // LOAD-48 (Midlothian) → LOAD-01 (Dallas)
  {
    id: 'LINE-133',
    sourceId: 'LOAD-48',
    targetId: 'LOAD-01',
    capacityMW: 700,
    reactance: 0.045,
    lengthKm: 45,
    state: 'normal',
  },
  // LOAD-48 (Midlothian) → LOAD-05 (Fort Worth)
  {
    id: 'LINE-134',
    sourceId: 'LOAD-48',
    targetId: 'LOAD-05',
    capacityMW: 660,
    reactance: 0.055,
    lengthKm: 55,
    state: 'normal',
  },

  // --- Killeen – College Station corridor ---
  // LOAD-38 (Killeen-Temple) → LOAD-09 (Waco)
  {
    id: 'LINE-135',
    sourceId: 'LOAD-38',
    targetId: 'LOAD-09',
    capacityMW: 650,
    reactance: 0.060,
    lengthKm: 60,
    state: 'normal',
  },
  // LOAD-38 (Killeen-Temple) → LOAD-04 (Austin)
  {
    id: 'LINE-136',
    sourceId: 'LOAD-38',
    targetId: 'LOAD-04',
    capacityMW: 720,
    reactance: 0.115,
    lengthKm: 115,
    state: 'normal',
  },
  // STOR-11 (Killeen Battery) → LOAD-38 (Killeen)
  {
    id: 'LINE-137',
    sourceId: 'STOR-11',
    targetId: 'LOAD-38',
    capacityMW: 420,
    reactance: 0.005,
    lengthKm: 5,
    state: 'normal',
  },
  // SUB-15 (Bryan-CS Sub) → LOAD-39 (College Station)
  {
    id: 'LINE-138',
    sourceId: 'SUB-15',
    targetId: 'LOAD-39',
    capacityMW: 700,
    reactance: 0.008,
    lengthKm: 8,
    state: 'normal',
  },
  // LOAD-39 (College Station) → LOAD-09 (Waco)
  {
    id: 'LINE-139',
    sourceId: 'LOAD-39',
    targetId: 'LOAD-09',
    capacityMW: 580,
    reactance: 0.145,
    lengthKm: 145,
    state: 'normal',
  },
  // LOAD-39 (College Station) → LOAD-10 (Beaumont)
  {
    id: 'LINE-140',
    sourceId: 'LOAD-39',
    targetId: 'LOAD-10',
    capacityMW: 550,
    reactance: 0.185,
    lengthKm: 185,
    state: 'normal',
  },

  // --- East Texas fill-in ---
  // LOAD-42 (Jacksonville) → LOAD-29 (Tyler)
  {
    id: 'LINE-141',
    sourceId: 'LOAD-42',
    targetId: 'LOAD-29',
    capacityMW: 540,
    reactance: 0.065,
    lengthKm: 65,
    state: 'normal',
  },
  // LOAD-42 (Jacksonville) → LOAD-46 (Palestine)
  {
    id: 'LINE-142',
    sourceId: 'LOAD-42',
    targetId: 'LOAD-46',
    capacityMW: 510,
    reactance: 0.058,
    lengthKm: 58,
    state: 'normal',
  },
  // LOAD-46 (Palestine) → SUB-15 (Bryan-CS Sub)
  {
    id: 'LINE-143',
    sourceId: 'LOAD-46',
    targetId: 'SUB-15',
    capacityMW: 490,
    reactance: 0.095,
    lengthKm: 95,
    state: 'normal',
  },

  // --- Gulf Coast / Galveston ---
  // LOAD-41 (Galveston) → LOAD-02 (Houston)
  {
    id: 'LINE-144',
    sourceId: 'LOAD-41',
    targetId: 'LOAD-02',
    capacityMW: 750,
    reactance: 0.065,
    lengthKm: 65,
    state: 'normal',
  },
  // STOR-10 (Galveston Battery) → LOAD-41 (Galveston)
  {
    id: 'LINE-145',
    sourceId: 'STOR-10',
    targetId: 'LOAD-41',
    capacityMW: 380,
    reactance: 0.003,
    lengthKm: 3,
    state: 'normal',
  },

  // --- South Texas / Victoria / Offshore ---
  // LOAD-40 (Victoria) → SUB-04 (South TX Sub)
  {
    id: 'LINE-146',
    sourceId: 'LOAD-40',
    targetId: 'SUB-04',
    capacityMW: 620,
    reactance: 0.003,
    lengthKm: 3,
    state: 'normal',
  },
  // GEN-19 (Offshore Wind) → LOAD-31 (Corpus Christi)
  {
    id: 'LINE-147',
    sourceId: 'GEN-19',
    targetId: 'LOAD-31',
    capacityMW: 680,
    reactance: 0.040,
    lengthKm: 40,
    state: 'normal',
  },
  // GEN-19 (Offshore Wind) → LOAD-40 (Victoria)
  {
    id: 'LINE-148',
    sourceId: 'GEN-19',
    targetId: 'LOAD-40',
    capacityMW: 600,
    reactance: 0.090,
    lengthKm: 90,
    state: 'normal',
  },

  // --- Deep South Texas ---
  // LOAD-43 (Brownsville) → SUB-16 (Brownsville Sub)
  {
    id: 'LINE-149',
    sourceId: 'LOAD-43',
    targetId: 'SUB-16',
    capacityMW: 660,
    reactance: 0.007,
    lengthKm: 7,
    state: 'normal',
  },
  // SUB-16 (Brownsville Sub) → LOAD-11 (McAllen)
  {
    id: 'LINE-150',
    sourceId: 'SUB-16',
    targetId: 'LOAD-11',
    capacityMW: 600,
    reactance: 0.092,
    lengthKm: 92,
    state: 'normal',
  },

  // --- Del Rio / SW Texas ---
  // LOAD-44 (Del Rio) → SUB-17 (Del Rio Sub)
  {
    id: 'LINE-151',
    sourceId: 'LOAD-44',
    targetId: 'SUB-17',
    capacityMW: 560,
    reactance: 0.005,
    lengthKm: 5,
    state: 'normal',
  },
  // SUB-17 (Del Rio Sub) → LOAD-03 (San Antonio)
  {
    id: 'LINE-152',
    sourceId: 'SUB-17',
    targetId: 'LOAD-03',
    capacityMW: 700,
    reactance: 0.200,
    lengthKm: 200,
    state: 'normal',
  },

  // --- Big Bend / Far West Texas ---
  // GEN-20 (Big Bend Solar) → LOAD-44 (Del Rio)
  {
    id: 'LINE-153',
    sourceId: 'GEN-20',
    targetId: 'LOAD-44',
    capacityMW: 750,
    reactance: 0.155,
    lengthKm: 155,
    state: 'normal',
  },
  // GEN-20 (Big Bend Solar) → LOAD-06 (El Paso)
  {
    id: 'LINE-154',
    sourceId: 'GEN-20',
    targetId: 'LOAD-06',
    capacityMW: 700,
    reactance: 0.225,
    lengthKm: 225,
    state: 'normal',
  },
];

// ---------------------------------------------------------------------------
// Inline sanity assertions (throw at module load if violated)
// ---------------------------------------------------------------------------
if (TEXAS_NODES.length !== 100)
  throw new Error(`Expected 100 nodes, got ${TEXAS_NODES.length}`);
if (TEXAS_EDGES.length !== 154)
  throw new Error(`Expected 154 edges, got ${TEXAS_EDGES.length}`);

// ---------------------------------------------------------------------------
// Austin metro node IDs — used for random event simulation
// ---------------------------------------------------------------------------
export const AUSTIN_NODE_IDS: string[] = [
  'LOAD-13', 'LOAD-14', 'LOAD-15', 'LOAD-16',
  'LOAD-17', 'LOAD-18', 'LOAD-19', 'LOAD-20', 'LOAD-21',
  'LOAD-22', 'LOAD-23', 'LOAD-24', 'LOAD-25', 'LOAD-26', 'LOAD-27', 'LOAD-28',
  'GEN-09',  'GEN-10',  'GEN-11',  'GEN-12',  'GEN-13',  'GEN-14',
  'SUB-07',  'SUB-08',  'SUB-09',  'SUB-10',  'SUB-11',
  'STOR-05', 'STOR-06', 'STOR-07',
];

// ---------------------------------------------------------------------------
// Build canonical graph
// ---------------------------------------------------------------------------
export const TEXAS_GRID = createGraph(TEXAS_NODES, TEXAS_EDGES);
