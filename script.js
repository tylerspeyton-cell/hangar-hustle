"use strict";

/*
  Hangar Hustle - Aircraft Maintenance Simulator
  Vanilla JS, mobile + desktop friendly
*/

(() => {
  const SAVE_KEY = "hangar_hustle_cms_save_v2";
  const RUSH_TOTAL_SECONDS = 8 * 60;

  const ZONES_BASE = ["engine", "cockpit", "gear", "wings", "tail"];
  const ZONES_WITH_AVIONICS = ["engine", "cockpit", "avionics", "gear", "wings", "tail"];

  const AIRCRAFT = [
    {
      tier: 0,
      id: "c172",
      name: "Cessna 172",
      family: "Single-Engine Piston",
      requires: "basic_toolbox",
      width: 300,
      stripe: "#c63b3b",
      windows: 3,
      engines: "single_prop",
      wingType: "high",
      tailType: "classic",
    },
    {
      tier: 1,
      id: "seneca",
      name: "Piper Seneca",
      family: "Twin Piston",
      requires: "socket_set",
      width: 340,
      stripe: "#3a72b8",
      windows: 4,
      engines: "twin_prop",
      wingType: "low",
      tailType: "classic",
    },
    {
      tier: 2,
      id: "kingair90",
      name: "King Air 90",
      family: "Turboprop",
      requires: "advanced_tool_set",
      width: 380,
      stripe: "#c58a2f",
      windows: 6,
      engines: "twin_turboprop",
      wingType: "low",
      tailType: "t",
    },
    {
      tier: 3,
      id: "mustang",
      name: "Citation Mustang",
      family: "Small Business Jet",
      requires: "advanced_tool_set",
      width: 400,
      stripe: "#4f83b6",
      windows: 5,
      engines: "rear_jet",
      wingType: "swept",
      tailType: "t",
    },
    {
      tier: 4,
      id: "xls",
      name: "Citation XLS",
      family: "Midsize Jet",
      requires: "large_hangar_expansion",
      width: 460,
      stripe: "#2a5e98",
      windows: 8,
      engines: "rear_jet_big",
      wingType: "swept_winglet",
      tailType: "t",
    },
  ];

  const PARTS = [
    // Engine
    { id: "oil_filter", name: "Oil Filter", cost: 45, zones: ["engine"], minTier: 0, maxTier: 4 },
    { id: "engine_oil", name: "Engine Oil", cost: 15, zones: ["engine"], minTier: 0, maxTier: 4 },
    { id: "spark_plugs", name: "Spark Plugs Set", cost: 175, zones: ["engine"], minTier: 0, maxTier: 1 },
    { id: "air_filter", name: "Air Filter", cost: 38, zones: ["engine"], minTier: 0, maxTier: 4 },
    { id: "exhaust_gasket", name: "Exhaust Gasket", cost: 95, zones: ["engine"], minTier: 0, maxTier: 4 },
    { id: "mag_l", name: "Magneto (L)", cost: 295, zones: ["engine"], minTier: 0, maxTier: 1 },
    { id: "mag_r", name: "Magneto (R)", cost: 295, zones: ["engine"], minTier: 0, maxTier: 1 },
    { id: "fuel_injector", name: "Fuel Injector Set", cost: 380, zones: ["engine"], minTier: 1, maxTier: 4 },
    { id: "prop_governor", name: "Prop Governor", cost: 520, zones: ["engine"], minTier: 2, maxTier: 4 },
    { id: "oil_cooler", name: "Oil Cooler", cost: 680, zones: ["engine"], minTier: 2, maxTier: 4 },

    // Cockpit
    { id: "altimeter", name: "Altimeter", cost: 580, zones: ["cockpit"], minTier: 0, maxTier: 4 },
    { id: "airspeed", name: "Airspeed Indicator", cost: 420, zones: ["cockpit"], minTier: 0, maxTier: 4 },
    { id: "vsi", name: "Vertical Speed Indicator", cost: 380, zones: ["cockpit"], minTier: 0, maxTier: 4 },
    { id: "turn_coord", name: "Turn Coordinator", cost: 490, zones: ["cockpit"], minTier: 0, maxTier: 4 },
    { id: "compass", name: "Magnetic Compass", cost: 145, zones: ["cockpit"], minTier: 0, maxTier: 4 },
    { id: "fuel_gauges", name: "Fuel Gauges", cost: 220, zones: ["cockpit"], minTier: 0, maxTier: 4 },
    { id: "breaker_set", name: "Circuit Breakers Set", cost: 65, zones: ["cockpit"], minTier: 0, maxTier: 4 },
    { id: "throttle_cable", name: "Throttle Cable", cost: 185, zones: ["cockpit"], minTier: 0, maxTier: 4 },
    { id: "mixture_cable", name: "Mixture Control Cable", cost: 185, zones: ["cockpit"], minTier: 0, maxTier: 1 },

    // Avionics
    { id: "com_radio", name: "COM Radio", cost: 1200, zones: ["avionics"], minTier: 2, maxTier: 4 },
    { id: "nav_radio", name: "NAV Radio", cost: 980, zones: ["avionics"], minTier: 2, maxTier: 4 },
    { id: "transponder", name: "Transponder", cost: 1450, zones: ["avionics"], minTier: 2, maxTier: 4 },
    { id: "gps_nav", name: "GPS Navigator", cost: 2800, zones: ["avionics"], minTier: 2, maxTier: 4 },
    { id: "wx_radar", name: "Weather Radar", cost: 3500, zones: ["avionics"], minTier: 3, maxTier: 4 },
    { id: "efis", name: "EFIS Display", cost: 4200, zones: ["avionics"], minTier: 3, maxTier: 4 },

    // Gear
    { id: "nose_tire", name: "Nose Tire", cost: 265, zones: ["gear"], minTier: 0, maxTier: 4 },
    { id: "main_tire_l", name: "Main Tire L", cost: 320, zones: ["gear"], minTier: 0, maxTier: 4 },
    { id: "main_tire_r", name: "Main Tire R", cost: 320, zones: ["gear"], minTier: 0, maxTier: 4 },
    { id: "brake_pad_l", name: "Brake Pads L", cost: 175, zones: ["gear"], minTier: 0, maxTier: 4 },
    { id: "brake_pad_r", name: "Brake Pads R", cost: 175, zones: ["gear"], minTier: 0, maxTier: 4 },
    { id: "caliper_l", name: "Brake Caliper L", cost: 580, zones: ["gear"], minTier: 0, maxTier: 4 },
    { id: "caliper_r", name: "Brake Caliper R", cost: 580, zones: ["gear"], minTier: 0, maxTier: 4 },
    { id: "nose_strut", name: "Nose Gear Strut", cost: 890, zones: ["gear"], minTier: 1, maxTier: 4 },
    { id: "gear_actuator", name: "Gear Actuator", cost: 1100, zones: ["gear"], minTier: 1, maxTier: 4 },
    { id: "shimmy", name: "Shimmy Dampener", cost: 395, zones: ["gear"], minTier: 0, maxTier: 4 },

    // Wings
    { id: "nav_light_l", name: "Nav Light L", cost: 78, zones: ["wings"], minTier: 0, maxTier: 4 },
    { id: "nav_light_r", name: "Nav Light R", cost: 78, zones: ["wings"], minTier: 0, maxTier: 4 },
    { id: "fuel_cap_l", name: "Fuel Cap L", cost: 42, zones: ["wings"], minTier: 0, maxTier: 4 },
    { id: "fuel_cap_r", name: "Fuel Cap R", cost: 42, zones: ["wings"], minTier: 0, maxTier: 4 },
    { id: "fuel_sender_l", name: "Fuel Sender L", cost: 310, zones: ["wings"], minTier: 0, maxTier: 4 },
    { id: "fuel_sender_r", name: "Fuel Sender R", cost: 310, zones: ["wings"], minTier: 0, maxTier: 4 },
    { id: "pitot", name: "Pitot Tube", cost: 165, zones: ["wings"], minTier: 0, maxTier: 4 },
    { id: "wick_set", name: "Static Wick Set", cost: 28, zones: ["wings"], minTier: 0, maxTier: 4 },
    { id: "flap_act", name: "Flap Actuator", cost: 740, zones: ["wings"], minTier: 0, maxTier: 4 },
    { id: "wing_tip_l", name: "Wing Tip L", cost: 420, zones: ["wings"], minTier: 2, maxTier: 4 },
    { id: "wing_tip_r", name: "Wing Tip R", cost: 420, zones: ["wings"], minTier: 2, maxTier: 4 },

    // Tail
    { id: "elt_batt", name: "ELT Battery", cost: 265, zones: ["tail"], minTier: 0, maxTier: 4 },
    { id: "tail_beacon", name: "Tail Beacon", cost: 135, zones: ["tail"], minTier: 0, maxTier: 4 },
    { id: "trim_act", name: "Elevator Trim Actuator", cost: 480, zones: ["tail"], minTier: 0, maxTier: 4 },
    { id: "rudder_cable", name: "Rudder Cable", cost: 225, zones: ["tail"], minTier: 0, maxTier: 4 },
    { id: "elevator_cable", name: "Elevator Cable", cost: 225, zones: ["tail"], minTier: 0, maxTier: 4 },
    { id: "static_port", name: "Static Port", cost: 85, zones: ["tail"], minTier: 0, maxTier: 4 },
    { id: "tail_ring", name: "Tail Tie-Down Ring", cost: 25, zones: ["tail"], minTier: 0, maxTier: 4 },
  ];

  const JOBS = [
    { id: "j01", name: "Oil Service", description: "Oil and filter change with leak check.", affectedZones: ["engine"], aircraftTier: 0, basePay: 280, difficulty: 1 },
    { id: "j02", name: "Annual Inspection", description: "Comprehensive annual condition check.", affectedZones: ["engine", "cockpit", "gear", "wings", "tail"], aircraftTier: 0, basePay: 650, difficulty: 3 },
    { id: "j03", name: "100-Hour Inspection", description: "Recurring high-utilization inspection package.", affectedZones: ["engine", "cockpit", "gear", "wings", "tail"], aircraftTier: 0, basePay: 580, difficulty: 3 },
    { id: "j04", name: "Tire Change", description: "Replace worn tires and check pressure.", affectedZones: ["gear"], aircraftTier: 0, basePay: 320, difficulty: 1 },
    { id: "j05", name: "Brake Service", description: "Pads and caliper service package.", affectedZones: ["gear"], aircraftTier: 0, basePay: 480, difficulty: 2 },
    { id: "j06", name: "Spark Plug Service", description: "Remove, inspect, and replace plugs.", affectedZones: ["engine"], aircraftTier: 0, basePay: 340, difficulty: 1 },
    { id: "j07", name: "Avionics Repair", description: "Troubleshoot intermittent panel faults.", affectedZones: ["cockpit"], aircraftTier: 1, basePay: 820, difficulty: 2 },
    { id: "j08", name: "Landing Gear Overhaul", description: "Deep landing gear service and actuator checks.", affectedZones: ["gear"], aircraftTier: 1, basePay: 1200, difficulty: 3 },
    { id: "j09", name: "Engine Overhaul", description: "High-effort engine subsystem refresh.", affectedZones: ["engine"], aircraftTier: 1, basePay: 1800, difficulty: 3 },
    { id: "j10", name: "Pre-buy Inspection", description: "Buyer-requested full condition report.", affectedZones: ["engine", "cockpit", "gear", "wings", "tail"], aircraftTier: 1, basePay: 950, difficulty: 3 },
    { id: "j11", name: "Hot Section Inspection", description: "Turbine hot section condition review.", affectedZones: ["engine"], aircraftTier: 2, basePay: 2400, difficulty: 3 },
    { id: "j12", name: "Gear Rigging Check", description: "Rigging and alignment validation.", affectedZones: ["gear"], aircraftTier: 2, basePay: 1400, difficulty: 2 },
    { id: "j13", name: "Full Inspection", description: "Comprehensive turboprop check.", affectedZones: ["engine", "cockpit", "avionics", "gear", "wings", "tail"], aircraftTier: 2, basePay: 2800, difficulty: 3 },
    { id: "j14", name: "Avionics Upgrade", description: "Comms/nav suite replacement package.", affectedZones: ["avionics"], aircraftTier: 2, basePay: 3200, difficulty: 2 },
    { id: "j15", name: "Transponder Test", description: "Bench and in-airframe transponder test.", affectedZones: ["avionics"], aircraftTier: 3, basePay: 1800, difficulty: 2 },
    { id: "j16", name: "Hydraulic Service", description: "Hydraulic pressure and actuator service.", affectedZones: ["gear"], aircraftTier: 3, basePay: 2600, difficulty: 2 },
    { id: "j17", name: "Engine Borescope", description: "Deep visual internal inspection.", affectedZones: ["engine"], aircraftTier: 3, basePay: 3400, difficulty: 3 },
    { id: "j18", name: "Full Jet Inspection", description: "Comprehensive light jet inspection package.", affectedZones: ["engine", "cockpit", "avionics", "gear", "wings", "tail"], aircraftTier: 3, basePay: 6500, difficulty: 3 },
    { id: "j19", name: "Thrust Reverser Check", description: "Tail/engine reverse-thrust systems check.", affectedZones: ["engine", "tail"], aircraftTier: 4, basePay: 5200, difficulty: 3 },
    { id: "j20", name: "Landing Gear Overhaul XL", description: "Heavy midsize-jet landing gear package.", affectedZones: ["gear"], aircraftTier: 4, basePay: 8400, difficulty: 3 },
    { id: "j21", name: "Full Midsize Inspection", description: "Complete midsize business jet inspection.", affectedZones: ["engine", "cockpit", "avionics", "gear", "wings", "tail"], aircraftTier: 4, basePay: 12000, difficulty: 3 },
    { id: "j22", name: "Wing System Service", description: "Fuel sender and flap actuator service.", affectedZones: ["wings"], aircraftTier: 2, basePay: 2200, difficulty: 2 },
  ];

  const UPGRADES = [
    { id: "basic_toolbox", name: "Basic Toolbox", cost: 0, icon: "🧰", desc: "Starter equipment. Enables tier 0 jobs.", alwaysOwned: true },
    { id: "socket_set", name: "Socket Set", cost: 800, icon: "🔩", desc: "Enables tier 1 jobs, faster repairs." },
    { id: "air_compressor", name: "Air Compressor", cost: 1200, icon: "🛞", desc: "Required for tire-focused jobs." },
    { id: "parts_shelf", name: "Parts Shelf", cost: 1800, icon: "📦", desc: "Instant part ordering in most cases." },
    { id: "second_tool_chest", name: "Second Tool Chest", cost: 2000, icon: "🧰", desc: "+15% payout bonus." },
    { id: "hydraulic_lift", name: "Hydraulic Lift", cost: 3500, icon: "🛗", desc: "Enables heavy gear-overhaul work." },
    { id: "diagnostic_computer", name: "Diagnostic Computer", cost: 2800, icon: "💻", desc: "Needed for advanced avionics work." },
    { id: "advanced_tool_set", name: "Advanced Tool Set", cost: 6000, icon: "🛠", desc: "Unlocks tiers 2 and 3 aircraft." },
    { id: "paint_detail_bay", name: "Paint & Detail Bay", cost: 4500, icon: "🎨", desc: "+10% quality payout bonus." },
    { id: "large_hangar_expansion", name: "Large Hangar Expansion", cost: 8000, icon: "🏗", desc: "Unlocks tier 4 aircraft and wider bay." },
    { id: "hire_assistant", name: "Hire Assistant", cost: 5000, icon: "👨‍🔧", desc: "Auto-completes one easy zone per job." },
    { id: "parts_inventory_pro", name: "Parts Inventory Pro", cost: 6500, icon: "📚", desc: "Parts under $500 are instant-stock." },
  ];

  const ACHIEVEMENTS = [
    { id: "first_job", name: "First Wrench Turn", check: (s) => s.jobsCompleted >= 1 },
    { id: "ten_jobs", name: "Getting Into It", check: (s) => s.jobsCompleted >= 10 },
    { id: "fifty_jobs", name: "Shop Veteran", check: (s) => s.jobsCompleted >= 50 },
    { id: "hundred_parts", name: "Grease Monkey", check: (s) => s.partsReplaced >= 100 },
    { id: "money_maker", name: "Money Maker", check: (s) => s.totalEarned >= 10000 },
    { id: "big_spender", name: "Big Spender", check: (s) => s.totalSpent >= 5000 },
    { id: "jet_cert", name: "Jet Certified", check: (s) => s.jetJobsCompleted >= 1 },
    { id: "full_shop", name: "Full Shop", check: (s) => ["socket_set", "air_compressor", "parts_shelf", "second_tool_chest"].every((id) => s.ownedUpgrades.includes(id)) },
    { id: "rush_expert", name: "Rush Expert", check: (s) => s.rushJobsCompleted >= 5 },
    { id: "perfect_day", name: "Perfect Day", check: (s) => s.perfectDays >= 1 },
  ];

  const RANDOM_EVENTS = [
    { type: "rush", label: "⚡ Rush Job: 2x Pay", mult: 2 },
    { type: "premium", label: "💎 Premium Client: 3x Pay, replace all worn parts", mult: 3 },
    { type: "repeat", label: "🤝 Repeat Customer: +15% loyalty", mult: 1.15 },
    { type: "parts_delay", label: "🚚 Parts Delay: some replacements delayed", mult: 1 },
    { type: "hidden_damage", label: "🕵 Hidden Damage: extra bad part may appear", mult: 1 },
  ];

  const ui = {};
  const state = {
    mode: null,
    money: 700,
    day: 1,
    rep: 0,
    jobsCompleted: 0,
    totalEarned: 0,
    totalSpent: 0,
    partsReplaced: 0,
    rushJobsCompleted: 0,
    jetJobsCompleted: 0,
    perfectDays: 0,
    dayJobsDone: 0,
    dayMistakes: 0,
    paused: false,
    rushSecondsLeft: RUSH_TOTAL_SECONDS,
    boardCount: 1,
    achievementsUnlocked: [],
    currentJob: null,
    jobBoard: [],
    selectedZone: null,
    hoveredZone: null,
    zoneRects: {},
    eventBannerTimer: 0,
    bannerText: "",
    touchDevice: false,
    ownedUpgrades: ["basic_toolbox"],
    adsHook: { rewardedReady: false, noAds: false, cosmetics: [], progressionPack: false },
  };

  let canvas;
  let ctx;
  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let lastTs = 0;
  let autosaveTimer = 0;

  function byId(id) {
    return document.getElementById(id);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function hasUpgrade(id) {
    return state.ownedUpgrades.includes(id);
  }

  function fmtMoney(v) {
    return `$${Math.round(v).toLocaleString()}`;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function initDom() {
    ui.titleScreen = byId("title-screen");
    ui.gameScreen = byId("game-screen");
    ui.btnCareer = byId("btn-career");
    ui.btnRush = byId("btn-rush");
    ui.btnFreePlay = byId("btn-free-play");
    ui.btnLoadGame = byId("btn-load-game");

    ui.hudMoney = byId("hud-money");
    ui.hudDay = byId("hud-day");
    ui.hudRep = byId("hud-rep");
    ui.hudJobName = byId("hud-job-name");
    ui.btnJobBoard = byId("btn-job-board");
    ui.btnUpgrades = byId("btn-upgrades");
    ui.btnPause = byId("btn-pause");

    ui.rushBar = byId("rush-timer-bar");
    ui.rushFill = byId("rush-fill");
    ui.rushValue = byId("rush-value");

    ui.leftSidebar = byId("left-sidebar");
    ui.equipmentIcons = byId("equipment-icons");
    ui.zoneRow = byId("zone-buttons-row");
    ui.zoneButtons = Array.from(document.querySelectorAll(".zone-btn"));
    ui.zoneBtnAvionics = byId("zone-btn-avionics");

    ui.partsPanel = byId("parts-panel");
    ui.partsZoneTitle = byId("parts-zone-title");
    ui.btnCloseParts = byId("btn-close-parts");
    ui.btnInspectAll = byId("btn-inspect-all");
    ui.partsList = byId("parts-list");
    ui.btnCompleteJob = byId("btn-complete-job");
    ui.completePay = byId("complete-pay");

    ui.modalJobs = byId("modal-job-board");
    ui.btnCloseJobs = byId("btn-close-jobs");
    ui.jobList = byId("job-list");

    ui.modalUpgrades = byId("modal-upgrades");
    ui.btnCloseUpgrades = byId("btn-close-upgrades");
    ui.upgradeBalanceVal = byId("upgrade-balance-val");
    ui.upgradeList = byId("upgrade-list");

    ui.jobCompletePopup = byId("job-complete-popup");
    ui.jcTitle = byId("jc-title");
    ui.jcBreakdown = byId("jc-breakdown");
    ui.jcTotal = byId("jc-total");
    ui.btnJcOk = byId("btn-jc-ok");

    ui.dayEndPopup = byId("day-end-popup");
    ui.dayEndNum = byId("day-end-num");
    ui.dayEndStats = byId("day-end-stats");
    ui.btnNextDay = byId("btn-next-day");
    ui.nextDayNum = byId("next-day-num");

    ui.pauseOverlay = byId("pause-overlay");
    ui.btnResume = byId("btn-resume");
    ui.btnSave = byId("btn-save");
    ui.btnQuitMain = byId("btn-quit-main");

    ui.achievementToast = byId("achievement-toast");
    ui.toastName = byId("toast-name");

    ui.eventBanner = byId("event-banner");
    ui.eventBannerText = byId("event-banner-text");

    canvas = byId("hangar-canvas");
    ctx = canvas.getContext("2d");
  }

  function bindEvents() {
    ui.btnCareer.addEventListener("click", () => startNewGame("career"));
    ui.btnRush.addEventListener("click", () => startNewGame("rush"));
    ui.btnFreePlay.addEventListener("click", () => startNewGame("free"));
    ui.btnLoadGame.addEventListener("click", () => loadGame(true));

    ui.btnJobBoard.addEventListener("click", () => openJobBoard());
    ui.btnUpgrades.addEventListener("click", () => openUpgrades());
    ui.btnPause.addEventListener("click", () => setPaused(true));

    ui.btnCloseJobs.addEventListener("click", closeModals);
    ui.btnCloseUpgrades.addEventListener("click", closeModals);
    ui.btnCloseParts.addEventListener("click", () => closePartsPanel());

    ui.btnInspectAll.addEventListener("click", inspectSelectedZone);
    ui.btnCompleteJob.addEventListener("click", completeCurrentJob);

    ui.btnJcOk.addEventListener("click", () => {
      ui.jobCompletePopup.classList.add("hidden");
      maybeTriggerDayEnd();
    });

    ui.btnNextDay.addEventListener("click", startNextDay);
    ui.btnResume.addEventListener("click", () => setPaused(false));
    ui.btnSave.addEventListener("click", () => {
      saveGame();
      showBanner("💾 Game saved");
    });
    ui.btnQuitMain.addEventListener("click", quitToMenu);

    ui.zoneButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!state.currentJob || state.currentJob.stage !== "parked") return;
        const zone = btn.dataset.zone;
        const zones = getCurrentZones();
        if (!zones.includes(zone)) return;
        openZone(zone);
      });
    });

    canvas.addEventListener("mousemove", onCanvasMove);
    canvas.addEventListener("click", onCanvasClick);
    canvas.addEventListener("touchstart", (e) => {
      state.touchDevice = true;
      onCanvasTouch(e);
    }, { passive: false });

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("beforeunload", saveGame);
  }

  function defaultState(mode) {
    state.mode = mode;
    state.money = mode === "free" ? 50000 : 700;
    state.day = 1;
    state.rep = mode === "free" ? 50 : 0;
    state.jobsCompleted = 0;
    state.totalEarned = 0;
    state.totalSpent = 0;
    state.partsReplaced = 0;
    state.rushJobsCompleted = 0;
    state.jetJobsCompleted = 0;
    state.perfectDays = 0;
    state.dayJobsDone = 0;
    state.dayMistakes = 0;
    state.paused = false;
    state.rushSecondsLeft = RUSH_TOTAL_SECONDS;
    state.boardCount = 1;
    state.achievementsUnlocked = [];
    state.currentJob = null;
    state.jobBoard = [];
    state.selectedZone = null;
    state.hoveredZone = null;
    state.zoneRects = {};
    state.eventBannerTimer = 0;
    state.bannerText = "";
    state.ownedUpgrades = mode === "free"
      ? UPGRADES.map((u) => u.id)
      : ["basic_toolbox"];
  }

  function startNewGame(mode) {
    defaultState(mode);
    ui.titleScreen.classList.remove("active");
    ui.gameScreen.classList.add("active");
    ui.rushBar.classList.toggle("hidden", mode !== "rush");
    closeModals();
    closePartsPanel();
    refreshBoard();
    renderEquipment();
    updateHUD();
    saveGame();
  }

  function quitToMenu() {
    setPaused(false);
    closeModals();
    closePartsPanel();
    state.currentJob = null;
    ui.gameScreen.classList.remove("active");
    ui.titleScreen.classList.add("active");
  }

  function setPaused(v) {
    state.paused = v;
    ui.pauseOverlay.classList.toggle("hidden", !v);
  }

  function closeModals() {
    ui.modalJobs.classList.add("hidden");
    ui.modalUpgrades.classList.add("hidden");
  }

  function openJobBoard() {
    renderJobBoard();
    ui.modalJobs.classList.remove("hidden");
  }

  function openUpgrades() {
    renderUpgrades();
    ui.modalUpgrades.classList.remove("hidden");
  }

  function openZone(zone) {
    state.selectedZone = zone;
    ui.partsZoneTitle.textContent = zone.toUpperCase();
    ui.partsPanel.classList.remove("hidden");
    renderPartsPanel();
    renderZoneButtons();
  }

  function closePartsPanel() {
    state.selectedZone = null;
    ui.partsPanel.classList.add("hidden");
    renderZoneButtons();
  }

  function refreshBoard() {
    if (state.currentJob) return;
    const maxTier = getMaxUnlockedTier();
    const candidates = JOBS.filter((j) => j.aircraftTier <= maxTier);
    const targetCount = state.mode === "career" ? clamp(state.boardCount, 1, 5) : 4;
    const pool = shuffle([...candidates]);
    state.jobBoard = pool.slice(0, targetCount).map((j) => ({ ...j, event: rollRandomEvent() }));
    renderJobBoard();
  }

  function getMaxUnlockedTier() {
    if (state.mode === "free") return 4;
    if (hasUpgrade("large_hangar_expansion")) return 4;
    if (hasUpgrade("advanced_tool_set")) return 3;
    if (hasUpgrade("socket_set")) return 1;
    return 0;
  }

  function rollRandomEvent() {
    if (Math.random() > 0.2) return null;
    return { ...pickRandom(RANDOM_EVENTS) };
  }

  function getAircraftForTier(tier) {
    return AIRCRAFT.find((a) => a.tier === tier) || AIRCRAFT[0];
  }

  function acceptJob(jobId) {
    if (state.currentJob) return;
    const entry = state.jobBoard.find((j) => j.id === jobId);
    if (!entry) return;

    const aircraft = getAircraftForTier(entry.aircraftTier);
    if (entry.aircraftTier >= 2 && !hasUpgrade("advanced_tool_set") && state.mode !== "free") {
      showBanner("Need Advanced Tool Set for this aircraft tier");
      return;
    }
    if (entry.aircraftTier >= 4 && !hasUpgrade("large_hangar_expansion") && state.mode !== "free") {
      showBanner("Need Large Hangar Expansion for midsize jets");
      return;
    }

    closeModals();
    state.currentJob = buildJob(entry, aircraft);
    state.selectedZone = null;
    ui.zoneRow.classList.remove("hidden");
    ui.partsPanel.classList.add("hidden");
    updateHUD();
    renderZoneButtons();

    if (entry.event) {
      showBanner(entry.event.label);
    }
  }

  function buildJob(template, aircraft) {
    const zones = aircraft.tier >= 2 ? ZONES_WITH_AVIONICS : ZONES_BASE;
    const affected = template.affectedZones.filter((z) => zones.includes(z));
    const byZone = {};

    zones.forEach((zone) => {
      const zoneParts = PARTS.filter((p) => p.zones.includes(zone) && aircraft.tier >= p.minTier && aircraft.tier <= p.maxTier)
        .map((p) => ({
          id: p.id,
          name: p.name,
          cost: p.cost,
          zone,
          condition: randInt(zoneIn(affected, zone) ? 35 : 70, 100),
          inspected: false,
          replaced: false,
          ordering: false,
          orderProgress: 0,
          orderEndTime: 0,
        }));
      byZone[zone] = zoneParts;
    });

    const affectedPartsFlat = affected.flatMap((z) => byZone[z] || []);
    const badCount = clamp(randInt(2, 4), 1, Math.max(1, affectedPartsFlat.length));
    shuffle(affectedPartsFlat).slice(0, badCount).forEach((part) => {
      part.condition = randInt(0, 30);
    });

    affected.forEach((z) => {
      (byZone[z] || []).forEach((part) => {
        if (part.condition > 30 && Math.random() < 0.35) {
          part.condition = randInt(31, 60);
        }
      });
    });

    const job = {
      id: `${template.id}_${Date.now()}`,
      template,
      aircraft,
      zones,
      affectedZones: affected,
      partsByZone: byZone,
      event: template.event || null,
      stage: "arriving",
      xOffset: canvas.width / dpr,
      hiddenDamageAdded: false,
      mistakes: 0,
      spentOnParts: 0,
      autoDoneZone: null,
    };

    if (hasUpgrade("hire_assistant") || state.mode === "free") {
      const zone = chooseAssistantZone(job);
      if (zone) {
        autoFixZone(job, zone);
        job.autoDoneZone = zone;
      }
    }

    if (job.event && job.event.type === "parts_delay") {
      const badParts = getBadParts(job);
      shuffle(badParts).slice(0, 3).forEach((p) => {
        p.forceDelay = 8;
      });
    }

    return job;
  }

  function zoneIn(list, zone) {
    return list.indexOf(zone) !== -1;
  }

  function chooseAssistantZone(job) {
    const zoneScores = job.affectedZones.map((z) => ({
      z,
      bad: (job.partsByZone[z] || []).filter((p) => p.condition <= 30).length,
      total: (job.partsByZone[z] || []).length,
    })).filter((v) => v.total > 0);

    if (!zoneScores.length) return null;
    zoneScores.sort((a, b) => (a.bad - b.bad) || (a.total - b.total));
    return zoneScores[0].z;
  }

  function autoFixZone(job, zone) {
    (job.partsByZone[zone] || []).forEach((p) => {
      if (p.condition <= 60) {
        p.condition = 100;
        p.inspected = true;
        p.replaced = true;
      }
    });
  }

  function getBadParts(job) {
    const out = [];
    job.affectedZones.forEach((z) => {
      (job.partsByZone[z] || []).forEach((p) => {
        if (p.condition <= 30) out.push(p);
      });
    });
    return out;
  }

  function renderJobBoard() {
    ui.jobList.innerHTML = "";
    if (!state.jobBoard.length) {
      const empty = document.createElement("div");
      empty.className = "job-card";
      empty.textContent = "No jobs available yet.";
      ui.jobList.appendChild(empty);
      return;
    }

    state.jobBoard.forEach((job) => {
      const aircraft = getAircraftForTier(job.aircraftTier);
      const card = document.createElement("div");
      card.className = "job-card";

      const top = document.createElement("div");
      top.className = "job-card-top";
      top.innerHTML = `<div class="job-title">${job.name}</div><div class="job-pay">${fmtMoney(job.basePay)}</div>`;

      const mid = document.createElement("div");
      mid.className = "job-card-mid";
      mid.innerHTML = `<span class="job-aircraft">${aircraft.name}</span><span class="job-zones">${job.affectedZones.join(", ")}</span><span class="job-diff diff-${job.difficulty}">D${job.difficulty}</span>`;

      if (job.event) {
        const tag = document.createElement("span");
        tag.className = "job-event-tag";
        tag.textContent = job.event.type === "premium" ? "PREMIUM" : job.event.type === "rush" ? "RUSH" : "EVENT";
        mid.appendChild(tag);
      }

      const desc = document.createElement("div");
      desc.className = "job-desc";
      desc.textContent = job.description;

      const btn = document.createElement("button");
      btn.className = "btn btn-primary";
      btn.textContent = "Accept Job";
      btn.addEventListener("click", () => acceptJob(job.id));

      card.appendChild(top);
      card.appendChild(mid);
      card.appendChild(desc);
      card.appendChild(btn);
      ui.jobList.appendChild(card);
    });
  }

  function renderUpgrades() {
    ui.upgradeBalanceVal.textContent = fmtMoney(state.money);
    ui.upgradeList.innerHTML = "";

    UPGRADES.forEach((u) => {
      const owned = hasUpgrade(u.id);
      const affordable = state.money >= u.cost;
      const card = document.createElement("div");
      card.className = `upgrade-card ${owned ? "owned" : ""} ${!owned && !affordable ? "locked" : ""}`;

      const icon = document.createElement("div");
      icon.className = "upgrade-icon";
      icon.textContent = u.icon;

      const info = document.createElement("div");
      info.className = "upgrade-info";
      info.innerHTML = `<div class="upgrade-name">${u.name}</div><div class="upgrade-desc">${u.desc}</div><div class="upgrade-cost">${owned ? "Owned" : fmtMoney(u.cost)}</div>`;

      const btn = document.createElement("button");
      btn.className = owned ? "btn btn-outline" : "btn btn-yellow";
      btn.textContent = owned ? "Owned" : "Buy";
      btn.disabled = owned || (!affordable && !u.alwaysOwned);
      btn.addEventListener("click", () => buyUpgrade(u.id));

      card.appendChild(icon);
      card.appendChild(info);
      card.appendChild(btn);
      ui.upgradeList.appendChild(card);
    });
  }

  function renderEquipment() {
    ui.equipmentIcons.innerHTML = "";
    UPGRADES.forEach((u) => {
      const box = document.createElement("div");
      box.className = `equip-icon ${hasUpgrade(u.id) ? "owned" : ""}`;
      box.innerHTML = `<div class="equip-emoji">${u.icon}</div><div class="equip-name">${u.name}</div>`;
      ui.equipmentIcons.appendChild(box);
    });
  }

  function buyUpgrade(id) {
    const u = UPGRADES.find((x) => x.id === id);
    if (!u || hasUpgrade(id)) return;
    if (state.money < u.cost && !u.alwaysOwned) return;

    state.money -= u.cost;
    state.totalSpent += u.cost;
    state.ownedUpgrades.push(id);
    renderEquipment();
    renderUpgrades();
    updateHUD();
    showBanner(`Purchased ${u.name}`);
    saveGame();
  }

  function getCurrentZones() {
    if (!state.currentJob) return [];
    return state.currentJob.aircraft.tier >= 2 ? ZONES_WITH_AVIONICS : ZONES_BASE;
  }

  function inspectSelectedZone() {
    const job = state.currentJob;
    if (!job || !state.selectedZone) return;
    const list = job.partsByZone[state.selectedZone] || [];

    list.forEach((p, i) => {
      setTimeout(() => {
        p.inspected = true;
        renderPartsPanel();
        renderZoneButtons();
      }, i * 55);
    });

    if (job.event && job.event.type === "hidden_damage" && !job.hiddenDamageAdded) {
      setTimeout(() => {
        const zone = pickRandom(job.affectedZones);
        const target = pickRandom(job.partsByZone[zone] || []);
        if (target) {
          target.condition = randInt(0, 20);
          target.inspected = true;
          job.hiddenDamageAdded = true;
          showBanner("Hidden damage discovered (+$200 bonus)");
          renderPartsPanel();
          renderZoneButtons();
        }
      }, 700);
    }
  }

  function replacePart(zone, partId) {
    const job = state.currentJob;
    if (!job) return;

    const part = (job.partsByZone[zone] || []).find((p) => p.id === partId);
    if (!part || part.ordering) return;

    if (!part.inspected) {
      showBanner("Inspect this zone first");
      return;
    }

    const premium = job.event && job.event.type === "premium";
    const needsReplace = part.condition <= 30 || (premium && part.condition <= 60);

    if (!needsReplace) {
      state.dayMistakes += 1;
      job.mistakes += 1;
      showBanner("Unneeded replacement. Payout penalty applied.");
    }

    if (state.money < part.cost) {
      showBanner("Not enough cash to order part");
      return;
    }

    const instant = shouldPartBeInstant(part, job);

    state.money -= part.cost;
    state.totalSpent += part.cost;
    job.spentOnParts += part.cost;
    updateHUD();

    if (instant) {
      completeReplacement(part);
    } else {
      part.ordering = true;
      part.orderProgress = 0;
      const delay = part.forceDelay ? part.forceDelay * 1000 : 3000;
      part.orderEndTime = performance.now() + delay;
    }

    renderPartsPanel();
    renderZoneButtons();
  }

  function shouldPartBeInstant(part, job) {
    if (job.event && job.event.type === "parts_delay" && part.forceDelay) return false;
    if (hasUpgrade("parts_shelf") || state.mode === "free") return true;
    if (hasUpgrade("parts_inventory_pro") && part.cost < 500) return true;
    return false;
  }

  function completeReplacement(part) {
    part.ordering = false;
    part.orderProgress = 1;
    part.condition = 100;
    part.replaced = true;
    part.inspected = true;
    state.partsReplaced += 1;
  }

  function tickPartOrders(now) {
    const job = state.currentJob;
    if (!job) return;

    Object.values(job.partsByZone).forEach((list) => {
      list.forEach((part) => {
        if (!part.ordering) return;
        const total = (part.forceDelay ? part.forceDelay * 1000 : 3000);
        const remaining = Math.max(0, part.orderEndTime - now);
        part.orderProgress = clamp(1 - remaining / total, 0, 1);
        if (remaining <= 0) completeReplacement(part);
      });
    });
  }

  function renderPartsPanel() {
    const job = state.currentJob;
    if (!job || !state.selectedZone) {
      ui.partsList.innerHTML = "";
      return;
    }

    const premium = job.event && job.event.type === "premium";
    const list = job.partsByZone[state.selectedZone] || [];
    ui.partsList.innerHTML = "";

    list.forEach((part) => {
      const row = document.createElement("div");
      const qualityClass = !part.inspected ? "part-unknown" : part.condition <= 30 ? "part-bad" : part.condition <= 60 ? "part-worn" : "part-good";
      row.className = `part-row ${qualityClass}`;

      const condText = !part.inspected ? "Unknown" : `${part.condition}%`;
      const status = !part.inspected ? "NOT INSPECTED"
        : part.condition <= 30 ? "BAD"
          : part.condition <= 60 ? "WORN"
            : part.replaced ? "NEW" : "GOOD";

      const condFillClass = !part.inspected ? "cond-unknown"
        : part.replaced ? "cond-new"
          : part.condition <= 30 ? "cond-bad"
            : part.condition <= 60 ? "cond-worn" : "cond-good";

      row.innerHTML = `
        <div class="part-row-top">
          <div class="part-name">${part.name}</div>
          <div class="part-cost">${fmtMoney(part.cost)}</div>
        </div>
        <div class="part-condition-bar">
          <div class="part-condition-fill ${condFillClass}" style="width:${part.inspected ? part.condition : 100}%"></div>
        </div>
        <div class="part-row-bottom">
          <div class="part-status status-${status.toLowerCase().replace(/\s+/g, "-")}">${status} ${part.inspected ? `(${condText})` : ""}</div>
          <div></div>
        </div>
      `;

      const actionHost = row.querySelector(".part-row-bottom div:last-child");
      const needsReplace = part.inspected && (part.condition <= 30 || (premium && part.condition <= 60));

      if (part.ordering) {
        const b = document.createElement("button");
        b.className = "part-action-btn btn-ordering";
        b.textContent = "ORDERING...";
        b.disabled = true;
        actionHost.appendChild(b);

        const progress = document.createElement("div");
        progress.className = "order-progress";
        progress.innerHTML = `<div class="order-progress-fill" style="width:${Math.round(part.orderProgress * 100)}%"></div>`;
        row.appendChild(progress);
      } else {
        const b = document.createElement("button");
        b.className = `part-action-btn ${needsReplace ? "btn-replace" : ""}`;
        b.textContent = part.replaced ? "INSTALLED" : "Remove & Replace";
        b.disabled = part.replaced || !part.inspected;
        b.addEventListener("click", () => replacePart(state.selectedZone, part.id));
        actionHost.appendChild(b);
      }

      ui.partsList.appendChild(row);
    });

    const pay = computePayoutEstimate();
    ui.completePay.textContent = Math.round(pay);

    const canFinish = canCompleteJob();
    ui.btnCompleteJob.classList.toggle("hidden", !canFinish);
  }

  function zoneStatus(zone) {
    const job = state.currentJob;
    if (!job) return "none";
    const list = job.partsByZone[zone] || [];
    if (!list.length) return "none";

    const premium = job.event && job.event.type === "premium";
    let hasBad = false;
    let hasWorn = false;
    let allDone = true;

    list.forEach((p) => {
      if (!p.inspected) allDone = false;
      if (p.condition <= 30 && !p.replaced) {
        hasBad = true;
        allDone = false;
      }
      if (p.condition <= 60 && !p.replaced) {
        hasWorn = true;
        if (premium) allDone = false;
      }
    });

    if (hasBad) return "bad";
    if (hasWorn) return premium ? "bad" : "worn";
    return allDone ? "good" : "worn";
  }

  function renderZoneButtons() {
    const zones = getCurrentZones();

    ui.zoneBtnAvionics.classList.toggle("hidden", !zones.includes("avionics"));

    ui.zoneButtons.forEach((btn) => {
      const zone = btn.dataset.zone;
      btn.classList.remove("active", "has-bad", "has-worn", "all-good", "not-in-job");

      if (!zones.includes(zone) || !state.currentJob) {
        btn.classList.add("not-in-job");
        return;
      }

      if (state.selectedZone === zone) btn.classList.add("active");
      const st = zoneStatus(zone);
      if (st === "bad") btn.classList.add("has-bad");
      else if (st === "worn") btn.classList.add("has-worn");
      else if (st === "good") btn.classList.add("all-good");
    });
  }

  function canCompleteJob() {
    const job = state.currentJob;
    if (!job || job.stage !== "parked") return false;

    const premium = job.event && job.event.type === "premium";
    for (const zone of job.affectedZones) {
      const list = job.partsByZone[zone] || [];
      for (const p of list) {
        if (!p.inspected) return false;
        if (p.condition <= 30 && !p.replaced) return false;
        if (premium && p.condition <= 60 && !p.replaced) return false;
      }
    }

    return true;
  }

  function computePayoutEstimate() {
    const job = state.currentJob;
    if (!job) return 0;

    let pay = job.template.basePay;

    if (job.event) pay *= job.event.mult || 1;
    if (hasUpgrade("second_tool_chest") || state.mode === "free") pay *= 1.15;
    if (hasUpgrade("paint_detail_bay") || state.mode === "free") pay *= 1.1;

    if (job.event && job.event.type === "hidden_damage" && job.hiddenDamageAdded) pay += 200;

    const mistakePenalty = job.mistakes * 120;
    pay -= mistakePenalty;
    return Math.max(100, Math.round(pay));
  }

  function completeCurrentJob() {
    if (!canCompleteJob()) return;
    const job = state.currentJob;

    const payout = computePayoutEstimate();
    state.money += payout;
    state.totalEarned += payout;
    state.rep += clamp(Math.round(job.template.difficulty * 1.5 - job.mistakes), 0, 5);
    state.jobsCompleted += 1;
    state.dayJobsDone += 1;

    if (state.mode === "rush") {
      state.rushJobsCompleted += 1;
    }
    if (job.aircraft.tier >= 3) {
      state.jetJobsCompleted += 1;
    }

    const breakdown = [
      ["Base Pay", fmtMoney(job.template.basePay)],
      ["Event", job.event ? job.event.label : "None"],
      ["Parts Cost", `-${fmtMoney(job.spentOnParts)}`],
      ["Mistake Penalty", `-${fmtMoney(job.mistakes * 120)}`],
    ];

    ui.jcBreakdown.innerHTML = "";
    breakdown.forEach(([k, v]) => {
      const line = document.createElement("div");
      line.className = "jc-line";
      line.innerHTML = `<span>${k}</span><span>${v}</span>`;
      ui.jcBreakdown.appendChild(line);
    });

    ui.jcTitle.textContent = `✔ JOB COMPLETE - ${job.template.name}`;
    ui.jcTotal.textContent = `Payout: ${fmtMoney(payout)}`;
    ui.jobCompletePopup.classList.remove("hidden");

    state.currentJob.stage = "departing";
    closePartsPanel();

    if (state.mode === "career" && state.dayJobsDone >= 5 && state.dayMistakes === 0) {
      state.perfectDays += 1;
    }

    checkAchievements();
    updateHUD();
    saveGame();
  }

  function maybeTriggerDayEnd() {
    if (state.mode === "career" && state.dayJobsDone >= 5) {
      showDayEnd();
      return;
    }
    if (!state.currentJob) {
      refreshBoard();
    }
  }

  function showDayEnd() {
    const bonus = 50 * state.day;
    state.money += bonus;
    state.totalEarned += bonus;

    ui.dayEndNum.textContent = state.day;
    ui.nextDayNum.textContent = state.day + 1;
    ui.dayEndStats.innerHTML = "";

    const lines = [
      ["Jobs Completed", String(state.dayJobsDone)],
      ["Mistakes", String(state.dayMistakes)],
      ["Daily Bonus", fmtMoney(bonus)],
    ];

    lines.forEach(([k, v]) => {
      const line = document.createElement("div");
      line.className = "jc-line";
      line.innerHTML = `<span>${k}</span><span>${v}</span>`;
      ui.dayEndStats.appendChild(line);
    });

    ui.dayEndPopup.classList.remove("hidden");
    updateHUD();
    saveGame();
  }

  function startNextDay() {
    ui.dayEndPopup.classList.add("hidden");
    state.day += 1;
    state.dayJobsDone = 0;
    state.dayMistakes = 0;
    state.boardCount = clamp(state.boardCount + 1, 1, 5);
    refreshBoard();
    updateHUD();
  }

  function checkAchievements() {
    ACHIEVEMENTS.forEach((a) => {
      if (state.achievementsUnlocked.includes(a.id)) return;
      if (a.check(state)) {
        state.achievementsUnlocked.push(a.id);
        ui.toastName.textContent = a.name;
        ui.achievementToast.classList.remove("hidden");
        setTimeout(() => ui.achievementToast.classList.add("hidden"), 2200);
      }
    });
  }

  function updateHUD() {
    ui.hudMoney.textContent = fmtMoney(state.money);
    ui.hudDay.textContent = `Day ${state.day}`;
    ui.hudRep.textContent = `⭐ Rep: ${state.rep}`;

    if (!state.currentJob) {
      ui.hudJobName.textContent = "- HANGAR EMPTY -";
      ui.zoneRow.classList.add("hidden");
      return;
    }

    ui.hudJobName.textContent = `${state.currentJob.template.name} | ${state.currentJob.aircraft.name}`;

    if (state.mode === "rush") {
      const t = Math.max(0, Math.round(state.rushSecondsLeft));
      const m = Math.floor(t / 60);
      const s = String(t % 60).padStart(2, "0");
      ui.rushValue.textContent = `${m}:${s}`;
      ui.rushFill.style.width = `${(t / RUSH_TOTAL_SECONDS) * 100}%`;
    }
  }

  function showBanner(text) {
    state.bannerText = text;
    state.eventBannerTimer = 2.4;
    ui.eventBannerText.textContent = text;
    ui.eventBanner.classList.remove("hidden");
  }

  function hideBanner() {
    ui.eventBanner.classList.add("hidden");
  }

  function onCanvasMove(e) {
    if (!state.currentJob || state.currentJob.stage !== "parked") return;
    const p = canvasPoint(e.clientX, e.clientY);
    state.hoveredZone = zoneAtPoint(p.x, p.y);
  }

  function onCanvasClick(e) {
    if (!state.currentJob || state.currentJob.stage !== "parked") return;
    const p = canvasPoint(e.clientX, e.clientY);
    const zone = zoneAtPoint(p.x, p.y);
    if (zone) openZone(zone);
  }

  function onCanvasTouch(e) {
    if (!state.currentJob || state.currentJob.stage !== "parked") return;
    e.preventDefault();
    const t = e.changedTouches[0];
    const p = canvasPoint(t.clientX, t.clientY);
    const zone = zoneAtPoint(p.x, p.y);
    if (zone) openZone(zone);
  }

  function canvasPoint(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * (canvas.width / dpr),
      y: ((clientY - r.top) / r.height) * (canvas.height / dpr),
    };
  }

  function zoneAtPoint(x, y) {
    const zones = getCurrentZones();
    for (const zone of zones) {
      const rect = state.zoneRects[zone];
      if (!rect) continue;
      if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) return zone;
    }
    return null;
  }

  function update(dt, now) {
    if (!ui.gameScreen.classList.contains("active")) return;
    if (state.paused) return;

    autosaveTimer += dt;
    if (autosaveTimer >= 20) {
      autosaveTimer = 0;
      saveGame();
    }

    if (state.mode === "rush") {
      state.rushSecondsLeft -= dt;
      if (state.rushSecondsLeft <= 0) {
        state.rushSecondsLeft = 0;
        setPaused(true);
        showBanner("Rush Day Over");
      }
    }

    if (state.eventBannerTimer > 0) {
      state.eventBannerTimer -= dt;
      if (state.eventBannerTimer <= 0) hideBanner();
    }

    tickPartOrders(now);

    const job = state.currentJob;
    if (job) {
      const w = canvas.width / dpr;
      const centerX = w * 0.52;

      if (job.stage === "arriving") {
        job.xOffset -= 420 * dt;
        if (job.xOffset <= centerX) {
          job.xOffset = centerX;
          job.stage = "parked";
        }
      } else if (job.stage === "departing") {
        job.xOffset -= 480 * dt;
        if (job.xOffset < -500) {
          state.currentJob = null;
          refreshBoard();
        }
      }
    }

    if (state.currentJob && state.selectedZone) {
      renderPartsPanel();
    }

    updateHUD();
  }

  function draw() {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);
    drawHangar(w, h);

    if (!state.currentJob) {
      drawEmptyHangarText(w, h);
      return;
    }

    drawAircraft(state.currentJob, w, h);
    drawZoneOverlays();
  }

  function drawHangar(w, h) {
    // Back wall
    ctx.fillStyle = "#2a2d33";
    ctx.fillRect(0, 0, w, h * 0.55);

    // Open hangar door view
    const expansion = hasUpgrade("large_hangar_expansion") || state.mode === "free";
    const doorW = expansion ? w * 0.56 : w * 0.42;
    const doorH = h * 0.36;
    const doorX = (w - doorW) * 0.5;
    const doorY = h * 0.1;

    ctx.fillStyle = "#5d93be";
    ctx.fillRect(doorX, doorY, doorW, doorH * 0.55);
    ctx.fillStyle = "#596169";
    ctx.fillRect(doorX, doorY + doorH * 0.55, doorW, doorH * 0.45);

    // Door frame
    ctx.strokeStyle = "#4a4f57";
    ctx.lineWidth = 6;
    ctx.strokeRect(doorX, doorY, doorW, doorH);

    // Side walls
    ctx.fillStyle = "#3a3e45";
    ctx.fillRect(0, 0, doorX, h * 0.6);
    ctx.fillRect(doorX + doorW, 0, w - (doorX + doorW), h * 0.6);

    // Ceiling trusses
    ctx.strokeStyle = "#5a606b";
    ctx.lineWidth = 3;
    for (let x = 0; x < w; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x + 40, 60);
      ctx.lineTo(x + 80, 10);
      ctx.stroke();
    }

    // Hanging lights
    for (let i = 0; i < 4; i += 1) {
      const lx = doorX + 30 + i * (doorW - 60) / 3;
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, 42);
      ctx.stroke();

      ctx.fillStyle = "#d7b66b";
      ctx.fillRect(lx - 10, 42, 20, 8);

      const glow = ctx.createRadialGradient(lx, 50, 2, lx, 50, 50);
      glow.addColorStop(0, "rgba(240,192,64,0.22)");
      glow.addColorStop(1, "rgba(240,192,64,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lx, 50, 50, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floor
    ctx.fillStyle = "#262a31";
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    // Bay markings
    ctx.strokeStyle = "#f0c040";
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 8]);
    ctx.strokeRect(w * 0.2, h * 0.62, w * 0.62, h * 0.28);
    ctx.setLineDash([]);

    // Lift pad
    const liftOwned = hasUpgrade("hydraulic_lift") || state.mode === "free";
    ctx.fillStyle = liftOwned ? "#b8a436" : "#58532f";
    ctx.fillRect(w * 0.39, h * 0.74, w * 0.25, h * 0.04);

    // Tool chest 1 always
    drawToolChest(18, h * 0.62, true);

    // Tool chest 2 gray until upgrade
    drawToolChest(18, h * 0.75, hasUpgrade("second_tool_chest") || state.mode === "free");

    // Parts shelf right
    drawPartsShelf(w - 90, h * 0.62, hasUpgrade("parts_shelf") || state.mode === "free");

    // Fan/AC unit
    ctx.fillStyle = "#6b727e";
    ctx.fillRect(w - 92, h * 0.2, 66, 36);
    ctx.strokeStyle = "#4a4f57";
    ctx.lineWidth = 2;
    ctx.strokeRect(w - 92, h * 0.2, 66, 36);
    ctx.beginPath();
    ctx.arc(w - 59, h * 0.218, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Oil stains
    ctx.fillStyle = "rgba(12,12,12,0.35)";
    ctx.beginPath();
    ctx.ellipse(w * 0.34, h * 0.85, 34, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.52, h * 0.82, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawToolChest(x, y, owned) {
    ctx.fillStyle = owned ? "#b12d2d" : "#4f3737";
    ctx.fillRect(x, y, 64, 44);
    ctx.fillStyle = owned ? "#d95c5c" : "#6f5a5a";
    ctx.fillRect(x + 4, y + 4, 56, 8);
    ctx.fillStyle = "#252525";
    ctx.fillRect(x + 6, y + 18, 52, 8);
    ctx.fillRect(x + 6, y + 30, 52, 8);
  }

  function drawPartsShelf(x, y, owned) {
    ctx.fillStyle = owned ? "#6f4a2d" : "#4d4239";
    ctx.fillRect(x, y, 70, 70);
    ctx.fillStyle = owned ? "#8f6240" : "#675a50";
    ctx.fillRect(x + 4, y + 10, 62, 6);
    ctx.fillRect(x + 4, y + 30, 62, 6);
    ctx.fillRect(x + 4, y + 50, 62, 6);
  }

  function drawEmptyHangarText(w, h) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(w * 0.32, h * 0.68, w * 0.34, 48);
    ctx.fillStyle = "#d8dce8";
    ctx.font = "bold 16px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("NO AIRCRAFT IN BAY", w * 0.49, h * 0.71 + 18);
    ctx.font = "12px Courier New";
    ctx.fillText("Open Job Board to accept work", w * 0.49, h * 0.71 + 36);
  }

  function drawAircraft(job, w, h) {
    const ac = job.aircraft;
    const cx = job.xOffset;
    const cy = h * 0.73;
    const bodyW = ac.width;
    const bodyH = 46 + ac.tier * 4;

    // Fuselage
    ctx.fillStyle = "#d9dde5";
    ctx.beginPath();
    ctx.moveTo(cx - bodyW * 0.47, cy - bodyH * 0.5);
    ctx.bezierCurveTo(cx - bodyW * 0.58, cy - bodyH * 0.3, cx - bodyW * 0.58, cy + bodyH * 0.3, cx - bodyW * 0.47, cy + bodyH * 0.5);
    ctx.lineTo(cx + bodyW * 0.4, cy + bodyH * 0.5);
    ctx.bezierCurveTo(cx + bodyW * 0.56, cy + bodyH * 0.35, cx + bodyW * 0.56, cy - bodyH * 0.35, cx + bodyW * 0.4, cy - bodyH * 0.5);
    ctx.closePath();
    ctx.fill();

    // Stripe
    ctx.fillStyle = ac.stripe;
    ctx.fillRect(cx - bodyW * 0.44, cy - 4, bodyW * 0.8, 6);

    // Windows
    ctx.fillStyle = "#7ea3c2";
    const winCount = ac.windows;
    for (let i = 0; i < winCount; i += 1) {
      const wx = cx - bodyW * 0.28 + i * (bodyW * 0.52 / Math.max(1, winCount - 1));
      ctx.fillRect(wx, cy - bodyH * 0.34, 12, 7);
    }

    drawWings(ac, cx, cy, bodyW, bodyH);
    drawEngines(ac, cx, cy, bodyW, bodyH);
    drawTail(ac, cx, cy, bodyW, bodyH);
    drawGear(ac, cx, cy, bodyW, bodyH, job);

    // Registration
    ctx.fillStyle = "#1f2b39";
    ctx.font = "bold 10px Courier New";
    ctx.textAlign = "left";
    ctx.fillText(`N${6300 + ac.tier * 101}HH`, cx + bodyW * 0.1, cy + 16);

    state.zoneRects = buildZoneRects(cx, cy, bodyW, bodyH, ac.tier >= 2);
    drawDamageIndicators(job, cx, cy, bodyW, bodyH);
  }

  function drawWings(ac, cx, cy, bodyW, bodyH) {
    ctx.fillStyle = "#c5cad3";
    if (ac.wingType === "high") {
      ctx.fillRect(cx - bodyW * 0.08, cy - bodyH * 0.72, bodyW * 0.45, 11);
    } else if (ac.wingType === "low") {
      ctx.fillRect(cx - bodyW * 0.08, cy + bodyH * 0.42, bodyW * 0.45, 11);
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - bodyW * 0.03, cy + bodyH * 0.36);
      ctx.lineTo(cx + bodyW * 0.4, cy + bodyH * 0.22);
      ctx.lineTo(cx + bodyW * 0.38, cy + bodyH * 0.34);
      ctx.lineTo(cx + bodyW * 0.02, cy + bodyH * 0.46);
      ctx.closePath();
      ctx.fill();

      if (ac.wingType === "swept_winglet") {
        ctx.fillRect(cx + bodyW * 0.39, cy + bodyH * 0.17, 4, 18);
      }
    }
  }

  function drawEngines(ac, cx, cy, bodyW, bodyH) {
    ctx.fillStyle = "#b7bdc8";

    if (ac.engines === "single_prop") {
      const ex = cx - bodyW * 0.54;
      ctx.fillRect(ex, cy - 14, 26, 28);
      ctx.strokeStyle = "#9da6b5";
      ctx.beginPath();
      ctx.moveTo(ex - 12, cy);
      ctx.lineTo(ex + 24, cy);
      ctx.stroke();
    }

    if (ac.engines === "twin_prop" || ac.engines === "twin_turboprop") {
      const wy = ac.wingType === "high" ? cy - bodyH * 0.64 : cy + bodyH * 0.52;
      const ex1 = cx - bodyW * 0.05;
      const ex2 = cx + bodyW * 0.2;
      [ex1, ex2].forEach((ex) => {
        ctx.fillRect(ex, wy, 22, 16);
        ctx.strokeStyle = "#8f98a8";
        ctx.beginPath();
        ctx.moveTo(ex - 8, wy + 8);
        ctx.lineTo(ex + 24, wy + 8);
        ctx.stroke();
      });
    }

    if (ac.engines === "rear_jet" || ac.engines === "rear_jet_big") {
      const sz = ac.engines === "rear_jet_big" ? 30 : 24;
      ctx.fillRect(cx + bodyW * 0.22, cy - bodyH * 0.55, sz, 15);
      ctx.fillRect(cx + bodyW * 0.22, cy + bodyH * 0.4, sz, 15);
    }
  }

  function drawTail(ac, cx, cy, bodyW, bodyH) {
    ctx.fillStyle = "#bec5d0";
    // Vertical
    ctx.fillRect(cx + bodyW * 0.35, cy - bodyH * 0.75, 18, 46);

    // Horizontal/T tail
    if (ac.tailType === "t") {
      ctx.fillRect(cx + bodyW * 0.3, cy - bodyH * 0.75, 40, 8);
    } else {
      ctx.fillRect(cx + bodyW * 0.3, cy - bodyH * 0.46, 34, 8);
    }
  }

  function drawGear(ac, cx, cy, bodyW, bodyH, job) {
    const badGear = zoneHasBad(job, "gear");

    ctx.fillStyle = "#4b4f55";
    ctx.fillRect(cx - bodyW * 0.24, cy + bodyH * 0.5, 8, 14);
    ctx.fillRect(cx + bodyW * 0.12, cy + bodyH * 0.5, 8, 14);

    ctx.fillStyle = badGear ? "#2f2f2f" : "#1e1e1e";
    if (badGear) {
      ctx.beginPath();
      ctx.ellipse(cx - bodyW * 0.2, cy + bodyH * 0.64, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + bodyW * 0.16, cy + bodyH * 0.64, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(cx - bodyW * 0.2, cy + bodyH * 0.64, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + bodyW * 0.16, cy + bodyH * 0.64, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function buildZoneRects(cx, cy, bodyW, bodyH, hasAvionics) {
    const map = {
      engine: { x: cx - bodyW * 0.56, y: cy - bodyH * 0.42, w: bodyW * 0.2, h: bodyH * 0.84 },
      cockpit: { x: cx - bodyW * 0.3, y: cy - bodyH * 0.5, w: bodyW * 0.25, h: bodyH * 0.44 },
      gear: { x: cx - bodyW * 0.26, y: cy + bodyH * 0.42, w: bodyW * 0.5, h: bodyH * 0.38 },
      wings: { x: cx - bodyW * 0.08, y: cy - bodyH * 0.7, w: bodyW * 0.5, h: bodyH * 1.4 },
      tail: { x: cx + bodyW * 0.26, y: cy - bodyH * 0.78, w: bodyW * 0.24, h: bodyH * 1.2 },
    };

    if (hasAvionics) {
      map.avionics = { x: cx - bodyW * 0.02, y: cy - bodyH * 0.4, w: bodyW * 0.24, h: bodyH * 0.4 };
    }
    return map;
  }

  function drawZoneOverlays() {
    const job = state.currentJob;
    if (!job || job.stage !== "parked") return;

    const zones = getCurrentZones();
    zones.forEach((zone) => {
      const rect = state.zoneRects[zone];
      if (!rect) return;

      const hovered = state.hoveredZone === zone || state.selectedZone === zone;
      const status = zoneStatus(zone);
      const fill = status === "bad" ? "rgba(216,64,64,0.20)"
        : status === "worn" ? "rgba(208,120,32,0.18)"
          : "rgba(64,176,96,0.16)";

      ctx.fillStyle = hovered ? fill : "rgba(74,143,200,0.10)";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = hovered ? "rgba(240,192,64,0.9)" : "rgba(74,143,200,0.5)";
      ctx.lineWidth = hovered ? 2.5 : 1.2;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    });
  }

  function zoneHasBad(job, zone) {
    if (!job) return false;
    const premium = job.event && job.event.type === "premium";
    return (job.partsByZone[zone] || []).some((p) => p.inspected && (p.condition <= 30 || (premium && p.condition <= 60)) && !p.replaced);
  }

  function drawDamageIndicators(job, cx, cy, bodyW, bodyH) {
    if (zoneHasBad(job, "engine")) {
      ctx.fillStyle = "rgba(20,20,20,0.5)";
      ctx.beginPath();
      ctx.ellipse(cx - bodyW * 0.47, cy + bodyH * 0.74, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (zoneHasBad(job, "wings")) {
      ctx.fillStyle = "#d84040";
      ctx.fillRect(cx + bodyW * 0.39, cy - bodyH * 0.12, 6, 18);
    }
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(400, Math.floor(rect.width * dpr));
    canvas.height = Math.max(240, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function saveGame() {
    if (!state.mode) return;

    const safe = {
      mode: state.mode,
      money: state.money,
      day: state.day,
      rep: state.rep,
      jobsCompleted: state.jobsCompleted,
      totalEarned: state.totalEarned,
      totalSpent: state.totalSpent,
      partsReplaced: state.partsReplaced,
      rushJobsCompleted: state.rushJobsCompleted,
      jetJobsCompleted: state.jetJobsCompleted,
      perfectDays: state.perfectDays,
      dayJobsDone: state.dayJobsDone,
      dayMistakes: state.dayMistakes,
      rushSecondsLeft: state.rushSecondsLeft,
      boardCount: state.boardCount,
      achievementsUnlocked: state.achievementsUnlocked,
      ownedUpgrades: state.ownedUpgrades,
      jobBoard: state.jobBoard,
      currentJob: state.currentJob,
      adsHook: state.adsHook,
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(safe));
  }

  function loadGame(fromButton = false) {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      if (fromButton) showBanner("No save found");
      return;
    }

    try {
      const data = JSON.parse(raw);
      defaultState(data.mode || "career");
      Object.assign(state, data);

      ui.titleScreen.classList.remove("active");
      ui.gameScreen.classList.add("active");
      ui.rushBar.classList.toggle("hidden", state.mode !== "rush");
      renderEquipment();
      updateHUD();
      renderZoneButtons();
      showBanner("Save loaded");
    } catch (err) {
      console.error(err);
      if (fromButton) showBanner("Save data corrupted");
    }
  }

  function gameLoop(ts) {
    if (!lastTs) lastTs = ts;
    const dt = clamp((ts - lastTs) / 1000, 0, 0.05);
    lastTs = ts;

    update(dt, ts);
    draw();

    requestAnimationFrame(gameLoop);
  }

  function setup() {
    initDom();
    bindEvents();
    resizeCanvas();

    if (!localStorage.getItem(SAVE_KEY)) {
      ui.btnLoadGame.disabled = true;
      ui.btnLoadGame.textContent = "💾 NO SAVE YET";
    }

    requestAnimationFrame(gameLoop);
  }

  setup();
})();
