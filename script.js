/* ============================================================
   HANGAR HUSTLE: A&P Shop Simulator
   script.js — vanilla JS, no external dependencies
   ============================================================ */
'use strict';

// ============================================================
// SECTION 1: CONFIGURATION
// ============================================================
const CFG = {
  TILE:          32,          // pixels per tile
  MAP_W:         25,          // tiles wide
  MAP_H:         15,          // tiles tall
  PLAYER_SPEED:  140,         // px / second
  INTERACT_DIST: 64,          // px — how close to trigger interact prompt
  SAVE_KEY:      'hangar_hustle_save',
  DAY_DURATION:  480,         // seconds for Rush mode (8 min = simulated work day)
  BASE_MONEY:    500,
  MAX_MISTAKES:  5,           // mistakes before reputation penalty
};

// Tile type constants
const T = { FLOOR:0, WALL:1, BAY:2, BENCH:3, SHELF:4, DESK:5, DOOR:6, LOCKED_BAY:7 };

// Directions
const DIR = { UP:'up', DOWN:'down', LEFT:'left', RIGHT:'right' };

// Colors — pixel-art palette
const CLR = {
  floor_a:   '#8B6F47', floor_b:   '#7A6040',
  wall:      '#2E2B4A', wall_top:  '#3D3960', wall_front:'#252240',
  bay:       '#6A8FA8', bay_line:  '#FFD700',
  bench:     '#6B4820', bench_top: '#8B5E2A',
  shelf:     '#5A3D1E', shelf_top: '#7A5530',
  desk:      '#1A3A5C', desk_top:  '#244870',
  door:      '#2A1810', door_trim: '#8B5A2A',
  locked:    '#333355',
  sky:       '#1a1a2e',
  grass:     '#1a3a1a',
};

// ============================================================
// SECTION 2: GAME DATA
// ============================================================

/** 20+ repair jobs across all aircraft tiers */
const JOBS = [
  // ── Single-engine piston ──────────────────────────────────
  {
    id:'oil_service',        name:'Oil Service',
    desc:'Drain and replace engine oil, inspect filter, check for metal contamination.',
    aircraft:0, pay:180, difficulty:1, minigame:'timing',
    educational:true, decisionId:'dc_logbook',
    tools:['basic_toolbox'],
  },
  {
    id:'annual_inspection',  name:'Annual Inspection',
    desc:'Comprehensive airworthiness inspection per 14 CFR Part 91.',
    aircraft:0, pay:480, difficulty:3, minigame:'checklist',
    educational:true, decisionId:'dc_annual',
    tools:['basic_toolbox'],
  },
  {
    id:'100hr_inspection',   name:'100-Hour Inspection',
    desc:'Required inspection for aircraft operated for hire. Similar scope to annual.',
    aircraft:0, pay:420, difficulty:3, minigame:'checklist',
    educational:true, decisionId:'dc_100hr',
    tools:['basic_toolbox'],
  },
  {
    id:'tire_main',          name:'Main Gear Tire Change',
    desc:'Remove and replace main gear tire and tube. Check wheel assembly.',
    aircraft:0, pay:220, difficulty:1, minigame:'bolt',
    tools:['basic_toolbox', 'air_compressor'],
  },
  {
    id:'tire_nose',          name:'Nose Gear Tire Change',
    desc:'Remove and replace nose gear tire. Inspect shimmy dampener.',
    aircraft:0, pay:200, difficulty:1, minigame:'bolt',
    tools:['basic_toolbox', 'air_compressor'],
  },
  {
    id:'landing_light',      name:'Landing Light Replacement',
    desc:'Replace burnt-out landing light. Check circuit and wiring.',
    aircraft:0, pay:150, difficulty:1, minigame:'timing',
    educational:false, decisionId:null,
    tools:['basic_toolbox'],
  },
  {
    id:'spark_plugs',        name:'Spark Plug Service',
    desc:'Remove, clean, inspect and gap all spark plugs. Check leads.',
    aircraft:0, pay:310, difficulty:2, minigame:'bolt',
    tools:['basic_toolbox'],
  },
  {
    id:'elt_battery',        name:'ELT Battery Replacement',
    desc:'Replace ELT battery pack and update logbook with new expiry date.',
    aircraft:0, pay:180, difficulty:1, minigame:'checklist',
    educational:true, decisionId:'dc_elt',
    tools:['basic_toolbox'],
  },
  {
    id:'pitot_check',        name:'Pitot-Static System Check',
    desc:'Inspect pitot tube and static ports. Leak check per IFR requirements.',
    aircraft:0, pay:280, difficulty:2, minigame:'match',
    educational:true, decisionId:'dc_ifr',
    tools:['basic_toolbox', 'diagnostic_bench'],
  },
  {
    id:'air_filter',         name:'Air Filter Replacement',
    desc:'Remove, inspect, and replace induction air filter element.',
    aircraft:0, pay:140, difficulty:1, minigame:'timing',
    tools:['basic_toolbox'],
  },
  // ── Twin-engine piston ────────────────────────────────────
  {
    id:'twin_oil_service',   name:'Twin Engine Oil Service',
    desc:'Oil service on both engines. Differential pressure checks.',
    aircraft:1, pay:380, difficulty:2, minigame:'timing',
    educational:true, decisionId:'dc_logbook',
    tools:['basic_toolbox', 'socket_set'],
  },
  {
    id:'brake_service',      name:'Brake Pad Replacement',
    desc:'Inspect and replace brake pads on all four wheels. Bleed system.',
    aircraft:1, pay:450, difficulty:2, minigame:'bolt',
    tools:['basic_toolbox', 'socket_set', 'air_compressor'],
  },
  {
    id:'gear_rigging',       name:'Landing Gear Rigging Check',
    desc:'Inspect and adjust retractable gear rigging, microswitch adjustment.',
    aircraft:1, pay:620, difficulty:3, minigame:'checklist',
    educational:true, decisionId:'dc_major_repair',
    tools:['basic_toolbox', 'socket_set'],
  },
  {
    id:'fuel_inspect',       name:'Fuel System Inspection',
    desc:'Inspect fuel tanks, selectors, gascolator, and interconnect system.',
    aircraft:1, pay:380, difficulty:2, minigame:'match',
    educational:true, decisionId:'dc_fuel',
    tools:['basic_toolbox'],
  },
  {
    id:'magneto_timing',     name:'Magneto Timing Service',
    desc:'Check and adjust ignition timing on both magnetos to spec.',
    aircraft:1, pay:420, difficulty:2, minigame:'timing',
    tools:['basic_toolbox', 'socket_set'],
  },
  // ── Turboprop ─────────────────────────────────────────────
  {
    id:'prop_governor',      name:'Prop Governor Service',
    desc:'Remove, inspect, and reinstall propeller governor. Set RPM limits.',
    aircraft:2, pay:900, difficulty:3, minigame:'bolt',
    educational:true, decisionId:'dc_major_repair',
    tools:['basic_toolbox', 'socket_set', 'advanced_tools'],
  },
  {
    id:'hot_section',        name:'Hot Section Inspection',
    desc:'Borescope turbine section. Inspect blades for cracks, erosion, FOD.',
    aircraft:2, pay:1400, difficulty:3, minigame:'match',
    educational:true, decisionId:'dc_logbook',
    tools:['diagnostic_bench', 'advanced_tools'],
  },
  {
    id:'fuel_control',       name:'Fuel Controller Check',
    desc:'Inspect fuel control unit, check metering valve, verify flow limits.',
    aircraft:2, pay:1100, difficulty:3, minigame:'checklist',
    educational:true, decisionId:'dc_major_repair',
    tools:['diagnostic_bench', 'advanced_tools'],
  },
  // ── Light jets ────────────────────────────────────────────
  {
    id:'transponder_check',  name:'Transponder IFR Test',
    desc:'Perform required 24-month transponder test per 14 CFR 91.411.',
    aircraft:3, pay:800, difficulty:2, minigame:'checklist',
    educational:true, decisionId:'dc_ifr',
    tools:['diagnostic_bench'],
  },
  {
    id:'vor_check',          name:'VOR Receiver Accuracy Check',
    desc:'Verify VOR accuracy within regulatory limits. Log results.',
    aircraft:3, pay:600, difficulty:2, minigame:'match',
    educational:true, decisionId:'dc_ifr',
    tools:['diagnostic_bench'],
  },
  {
    id:'avionics_trouble',   name:'Avionics Troubleshooting',
    desc:'Diagnose and isolate intermittent avionics fault. Document findings.',
    aircraft:3, pay:1800, difficulty:3, minigame:'match',
    educational:true, decisionId:'dc_major_repair',
    tools:['diagnostic_bench', 'advanced_tools'],
  },
  {
    id:'hydraulic_service',  name:'Hydraulic System Service',
    desc:'Inspect hydraulic reservoir, lines, actuators. Bleed system.',
    aircraft:3, pay:1500, difficulty:3, minigame:'bolt',
    tools:['socket_set', 'advanced_tools'],
  },
  // ── Midsize jets ──────────────────────────────────────────
  {
    id:'thrust_reverser',    name:'Thrust Reverser Check',
    desc:'Functional test of thrust reverser system. Check rigging and locks.',
    aircraft:4, pay:3200, difficulty:3, minigame:'checklist',
    educational:true, decisionId:'dc_major_repair',
    tools:['advanced_tools', 'diagnostic_bench'],
  },
  {
    id:'landing_gear_oh',    name:'Landing Gear Overhaul',
    desc:'Overhaul main and nose gear assemblies per maintenance manual limits.',
    aircraft:4, pay:5500, difficulty:3, minigame:'bolt',
    educational:true, decisionId:'dc_major_repair',
    tools:['advanced_tools', 'socket_set'],
  },
  {
    id:'engine_borescope',   name:'Engine Borescope Inspection',
    desc:'Complete borescope of all engine stages per MEL/AMM procedures.',
    aircraft:4, pay:4200, difficulty:3, minigame:'match',
    educational:true, decisionId:'dc_logbook',
    tools:['diagnostic_bench', 'advanced_tools'],
  },
];

/** 5 aircraft tiers with increasing size/pay */
const AIRCRAFT_TYPES = [
  {
    id:0, name:'Cessna 172',       label:'C172',
    desc:'Single-engine piston, 4-seat trainer',
    jobTier:0, color:'#E8E8E8', accentColor:'#CC2222',
    width:44, height:72, payMult:1.0,
    unlockCost:0, unlockUpgrade:null,
  },
  {
    id:1, name:'Piper Seneca',     label:'PA-34',
    desc:'Twin-engine piston, 6-seat complex aircraft',
    jobTier:1, color:'#D8E8F0', accentColor:'#1144CC',
    width:56, height:80, payMult:1.8,
    unlockCost:0, unlockUpgrade:'socket_set',
  },
  {
    id:2, name:'King Air 90',      label:'BE-90',
    desc:'Twin turboprop, pressurized cabin',
    jobTier:2, color:'#F0F0E8', accentColor:'#CC7700',
    width:64, height:96, payMult:3.5,
    unlockCost:0, unlockUpgrade:'advanced_tools',
  },
  {
    id:3, name:'Citation Mustang', label:'C510',
    desc:'Very light jet, entry-level business aviation',
    jobTier:3, color:'#E8F0F8', accentColor:'#004488',
    width:60, height:88, payMult:6.0,
    unlockCost:0, unlockUpgrade:'diagnostic_bench',
  },
  {
    id:4, name:'Citation XLS',     label:'C560',
    desc:'Midsize business jet, trans-continental range',
    jobTier:4, color:'#FFFFFF', accentColor:'#002266',
    width:72, height:108, payMult:10.0,
    unlockCost:0, unlockUpgrade:'large_hangar',
  },
];

/** 10+ upgrades for the shop */
const UPGRADES = [
  {
    id:'basic_toolbox',    name:'Basic Toolbox',     icon:'🔧',
    desc:'Standard hand tools. Required for all jobs.',
    cost:0, owned:true, requires:[],
    effect:'Starts owned. Unlocks all basic jobs.',
  },
  {
    id:'socket_set',       name:'Socket Set',         icon:'🔩',
    desc:'Full socket set for complex fasteners. Required for brake and gear work.',
    cost:800, owned:false, requires:[],
    effect:'Unlocks twin-piston aircraft. Required for brake/gear jobs.',
  },
  {
    id:'air_compressor',   name:'Air Compressor',     icon:'💨',
    desc:'Shop air compressor and regulator. Needed for tire service.',
    cost:1200, owned:false, requires:['basic_toolbox'],
    effect:'Required for all tire change jobs.',
  },
  {
    id:'parts_shelf_sm',   name:'Small Parts Shelf',  icon:'📦',
    desc:'Organized parts storage. Reduce parts delay events.',
    cost:1500, owned:false, requires:[],
    effect:'-30% chance of parts delay random event.',
  },
  {
    id:'diagnostic_bench', name:'Diagnostic Bench',   icon:'📡',
    desc:'Avionics test bench. Unlocks avionics and IFR equipment checks.',
    cost:2500, owned:false, requires:['socket_set'],
    effect:'Unlocks light jet aircraft. Required for avionics jobs.',
  },
  {
    id:'extra_bay_3',      name:'Extra Repair Bay #3', icon:'🏗️',
    desc:'Third repair bay. Work on 3 aircraft simultaneously.',
    cost:3000, owned:false, requires:['socket_set'],
    effect:'Unlocks Bay 3 on the shop floor.',
  },
  {
    id:'extra_bay_4',      name:'Extra Repair Bay #4', icon:'🏗️',
    desc:'Fourth repair bay. Maximum shop capacity.',
    cost:5000, owned:false, requires:['extra_bay_3'],
    effect:'Unlocks Bay 4 on the shop floor.',
  },
  {
    id:'inspection_desk',  name:'Inspection Desk',    icon:'🖊️',
    desc:'Dedicated paperwork and logbook station. Speeds up sign-off.',
    cost:3500, owned:false, requires:['basic_toolbox'],
    effect:'-20% payout reduction from paperwork errors.',
  },
  {
    id:'parts_shelf_lg',   name:'Large Parts Shelf',  icon:'🏪',
    desc:'Full parts inventory system. Greatly reduce supply delays.',
    cost:4500, owned:false, requires:['parts_shelf_sm'],
    effect:'-60% chance of parts delay events.',
  },
  {
    id:'advanced_tools',   name:'Advanced Tool Set',  icon:'⚙️',
    desc:'Precision instruments, torque wrenches, specialty tools.',
    cost:7500, owned:false, requires:['socket_set', 'diagnostic_bench'],
    effect:'Unlocks turboprop aircraft. Required for turbine work.',
  },
  {
    id:'paint_bay',        name:'Paint & Clean Bay',  icon:'🎨',
    desc:'Dedicated cleaning and detailing area. Quality bonus on all jobs.',
    cost:6000, owned:false, requires:['extra_bay_3'],
    effect:'+10% quality bonus on all job payouts.',
  },
  {
    id:'large_hangar',     name:'Large Hangar Expansion', icon:'🏢',
    desc:'Expand hangar footprint. Required for midsize jets.',
    cost:10000, owned:false, requires:['advanced_tools', 'extra_bay_4'],
    effect:'Unlocks midsize jet aircraft.',
  },
  {
    id:'hire_assistant',   name:'Hire Assistant Mechanic', icon:'👷',
    desc:'Part-time helper mechanic. Auto-completes Tier 1 simple jobs.',
    cost:4000, owned:false, requires:['extra_bay_3'],
    effect:'Auto-handles difficulty-1 jobs (basic piston work). Earns 60% of normal pay.',
  },
];

/** 10 achievements */
const ACHIEVEMENTS = [
  { id:'first_job',       name:'First Wrench Turn',     icon:'🔧', desc:'Complete your first repair job.',            goal:1,  stat:'jobs_done',     unlocked:false },
  { id:'ten_jobs',        name:'Getting Into It',        icon:'✈', desc:'Complete 10 repair jobs.',                  goal:10, stat:'jobs_done',     unlocked:false },
  { id:'fifty_jobs',      name:'Shop Veteran',           icon:'🏆', desc:'Complete 50 repair jobs.',                  goal:50, stat:'jobs_done',     unlocked:false },
  { id:'quick_hands',     name:'Quick Hands',            icon:'⚡', desc:'Get a perfect score on 5 mini-games.',      goal:5,  stat:'perfect_games', unlocked:false },
  { id:'money_maker',     name:'Money Maker',            icon:'💰', desc:'Earn $10,000 total.',                       goal:10000, stat:'total_earned', unlocked:false },
  { id:'big_spender',     name:'Big Spender',            icon:'💳', desc:'Spend $5,000 on upgrades.',                 goal:5000, stat:'total_spent',  unlocked:false },
  { id:'no_mistakes',     name:'Precision Mechanic',     icon:'🎯', desc:'Complete 10 jobs in a row with no mistakes.',goal:10, stat:'streak_clean',  unlocked:false },
  { id:'jet_setter',      name:'Jet Setter',             icon:'🛩', desc:'Complete your first jet aircraft job.',      goal:1,  stat:'jet_jobs',      unlocked:false },
  { id:'all_bays',        name:'Full Shop',              icon:'🏗️', desc:'Unlock all 4 repair bays.',                 goal:4,  stat:'bays_owned',    unlocked:false },
  { id:'rush_master',     name:'Rush Hour Hero',         icon:'⏱', desc:'Complete 10 jobs in a single Rush Mode day.',goal:10, stat:'rush_jobs_day', unlocked:false },
];

/** Decision cards (educational) */
const DECISION_CARDS = {
  dc_logbook: {
    title: 'Logbook Entry Required?',
    scenario: 'You\'ve completed the repair. Before returning the aircraft to service, do you need to make an entry in the aircraft maintenance records (logbook)?',
    options: [
      { text:'✔ Yes — all maintenance must be recorded with date, description, aircraft total time, and A&P certificate number.', correct:true },
      { text:'✘ No — only major repairs require documentation.', correct:false },
    ],
    explanation:'Per 14 CFR 43.9, any maintenance performed must be recorded. The entry includes the date, description of work, and the certificated person\'s signature and certificate number.',
  },
  dc_annual: {
    title: 'Annual Inspection Authority',
    scenario: 'Who is authorized to return an aircraft to service after an Annual Inspection?',
    options: [
      { text:'✔ Only an Airframe & Powerplant (A&P) mechanic with Inspection Authorization (IA).', correct:true },
      { text:'✘ Any A&P mechanic.', correct:false },
      { text:'✘ The aircraft owner if they performed the work.', correct:false },
    ],
    explanation:'An Annual Inspection can only be approved for return to service (RTS) by an A&P mechanic who holds an Inspection Authorization (IA) per 14 CFR 65.91.',
  },
  dc_100hr: {
    title: '100-Hour vs Annual',
    scenario: 'What is the key difference between a 100-Hour Inspection and an Annual Inspection?',
    options: [
      { text:'✔ A 100-hour is required for aircraft operated for hire; an Annual can be signed off by an A&P with IA.', correct:true },
      { text:'✘ They are identical — any A&P can sign either one.', correct:false },
    ],
    explanation:'14 CFR 91.409: aircraft used for hire or flight instruction must have 100-hour inspections. The Annual requires IA authorization; a 100-hour does not, but the scope of inspection is similar.',
  },
  dc_elt: {
    title: 'ELT Currency',
    scenario: 'After replacing the ELT battery, what must be updated in the maintenance records?',
    options: [
      { text:'✔ The new battery install date and next replacement date per the battery manufacturer\'s spec.', correct:true },
      { text:'✘ Nothing — battery changes are not required to be logged.', correct:false },
    ],
    explanation:'Per 14 CFR 91.207, ELT batteries must be replaced when 50% of the useful life is used or after the cumulative use limit. The replacement date must be recorded in the maintenance records.',
  },
  dc_ifr: {
    title: 'IFR Equipment Check',
    scenario: 'The aircraft needs to fly IFR. Which equipment checks are required within the past 24 calendar months?',
    options: [
      { text:'✔ Altimeter/pitot-static system (91.411) and transponder (91.413).', correct:true },
      { text:'✘ Only the transponder — altimeter is self-certified by the pilot.', correct:false },
    ],
    explanation:'For IFR flight, both the pitot-static/altimeter system (14 CFR 91.411) and the transponder (14 CFR 91.413) must have been tested within the preceding 24 calendar months.',
  },
  dc_major_repair: {
    title: 'Major Repair Documentation',
    scenario: 'You\'ve completed a major repair (as defined in 14 CFR Part 43, Appendix A). What additional form may be required?',
    options: [
      { text:'✔ FAA Form 337 (Major Repair and Alteration) — filed with the FAA within 48 hours.', correct:true },
      { text:'✘ A work order is sufficient for all repairs.', correct:false },
    ],
    explanation:'Major repairs and alterations must be documented on FAA Form 337 per 14 CFR 43.9. A copy must be given to the aircraft owner and a copy filed with the FAA.',
  },
  dc_fuel: {
    title: 'Fuel Contamination Find',
    scenario: 'During the fuel system inspection, you find water in the gascolator sump. What is the correct action?',
    options: [
      { text:'✔ Drain until all water is removed, inspect tanks, recheck, document findings in records.', correct:true },
      { text:'✘ A small amount of water is normal — reassemble and return to service.', correct:false },
    ],
    explanation:'Water in aviation fuel is a serious hazard. Any water must be completely drained. Inspect for source of contamination, ensure all sumps are clear, and document all findings in maintenance records.',
  },
};

/** Random events that can affect jobs */
const RANDOM_EVENTS = [
  {
    id:'parts_delay',     weight:20,
    title:'⚠️ Parts Delayed',
    desc:'Your parts order is delayed. Job will take longer.',
    effect(job) { job.bonusMultiplier = (job.bonusMultiplier||1) * 0.9; },
    message:'Parts are on backorder — shipping 2 days late.',
  },
  {
    id:'repeat_customer', weight:15,
    title:'😊 Repeat Customer',
    desc:'They\'re back! Loyalty bonus on this job.',
    effect(job) { job.bonusMultiplier = (job.bonusMultiplier||1) * 1.15; },
    message:'This customer has been here 3 times! +15% loyalty bonus.',
  },
  {
    id:'hidden_squawk',   weight:12,
    title:'🔍 Hidden Squawk Found!',
    desc:'You found an additional issue! Bonus pay for catching it.',
    effect(job) { job.bonusMultiplier = (job.bonusMultiplier||1) * 1.2; job.bonusPay = 200; },
    message:'Found a hidden issue during inspection! Extra $200 bonus pay.',
  },
  {
    id:'rush_job',        weight:10,
    title:'🚨 Rush Job!',
    desc:'Aircraft is AOG. 2x pay but must accept immediately.',
    effect(job) { job.bonusMultiplier = (job.bonusMultiplier||1) * 2.0; job.isRush = true; },
    message:'Aircraft grounded — owner needs it ASAP! Double pay!',
  },
  {
    id:'premium_client',  weight:8,
    title:'💎 Premium Client',
    desc:'VIP client: 3x pay, but no mistakes allowed.',
    effect(job) { job.bonusMultiplier = (job.bonusMultiplier||1) * 3.0; job.isPremium = true; },
    message:'Premium client — flawless work expected. 3x pay!',
  },
  {
    id:'tool_issue',      weight:10,
    title:'🔧 Tool Malfunction',
    desc:'A tool is acting up. Mini-game is slightly harder.',
    effect(job) { job.miniGameHarder = true; },
    message:'One of your tools is acting up — mini-game will be tougher.',
  },
];

// ============================================================
// SECTION 3: MAP DEFINITION
// ============================================================

/** Build the base tile map array [y][x] */
function buildMap() {
  const w = CFG.MAP_W, h = CFG.MAP_H;
  const m = [];
  for (let y = 0; y < h; y++) {
    m[y] = [];
    for (let x = 0; x < w; x++) {
      // Outer walls
      if (x === 0 || x === w-1 || y === 0) {
        m[y][x] = T.WALL;
      } else if (y === h-1) {
        // Bottom wall with door gap cols 11-13
        m[y][x] = (x >= 11 && x <= 13) ? T.DOOR : T.WALL;
      } else {
        m[y][x] = T.FLOOR;
      }
    }
  }
  // Bay 1: cols 2-4, rows 1-3 (always unlocked)
  setTiles(m, 2, 4, 1, 3, T.BAY);
  // Bay 2: cols 7-9, rows 1-3 (always unlocked)
  setTiles(m, 7, 9, 1, 3, T.BAY);
  // Bay 3: cols 14-16, rows 1-3 (locked, upgrade: extra_bay_3)
  setTiles(m, 14, 16, 1, 3, T.LOCKED_BAY);
  // Bay 4: cols 19-21, rows 1-3 (locked, upgrade: extra_bay_4)
  setTiles(m, 19, 21, 1, 3, T.LOCKED_BAY);
  // Workbench: cols 5-6, rows 7-8
  setTiles(m, 5, 6, 7, 8, T.BENCH);
  // Parts shelf: cols 21-23, rows 5-7
  setTiles(m, 21, 23, 5, 7, T.SHELF);
  // Inspection desk: cols 2-3, rows 10-11
  setTiles(m, 2, 3, 10, 11, T.DESK);
  return m;
}

function setTiles(map, x1, x2, y1, y2, type) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++)
      map[y][x] = type;
}

const BASE_MAP = buildMap();

/** Bay definitions — world pixel positions (center of bay) */
const BAYS = [
  { id:0, tx:2, ty:1, tw:3, th:3, interactY: 4, label:'Bay 1', upgradeId:null },
  { id:1, tx:7, ty:1, tw:3, th:3, interactY: 4, label:'Bay 2', upgradeId:null },
  { id:2, tx:14, ty:1, tw:3, th:3, interactY: 4, label:'Bay 3', upgradeId:'extra_bay_3' },
  { id:3, tx:19, ty:1, tw:3, th:3, interactY: 4, label:'Bay 4', upgradeId:'extra_bay_4' },
];

// Helper: tile world coords
function tileToWorld(tx, ty) {
  return { x: tx * CFG.TILE + CFG.TILE/2, y: ty * CFG.TILE + CFG.TILE/2 };
}

// ============================================================
// SECTION 4: AUDIO (Web Audio API, procedural sounds)
// ============================================================
const Audio = {
  ctx: null,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { /* no audio */ }
  },

  _beep(freq, dur, type='square', vol=0.08) {
    if (!this.ctx) return;
    try {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + dur + 0.05);
    } catch(e) {}
  },

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },

  success() {
    this._beep(523, 0.08);
    setTimeout(()=>this._beep(659, 0.08), 90);
    setTimeout(()=>this._beep(784, 0.18), 180);
  },
  fail()    { this._beep(180, 0.35, 'sawtooth', 0.06); },
  click()   { this._beep(900, 0.04, 'sine', 0.05); },
  money()   {
    this._beep(440, 0.05, 'sine');
    setTimeout(()=>this._beep(554, 0.05, 'sine'), 55);
    setTimeout(()=>this._beep(660, 0.12, 'sine'), 110);
  },
  achieve() {
    [523, 659, 784, 1047].forEach((f,i) => setTimeout(()=>this._beep(f, 0.12,'triangle',0.07), i*80));
  },
  interact(){ this._beep(660, 0.06, 'sine', 0.04); },
};

// ============================================================
// SECTION 5: SAVE SYSTEM
// ============================================================
const Save = {
  save(state) {
    try {
      const data = {
        money:          state.money,
        reputation:     state.reputation,
        day:            state.day,
        jobsDone:       state.stats.jobs_done,
        totalEarned:    state.stats.total_earned,
        totalSpent:     state.stats.total_spent,
        perfectGames:   state.stats.perfect_games,
        jetJobs:        state.stats.jet_jobs,
        ownedUpgrades:  UPGRADES.filter(u=>u.owned).map(u=>u.id),
        achievements:   ACHIEVEMENTS.filter(a=>a.unlocked).map(a=>a.id),
        savedAt:        Date.now(),
      };
      localStorage.setItem(CFG.SAVE_KEY, JSON.stringify(data));
      return true;
    } catch(e) { return false; }
  },

  load() {
    try {
      const raw = localStorage.getItem(CFG.SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch(e) { return null; }
  },

  clear() { localStorage.removeItem(CFG.SAVE_KEY); },

  applyToState(data, state) {
    if (!data) return;
    state.money      = data.money      || CFG.BASE_MONEY;
    state.reputation = data.reputation || 0;
    state.day        = data.day        || 1;
    state.stats.jobs_done      = data.jobsDone    || 0;
    state.stats.total_earned   = data.totalEarned || 0;
    state.stats.total_spent    = data.totalSpent  || 0;
    state.stats.perfect_games  = data.perfectGames|| 0;
    state.stats.jet_jobs       = data.jetJobs     || 0;
    // Restore upgrades
    UPGRADES.forEach(u => {
      u.owned = u.id === 'basic_toolbox' || (data.ownedUpgrades||[]).includes(u.id);
    });
    // Restore achievements
    ACHIEVEMENTS.forEach(a => {
      a.unlocked = (data.achievements||[]).includes(a.id);
    });
  },
};

// ============================================================
// SECTION 6: GAME STATE
// ============================================================
const GS = {
  // Current game mode: 'career' | 'rush' | 'freeplay'
  mode: 'career',

  // Running state
  running:    false,
  paused:     false,

  // Economy
  money:      CFG.BASE_MONEY,
  reputation: 0,
  day:        1,

  // Daily tracking
  dayEarned:  0,
  dayJobs:    0,
  dayMistakes:0,

  // Aircraft on the floor — array of active aircraft entities
  aircraft:   [],

  // Currently active job (the one player accepted)
  activeJob:  null,

  // Rush mode timer
  rushTime:   CFG.DAY_DURATION,
  rushRunning:false,

  // Statistics (for achievements)
  stats: {
    jobs_done:      0,
    total_earned:   0,
    total_spent:    0,
    perfect_games:  0,
    jet_jobs:       0,
    streak_clean:   0,
    rush_jobs_day:  0,
    bays_owned:     2,
  },

  // Counters for UI
  mistakes:   0,

  // Work order counter
  woCounter:  1,

  // Newly unlocked achievements this session (for day summary)
  newAchievements: [],

  reset(mode) {
    this.mode       = mode;
    this.running    = true;
    this.paused     = false;
    this.dayEarned  = 0;
    this.dayJobs    = 0;
    this.dayMistakes= 0;
    this.mistakes   = 0;
    this.aircraft   = [];
    this.activeJob  = null;
    this.rushTime   = CFG.DAY_DURATION;
    this.rushRunning= (mode === 'rush');
    this.newAchievements = [];
  },
};

// ============================================================
// SECTION 7: INPUT HANDLING
// ============================================================
const Input = {
  keys: {},
  dpad: { up:false, down:false, left:false, right:false },
  interactPressed: false,

  init() {
    document.addEventListener('keydown', e => {
      this.keys[e.key] = true;
      // Prevent default for game keys
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
        e.preventDefault();
      }
      // E or Space = interact
      if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
        this.interactPressed = true;
        Audio.resume();
      }
    });
    document.addEventListener('keyup', e => {
      this.keys[e.key] = false;
    });

    // Touch D-pad
    const dirs = ['up','down','left','right'];
    dirs.forEach(dir => {
      const btn = document.getElementById('dpad-' + dir);
      if (!btn) return;
      btn.addEventListener('touchstart', e => { e.preventDefault(); this.dpad[dir] = true; Audio.resume(); }, {passive:false});
      btn.addEventListener('touchend',   e => { e.preventDefault(); this.dpad[dir] = false; }, {passive:false});
      btn.addEventListener('mousedown',  e => { this.dpad[dir] = true; });
      btn.addEventListener('mouseup',    e => { this.dpad[dir] = false; });
    });

    // Interact button
    const ib = document.getElementById('btn-interact-touch');
    if (ib) {
      ib.addEventListener('touchstart', e => { e.preventDefault(); this.interactPressed = true; Audio.resume(); }, {passive:false});
      ib.addEventListener('mousedown',  ()=> { this.interactPressed = true; });
    }
  },

  consumeInteract() {
    const v = this.interactPressed;
    this.interactPressed = false;
    return v;
  },

  getMoveDir() {
    const dx = ((this.keys['ArrowRight']||this.keys['d']||this.keys['D']||this.dpad.right) ? 1 : 0)
             - ((this.keys['ArrowLeft'] ||this.keys['a']||this.keys['A']||this.dpad.left)  ? 1 : 0);
    const dy = ((this.keys['ArrowDown'] ||this.keys['s']||this.keys['S']||this.dpad.down)  ? 1 : 0)
             - ((this.keys['ArrowUp']   ||this.keys['w']||this.keys['W']||this.dpad.up)    ? 1 : 0);
    return { dx, dy };
  },
};

// ============================================================
// SECTION 8: PLAYER
// ============================================================
const Player = {
  x: 12 * CFG.TILE + 16,  // world pixel x (center)
  y:  9 * CFG.TILE + 16,  // world pixel y (center)
  vx: 0, vy: 0,
  dir: DIR.DOWN,
  frameTimer: 0,
  frame: 0,
  moving: false,
  isWorking: false,

  reset() {
    this.x = 12 * CFG.TILE + 16;
    this.y =  9 * CFG.TILE + 16;
    this.dir = DIR.DOWN;
    this.frame = 0;
    this.frameTimer = 0;
    this.moving = false;
  },

  update(dt, map) {
    const { dx, dy } = Input.getMoveDir();
    const spd = CFG.PLAYER_SPEED;

    this.moving = (dx !== 0 || dy !== 0);

    // Update direction
    if      (dy < 0) this.dir = DIR.UP;
    else if (dy > 0) this.dir = DIR.DOWN;
    else if (dx < 0) this.dir = DIR.LEFT;
    else if (dx > 0) this.dir = DIR.RIGHT;

    // Normalize diagonal
    let vx = dx * spd, vy = dy * spd;
    if (dx !== 0 && dy !== 0) { vx *= 0.707; vy *= 0.707; }

    // Move with collision
    const px = 8; // player half-width
    const py = 12;// player half-height

    // Horizontal
    const newX = this.x + vx * dt;
    if (!this._collidesAt(newX, this.y, px, py, map)) this.x = newX;

    // Vertical
    const newY = this.y + vy * dt;
    if (!this._collidesAt(this.x, newY, px, py, map)) this.y = newY;

    // Clamp to world
    this.x = Math.max(px, Math.min(CFG.MAP_W * CFG.TILE - px, this.x));
    this.y = Math.max(py, Math.min(CFG.MAP_H * CFG.TILE - py, this.y));

    // Animate walk cycle
    if (this.moving) {
      this.frameTimer += dt;
      if (this.frameTimer > 0.15) {
        this.frameTimer = 0;
        this.frame = (this.frame + 1) % 4;
      }
    } else {
      this.frame = 0;
    }
  },

  _collidesAt(wx, wy, hw, hh, map) {
    // Check four corners
    const corners = [
      { x: wx - hw + 2, y: wy - hh + 2 },
      { x: wx + hw - 2, y: wy - hh + 2 },
      { x: wx - hw + 2, y: wy + hh - 2 },
      { x: wx + hw - 2, y: wy + hh - 2 },
    ];
    const impassable = new Set([T.WALL, T.BENCH, T.SHELF, T.DESK]);
    for (const c of corners) {
      const tx = Math.floor(c.x / CFG.TILE);
      const ty = Math.floor(c.y / CFG.TILE);
      if (ty < 0 || ty >= CFG.MAP_H || tx < 0 || tx >= CFG.MAP_W) return true;
      if (impassable.has(map[ty][tx])) return true;
    }
    return false;
  },

  draw(ctx, camX, camY) {
    const sx = Math.floor(this.x - camX);
    const sy = Math.floor(this.y - camY);

    // Walk animation offsets
    const legOff = this.moving ? Math.sin(this.frame * Math.PI / 2) * 3 : 0;
    const armOff = this.moving ? Math.cos(this.frame * Math.PI / 2) * 2 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 12, 7, 3, 0, 0, Math.PI*2);
    ctx.fill();

    // Shoes
    ctx.fillStyle = '#1A1020';
    ctx.fillRect(sx-7, sy+8 + (this.moving ? legOff : 0), 6, 4);
    ctx.fillRect(sx+1, sy+8 - (this.moving ? legOff : 0), 6, 4);

    // Pants (dark navy)
    ctx.fillStyle = '#1A2A5C';
    ctx.fillRect(sx-6, sy + (this.moving ? legOff : 0), 5, 10);
    ctx.fillRect(sx+1, sy - (this.moving ? legOff : 0), 5, 10);

    // Shirt (blue mechanic)
    ctx.fillStyle = '#1A6FCC';
    ctx.fillRect(sx-6, sy-10, 12, 11);

    // Arms
    ctx.fillStyle = '#1A6FCC';
    ctx.fillRect(sx-9, sy-10 + (this.moving ? armOff : 0), 4, 8);
    ctx.fillRect(sx+5, sy-10 - (this.moving ? armOff : 0), 4, 8);

    // Hands (skin)
    ctx.fillStyle = '#FFCC88';
    ctx.fillRect(sx-9, sy-2 + (this.moving ? armOff : 0), 4, 3);
    ctx.fillRect(sx+5, sy-2 - (this.moving ? armOff : 0), 4, 3);

    // Head (skin)
    ctx.fillStyle = '#FFCC88';
    ctx.fillRect(sx-5, sy-22, 10, 11);

    // Hair
    ctx.fillStyle = '#2A1800';
    ctx.fillRect(sx-5, sy-22, 10, 4);
    ctx.fillRect(sx-5, sy-22, 2, 7);

    // Eyes (face direction)
    ctx.fillStyle = '#000000';
    if (this.dir !== DIR.UP) {
      ctx.fillRect(sx-3, sy-16, 2, 2);
      ctx.fillRect(sx+1, sy-16, 2, 2);
    }

    // Hard hat / cap
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(sx-6, sy-24, 12, 3);
    ctx.fillRect(sx-5, sy-25, 10, 2);

    // Wrench while working
    if (this.isWorking) {
      ctx.fillStyle = '#999';
      ctx.fillRect(sx+6, sy-18, 3, 14);
      ctx.fillStyle = '#777';
      ctx.fillRect(sx+4, sy-20, 7, 3);
    }
  },
};

// ============================================================
// SECTION 9: AIRCRAFT SYSTEM
// ============================================================

/** Single aircraft entity on the game floor */
class AircraftEntity {
  constructor(bayId, typeId, jobDef) {
    const bay   = BAYS[bayId];
    const type  = AIRCRAFT_TYPES[typeId];
    const center = tileToWorld(bay.tx + Math.floor(bay.tw/2), bay.ty + Math.floor(bay.th/2));

    this.bayId    = bayId;
    this.typeId   = typeId;
    this.type     = type;
    this.job      = { ...jobDef }; // copy so we can add event data

    // World position
    this.wx = center.x;
    this.wy = center.y;

    // Interact point (stand here to inspect aircraft)
    const ipt = tileToWorld(bay.tx + Math.floor(bay.tw/2), bay.interactY);
    this.interactX = ipt.x;
    this.interactY = ipt.y;

    // Animation / state
    this.alpha    = 0;      // fade in
    this.status   = 'waiting'; // 'waiting' | 'in_progress' | 'done' | 'leaving'
    this.bobTimer = Math.random() * Math.PI * 2;

    // Apply random event
    this._applyRandomEvent();

    // Work order number
    this.woNum = GS.woCounter++;
  }

  _applyRandomEvent() {
    this.job.bonusMultiplier = 1.0;
    this.job.bonusPay = 0;
    this.job.isRush = false;
    this.job.isPremium = false;
    this.job.miniGameHarder = false;
    this.job.activeEvent = null;

    // Roll for an event
    const total = RANDOM_EVENTS.reduce((s,e)=>s+e.weight, 0);
    let roll = Math.random() * total;
    for (const ev of RANDOM_EVENTS) {
      roll -= ev.weight;
      if (roll <= 0) {
        // 30% chance any event fires
        if (Math.random() < 0.30) {
          ev.effect(this.job);
          this.job.activeEvent = ev;
        }
        break;
      }
    }
  }

  computePay() {
    const basePay   = Math.round(this.job.pay * this.type.payMult);
    const total     = Math.round(basePay * this.job.bonusMultiplier + (this.job.bonusPay||0));
    return Math.max(50, total);
  }

  update(dt) {
    // Fade in
    if (this.alpha < 1) this.alpha = Math.min(1, this.alpha + dt * 2);
    // Bob
    this.bobTimer += dt * 0.8;
  }

  draw(ctx, camX, camY) {
    const sx = Math.floor(this.wx - camX);
    const sy = Math.floor(this.wy - camY) + Math.sin(this.bobTimer) * 2;
    const t  = this.type;

    ctx.save();
    ctx.globalAlpha = this.alpha;

    // Draw top-down aircraft based on tier
    if (t.id <= 1) this._drawPiston(ctx, sx, sy);
    else if (t.id === 2) this._drawTurboprop(ctx, sx, sy);
    else this._drawJet(ctx, sx, sy);

    // Status marker
    if (this.status === 'waiting') {
      // Exclamation mark bubble
      const bx = sx, by = sy - t.height/2 - 18;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(bx, by, 10, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', bx, by);
    } else if (this.status === 'in_progress') {
      // Wrench icon
      const bx = sx, by = sy - t.height/2 - 18;
      ctx.fillStyle = '#2980b9';
      ctx.beginPath();
      ctx.arc(bx, by, 10, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔧', bx, by);
    }

    ctx.restore();
  }

  _drawPiston(ctx, sx, sy) {
    const t = this.type;
    const hh = t.height/2, hw = t.width/2;
    const col  = t.color;
    const acc  = t.accentColor;

    // Wings
    ctx.fillStyle = col;
    ctx.fillRect(sx - hw*1.3, sy - 4, hw*2.6, 8);

    // Fuselage
    ctx.fillStyle = col;
    ctx.fillRect(sx - 7, sy - hh, 14, t.height);

    // Nose cone
    ctx.fillStyle = '#AAAAAA';
    ctx.beginPath();
    ctx.moveTo(sx, sy - hh - 8);
    ctx.lineTo(sx - 5, sy - hh);
    ctx.lineTo(sx + 5, sy - hh);
    ctx.closePath();
    ctx.fill();

    // Horizontal stab
    ctx.fillStyle = col;
    ctx.fillRect(sx - 12, sy + hh - 10, 24, 5);

    // Vertical fin
    ctx.fillStyle = acc;
    ctx.fillRect(sx - 3, sy + hh - 18, 6, 14);

    // Windows
    ctx.fillStyle = '#88CCEE';
    ctx.fillRect(sx - 4, sy - 8, 8, 5);

    // Accent stripe
    ctx.fillStyle = acc;
    ctx.fillRect(sx - 7, sy - 3, 14, 3);

    // Prop
    ctx.fillStyle = '#444';
    ctx.fillRect(sx - 12, sy - hh - 10, 24, 3);
    ctx.fillStyle = '#888';
    ctx.fillRect(sx - 2, sy - hh - 14, 4, 8);

    // Wheels (small dots)
    ctx.fillStyle = '#222';
    ctx.fillRect(sx - hw*1.2 - 2, sy + 2, 5, 3);
    ctx.fillRect(sx + hw*1.2 - 3, sy + 2, 5, 3);

    // If twin: add second engine
    if (this.type.id === 1) {
      ctx.fillStyle = '#AAAAAA';
      ctx.fillRect(sx - hw*0.9 - 5, sy - 15, 10, 20);
      ctx.fillRect(sx + hw*0.9 - 5, sy - 15, 10, 20);
      ctx.fillStyle = '#555';
      ctx.fillRect(sx - hw*0.9 - 3, sy - 18, 6, 4);
      ctx.fillRect(sx + hw*0.9 - 3, sy - 18, 6, 4);
    }
  }

  _drawTurboprop(ctx, sx, sy) {
    const t = this.type;
    const hh = t.height/2, hw = t.width/2;

    // T-tail
    ctx.fillStyle = t.color;
    ctx.fillRect(sx - 18, sy + hh - 10, 36, 5);
    ctx.fillRect(sx - 4, sy + hh - 22, 8, 18);

    // Wings
    ctx.fillStyle = t.color;
    ctx.fillRect(sx - hw*1.4, sy - 6, hw*2.8, 9);

    // Fuselage
    ctx.fillStyle = t.color;
    ctx.fillRect(sx - 9, sy - hh, 18, t.height);

    // Engines on wings (turboprops)
    [- hw*0.75, hw*0.75 - 12].forEach(ex => {
      ctx.fillStyle = '#888';
      ctx.fillRect(sx + ex, sy - 18, 12, 28);
      ctx.fillStyle = '#444';
      ctx.fillRect(sx + ex + 2, sy - 22, 8, 6);
    });

    // Nose
    ctx.fillStyle = '#CCC';
    ctx.beginPath();
    ctx.moveTo(sx, sy - hh - 10);
    ctx.lineTo(sx - 7, sy - hh);
    ctx.lineTo(sx + 7, sy - hh);
    ctx.closePath();
    ctx.fill();

    // Windows row
    ctx.fillStyle = '#88CCEE';
    for (let i = -2; i <= 2; i++) {
      ctx.fillRect(sx + i*5 - 2, sy - 10, 4, 4);
    }

    // Accent
    ctx.fillStyle = t.accentColor;
    ctx.fillRect(sx - 9, sy - 5, 18, 4);
  }

  _drawJet(ctx, sx, sy) {
    const t = this.type;
    const hh = t.height/2, hw = t.width/2;

    // Engines (rear-mounted)
    ctx.fillStyle = '#888';
    ctx.fillRect(sx - 18, sy + hh - 25, 10, 20);
    ctx.fillRect(sx + 8, sy + hh - 25, 10, 20);
    ctx.fillStyle = '#555';
    ctx.fillRect(sx - 17, sy + hh - 5, 8, 4);
    ctx.fillRect(sx + 9, sy + hh - 5, 8, 4);

    // Swept wings
    ctx.fillStyle = t.color;
    // Wing (swept back shape)
    ctx.beginPath();
    ctx.moveTo(sx - 4, sy - 5);
    ctx.lineTo(sx - hw*1.4, sy + 10);
    ctx.lineTo(sx - hw*1.4, sy + 18);
    ctx.lineTo(sx - 4, sy + 5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sx + 4, sy - 5);
    ctx.lineTo(sx + hw*1.4, sy + 10);
    ctx.lineTo(sx + hw*1.4, sy + 18);
    ctx.lineTo(sx + 4, sy + 5);
    ctx.closePath();
    ctx.fill();

    // Fuselage
    ctx.fillStyle = t.color;
    ctx.fillRect(sx - 9, sy - hh, 18, t.height);

    // Nose
    ctx.fillStyle = '#DDD';
    ctx.beginPath();
    ctx.moveTo(sx, sy - hh - 12);
    ctx.lineTo(sx - 7, sy - hh);
    ctx.lineTo(sx + 7, sy - hh);
    ctx.closePath();
    ctx.fill();

    // T-tail
    ctx.fillStyle = t.color;
    ctx.fillRect(sx - 20, sy + hh - 10, 40, 6);
    ctx.fillRect(sx - 4, sy + hh - 24, 8, 20);

    // Windows
    ctx.fillStyle = '#88CCEE';
    for (let i = -3; i <= 3; i++) {
      ctx.fillRect(sx + i*5 - 2, sy - 10, 3, 4);
    }

    // Accent stripe
    ctx.fillStyle = t.accentColor;
    ctx.fillRect(sx - 9, sy - 6, 18, 4);

    // Winglets (if midsize)
    if (t.id === 4) {
      ctx.fillStyle = t.accentColor;
      ctx.fillRect(sx - hw*1.4, sy + 8, 4, 12);
      ctx.fillRect(sx + hw*1.4 - 4, sy + 8, 4, 12);
    }
  }
}

// ============================================================
// SECTION 10: JOB SYSTEM
// ============================================================
const JobSystem = {
  // Spawn aircraft jobs based on day / upgrades
  spawnJobs() {
    const activeBays = BAYS.filter(b => this._bayUnlocked(b.id));
    const freeSlots  = activeBays.filter(b => !GS.aircraft.find(a => a.bayId === b.id));

    if (freeSlots.length === 0) return;

    // Pick a free bay
    const bay = freeSlots[Math.floor(Math.random() * freeSlots.length)];

    // Determine max aircraft tier available
    const unlockedTiers = AIRCRAFT_TYPES
      .filter(t => !t.unlockUpgrade || this._upgradeOwned(t.unlockUpgrade))
      .map(t => t.id);
    const maxTier = unlockedTiers[unlockedTiers.length - 1] || 0;

    // Weight lower tiers more
    const tierWeights = [50, 30, 15, 8, 4];
    let tierPool = [];
    unlockedTiers.forEach(tid => {
      for (let i = 0; i < (tierWeights[tid]||1); i++) tierPool.push(tid);
    });
    const typeId = tierPool[Math.floor(Math.random() * tierPool.length)];

    // Pick a compatible job
    const compatJobs = JOBS.filter(j => {
      if (j.aircraft > typeId) return false;
      if (j.tools.some(t => !this._upgradeOwned(t))) return false;
      return true;
    });
    if (compatJobs.length === 0) return;
    const job = compatJobs[Math.floor(Math.random() * compatJobs.length)];

    const entity = new AircraftEntity(bay.id, typeId, job);
    GS.aircraft.push(entity);
    UI.toast(`✈ New aircraft arrived — ${entity.type.name} needs ${job.name}!`, 'info');
  },

  _bayUnlocked(bayId) {
    const bay = BAYS[bayId];
    if (!bay.upgradeId) return true;
    return this._upgradeOwned(bay.upgradeId);
  },

  _upgradeOwned(id) {
    return UPGRADES.find(u => u.id === id)?.owned ?? false;
  },

  /** Called when player presses E near an aircraft */
  openWorkOrder(aircraft) {
    if (GS.activeJob) return; // already working
    GS.aircraft.forEach(a => a === aircraft ? null : null); // focus

    const pay = aircraft.computePay();
    const type = aircraft.type;
    const job  = aircraft.job;

    // Fill work order panel
    document.getElementById('wo-aircraft-badge').textContent = type.label;
    document.getElementById('wo-number').textContent         = '#' + String(aircraft.woNum).padStart(3,'0');
    document.getElementById('wo-job-name').textContent       = job.name;
    document.getElementById('wo-description').textContent    = job.desc;
    document.getElementById('wo-pay').textContent            = '$' + pay;
    document.getElementById('wo-difficulty').textContent     = '★'.repeat(job.difficulty) + '☆'.repeat(3-job.difficulty);

    // Event banner
    const evBanner = document.getElementById('wo-event-banner');
    if (job.activeEvent) {
      evBanner.textContent = job.activeEvent.message;
      evBanner.classList.remove('hidden');
    } else {
      evBanner.classList.add('hidden');
    }

    // Button handlers
    document.getElementById('btn-accept-job').onclick = () => {
      Audio.click();
      UI.hideOverlay('overlay-workorder');
      this.startJob(aircraft);
    };
    document.getElementById('btn-decline-job').onclick = () => {
      Audio.click();
      UI.hideOverlay('overlay-workorder');
    };

    UI.showOverlay('overlay-workorder');
    Audio.interact();
  },

  startJob(aircraft) {
    GS.activeJob = aircraft;
    aircraft.status = 'in_progress';
    UI.setTask(`Working on ${aircraft.type.name}: ${aircraft.job.name}`);
    Player.isWorking = true;
    MiniGame.start(aircraft);
  },

  completeJob(aircraft, quality) {
    // quality: 0.0 - 1.0 (1.0 = perfect)
    const basePay   = aircraft.computePay();
    const qualPay   = Math.round(basePay * quality);

    // Deductions for mistakes
    const mistakePenalty = GS.mistakes > 0 ? Math.round(qualPay * 0.05 * GS.mistakes) : 0;
    const finalPay = Math.max(0, qualPay - mistakePenalty);

    // Inspection desk bonus
    if (this._upgradeOwned('inspection_desk') && quality > 0.8) {
      // Small paperwork speed bonus, already reflected in no extra deduction
    }

    // Paint bay quality bonus
    let paintBonus = 0;
    if (this._upgradeOwned('paint_bay')) {
      paintBonus = Math.round(finalPay * 0.10);
    }

    const totalPay = finalPay + paintBonus;

    // Award money
    GS.money     += totalPay;
    GS.dayEarned += totalPay;
    GS.dayJobs   ++;
    GS.stats.total_earned += totalPay;
    GS.stats.jobs_done ++;
    if (aircraft.typeId >= 3) GS.stats.jet_jobs++;
    if (quality === 1.0) {
      GS.stats.streak_clean++;
      GS.stats.perfect_games++;
    } else {
      GS.stats.streak_clean = 0;
    }
    if (GS.mode === 'rush') GS.stats.rush_jobs_day++;

    // Reputation (capped at 9999)
    const repGain = Math.round(10 * quality + aircraft.typeId * 5);
    GS.reputation = Math.min(9999, GS.reputation + repGain);

    // Update UI
    UI.updateHUD();
    UI.showMoneyPop(totalPay > 0 ? '+$' + totalPay : 'DECLINED', totalPay > 0 ? '#FFD700' : '#ff4444');
    Audio.money();

    // Toast
    let toastMsg = `✔ ${aircraft.job.name} done! +$${totalPay}`;
    if (paintBonus) toastMsg += ` (+$${paintBonus} quality bonus)`;
    UI.toast(toastMsg, 'money');

    // Signoff step / decision card
    if (aircraft.job.educational && aircraft.job.decisionId && Math.random() < 0.6) {
      setTimeout(() => {
        DecisionCards.show(aircraft.job.decisionId, () => {
          this._finishJob(aircraft);
        });
      }, 600);
    } else {
      this._finishJob(aircraft);
    }

    // Check achievements
    Achievements.check();
  },

  _finishJob(aircraft) {
    aircraft.status = 'leaving';
    GS.activeJob    = null;
    Player.isWorking = false;

    setTimeout(() => {
      GS.aircraft = GS.aircraft.filter(a => a !== aircraft);
      // Spawn new aircraft after short delay
      if (GS.mode !== 'rush' || GS.rushRunning) {
        setTimeout(() => this.spawnJobs(), 2000);
      }
    }, 1500);

    UI.setTask('Walk to an aircraft to begin');

    // Trigger day end on rush mode when all bays empty
    if (GS.mode === 'rush' && GS.aircraft.length === 0 && !GS.rushRunning) {
      setTimeout(() => GameModes.endDay(), 1000);
    }
  },
};

// ============================================================
// SECTION 11: MINI-GAME SYSTEM
// ============================================================
const MiniGame = {
  current: null,

  start(aircraft) {
    const job  = aircraft.job;
    const type = job.minigame;
    const hard = job.miniGameHarder || (job.difficulty === 3);

    this.current = { aircraft, type, hard };

    document.getElementById('mg-title').textContent        = this._getTitle(type);
    document.getElementById('mg-instructions').textContent = this._getInstructions(type);
    document.getElementById('mg-result').classList.add('hidden');

    const content = document.getElementById('mg-content');
    content.innerHTML = '';

    switch (type) {
      case 'timing':    this._buildTiming(content, hard);    break;
      case 'bolt':      this._buildBolt(content, hard);      break;
      case 'checklist': this._buildChecklist(content);       break;
      case 'match':     this._buildMatch(content, hard);     break;
      default:          this._buildTiming(content, hard);    break;
    }

    UI.showOverlay('overlay-minigame');
  },

  _getTitle(type) {
    return { timing:'Repair Timing', bolt:'Fastener Sequence', checklist:'Inspection Checklist', match:'Part Identification' }[type] || 'Mini-Game';
  },

  _getInstructions(type) {
    return {
      timing:    'Tap STOP when the bar is inside the green zone!',
      bolt:      'Tap the numbered bolts in order from 1 to last!',
      checklist: 'Check off each item in the correct sequence.',
      match:     'Match each part to its aircraft system by tapping pairs.',
    }[type] || '';
  },

  // ── Timing Bar ──────────────────────────────────────────────────
  _buildTiming(container, hard) {
    const wrap = document.createElement('div');
    wrap.className = 'timing-bar-wrap';

    // Green zone width/position
    const greenW  = hard ? 20 : 30;    // percent
    const greenPos = 20 + Math.random() * (60 - greenW); // 20-60% start

    wrap.innerHTML = `
      <div class="timing-bar-track" id="mg-track">
        <div class="timing-bar-green"
             id="mg-green"
             style="left:${greenPos}%;width:${greenW}%"></div>
        <div class="timing-bar-cursor" id="mg-cursor"></div>
      </div>
    `;

    const tapBtn = document.createElement('button');
    tapBtn.className = 'btn-pixel btn-blue timing-tap-btn';
    tapBtn.textContent = 'STOP!';

    container.appendChild(wrap);
    container.appendChild(tapBtn);

    // Animate cursor
    let pos = 0;         // 0-100 percent
    let dir = 1;
    const speed = hard ? 80 : 55; // percent per second
    let raf;
    let lastT = performance.now();
    let stopped = false;

    const cursor = wrap.querySelector('#mg-cursor');

    const animate = (now) => {
      if (stopped) return;
      const dt = (now - lastT) / 1000;
      lastT = now;
      pos += dir * speed * dt;
      if (pos >= 100) { pos = 100; dir = -1; }
      if (pos <= 0)   { pos = 0;   dir =  1; }
      cursor.style.left = pos + '%';
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    tapBtn.addEventListener('click', () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      Audio.click();

      const greenLeft  = greenPos;
      const greenRight = greenPos + greenW;
      let quality;

      if (pos >= greenLeft && pos <= greenRight) {
        // How centered in the green zone?
        const center = greenLeft + greenW/2;
        const dist   = Math.abs(pos - center) / (greenW/2);
        quality = dist < 0.3 ? 1.0 : (1.0 - dist * 0.4);
        cursor.style.background = '#27ae60';
        this._showResult(true, quality);
      } else {
        quality = 0.4;
        cursor.style.background = '#c0392b';
        this._showResult(false, quality);
      }
    });

    tapBtn.addEventListener('touchstart', e => { e.preventDefault(); tapBtn.click(); }, {passive:false});
  },

  // ── Bolt Sequence ───────────────────────────────────────────────
  _buildBolt(container, hard) {
    const count = hard ? 7 : 5;
    const correct = Array.from({length: count}, (_, i) => i + 1);
    // Shuffle display order
    const display = [...correct].sort(() => Math.random() - 0.5);

    const grid = document.createElement('div');
    grid.className = 'bolt-grid';

    let nextExpected = 1;
    let mistakes = 0;
    let completed = 0;

    const btns = {};
    display.forEach(num => {
      const btn = document.createElement('button');
      btn.className  = 'bolt-btn';
      btn.textContent = num;
      btn.dataset.num = num;
      grid.appendChild(btn);
      btns[num] = btn;

      btn.addEventListener('click', () => {
        Audio.click();
        if (parseInt(btn.dataset.num) === nextExpected) {
          btn.classList.add('done');
          btn.disabled = true;
          nextExpected++;
          completed++;
          if (completed === count) {
            const quality = Math.max(0.3, 1.0 - mistakes * 0.15);
            this._showResult(true, quality);
          }
        } else {
          mistakes++;
          btn.classList.add('error');
          setTimeout(() => btn.classList.remove('error'), 400);
          Audio.fail();
          if (mistakes >= 3) {
            this._showResult(false, 0.3);
          }
        }
      });
    });

    container.appendChild(grid);
  },

  // ── Checklist ───────────────────────────────────────────────────
  _buildChecklist(container) {
    const templates = [
      ['Inspect oil level', 'Check filter element', 'Verify drain plug', 'Torque to spec', 'Record in logbook'],
      ['Check brake fluid', 'Inspect pad thickness', 'Verify lines / fittings', 'Test pedal pressure', 'Log work performed'],
      ['Review approved data', 'Gather required tools', 'Perform inspection', 'Document findings', 'Return to service signoff'],
      ['Check fuel quantity', 'Inspect fuel cap seals', 'Sump water check', 'Verify no contamination', 'Replace fuel cap'],
    ];
    const items = templates[Math.floor(Math.random() * templates.length)];

    const wrap = document.createElement('div');
    wrap.className = 'checklist-items';

    let nextIdx = 0;
    let done = 0;
    let mistakes = 0;

    items.forEach((text, idx) => {
      const item = document.createElement('div');
      item.className = 'checklist-item';
      item.textContent = text;
      item.dataset.idx = idx;
      wrap.appendChild(item);

      item.addEventListener('click', () => {
        Audio.click();
        if (idx === nextIdx) {
          item.classList.add('checked');
          item.style.pointerEvents = 'none';
          nextIdx++;
          done++;
          if (done === items.length) {
            const quality = Math.max(0.4, 1.0 - mistakes * 0.12);
            this._showResult(true, quality);
          }
        } else {
          mistakes++;
          item.classList.add('wrong');
          setTimeout(() => item.classList.remove('wrong'), 400);
          Audio.fail();
          if (mistakes >= 4) this._showResult(false, 0.35);
        }
      });
    });

    container.appendChild(wrap);
  },

  // ── Part Match ──────────────────────────────────────────────────
  _buildMatch(container, hard) {
    const allPairs = [
      ['Brake pads',        'Landing Gear'],
      ['Oil filter',        'Engine Lubrication'],
      ['ELT',               'Safety / Emergency'],
      ['Magneto',           'Ignition System'],
      ['Pitot tube',        'Airspeed Indicator'],
      ['Transponder',       'ATC Communication'],
      ['VOR receiver',      'Navigation'],
      ['Propeller governor','Engine RPM Control'],
      ['Fuel gascolator',   'Fuel System'],
      ['Altimeter',         'Pitot-Static System'],
    ];
    const count = hard ? 5 : 4;
    const pairs = allPairs.sort(()=>Math.random()-0.5).slice(0, count);

    const matchWrap = document.createElement('div');
    matchWrap.className = 'match-container';
    const leftCol  = document.createElement('div');
    leftCol.className = 'match-col';
    const rightCol = document.createElement('div');
    rightCol.className = 'match-col';

    const lefts  = pairs.map(p=>p[0]).sort(()=>Math.random()-0.5);
    const rights = pairs.map(p=>p[1]).sort(()=>Math.random()-0.5);

    let selectedLeft = null;
    let matched = 0;
    let mistakes = 0;

    const pairMap = {};
    pairs.forEach(p => pairMap[p[0]] = p[1]);

    const leftBtns = {}, rightBtns = {};

    lefts.forEach(part => {
      const btn = document.createElement('div');
      btn.className = 'match-item';
      btn.textContent = part;
      btn.dataset.val = part;
      leftCol.appendChild(btn);
      leftBtns[part] = btn;
      btn.addEventListener('click', () => {
        if (btn.classList.contains('matched')) return;
        Object.values(leftBtns).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedLeft = part;
        Audio.click();
      });
    });

    rights.forEach(system => {
      const btn = document.createElement('div');
      btn.className = 'match-item';
      btn.textContent = system;
      btn.dataset.val = system;
      rightCol.appendChild(btn);
      rightBtns[system] = btn;
      btn.addEventListener('click', () => {
        if (!selectedLeft) return;
        if (btn.classList.contains('matched')) return;
        Audio.click();

        const correctRight = pairMap[selectedLeft];
        if (system === correctRight) {
          leftBtns[selectedLeft].classList.add('matched');
          leftBtns[selectedLeft].classList.remove('selected');
          btn.classList.add('matched');
          selectedLeft = null;
          matched++;
          if (matched === count) {
            const quality = Math.max(0.4, 1.0 - mistakes * 0.12);
            this._showResult(true, quality);
          }
        } else {
          mistakes++;
          btn.classList.add('wrong');
          setTimeout(() => btn.classList.remove('wrong'), 400);
          Audio.fail();
          if (mistakes >= count) this._showResult(false, 0.35);
        }
      });
    });

    matchWrap.appendChild(leftCol);
    matchWrap.appendChild(rightCol);
    container.appendChild(matchWrap);
  },

  // ── Result handling ─────────────────────────────────────────────
  _showResult(success, quality) {
    document.getElementById('mg-content').style.pointerEvents = 'none';

    const resultEl = document.getElementById('mg-result');
    const textEl   = document.getElementById('mg-result-text');

    resultEl.classList.remove('hidden');

    if (success) {
      const pct = Math.round(quality * 100);
      const emoji = quality >= 0.9 ? '🌟' : quality >= 0.7 ? '✅' : '👍';
      textEl.innerHTML = `<span style="color:#27ae60;font-size:1.4rem">${emoji} ${pct}% Quality!</span>`;
      Audio.success();
    } else {
      textEl.innerHTML = `<span style="color:#c0392b;font-size:1.1rem">❌ Needs Improvement<br><small>Job complete but quality reduced</small></span>`;
      Audio.fail();
      GS.mistakes++;
      GS.dayMistakes++;
      UI.updateHUD();
    }

    document.getElementById('btn-mg-continue').onclick = () => {
      UI.hideOverlay('overlay-minigame');
      JobSystem.completeJob(this.current.aircraft, quality);
      this.current = null;
    };
  },
};

// ============================================================
// SECTION 12: DECISION CARDS
// ============================================================
const DecisionCards = {
  show(cardId, onDone) {
    const card = DECISION_CARDS[cardId];
    if (!card) { onDone(); return; }

    document.getElementById('dc-title').textContent    = card.title;
    document.getElementById('dc-scenario').textContent = card.scenario;

    const optContainer = document.getElementById('dc-options');
    optContainer.innerHTML = '';

    let answered = false;

    card.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'dc-option-btn';
      btn.textContent = opt.text;
      optContainer.appendChild(btn);

      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        Audio.click();

        // Mark all buttons
        card.options.forEach((o, j) => {
          const b = optContainer.children[j];
          b.classList.add(o.correct ? 'correct' : 'incorrect');
        });

        // Show explanation
        const expEl = document.createElement('div');
        expEl.className = 'dc-explanation';
        expEl.textContent = card.explanation;
        optContainer.appendChild(expEl);

        // Award/penalize rep
        if (opt.correct) {
          GS.reputation = Math.min(9999, GS.reputation + 15);
          UI.toast('📋 Correct! +15 reputation for good documentation practice.', 'info');
          Audio.success();
        } else {
          GS.reputation = Math.max(0, GS.reputation - 5);
          UI.toast('📋 Not quite. -5 reputation. Review the explanation.', 'warning');
        }
        UI.updateHUD();

        setTimeout(() => {
          UI.hideOverlay('overlay-decision');
          onDone();
        }, 3000);
      });
    });

    UI.showOverlay('overlay-decision');
  },
};

// ============================================================
// SECTION 13: RENDERER
// ============================================================
const Renderer = {
  canvas: null,
  ctx:    null,
  camX:   0,
  camY:   0,

  init() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    const c = this.canvas;
    // Fill available area
    c.width  = c.offsetWidth  || window.innerWidth;
    c.height = c.offsetHeight || (window.innerHeight - 60);
    if (this.ctx) this.ctx.imageSmoothingEnabled = false;
  },

  updateCamera() {
    const worldW = CFG.MAP_W * CFG.TILE;
    const worldH = CFG.MAP_H * CFG.TILE;
    const vw = this.canvas.width;
    const vh = this.canvas.height;

    // Center on player
    let cx = Player.x - vw / 2;
    let cy = Player.y - vh / 2;

    // Clamp
    cx = Math.max(0, Math.min(worldW - vw, cx));
    cy = Math.max(0, Math.min(worldH - vh, cy));

    // If world fits, center it
    if (worldW <= vw) cx = -(vw - worldW) / 2;
    if (worldH <= vh) cy = -(vh - worldH) / 2;

    this.camX = cx;
    this.camY = cy;
  },

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    this.updateCamera();

    // Draw map
    this._drawMap(ctx);

    // Draw bay markings
    this._drawBayMarkings(ctx);

    // Draw aircraft
    GS.aircraft.forEach(a => a.draw(ctx, this.camX, this.camY));

    // Draw player
    Player.draw(ctx, this.camX, this.camY);

    // Draw interact prompt
    this._drawInteractPrompt(ctx);

    // Draw HUD elements on canvas (interact hint)
    this._drawControls(ctx, w, h);
  },

  _drawMap(ctx) {
    const T_SZ = CFG.TILE;
    const map  = BASE_MAP;

    for (let ty = 0; ty < CFG.MAP_H; ty++) {
      for (let tx = 0; tx < CFG.MAP_W; tx++) {
        const sx = tx * T_SZ - this.camX;
        const sy = ty * T_SZ - this.camY;

        // Cull off-screen
        if (sx + T_SZ < 0 || sy + T_SZ < 0 ||
            sx > this.canvas.width || sy > this.canvas.height) continue;

        const tile = map[ty][tx];
        this._drawTile(ctx, tile, sx, sy, T_SZ);
      }
    }
  },

  _drawTile(ctx, tile, sx, sy, S) {
    switch (tile) {
      case T.FLOOR: {
        const alt = ((Math.floor(sx/S) + Math.floor(sy/S)) % 2 === 0);
        ctx.fillStyle = alt ? CLR.floor_a : CLR.floor_b;
        ctx.fillRect(sx, sy, S, S);
        // Subtle edge shading
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fillRect(sx, sy + S - 2, S, 2);
        ctx.fillRect(sx + S - 2, sy, 2, S);
        break;
      }
      case T.BAY: {
        // Bay floor — lighter blue-grey
        ctx.fillStyle = '#7090AA';
        ctx.fillRect(sx, sy, S, S);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(sx, sy + S - 2, S, 2);
        break;
      }
      case T.LOCKED_BAY: {
        // Darker locked bay
        ctx.fillStyle = CLR.locked;
        ctx.fillRect(sx, sy, S, S);
        // X pattern
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(sx+2, sy + S/2 - 1, S-4, 2);
        ctx.fillRect(sx + S/2-1, sy+2, 2, S-4);
        break;
      }
      case T.WALL: {
        ctx.fillStyle = CLR.wall;
        ctx.fillRect(sx, sy, S, S);
        // Top face highlight
        ctx.fillStyle = CLR.wall_top;
        ctx.fillRect(sx, sy, S, 5);
        // Inner shadow
        ctx.fillStyle = CLR.wall_front;
        ctx.fillRect(sx, sy + 5, S, S - 5);
        break;
      }
      case T.BENCH: {
        ctx.fillStyle = CLR.bench;
        ctx.fillRect(sx, sy, S, S);
        ctx.fillStyle = CLR.bench_top;
        ctx.fillRect(sx+2, sy+2, S-4, S-8);
        // Drawers
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(sx+4, sy+8, S-8, 5);
        ctx.fillRect(sx+4, sy+17, S-8, 5);
        // Handle
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(sx + S/2 - 3, sy+10, 6, 2);
        ctx.fillRect(sx + S/2 - 3, sy+19, 6, 2);
        break;
      }
      case T.SHELF: {
        ctx.fillStyle = CLR.shelf;
        ctx.fillRect(sx, sy, S, S);
        ctx.fillStyle = CLR.shelf_top;
        ctx.fillRect(sx+2, sy+2, S-4, 5);
        // Shelf level lines
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(sx+2, sy+10, S-4, 2);
        ctx.fillRect(sx+2, sy+20, S-4, 2);
        // Small parts boxes
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(sx+4, sy+12, 8, 7);
        ctx.fillRect(sx+14, sy+12, 8, 7);
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(sx+5, sy+22, 6, 6);
        ctx.fillRect(sx+15, sy+22, 6, 6);
        break;
      }
      case T.DESK: {
        ctx.fillStyle = CLR.desk;
        ctx.fillRect(sx, sy, S, S);
        ctx.fillStyle = CLR.desk_top;
        ctx.fillRect(sx+2, sy+2, S-4, S-8);
        // Paper on desk
        ctx.fillStyle = '#FFFDE7';
        ctx.fillRect(sx+4, sy+6, 10, 14);
        ctx.fillStyle = '#ccc';
        for (let i=0;i<4;i++) ctx.fillRect(sx+5, sy+8+i*3, 8, 1);
        // Pen
        ctx.fillStyle = '#2255CC';
        ctx.fillRect(sx+18, sy+6, 2, 14);
        break;
      }
      case T.DOOR: {
        ctx.fillStyle = CLR.door;
        ctx.fillRect(sx, sy, S, S);
        ctx.fillStyle = CLR.door_trim;
        ctx.fillRect(sx+2, sy, S-4, 4);
        ctx.fillRect(sx+2, sy, 4, S);
        ctx.fillRect(sx + S-6, sy, 4, S);
        break;
      }
    }
  },

  _drawBayMarkings(ctx) {
    const T_SZ = CFG.TILE;
    BAYS.forEach(bay => {
      const locked = bay.upgradeId && !UPGRADES.find(u=>u.id===bay.upgradeId)?.owned;
      if (locked) return;

      // Yellow outline around bay
      const bx = bay.tx * T_SZ - this.camX;
      const by = bay.ty * T_SZ - this.camY;
      const bw = bay.tw * T_SZ;
      const bh = bay.th * T_SZ;

      ctx.strokeStyle = CLR.bay_line;
      ctx.lineWidth   = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(bx + 3, by + 3, bw - 6, bh - 6);
      ctx.setLineDash([]);

      // Bay label
      ctx.fillStyle   = 'rgba(255,215,0,0.7)';
      ctx.font        = 'bold 9px monospace';
      ctx.textAlign   = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(bay.label, bx + 5, by + 5);
    });
  },

  _drawInteractPrompt(ctx) {
    // Find nearest aircraft to player
    const near = this._nearestAircraftToInteract();
    if (!near) return;

    const sx = near.interactX - this.camX;
    const sy = near.interactY - this.camY - 8;

    // Bouncing prompt
    const bob = Math.sin(Date.now() / 400) * 4;

    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle   = 'rgba(10,20,40,0.85)';
    const text = 'Press E / Tap ⬤ to inspect';
    ctx.font = 'bold 11px monospace';
    const tw = ctx.measureText(text).width;
    ctx.fillRect(sx - tw/2 - 8, sy - 22 + bob, tw + 16, 20);
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, sx, sy - 12 + bob);
    ctx.restore();
  },

  _nearestAircraftToInteract() {
    let best = null, bestDist = CFG.INTERACT_DIST;
    for (const a of GS.aircraft) {
      if (a.status !== 'waiting') continue;
      const dist = Math.hypot(Player.x - a.interactX, Player.y - a.interactY);
      if (dist < bestDist) { bestDist = dist; best = a; }
    }
    return best;
  },

  _drawControls(ctx, w, h) {
    // Keyboard hint (desktop only)
    if (!('ontouchstart' in window)) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('WASD/Arrows: Move  |  E/Space: Interact', w - 8, h - 6);
    }
  },
};

// ============================================================
// SECTION 14: UI MANAGER
// ============================================================
const UI = {
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  },

  showOverlay(id)  { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); },
  hideOverlay(id)  { const el = document.getElementById(id); if (el) el.classList.add('hidden'); },

  updateHUD() {
    document.getElementById('hud-money').textContent    = '$' + GS.money.toLocaleString();
    document.getElementById('hud-day').textContent      = GS.day;
    document.getElementById('hud-rep').textContent      = GS.reputation;
    document.getElementById('hud-mistakes').textContent = GS.mistakes;
    document.getElementById('upgrade-budget').textContent = GS.money.toLocaleString();
  },

  setTask(text) {
    document.getElementById('hud-task').textContent = text;
  },

  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = message;
    container.appendChild(el);

    // Auto-remove
    setTimeout(() => {
      el.style.animation = 'toastOut 0.3s ease-out forwards';
      setTimeout(() => el.remove(), 350);
    }, 3500);
  },

  showMoneyPop(text, color) {
    const pop = document.createElement('div');
    pop.className = 'money-pop';
    pop.textContent = text;
    pop.style.color = color || '#FFD700';
    pop.style.left  = (window.innerWidth / 2 - 30) + 'px';
    pop.style.top   = (window.innerHeight / 2 - 60) + 'px';
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 1500);
  },

  buildUpgradeList() {
    const list = document.getElementById('upgrade-list');
    list.innerHTML = '';

    UPGRADES.forEach(upg => {
      const card = document.createElement('div');
      const reqsMet = upg.requires.every(r => UPGRADES.find(u=>u.id===r)?.owned);
      const canBuy  = !upg.owned && reqsMet && GS.money >= upg.cost;

      let cls = 'upgrade-card';
      if (upg.owned)       cls += ' owned';
      else if (!reqsMet)   cls += ' locked';
      else if (canBuy)     cls += ' buyable';

      card.className = cls;
      card.innerHTML = `
        <div class="upgrade-icon">${upg.icon}</div>
        <div class="upgrade-name">${upg.name}</div>
        <div class="upgrade-desc">${upg.desc}</div>
        ${upg.owned ? '<div class="upgrade-status">✔ OWNED</div>'
          : !reqsMet ? '<div class="upgrade-status" style="color:#888">🔒 Requires prerequisites</div>'
          : `<div class="upgrade-cost ${GS.money<upg.cost?'cant-afford':''}">💰 $${upg.cost.toLocaleString()}</div>`}
      `;

      if (!upg.owned && reqsMet) {
        const btn = document.createElement('button');
        btn.className  = 'btn-pixel ' + (canBuy ? 'btn-green' : 'btn-gray');
        btn.textContent = canBuy ? '🛒 Buy' : '💸 Too Expensive';
        btn.disabled   = !canBuy;
        btn.addEventListener('click', () => {
          Audio.click();
          if (GS.money >= upg.cost) {
            GS.money -= upg.cost;
            GS.stats.total_spent += upg.cost;
            upg.owned = true;
            // Update bay count stat
            GS.stats.bays_owned = BAYS.filter(b => !b.upgradeId || UPGRADES.find(u=>u.id===b.upgradeId)?.owned).length;
            UI.updateHUD();
            UI.toast(`✔ Purchased: ${upg.name}!`, 'money');
            Audio.money();
            this.buildUpgradeList(); // Refresh
            Achievements.check();
          }
        });
        card.appendChild(btn);
      }

      list.appendChild(card);
    });
  },

  buildAchievementList() {
    const list = document.getElementById('achievements-list');
    list.innerHTML = '';

    let unlocked = 0;
    ACHIEVEMENTS.forEach(ach => {
      const card = document.createElement('div');
      card.className = 'achievement-card ' + (ach.unlocked ? 'unlocked' : 'locked');
      card.innerHTML = `
        <div class="ach-icon">${ach.icon}</div>
        <div class="ach-info">
          <div class="ach-name">${ach.name}</div>
          <div class="ach-desc">${ach.desc}</div>
          ${ach.unlocked && ach.unlockedAt ? `<div class="ach-date">${new Date(ach.unlockedAt).toLocaleDateString()}</div>` : ''}
        </div>
      `;
      list.appendChild(card);
      if (ach.unlocked) unlocked++;
    });

    document.getElementById('ach-count').textContent = unlocked;
    document.getElementById('ach-total').textContent = ACHIEVEMENTS.length;
  },

  showDaySummary() {
    document.getElementById('summary-day').textContent = GS.day;
    const stats = document.getElementById('summary-stats');
    stats.innerHTML = `
      <div class="summary-row"><span>Jobs Completed</span><span class="val">${GS.dayJobs}</span></div>
      <div class="summary-row"><span>Money Earned</span><span class="val">$${GS.dayEarned.toLocaleString()}</span></div>
      <div class="summary-row"><span>Mistakes Made</span><span class="val">${GS.dayMistakes}</span></div>
      <div class="summary-row"><span>Total Money</span><span class="val">$${GS.money.toLocaleString()}</span></div>
      <div class="summary-row"><span>Reputation</span><span class="val">${GS.reputation}</span></div>
    `;

    const achEl = document.getElementById('summary-achievements');
    achEl.innerHTML = '';
    if (GS.newAchievements.length > 0) {
      const hdr = document.createElement('p');
      hdr.style.cssText = 'font-size:0.8rem;color:#FFD700;margin-bottom:6px;';
      hdr.textContent = '🏆 Achievements Unlocked:';
      achEl.appendChild(hdr);
      GS.newAchievements.forEach(ach => {
        const el = document.createElement('div');
        el.className = 'new-achievement';
        el.textContent = `${ach.icon} ${ach.name}`;
        achEl.appendChild(el);
      });
    }

    this.showOverlay('overlay-day-summary');
  },

  updateRushTimer() {
    const pct = GS.rushTime / CFG.DAY_DURATION * 100;
    document.getElementById('rush-timer-fill').style.width = pct + '%';
    const h = 8, m = Math.floor((GS.rushTime / CFG.DAY_DURATION) * 480); // 8am to 5pm sim
    const displayH = Math.floor(8 + m/60);
    const displayM = m % 60;
    const ampm = displayH >= 12 ? 'PM' : 'AM';
    const dh = displayH > 12 ? displayH - 12 : displayH;
    document.getElementById('rush-timer-text').textContent =
      `${dh}:${String(displayM).padStart(2,'0')} ${ampm}`;
  },
};

// ============================================================
// SECTION 15: ACHIEVEMENTS
// ============================================================
const Achievements = {
  check() {
    const s = GS.stats;
    const statMap = {
      jobs_done:     s.jobs_done,
      perfect_games: s.perfect_games,
      total_earned:  s.total_earned,
      total_spent:   s.total_spent,
      streak_clean:  s.streak_clean,
      jet_jobs:      s.jet_jobs,
      bays_owned:    s.bays_owned,
      rush_jobs_day: s.rush_jobs_day,
    };

    ACHIEVEMENTS.forEach(ach => {
      if (ach.unlocked) return;
      const val = statMap[ach.stat] || 0;
      if (val >= ach.goal) {
        ach.unlocked   = true;
        ach.unlockedAt = Date.now();
        GS.newAchievements.push(ach);
        UI.toast(`🏆 Achievement: ${ach.name} — ${ach.desc}`, 'ach');
        Audio.achieve();
      }
    });
  },
};

// ============================================================
// SECTION 16: GAME MODES
// ============================================================
const GameModes = {
  startCareer(loadSave) {
    GS.reset('career');
    if (loadSave) {
      const data = Save.load();
      Save.applyToState(data, GS);
    } else {
      GS.money = CFG.BASE_MONEY;
    }

    UI.showScreen('screen-game');
    UI.updateHUD();
    UI.setTask('Walk to an aircraft to begin');
    document.getElementById('rush-timer-wrap').style.display = 'none';

    Player.reset();
    Renderer.resize();

    // Spawn initial aircraft
    JobSystem.spawnJobs();
    if (BAYS.filter(b=>!b.upgradeId||UPGRADES.find(u=>u.id===b.upgradeId)?.owned).length > 1) {
      setTimeout(() => JobSystem.spawnJobs(), 1500);
    }

    GS.running = true;
    Game.startLoop();
  },

  startRush() {
    GS.reset('rush');
    GS.rushRunning = true;
    GS.rushTime    = CFG.DAY_DURATION;
    const data = Save.load();
    Save.applyToState(data, GS);
    GS.dayEarned = 0; GS.dayJobs = 0; GS.dayMistakes = 0;
    GS.stats.rush_jobs_day = 0;

    UI.showScreen('screen-game');
    UI.updateHUD();
    UI.setTask('RUSH MODE — earn as much as possible before closing time!');
    document.getElementById('rush-timer-wrap').style.display = 'flex';

    Player.reset();
    Renderer.resize();

    // Spawn 2 aircraft immediately
    JobSystem.spawnJobs();
    setTimeout(() => JobSystem.spawnJobs(), 800);

    GS.running = true;
    Game.startLoop();
  },

  startFreePlay() {
    GS.reset('freeplay');
    const data = Save.load();
    if (data) {
      Save.applyToState(data, GS);
    } else {
      // Unlock everything for free play
      UPGRADES.forEach(u => u.owned = true);
      GS.money = 99999;
    }
    GS.stats.bays_owned = 4;

    UI.showScreen('screen-game');
    UI.updateHUD();
    UI.setTask('Free Play — all features unlocked! No pressure.');
    document.getElementById('rush-timer-wrap').style.display = 'none';

    Player.reset();
    Renderer.resize();

    BAYS.forEach(() => JobSystem.spawnJobs());

    GS.running = true;
    Game.startLoop();
  },

  tickRushTimer(dt) {
    if (!GS.rushRunning) return;
    GS.rushTime -= dt;
    UI.updateRushTimer();
    if (GS.rushTime <= 0) {
      GS.rushTime = 0;
      GS.rushRunning = false;
      UI.toast('⏱ Shop is closing! End of rush day.', 'warning');
      // End day after active job if any, else immediately
      if (!GS.activeJob) this.endDay();
    } else if (GS.rushTime < 60 && !GS._rushWarned) {
      GS._rushWarned = true;
      UI.toast('⚠️ Less than 1 minute left!', 'warning');
    }
  },

  endDay() {
    GS.running = false;
    GS.day++;
    GS.dayMistakes = 0;
    GS.mistakes   = 0;

    // Daily bonus
    const bonus = Math.floor(50 + GS.day * 10);
    GS.money += bonus;
    GS.dayEarned += bonus;

    Achievements.check();
    Save.save(GS);
    UI.showDaySummary();
  },
};

// ============================================================
// SECTION 17: MAIN GAME LOOP
// ============================================================
const Game = {
  loopId: null,
  lastTime: 0,

  startLoop() {
    if (this.loopId) cancelAnimationFrame(this.loopId);
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  },

  loop(now) {
    this.loopId = requestAnimationFrame(t => this.loop(t));
    const dt = Math.min((now - this.lastTime) / 1000, 0.05); // cap at 50ms
    this.lastTime = now;

    if (!GS.running || GS.paused) {
      Renderer.render();
      return;
    }

    this.update(dt);
    Renderer.render();
  },

  update(dt) {
    // Player movement
    Player.update(dt, BASE_MAP);

    // Rush timer
    if (GS.mode === 'rush') {
      GameModes.tickRushTimer(dt);
    }

    // Aircraft update
    GS.aircraft.forEach(a => a.update(dt));

    // Interact
    if (Input.consumeInteract() && !GS.activeJob) {
      const near = Renderer._nearestAircraftToInteract();
      if (near) {
        Audio.interact();
        JobSystem.openWorkOrder(near);
      }
    }

    // Proximity highlight - update HUD task
    const near = Renderer._nearestAircraftToInteract();
    if (near && !GS.activeJob) {
      UI.setTask(`${near.type.name} needs: ${near.job.name} — Press E to inspect`);
    } else if (!GS.activeJob) {
      UI.setTask('Walk to an aircraft to begin');
    }

    // Spawn more aircraft in career/freeplay if bays are empty
    if (GS.mode !== 'rush') {
      const activeBays = BAYS.filter(b => !b.upgradeId || UPGRADES.find(u=>u.id===b.upgradeId)?.owned);
      const occupied   = GS.aircraft.length;
      if (occupied === 0 && !GS.activeJob) {
        JobSystem.spawnJobs();
      }
    }

    // Career day advancement every ~5 jobs
    if (GS.mode === 'career' && GS.dayJobs > 0 && GS.dayJobs % 5 === 0 && !this._dayChecked) {
      this._dayChecked = true;
      setTimeout(() => {
        GameModes.endDay();
        this._dayChecked = false;
      }, 500);
    }
  },
};

// ============================================================
// SECTION 18: INITIALIZATION
// ============================================================
window.addEventListener('load', () => {
  // Init audio
  Audio.init();

  // Init input
  Input.init();

  // Init renderer (canvas not visible yet, init when game starts)
  // We do a deferred init when game screen becomes active

  // --- Title screen save info ---
  const saved = Save.load();
  const saveInfo = document.getElementById('save-slot-info');
  if (saved) {
    const d = new Date(saved.savedAt);
    saveInfo.textContent = `💾 Saved: Day ${saved.day} | $${(saved.money||0).toLocaleString()} | ${d.toLocaleDateString()}`;
  }

  // --- Title screen buttons ---
  document.getElementById('btn-career').addEventListener('click', () => {
    Audio.click(); Audio.resume();
    GameModes.startCareer(!!saved);
  });

  document.getElementById('btn-rush').addEventListener('click', () => {
    Audio.click(); Audio.resume();
    GameModes.startRush();
  });

  document.getElementById('btn-freeplay').addEventListener('click', () => {
    Audio.click(); Audio.resume();
    GameModes.startFreePlay();
  });

  document.getElementById('btn-achievements').addEventListener('click', () => {
    Audio.click();
    if (saved) Save.applyToState(saved, GS);
    UI.buildAchievementList();
    UI.showScreen('screen-achievements');
  });

  // --- Game HUD buttons ---
  document.getElementById('btn-pause').addEventListener('click', () => {
    Audio.click();
    GS.paused = true;
    UI.showOverlay('overlay-pause');
  });

  document.getElementById('btn-resume').addEventListener('click', () => {
    Audio.click();
    GS.paused = false;
    UI.hideOverlay('overlay-pause');
  });

  document.getElementById('btn-upgrades-from-pause').addEventListener('click', () => {
    Audio.click();
    UI.hideOverlay('overlay-pause');
    UI.buildUpgradeList();
    UI.showScreen('screen-upgrades');
  });

  document.getElementById('btn-save').addEventListener('click', () => {
    Audio.click();
    if (Save.save(GS)) {
      UI.toast('💾 Game saved!', 'info');
    } else {
      UI.toast('❌ Save failed.', 'error');
    }
  });

  document.getElementById('btn-quit-to-title').addEventListener('click', () => {
    Audio.click();
    if (GS.dayJobs > 0) Save.save(GS);
    GS.running = false;
    UI.hideOverlay('overlay-pause');
    UI.showScreen('screen-title');
    // Update save info
    const newSave = Save.load();
    if (newSave) {
      const d = new Date(newSave.savedAt);
      document.getElementById('save-slot-info').textContent =
        `💾 Saved: Day ${newSave.day} | $${(newSave.money||0).toLocaleString()} | ${d.toLocaleDateString()}`;
    }
  });

  // --- Upgrade screen ---
  document.getElementById('btn-close-upgrades').addEventListener('click', () => {
    Audio.click();
    // Return to game if running, else title
    if (GS.running) {
      UI.showScreen('screen-game');
      GS.paused = false;
    } else {
      UI.showScreen('screen-title');
    }
  });

  // --- Achievements screen ---
  document.getElementById('btn-close-achievements').addEventListener('click', () => {
    Audio.click();
    if (GS.running) UI.showScreen('screen-game');
    else UI.showScreen('screen-title');
  });

  // --- Day summary ---
  document.getElementById('btn-next-day').addEventListener('click', () => {
    Audio.click();
    UI.hideOverlay('overlay-day-summary');
    GS.dayEarned   = 0;
    GS.dayJobs     = 0;
    GS.dayMistakes = 0;
    GS.mistakes    = 0;
    GS.newAchievements = [];
    GS.stats.rush_jobs_day = 0;
    GS._rushWarned = false;

    if (GS.mode === 'rush') {
      // Return to title after rush day ends
      GS.running = false;
      UI.showScreen('screen-title');
    } else {
      GS.running = true;
      // Spawn fresh aircraft for new day
      GS.aircraft = [];
      GS.activeJob = null;
      Player.isWorking = false;
      JobSystem.spawnJobs();
      if (BAYS.filter(b=>!b.upgradeId||UPGRADES.find(u=>u.id===b.upgradeId)?.owned).length > 1) {
        setTimeout(() => JobSystem.spawnJobs(), 1000);
      }
      UI.showScreen('screen-game');
      UI.updateHUD();
      UI.setTask(`Day ${GS.day} — ready for work!`);
    }
  });

  // --- Canvas resize on game screen visibility ---
  const observer = new MutationObserver(() => {
    if (document.getElementById('screen-game').classList.contains('active')) {
      setTimeout(() => Renderer.init(), 50);
    }
  });
  observer.observe(document.getElementById('screen-game'), { attributes: true, attributeFilter:['class'] });

  // Initial renderer (no-op if canvas not visible)
  Renderer.init();

  console.log('%c✈ HANGAR HUSTLE loaded! %cOpen browser console to see debug info.',
    'color:#FFD700;font-size:1.2em;font-weight:bold',
    'color:#888');
});

// ── Prevent context menu on long-press (mobile) ──────────────────
document.addEventListener('contextmenu', e => e.preventDefault());
