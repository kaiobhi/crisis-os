import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Droplet, UtensilsCrossed, HeartPulse, LifeBuoy, Home as HomeIcon, Car,
  HelpCircle, CheckCircle2, AlertTriangle, PhoneCall, MapPin, Navigation,
  Radio, Users, ShieldAlert, Flame, Waves, Activity, Wind, ChevronRight,
  ArrowLeft, FileWarning, Wrench, Stethoscope, Package, Satellite, WifiOff,
  Wifi, Bluetooth, BatteryFull, BatteryMedium, BatteryLow, BatteryWarning,
  Plus, Server, Building2, Cross, Route, Database, RadioTower, Signal,
  CloudOff, Cloud,
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/*  Static reference data                                                  */
/* ---------------------------------------------------------------------- */

const ZONES = [
  { id: "z1", area: "Riverside", zone: "Zone 1", x: 78, y: 96 },
  { id: "z2", area: "Oak Hill", zone: "Zone 2", x: 226, y: 58 },
  { id: "z3", area: "Downtown", zone: "Zone 3", x: 196, y: 168 },
  { id: "z4", area: "Mill Creek", zone: "Zone 4", x: 322, y: 118 },
  { id: "z5", area: "Harbor", zone: "Zone 5", x: 300, y: 236 },
  { id: "z6", area: "Greenwood", zone: "Zone 6", x: 96, y: 226 },
];

const NEED_META = {
  water: { label: "Water", Icon: Droplet, weight: 2, color: "var(--c-water)" },
  food: { label: "Food", Icon: UtensilsCrossed, weight: 1, color: "var(--c-water)" },
  medical: { label: "Medical", Icon: HeartPulse, weight: 3, color: "var(--c-danger)" },
  evacuation: { label: "Evacuation", Icon: LifeBuoy, weight: 3, color: "var(--c-danger)" },
  shelter: { label: "Shelter", Icon: HomeIcon, weight: 2, color: "var(--c-amber)" },
  transport: { label: "Transport", Icon: Car, weight: 1, color: "var(--c-water)" },
  other: { label: "Other", Icon: HelpCircle, weight: 1, color: "var(--c-grey)" },
};
const NEED_ORDER = ["water", "food", "medical", "evacuation", "shelter", "transport", "other"];
const TAG_OPTIONS = ["Trapped", "Injured", "With children", "Elderly present", "No power"];

const BASELINE_COUNTS = { safe: 96, unreachable: 8, evacuated: 14 };

const DISASTER_META = {
  flood: { label: "Flood", Icon: Waves, color: "var(--c-water)", banner: "River Flood Warning", sub: "Zone 3", region: "Riverside County · River Flood Response" },
  fire: { label: "Wildfire", Icon: Flame, color: "var(--c-danger)", banner: "Wildfire Warning", sub: "Ridgeline", region: "Ridgeline County · Wildfire Response" },
  earthquake: { label: "Earthquake", Icon: Activity, color: "var(--c-amber)", banner: "Aftershock Alert", sub: "Magnitude 5.4", region: "Fault Line District · Earthquake Response" },
  storm: { label: "Storm", Icon: Wind, color: "var(--c-evac)", banner: "Severe Storm Warning", sub: "Category 2", region: "Coastal County · Storm Response" },
};
const DISASTER_ORDER = ["flood", "fire", "earthquake", "storm"];
const SITUATIONS = ["Inside a building", "In a vehicle", "Outdoors"];

const ACTION_STEPS = {
  flood: {
    "Inside a building": ["Move to the highest level of the building now.", "Shut off electricity and gas if the switches are safe to reach.", "Take the stairs — never an elevator.", "Signal from a window or roof if water keeps rising."],
    "In a vehicle": ["Abandon the vehicle if water is rising around it.", "Never drive through moving water, even if it looks shallow.", "Move to higher ground on foot.", "Leave doors unlocked in case you need to exit fast."],
    "Outdoors": ["Get to higher ground immediately.", "Stay away from moving water — 15cm can knock you down.", "Avoid bridges over fast-moving water.", "Move away from power lines that may be down."],
  },
  fire: {
    "Inside a building": ["Get low — stay under smoke as you move.", "Feel doors before opening; if hot, use another way out.", "Get out and stay out. Don't go back for belongings.", "Call for help from outside once you're clear."],
    "In a vehicle": ["Close windows and vents; turn on headlights.", "Drive away from the fire, not through smoke.", "If trapped, park clear of vegetation and stay in the vehicle.", "Cover yourself with a blanket below window level."],
    "Outdoors": ["Move uphill and away from the direction of the wind.", "Avoid canyons and dense brush — they burn fast.", "Head toward a cleared area, road, or body of water.", "Cover your nose and mouth with cloth."],
  },
  earthquake: {
    "Inside a building": ["Drop, cover, and hold on under sturdy furniture.", "Stay away from windows and anything that can fall.", "Do not run outside during shaking.", "After shaking stops, check for gas leaks before using switches."],
    "In a vehicle": ["Pull over away from bridges, overpasses, and power lines.", "Stay inside the vehicle with your seatbelt on.", "Set the parking brake and wait for shaking to stop.", "Watch for road damage before continuing."],
    "Outdoors": ["Move to an open area away from buildings and trees.", "Drop and cover your head and neck.", "Stay clear of power lines and anything that can fall.", "Expect aftershocks — stay alert once shaking stops."],
  },
  storm: {
    "Inside a building": ["Move to an interior room away from windows.", "Get to the lowest floor if high winds are expected.", "Unplug sensitive electronics.", "Keep a flashlight ready — avoid candles."],
    "In a vehicle": ["Pull over safely and avoid trees or power lines above you.", "Stay in the vehicle with seatbelt fastened.", "Turn on hazard lights so others can see you.", "Wait until conditions clearly improve before driving on."],
    "Outdoors": ["Get inside a sturdy building immediately.", "Avoid open fields, hilltops, and isolated trees.", "Stay away from metal objects and water.", "If caught in the open, crouch low with feet together."],
  },
};

const RECOVERY_ITEMS = [
  { id: "docs", label: "Missing documents", Icon: FileWarning, status: "Not started" },
  { id: "shelter", label: "Temporary shelter", Icon: HomeIcon, status: "In progress" },
  { id: "medical", label: "Medical follow-up", Icon: Stethoscope, status: "Not started" },
  { id: "food", label: "Food & water", Icon: Package, status: "Resolved" },
  { id: "repairs", label: "Home repairs", Icon: Wrench, status: "Not started" },
  { id: "assistance", label: "Assistance request", Icon: HelpCircle, status: "In progress" },
];

const CONTACTS = [
  { id: "c1", name: "Emergency Dispatch", role: "Call first for life-threatening danger", urgent: true },
  { id: "c2", name: "Community Relief Line", role: "Shelter, water, and supply drop info" },
  { id: "c3", name: "Utility Outage Line", role: "Report downed lines or gas smell" },
];

const HOUSEHOLD = [
  { id: "h1", name: "Mom", status: "safe" },
  { id: "h2", name: "Dad", status: "safe" },
  { id: "h3", name: "Jordan", status: "help" },
];

const STATUS_CYCLE = ["Not started", "In progress", "Resolved"];

const CACHED_SHELTERS = [
  { id: "s1", name: "Lincoln High Gymnasium", zone: "Zone 2", detail: "Capacity ~300 · pet-friendly wing" },
  { id: "s2", name: "Downtown Community Center", zone: "Zone 3", detail: "Capacity ~180 · generator power" },
  { id: "s3", name: "Greenwood Fire Station 12", zone: "Zone 6", detail: "Overflow only · check in first" },
];
const CACHED_HOSPITALS = [
  { id: "h1", name: "Riverside General", zone: "Zone 1", detail: "Emergency dept · trauma capable" },
  { id: "h2", name: "Mill Creek Urgent Care", zone: "Zone 4", detail: "Non-critical only, no trauma" },
];
const CACHED_ROUTES = [
  { id: "r1", name: "Route 9 North", zone: "Zone 3 → Zone 2", detail: "Primary evacuation corridor" },
  { id: "r2", name: "Harbor Bridge Bypass", zone: "Zone 5 → Zone 4", detail: "Use if Harbor Rd is flooded" },
];
const CACHED_RELIEF = [
  { id: "rc1", name: "Oak Hill Relief Depot", zone: "Zone 2", detail: "Water, MREs, first aid" },
  { id: "rc2", name: "Mobile Relief Truck — Zone 5", zone: "Zone 5", detail: "Rotates 9am–4pm daily" },
];

const CONNECTIVITY_LADDER = [
  { id: "internet", label: "Internet / mobile data", Icon: Cloud, desc: "Full sync — reports reach the coordinator instantly." },
  { id: "wifi", label: "Local Wi-Fi / Wi-Fi Direct", Icon: Wifi, desc: "Sync within range of a community hub, no carrier needed." },
  { id: "bluetooth", label: "Bluetooth · nearby devices", Icon: Bluetooth, desc: "Trade reports phone-to-phone as people pass by." },
  { id: "local", label: "Locally stored data", Icon: Database, desc: "Nothing is lost — everything waits safely on your device." },
  { id: "sms", label: "SMS fallback (where supported)", Icon: Signal, desc: "Last-resort text relay for the most critical reports." },
];

/* ---------------------------------------------------------------------- */
/*  Helpers                                                                 */
/* ---------------------------------------------------------------------- */

function useLiveFeed(initial) {
  const [feed, setFeed] = useState(initial);
  const push = (text, tone) => setFeed((f) => [{ id: Math.random().toString(36).slice(2), text, t: "just now", tone: tone || "info" }, ...f].slice(0, 14));
  return [feed, push];
}

function zoneName(id) {
  const z = ZONES.find((z) => z.id === id);
  return z ? `${z.area} — ${z.zone}` : id;
}
function zoneLabel(id) {
  const z = ZONES.find((z) => z.id === id);
  return z ? z.zone : id;
}

function severityFromWeight(w) {
  if (w >= 3) return { label: "Critical", color: "var(--c-danger)" };
  if (w >= 2) return { label: "High", color: "var(--c-amber)" };
  return { label: "Medium", color: "var(--c-water)" };
}

function makeReportId(n) {
  return (0x1000 + (n % 0xEFFF)).toString(16).toUpperCase();
}

const TIME_POOL = ["09:14", "09:52", "10:08", "10:31", "10:47", "11:02", "11:19", "11:34", "11:47", "12:03", "12:15", "12:28"];

function buildInitialReports() {
  const seed = {
    z1: { evacuation: 6, water: 6, food: 1 },
    z2: { water: 9, shelter: 3, food: 2, evacuation: 1, transport: 1 },
    z3: { medical: 3, evacuation: 5, shelter: 2, water: 5, food: 1 },
    z4: { shelter: 4, transport: 2, water: 3, evacuation: 1, food: 1 },
    z5: { medical: 4, evacuation: 3, water: 4, shelter: 1, food: 1, other: 1 },
    z6: { water: 4, food: 3, other: 3, evacuation: 2, shelter: 1, transport: 2 },
  };
  const deliveryCycle = ["received", "received", "relayed", "received", "stored", "received"];
  let i = 0;
  const out = [];
  Object.entries(seed).forEach(([zoneId, needs]) => {
    Object.entries(needs).forEach(([need, count]) => {
      for (let k = 0; k < count; k++) {
        out.push({
          id: makeReportId(i),
          zoneId,
          need,
          weight: NEED_META[need].weight,
          time: TIME_POOL[i % TIME_POOL.length],
          tags: [],
          delivery: deliveryCycle[i % deliveryCycle.length],
          status: "open",
          origin: "other",
        });
        i++;
      }
    });
  });
  return out;
}

function getBatteryTier(pct) {
  if (pct > 50) return { key: "normal", label: "Relay enabled", color: "var(--c-safe)", Icon: BatteryFull, scope: "all", desc: "Normal relay behavior — carrying all nearby reports." };
  if (pct > 20) return { key: "reduced", label: "Reduced relay", color: "var(--c-water)", Icon: BatteryMedium, scope: "priority", desc: "Reduced relay — prioritizing higher-severity reports." };
  if (pct > 5) return { key: "minimal", label: "Minimal relay", color: "var(--c-amber)", Icon: BatteryLow, scope: "critical", desc: "Minimal relay — only critical reports and your own." };
  return { key: "critical", label: "Power saving", color: "var(--c-danger)", Icon: BatteryWarning, scope: "self", desc: "Own emergency data prioritized. Not relaying others." };
}

function isEligibleForRelay(report, tier) {
  if (report.origin === "self") return true;
  if (tier.scope === "all") return true;
  if (tier.scope === "priority") return report.weight >= 2;
  if (tier.scope === "critical") return report.weight >= 3;
  return false; // "self" scope
}

/* ---------------------------------------------------------------------- */
/*  Root component                                                         */
/* ---------------------------------------------------------------------- */

export default function CrisisOS() {
  const [role, setRole] = useState("resident");
  const [disaster, setDisaster] = useState("flood");
  const [reports, setReports] = useState(buildInitialReports);
  const [counts, setCounts] = useState({ ...BASELINE_COUNTS, needAssistance: 24 });
  const [connectivity, setConnectivityRaw] = useState("internet"); // internet | offline
  const [battery, setBattery] = useState(72);
  const [peerFlash, setPeerFlash] = useState(null); // { count, at } transient pulse
  const [feed, pushFeed] = useLiveFeed([
    { id: "f1", text: "New request — Medical, Harbor Zone 5", t: "2m ago", tone: "info" },
    { id: "f2", text: "Riverside Zone 1 evacuation team dispatched", t: "6m ago", tone: "info" },
    { id: "f3", text: "9 residents marked themselves safe", t: "11m ago", tone: "info" },
  ]);
  const [selfStatus, setSelfStatus] = useState(null);
  const flashTimer = useRef(null);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const needsTotals = useMemo(() => {
    const totals = {};
    NEED_ORDER.forEach((n) => (totals[n] = 0));
    reports.forEach((r) => { if (r.delivery === "received") totals[r.need] = (totals[r.need] || 0) + 1; });
    return totals;
  }, [reports]);

  const inTransitTotals = useMemo(() => {
    const stored = reports.filter((r) => r.delivery === "stored").length;
    const relayed = reports.filter((r) => r.delivery === "relayed").length;
    return { stored, relayed };
  }, [reports]);

  const incidents = useMemo(() => {
    return reports
      .filter((r) => r.delivery === "received")
      .map((r) => ({ ...r, sev: severityFromWeight(r.weight) }))
      .sort((a, b) => b.weight - a.weight || (a.time < b.time ? 1 : -1));
  }, [reports]);

  const total = counts.safe + counts.needAssistance + counts.unreachable + counts.evacuated;
  const batteryTier = getBatteryTier(battery);

  function setConnectivity(next) {
    setConnectivityRaw(next);
    if (next === "internet") {
      setReports((rs) => {
        const promoted = rs.filter((r) => r.delivery !== "received").length;
        if (promoted > 0) pushFeed(`${promoted} report${promoted > 1 ? "s" : ""} received through community relay`, "good");
        else pushFeed("Connection restored — all reports already synced", "good");
        return rs.map((r) => (r.delivery !== "received" ? { ...r, delivery: "received" } : r));
      });
    } else {
      pushFeed("Connection lost — entering offline crisis mode", "warn");
    }
  }

  function detectNearbyDevice() {
    const tier = getBatteryTier(battery);
    const eligible = reports.filter((r) => r.delivery === "stored" && isEligibleForRelay(r, tier));
    if (eligible.length === 0) {
      pushFeed("Nearby device detected — nothing eligible to relay right now", "info");
      flashPeer(0);
      return;
    }
    const ids = new Set(eligible.map((r) => r.id));
    setReports((rs) => rs.map((r) => (ids.has(r.id) ? { ...r, delivery: "relayed" } : r)));
    pushFeed(`Nearby device detected — ${eligible.length} report${eligible.length > 1 ? "s" : ""} exchanged`, "good");
    flashPeer(eligible.length);
  }

  function flashPeer(count) {
    clearTimeout(flashTimer.current);
    setPeerFlash({ count, at: Date.now() });
    flashTimer.current = setTimeout(() => setPeerFlash(null), 2600);
  }

  function addReports(needs, zoneId, tags) {
    const delivery = connectivity === "internet" ? "received" : "stored";
    setReports((rs) => {
      const startN = rs.length + Math.floor(Math.random() * 900);
      const fresh = needs.map((need, i) => ({
        id: makeReportId(startN + i),
        zoneId, need, weight: NEED_META[need].weight,
        time: TIME_POOL[TIME_POOL.length - 1],
        tags, delivery, status: "open", origin: "self",
      }));
      return [...fresh, ...rs];
    });
    const first = needs[0];
    if (delivery === "received") {
      pushFeed(`New request — ${NEED_META[first]?.label}${needs.length > 1 ? ` +${needs.length - 1} more` : ""}, ${zoneName(zoneId)} (sent directly)`, "info");
    } else {
      pushFeed(`Request saved on-device — ${NEED_META[first]?.label}${needs.length > 1 ? ` +${needs.length - 1} more` : ""}, ${zoneName(zoneId)}. Waiting for a connection.`, "warn");
    }
  }

  function markSelfSafe() {
    if (selfStatus === "safe") {
      setCounts((c) => ({ ...c, safe: Math.max(0, c.safe - 1) }));
      pushFeed("A resident undid their safe status", "info");
      setSelfStatus(null);
      return;
    }
    setCounts((c) => {
      const next = { ...c };
      if (selfStatus === "help") next.needAssistance = Math.max(0, next.needAssistance - 1);
      next.safe += 1;
      return next;
    });
    pushFeed(connectivity === "internet" ? "A resident marked themselves safe" : "Safe status saved on-device — will sync when connected", connectivity === "internet" ? "info" : "warn");
    setSelfStatus("safe");
  }

  function markSelfNeedsHelp(needs, zoneId, tags) {
    setCounts((c) => {
      const next = { ...c };
      if (selfStatus === "safe") next.safe = Math.max(0, next.safe - 1);
      if (selfStatus !== "help") next.needAssistance += 1;
      return next;
    });
    addReports(needs, zoneId, tags);
    setSelfStatus("help");
  }

  function simulateIncoming() {
    const pool = ["water", "medical", "evacuation", "shelter", "food"];
    const n = 1 + Math.floor(Math.random() * 2);
    const zonesPick = [];
    for (let i = 0; i < n; i++) zonesPick.push(ZONES[Math.floor(Math.random() * ZONES.length)]);
    setReports((rs) => {
      const startN = rs.length + Math.floor(Math.random() * 900);
      const fresh = zonesPick.map((z, i) => {
        const need = pool[Math.floor(Math.random() * pool.length)];
        return {
          id: makeReportId(startN + i), zoneId: z.id, need, weight: NEED_META[need].weight,
          time: TIME_POOL[TIME_POOL.length - 1], tags: [],
          delivery: connectivity === "internet" ? "received" : "stored",
          status: "open", origin: "other",
        };
      });
      return [...fresh, ...rs];
    });
    setCounts((c) => ({ ...c, needAssistance: c.needAssistance + n }));
    pushFeed(`${n} new report${n > 1 ? "s" : ""} appeared on nearby devices`, "info");
  }

  function cycleIncidentStatus(id) {
    setReports((rs) => rs.map((r) => {
      if (r.id !== id) return r;
      const order = ["open", "responding", "resolved"];
      const next = order[(order.indexOf(r.status) + 1) % order.length];
      return { ...r, status: next, delivery: next === "resolved" ? "resolved" : r.delivery };
    }));
  }

  return (
    <div className="ccos-root">
      <GlobalStyle />
      <div className="ccos-demo-bar">
        <div className="ccos-demo-group">
          <span className="ccos-demo-label">Scenario</span>
          <div className="ccos-demo-tabs">
            {DISASTER_ORDER.map((id) => (
              <button key={id} className={`ccos-demo-tab ${disaster === id ? "active" : ""}`} onClick={() => setDisaster(id)}>
                {DISASTER_META[id].label}
              </button>
            ))}
          </div>
        </div>
        <div className="ccos-demo-group">
          <span className="ccos-demo-label">View as</span>
          <div className="ccos-demo-tabs">
            {["resident", "coordinator", "recovery"].map((r) => (
              <button key={r} className={`ccos-demo-tab ${role === r ? "active" : ""}`} onClick={() => setRole(r)}>
                {r === "resident" ? "Resident" : r === "coordinator" ? "Coordinator" : "Recovery"}
              </button>
            ))}
          </div>
        </div>
        <div className="ccos-demo-group">
          <span className="ccos-demo-label">Connectivity</span>
          <div className="ccos-demo-tabs conn">
            <button className={`ccos-demo-tab ${connectivity === "internet" ? "active good" : ""}`} onClick={() => setConnectivity("internet")}>
              <Cloud size={12} /> Internet
            </button>
            <button className={`ccos-demo-tab ${connectivity === "offline" ? "active warn" : ""}`} onClick={() => setConnectivity("offline")}>
              <CloudOff size={12} /> Simulate disaster
            </button>
          </div>
        </div>
        <div className="ccos-demo-group">
          <span className="ccos-demo-label">Battery {battery}%</span>
          <input className="ccos-battery-slider" type="range" min={2} max={100} value={battery} onChange={(e) => setBattery(Number(e.target.value))} />
        </div>
      </div>

      {role === "resident" && (
        <ResidentApp
          disaster={disaster}
          total={total}
          counts={counts}
          needsTotals={needsTotals}
          selfStatus={selfStatus}
          connectivity={connectivity}
          battery={battery}
          batteryTier={batteryTier}
          reports={reports}
          inTransitTotals={inTransitTotals}
          peerFlash={peerFlash}
          onMarkSafe={markSelfSafe}
          onNeedHelp={markSelfNeedsHelp}
          onDetectPeer={detectNearbyDevice}
        />
      )}
      {role === "coordinator" && (
        <CoordinatorApp
          disaster={disaster}
          total={total}
          counts={counts}
          needsTotals={needsTotals}
          incidents={incidents}
          inTransitTotals={inTransitTotals}
          feed={feed}
          connectivity={connectivity}
          battery={battery}
          batteryTier={batteryTier}
          onSimulate={simulateIncoming}
          onCycleStatus={cycleIncidentStatus}
        />
      )}
      {role === "recovery" && <RecoveryApp />}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Resident app (phone frame)                                             */
/* ---------------------------------------------------------------------- */

function ResidentApp({ disaster, total, counts, needsTotals, selfStatus, connectivity, battery, batteryTier, reports, inTransitTotals, peerFlash, onMarkSafe, onNeedHelp, onDetectPeer }) {
  const [screen, setScreen] = useState("home");
  const myReports = useMemo(() => reports.filter((r) => r.origin === "self"), [reports]);

  return (
    <div className="ccos-phone-wrap">
      <div className="ccos-phone">
        <div className="ccos-phone-notch" />
        <div className="ccos-phone-screen">
          {screen === "home" && (
            <HomeScreen disaster={disaster} selfStatus={selfStatus} connectivity={connectivity} battery={battery} batteryTier={batteryTier} onNavigate={setScreen} onMarkSafe={onMarkSafe} />
          )}
          {screen === "needHelp" && (
            <NeedHelpFlow connectivity={connectivity} onBack={() => setScreen("home")} onSubmit={(needs, zone, tags) => { onNeedHelp(needs, zone, tags); setScreen("needHelpDone"); }} />
          )}
          {screen === "needHelpDone" && <NeedHelpDone connectivity={connectivity} onBack={() => setScreen("home")} />}
          {screen === "findSafety" && <FindSafetyFlow presetCrisis={disaster} onBack={() => setScreen("home")} />}
          {screen === "sos" && <SosScreen connectivity={connectivity} onBack={() => setScreen("home")} />}
          {screen === "contacts" && <ContactsScreen connectivity={connectivity} onBack={() => setScreen("home")} />}
          {screen === "network" && (
            <NetworkScreen
              connectivity={connectivity} battery={battery} batteryTier={batteryTier}
              inTransitTotals={inTransitTotals} myReports={myReports} peerFlash={peerFlash}
              onDetectPeer={onDetectPeer} onBack={() => setScreen("home")}
            />
          )}
          {screen === "cached" && <CachedInfoScreen onBack={() => setScreen("home")} />}
          {screen === "community" && (
            <CommunitySnapshot total={total} counts={counts} needsTotals={needsTotals} connectivity={connectivity} onBack={() => setScreen("home")} />
          )}
        </div>
      </div>
      <p className="ccos-phone-caption">Resident app · offline-first · works with no signal</p>
    </div>
  );
}

function ConnectivityStrip({ onNavigate, connectivity, battery, batteryTier }) {
  if (connectivity === "internet") {
    return (
      <button className="ccos-conn-strip good" onClick={() => onNavigate("network")}>
        <Cloud size={16} />
        <div className="ccos-strip-text">
          <strong>Connected</strong>
          <span>Reports sync live · tap for network details</span>
        </div>
        <ChevronRight size={16} />
      </button>
    );
  }
  return (
    <button className="ccos-conn-strip warn" onClick={() => onNavigate("network")}>
      <WifiOff size={16} />
      <div className="ccos-strip-text">
        <strong>OFFLINE MODE</strong>
        <span>Your reports are saved on this device and relay when a connection is found</span>
      </div>
      <ChevronRight size={16} />
    </button>
  );
}

function TopStrip({ onNavigate, disaster }) {
  const meta = DISASTER_META[disaster];
  return (
    <button className="ccos-strip" style={{ "--strip-color": meta.color }} onClick={() => onNavigate("community")}>
      <meta.Icon size={16} />
      <div className="ccos-strip-text">
        <strong>{meta.banner}</strong>
        <span>{meta.sub} · tap for community status</span>
      </div>
      <ChevronRight size={16} />
    </button>
  );
}

function HomeScreen({ disaster, selfStatus, connectivity, battery, batteryTier, onNavigate, onMarkSafe }) {
  return (
    <div className="ccos-screen">
      <TopStrip onNavigate={onNavigate} disaster={disaster} />
      <ConnectivityStrip onNavigate={onNavigate} connectivity={connectivity} battery={battery} batteryTier={batteryTier} />

      <div className="ccos-home-actions">
        <button className={`ccos-big-btn safe ${selfStatus === "safe" ? "confirmed" : ""}`} onClick={onMarkSafe}>
          <CheckCircle2 size={28} />
          <div>
            <div className="ccos-big-btn-title">{selfStatus === "safe" ? "You're marked safe" : "I'm safe"}</div>
            <div className="ccos-big-btn-sub">{selfStatus === "safe" ? "Tap to undo" : "Works offline — saved on this device"}</div>
          </div>
        </button>

        <button className="ccos-big-btn help" onClick={() => onNavigate("needHelp")}>
          <ShieldAlert size={28} />
          <div>
            <div className="ccos-big-btn-title">I need help</div>
            <div className="ccos-big-btn-sub">Report what you need and where you are</div>
          </div>
        </button>

        <button className="ccos-big-btn safety" onClick={() => onNavigate("findSafety")}>
          <Navigation size={28} />
          <div>
            <div className="ccos-big-btn-title">Find safety</div>
            <div className="ccos-big-btn-sub">What to do right now — no connection needed</div>
          </div>
        </button>
      </div>

      <button className="ccos-sos-bar" onClick={() => onNavigate("sos")}>
        <Radio size={20} />
        HOLD FOR SOS
      </button>

      <div className="ccos-link-row-group">
        <button className="ccos-link-row" onClick={() => onNavigate("network")}>
          <RadioTower size={14} /> Network <ChevronRight size={14} />
        </button>
        <button className="ccos-link-row" onClick={() => onNavigate("cached")}>
          <Database size={14} /> Cached info <ChevronRight size={14} />
        </button>
        <button className="ccos-link-row" onClick={() => onNavigate("contacts")}>
          <PhoneCall size={14} /> Emergency contacts <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function CommunitySnapshot({ total, counts, needsTotals, connectivity, onBack }) {
  return (
    <div className="ccos-screen">
      <ScreenHeader title="Community status" onBack={onBack} />
      <p className="ccos-muted-line">{total} people accounted for{connectivity !== "internet" ? " · showing last synced data" : ""}</p>
      <div className="ccos-status-stack">
        <StatusBar label="Safe" value={counts.safe} total={total} color="var(--c-safe)" />
        <StatusBar label="Need assistance" value={counts.needAssistance} total={total} color="var(--c-amber)" />
        <StatusBar label="Unreachable" value={counts.unreachable} total={total} color="var(--c-grey)" />
        <StatusBar label="Evacuated" value={counts.evacuated} total={total} color="var(--c-evac)" />
      </div>
      <p className="ccos-section-title">Current needs received by command center</p>
      <div className="ccos-need-grid-simple">
        {NEED_ORDER.filter((n) => needsTotals[n] > 0).map((n) => {
          const meta = NEED_META[n];
          return (
            <div className="ccos-need-pill" key={n}>
              <meta.Icon size={16} color={meta.color} />
              <span>{meta.label}</span>
              <strong>{needsTotals[n]}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBar({ label, value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="ccos-status-row">
      <div className="ccos-status-row-top">
        <span>{label}</span>
        <strong style={{ color }}>{value}</strong>
      </div>
      <div className="ccos-status-track">
        <div className="ccos-status-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function ScreenHeader({ title, onBack }) {
  return (
    <div className="ccos-screen-header">
      <button className="ccos-back-btn" onClick={onBack}><ArrowLeft size={18} /></button>
      <h2>{title}</h2>
    </div>
  );
}

/* ---- Network / connectivity screen (store-and-forward demo) ---- */

function DeliveryBadge({ state }) {
  const meta = {
    stored: { label: "Stored locally", color: "var(--c-grey)" },
    relayed: { label: "Relayed", color: "var(--c-amber)" },
    received: { label: "Received by coordinator", color: "var(--c-safe)" },
    resolved: { label: "Resolved", color: "var(--c-safe)" },
  }[state];
  return <span className="ccos-delivery-badge" style={{ color: meta.color, borderColor: meta.color }}>{meta.label}</span>;
}

function NetworkScreen({ connectivity, battery, batteryTier, inTransitTotals, myReports, peerFlash, onDetectPeer, onBack }) {
  const activeLadderId = connectivity === "internet" ? "internet" : peerFlash ? "bluetooth" : "local";
  const BatteryIcon = batteryTier.Icon;

  return (
    <div className="ccos-screen">
      <ScreenHeader title="Network" onBack={onBack} />

      <div className="ccos-net-panel">
        <div className="ccos-net-panel-row">
          <BatteryIcon size={18} color={batteryTier.color} />
          <div>
            <strong style={{ color: batteryTier.color }}>{battery}% · {batteryTier.label}</strong>
            <div className="ccos-net-panel-sub">{batteryTier.desc}</div>
          </div>
        </div>
      </div>

      <p className="ccos-section-title">Store-and-forward pipeline</p>
      <div className="ccos-pipeline">
        <div className="ccos-pipeline-stage">
          <div className="ccos-pipeline-dot you"><Satellite size={14} /></div>
          <span>YOU</span>
          <strong>{myReports.length}</strong>
        </div>
        <div className="ccos-pipeline-arrow" />
        <div className={`ccos-pipeline-stage ${peerFlash ? "flash" : ""}`}>
          <div className="ccos-pipeline-dot nearby"><Bluetooth size={14} /></div>
          <span>NEARBY DEVICE</span>
          <strong>{inTransitTotals.stored}</strong>
        </div>
        <div className="ccos-pipeline-arrow" />
        <div className="ccos-pipeline-stage">
          <div className="ccos-pipeline-dot relay"><RadioTower size={14} /></div>
          <span>RELAY</span>
          <strong>{inTransitTotals.relayed}</strong>
        </div>
        <div className="ccos-pipeline-arrow" />
        <div className="ccos-pipeline-stage">
          <div className="ccos-pipeline-dot command"><Server size={14} /></div>
          <span>COMMAND CENTER</span>
          <strong>{myReports.filter((r) => r.delivery === "received" || r.delivery === "resolved").length}</strong>
        </div>
      </div>

      {connectivity !== "internet" ? (
        <button className="ccos-cta secondary" onClick={onDetectPeer}>
          <Bluetooth size={16} /> Check for nearby devices
        </button>
      ) : (
        <div className="ccos-net-note good"><Cloud size={14} /> Internet available — reports sync directly, no relay needed.</div>
      )}
      {peerFlash && (
        <div className="ccos-net-note good">
          <CheckCircle2 size={14} /> {peerFlash.count > 0 ? `Nearby device detected — ${peerFlash.count} report${peerFlash.count > 1 ? "s" : ""} exchanged` : "Nearby device detected — nothing eligible to relay"}
        </div>
      )}

      <p className="ccos-section-title">Connectivity fallback ladder</p>
      <div className="ccos-ladder">
        {CONNECTIVITY_LADDER.map((tier) => (
          <div key={tier.id} className={`ccos-ladder-row ${activeLadderId === tier.id ? "active" : ""}`}>
            <tier.Icon size={15} />
            <div>
              <div className="ccos-ladder-label">{tier.label}</div>
              <div className="ccos-ladder-desc">{tier.desc}</div>
            </div>
            {activeLadderId === tier.id && <span className="ccos-ladder-tag">ACTIVE</span>}
          </div>
        ))}
      </div>

      {myReports.length > 0 && (
        <>
          <p className="ccos-section-title">Your reports</p>
          <div className="ccos-report-list">
            {myReports.map((r) => (
              <div className="ccos-report-card" key={r.id}>
                <div className="ccos-report-card-top">
                  <span className="ccos-report-id">ID {r.id}</span>
                  <DeliveryBadge state={r.delivery} />
                </div>
                <div className="ccos-report-card-body">
                  {NEED_META[r.need].label} · {zoneLabel(r.zoneId)} · {r.time}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="ccos-muted-line small">Peer discovery and relay are simulated for this prototype — built on the same abstractions a real BLE / Wi-Fi Direct transport would use.</p>
    </div>
  );
}

/* ---- Cached info (available with zero connectivity) ---- */

function CachedInfoScreen({ onBack }) {
  const [tab, setTab] = useState("shelters");
  const groups = { shelters: CACHED_SHELTERS, hospitals: CACHED_HOSPITALS, routes: CACHED_ROUTES, relief: CACHED_RELIEF };
  const icons = { shelters: HomeIcon, hospitals: Cross, routes: Route, relief: Package };
  const Icon = icons[tab];
  return (
    <div className="ccos-screen">
      <ScreenHeader title="Cached info" onBack={onBack} />
      <div className="ccos-net-note">
        <Database size={14} /> Saved to this device before signal loss. No connection required.
      </div>
      <div className="ccos-demo-tabs local-tabs">
        {["shelters", "hospitals", "routes", "relief"].map((t) => (
          <button key={t} className={`ccos-demo-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="ccos-cached-list">
        {groups[tab].map((item) => (
          <div className="ccos-cached-row" key={item.id}>
            <Icon size={18} />
            <div>
              <div className="ccos-cached-name">{item.name}</div>
              <div className="ccos-cached-detail">{item.zone} · {item.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- I need help flow ---- */

function NeedHelpFlow({ connectivity, onBack, onSubmit }) {
  const [step, setStep] = useState(0);
  const [needs, setNeeds] = useState([]);
  const [zone, setZone] = useState(null);
  const [tags, setTags] = useState([]);

  const toggleNeed = (id) => setNeeds((n) => (n.includes(id) ? n.filter((x) => x !== id) : [...n, id]));
  const toggleTag = (t) => setTags((n) => (n.includes(t) ? n.filter((x) => x !== t) : [...n, t]));

  return (
    <div className="ccos-screen">
      <ScreenHeader title="I need help" onBack={step === 0 ? onBack : () => setStep((s) => s - 1)} />
      {connectivity !== "internet" && (
        <div className="ccos-net-note warn"><WifiOff size={14} /> Offline — this will save on your device and relay when possible.</div>
      )}
      <StepDots count={3} active={step} />

      {step === 0 && (
        <>
          <p className="ccos-prompt">What do you need? Select all that apply.</p>
          <div className="ccos-need-grid">
            {NEED_ORDER.map((n) => {
              const meta = NEED_META[n];
              const active = needs.includes(n);
              return (
                <button key={n} className={`ccos-need-chip ${active ? "active" : ""}`} onClick={() => toggleNeed(n)}>
                  <meta.Icon size={22} />
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
          <button className="ccos-cta" disabled={needs.length === 0} onClick={() => setStep(1)}>
            Continue <ChevronRight size={16} />
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <p className="ccos-prompt">Where are you?</p>
          <button className="ccos-gps-btn" onClick={() => setZone("z3")}>
            <MapPin size={18} /> Use my location
          </button>
          <p className="ccos-or">or pick your area</p>
          <div className="ccos-zone-grid">
            {ZONES.map((z) => (
              <button key={z.id} className={`ccos-zone-chip ${zone === z.id ? "active" : ""}`} onClick={() => setZone(z.id)}>
                {z.area}<span>{z.zone}</span>
              </button>
            ))}
          </div>
          <button className="ccos-cta" disabled={!zone} onClick={() => setStep(2)}>
            Continue <ChevronRight size={16} />
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <p className="ccos-prompt">Anything else? (optional)</p>
          <div className="ccos-tag-grid">
            {TAG_OPTIONS.map((t) => (
              <button key={t} className={`ccos-tag-chip ${tags.includes(t) ? "active" : ""}`} onClick={() => toggleTag(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="ccos-review">
            <p>You're sending:</p>
            <div className="ccos-review-chips">
              {needs.map((n) => <span key={n} className="ccos-review-chip">{NEED_META[n].label}</span>)}
            </div>
            <p className="ccos-review-loc"><MapPin size={13} /> {zoneName(zone)}</p>
          </div>
          <button className="ccos-cta danger" onClick={() => onSubmit(needs, zone, tags)}>
            Send request
          </button>
        </>
      )}
    </div>
  );
}

function StepDots({ count, active }) {
  return (
    <div className="ccos-dots">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`ccos-dot ${i <= active ? "on" : ""}`} />
      ))}
    </div>
  );
}

function NeedHelpDone({ connectivity, onBack }) {
  const offline = connectivity !== "internet";
  return (
    <div className="ccos-screen ccos-center">
      <div className={`ccos-confirm-icon ${offline ? "offline" : "help"}`}>{offline ? <Database size={40} /> : <ShieldAlert size={40} />}</div>
      <h2>{offline ? "Saved on this device" : "Request sent"}</h2>
      <p className="ccos-muted-line center">
        {offline
          ? "OFFLINE MODE — your report is stored locally and will be delivered when another device or connection becomes available."
          : "You're now visible on the community picture. Responders in your area have been notified."}
      </p>
      <button className="ccos-cta" onClick={onBack}>Back to home</button>
    </div>
  );
}

/* ---- Find safety flow ---- */

function FindSafetyFlow({ onBack, presetCrisis }) {
  const [crisis, setCrisis] = useState(presetCrisis || null);
  const [situation, setSituation] = useState(null);
  const step = crisis === null ? 0 : situation === null ? 1 : 2;

  return (
    <div className="ccos-screen">
      <ScreenHeader title="Find safety" onBack={step === 0 ? onBack : step === 1 ? () => setCrisis(null) : () => setSituation(null)} />
      {step === 0 && (
        <>
          <p className="ccos-prompt">What's happening?</p>
          <div className="ccos-crisis-grid">
            {DISASTER_ORDER.map((id) => {
              const c = DISASTER_META[id];
              return (
                <button key={id} className="ccos-crisis-chip" style={{ "--chip-color": c.color }} onClick={() => setCrisis(id)}>
                  <c.Icon size={26} />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <p className="ccos-prompt">Where are you right now?</p>
          <div className="ccos-situation-list">
            {SITUATIONS.map((s) => (
              <button key={s} className="ccos-situation-btn" onClick={() => setSituation(s)}>
                {s} <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <p className="ccos-prompt">Do these in order:</p>
          <ol className="ccos-steps-list">
            {ACTION_STEPS[crisis][situation].map((s, i) => (
              <li key={i} className={i === 0 ? "urgent" : ""}>
                <span className="ccos-step-num">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <button className="ccos-cta danger">
            <Radio size={16} /> Still unsafe? Send SOS
          </button>
        </>
      )}
    </div>
  );
}

/* ---- SOS ---- */

function SosScreen({ connectivity, onBack }) {
  const [progress, setProgress] = useState(0);
  const [sent, setSent] = useState(false);
  const timer = useRef(null);
  const offline = connectivity !== "internet";

  const startHold = () => {
    if (sent) return;
    let p = 0;
    timer.current = setInterval(() => {
      p += 100 / 15;
      setProgress(Math.min(100, p));
      if (p >= 100) { clearInterval(timer.current); setSent(true); }
    }, 100);
  };
  const cancelHold = () => { if (sent) return; clearInterval(timer.current); setProgress(0); };
  useEffect(() => () => clearInterval(timer.current), []);

  if (sent) {
    return (
      <div className="ccos-screen ccos-center">
        <div className="ccos-confirm-icon sos pulse"><Radio size={40} /></div>
        <h2>SOS sent</h2>
        <p className="ccos-muted-line center">
          {offline
            ? "Your SOS is stored on this device and marked highest priority for the next relay — critical reports always go first, even in power-saving mode."
            : "Your location and status have been sent to emergency responders. Stay where you are if it's safe."}
        </p>
        <p className="ccos-coord-mock"><MapPin size={13} /> 41.732°N, 72.681°W · Zone 3</p>
        {offline && <p className="ccos-coord-mock"><Database size={13} /> Delivery: stored locally · will relay on next nearby device</p>}
        <button className="ccos-cta" onClick={onBack}>Back to home</button>
      </div>
    );
  }

  return (
    <div className="ccos-screen ccos-center">
      <ScreenHeader title="" onBack={onBack} />
      <p className="ccos-prompt center">Press and hold for 1.5s to alert emergency responders</p>
      <button className="ccos-sos-dial" onPointerDown={startHold} onPointerUp={cancelHold} onPointerLeave={cancelHold} style={{ "--p": `${progress}%` }}>
        <div className="ccos-sos-dial-ring" />
        <div className="ccos-sos-dial-inner">SOS</div>
      </button>
      <p className="ccos-muted-line center small">Only use this if you are in immediate danger. Works with no signal.</p>
    </div>
  );
}

/* ---- Contacts ---- */

function ContactsScreen({ connectivity, onBack }) {
  const [callingId, setCallingId] = useState(null);
  const [pingedId, setPingedId] = useState(null);
  const callTimer = useRef(null);
  const pingTimer = useRef(null);

  const call = (id) => { clearTimeout(callTimer.current); setCallingId(id); callTimer.current = setTimeout(() => setCallingId(null), 1800); };
  const ping = (id) => { clearTimeout(pingTimer.current); setPingedId(id); pingTimer.current = setTimeout(() => setPingedId(null), 1800); };
  useEffect(() => () => { clearTimeout(callTimer.current); clearTimeout(pingTimer.current); }, []);

  return (
    <div className="ccos-screen">
      <ScreenHeader title="Emergency contacts" onBack={onBack} />
      {connectivity !== "internet" && (
        <div className="ccos-net-note">
          <Database size={14} /> Numbers are cached — calls use the cellular voice network if available, independent of data.
        </div>
      )}
      {CONTACTS.map((c) => {
        const calling = callingId === c.id;
        return (
          <button key={c.id} className={`ccos-contact-row ${c.urgent ? "urgent" : ""} ${calling ? "active" : ""}`} onClick={() => call(c.id)}>
            <div>
              <div className="ccos-contact-name">{c.name}</div>
              <div className="ccos-contact-role">{calling ? "Calling…" : c.role}</div>
            </div>
            <PhoneCall size={18} />
          </button>
        );
      })}
      <p className="ccos-section-title">Household</p>
      {HOUSEHOLD.map((h) => {
        const pinged = pingedId === h.id;
        return (
          <button key={h.id} className="ccos-household-row" onClick={() => ping(h.id)}>
            <span className={`ccos-dot-status ${h.status}`} />
            <span>{h.name}</span>
            <span className="ccos-household-status">{pinged ? "Checking in…" : h.status === "safe" ? "Safe" : "Needs assistance"}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Coordinator app                                                        */
/* ---------------------------------------------------------------------- */

function CoordinatorApp({ disaster, total, counts, needsTotals, incidents, inTransitTotals, feed, connectivity, battery, batteryTier, onSimulate, onCycleStatus }) {
  const maxNeed = Math.max(...NEED_ORDER.map((n) => needsTotals[n] || 0), 1);
  const openIncidents = incidents.filter((i) => i.status !== "resolved");
  const resolvedIncidents = incidents.filter((i) => i.status === "resolved");
  const meta = DISASTER_META[disaster];
  const BatteryIcon = batteryTier.Icon;

  return (
    <div className="ccos-coord">
      <div className="ccos-coord-header">
        <div>
          <h1>Command view</h1>
          <p><meta.Icon size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} color={meta.color} />{meta.region} · {connectivity === "internet" ? "live" : "relay-dependent"}</p>
        </div>
        <button className="ccos-sim-btn" onClick={onSimulate}><Plus size={15} /> Simulate incoming reports</button>
      </div>

      <div className="ccos-coord-grid">
        <div className="ccos-panel ccos-panel-people">
          <h3>People accounted for</h3>
          <div className="ccos-people-total">{total}</div>
          <div className="ccos-people-bar">
            <div style={{ width: `${(counts.safe / total) * 100}%`, background: "var(--c-safe)" }} />
            <div style={{ width: `${(counts.needAssistance / total) * 100}%`, background: "var(--c-amber)" }} />
            <div style={{ width: `${(counts.unreachable / total) * 100}%`, background: "var(--c-grey)" }} />
            <div style={{ width: `${(counts.evacuated / total) * 100}%`, background: "var(--c-evac)" }} />
          </div>
          <div className="ccos-people-legend">
            <span><i style={{ background: "var(--c-safe)" }} /> Safe {counts.safe}</span>
            <span><i style={{ background: "var(--c-amber)" }} /> Need assistance {counts.needAssistance}</span>
            <span><i style={{ background: "var(--c-grey)" }} /> Unreachable {counts.unreachable}</span>
            <span><i style={{ background: "var(--c-evac)" }} /> Evacuated {counts.evacuated}</span>
          </div>
        </div>

        <div className="ccos-panel">
          <h3>Needs breakdown (received only)</h3>
          <div className="ccos-needs-bars">
            {NEED_ORDER.map((n) => {
              const nmeta = NEED_META[n];
              const v = needsTotals[n] || 0;
              return (
                <div className="ccos-needs-bar-row" key={n}>
                  <nmeta.Icon size={14} color={nmeta.color} />
                  <span className="ccos-needs-bar-label">{nmeta.label}</span>
                  <div className="ccos-needs-bar-track">
                    <div className="ccos-needs-bar-fill" style={{ width: `${(v / maxNeed) * 100}%`, background: nmeta.color }} />
                  </div>
                  <strong>{v}</strong>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ccos-panel ccos-panel-relay">
          <h3>Community relay network</h3>
          <div className="ccos-net-panel-row">
            <BatteryIcon size={16} color={batteryTier.color} />
            <div><strong style={{ color: batteryTier.color }}>Coordinator device · {battery}%</strong><div className="ccos-net-panel-sub">{batteryTier.label}</div></div>
          </div>
          <div className="ccos-relay-stats">
            <div className="ccos-relay-stat">
              <span className="ccos-relay-num" style={{ color: "var(--c-grey)" }}>{inTransitTotals.stored}</span>
              <span>Stored on residents' phones</span>
            </div>
            <div className="ccos-relay-stat">
              <span className="ccos-relay-num" style={{ color: "var(--c-amber)" }}>{inTransitTotals.relayed}</span>
              <span>In transit via relay</span>
            </div>
            <div className="ccos-relay-stat">
              <span className="ccos-relay-num" style={{ color: "var(--c-safe)" }}>{incidents.length}</span>
              <span>Received by command center</span>
            </div>
          </div>
          <p className="ccos-muted-line small">The priority queue below only shows reports that have actually reached this device — that lag is the store-and-forward model working as designed.</p>
        </div>

        <div className="ccos-panel ccos-panel-feed">
          <h3>Live feed</h3>
          <div className="ccos-feed-list">
            {feed.map((f) => (
              <div className={`ccos-feed-row ${f.tone}`} key={f.id}>
                <span className="ccos-feed-time">{f.t}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ccos-panel ccos-panel-map">
          <h3>Zone map</h3>
          <ZoneMap zoneNeeds={incidents} disaster={disaster} />
          <p className="ccos-map-caption"><WifiOff size={12} /> Rendered from cached local zone tiles — works offline</p>
        </div>

        <div className="ccos-panel ccos-panel-queue">
          <h3>Priority queue</h3>
          <div className="ccos-queue-list">
            {openIncidents.map((row) => {
              const nmeta = NEED_META[row.need];
              return (
                <div className="ccos-queue-row" key={row.id}>
                  <div className="ccos-queue-sev" style={{ background: row.sev.color }} />
                  <div className="ccos-queue-main">
                    <div className="ccos-queue-title">
                      <strong>ID {row.id}</strong> · {nmeta.label} in {zoneName(row.zoneId)} · {row.time}
                    </div>
                    <div className="ccos-queue-sub">
                      <span className="ccos-badge" style={{ color: row.sev.color, borderColor: row.sev.color }}>{row.sev.label}</span>
                      <nmeta.Icon size={13} color={nmeta.color} />
                      <DeliveryBadge state={row.delivery} />
                    </div>
                  </div>
                  <button className={`ccos-queue-action ${row.status}`} onClick={() => onCycleStatus(row.id)}>
                    {row.status === "open" ? "Mark responding" : row.status === "responding" ? "Mark resolved" : "Resolved"}
                  </button>
                </div>
              );
            })}
            {openIncidents.length === 0 && (
              <div className="ccos-resolved-note">No reports received yet — waiting on relay. {inTransitTotals.stored + inTransitTotals.relayed} report{(inTransitTotals.stored + inTransitTotals.relayed) === 1 ? "" : "s"} still in transit.</div>
            )}
            {resolvedIncidents.length > 0 && (
              <div className="ccos-resolved-note">{resolvedIncidents.length} incident{resolvedIncidents.length > 1 ? "s" : ""} resolved</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MapBackdrop({ disaster }) {
  const color = DISASTER_META[disaster].color;
  if (disaster === "flood") {
    return (
      <>
        <path d="M0,40 C90,10 120,90 200,80 C280,70 320,140 400,130" stroke={color} strokeOpacity="0.4" strokeWidth="9" fill="none" />
        <path d="M0,60 C90,30 120,110 200,100 C280,90 320,160 400,150" stroke={color} strokeOpacity="0.16" strokeWidth="20" fill="none" />
      </>
    );
  }
  if (disaster === "fire") {
    return <path d="M40,260 C90,200 60,140 130,120 C210,95 230,150 300,140 C350,133 370,180 360,230 C300,270 120,290 40,260 Z" fill={color} opacity="0.14" />;
  }
  if (disaster === "earthquake") {
    return <path d="M10,150 L60,140 L80,182 L120,118 L150,172 L190,108 L230,162 L270,128 L310,176 L390,150" stroke={color} strokeOpacity="0.5" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  }
  return (
    <>
      <circle cx="200" cy="150" r="40" stroke={color} strokeOpacity="0.3" strokeWidth="2" fill="none" />
      <circle cx="200" cy="150" r="80" stroke={color} strokeOpacity="0.2" strokeWidth="2" fill="none" strokeDasharray="6 6" />
      <circle cx="200" cy="150" r="120" stroke={color} strokeOpacity="0.13" strokeWidth="2" fill="none" strokeDasharray="3 10" />
    </>
  );
}

function ZoneMap({ zoneNeeds, disaster }) {
  const zoneTotals = {};
  const zoneSeverity = {};
  zoneNeeds.forEach((row) => {
    zoneTotals[row.zoneId] = (zoneTotals[row.zoneId] || 0) + 1;
    zoneSeverity[row.zoneId] = Math.max(zoneSeverity[row.zoneId] || 0, row.weight);
  });
  const maxTotal = Math.max(...Object.values(zoneTotals), 1);

  return (
    <svg viewBox="0 0 400 300" className="ccos-map-svg">
      <MapBackdrop disaster={disaster} />
      {ZONES.map((z) => {
        const total = zoneTotals[z.id] || 0;
        const sev = severityFromWeight(zoneSeverity[z.id] || 0);
        const r = 14 + (total / maxTotal) * 22;
        return (
          <g key={z.id} transform={`translate(${z.x},${z.y})`}>
            <circle r={r} fill={sev.color} opacity="0.22" />
            <circle r={r * 0.55} fill={sev.color} opacity="0.9" />
            <text y={4} textAnchor="middle" className="ccos-map-count">{total || ""}</text>
            <text y={r + 16} textAnchor="middle" className="ccos-map-label">{z.area}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------------------------------------------------------------- */
/*  Recovery                                                                */
/* ---------------------------------------------------------------------- */

function RecoveryApp() {
  const [items, setItems] = useState(RECOVERY_ITEMS);
  const cycle = (id) => setItems((its) => its.map((it) => it.id === id ? { ...it, status: STATUS_CYCLE[(STATUS_CYCLE.indexOf(it.status) + 1) % STATUS_CYCLE.length] } : it));
  const resolvedCount = items.filter((i) => i.status === "Resolved").length;

  return (
    <div className="ccos-phone-wrap">
      <div className="ccos-phone">
        <div className="ccos-phone-notch" />
        <div className="ccos-phone-screen">
          <div className="ccos-screen">
            <div className="ccos-recovery-head">
              <h2>Recovery</h2>
              <p>The flood warning has lifted. Here's what's still open for your household.</p>
            </div>
            <div className="ccos-recovery-progress">
              <div className="ccos-status-track"><div className="ccos-status-fill" style={{ width: `${(resolvedCount / items.length) * 100}%`, background: "var(--c-safe)" }} /></div>
              <span>{resolvedCount} of {items.length} resolved</span>
            </div>
            <div className="ccos-recovery-list">
              {items.map((it) => (
                <button key={it.id} className="ccos-recovery-row" onClick={() => cycle(it.id)}>
                  <it.Icon size={20} />
                  <span className="ccos-recovery-label">{it.label}</span>
                  <span className={`ccos-status-pill ${it.status.replace(" ", "-").toLowerCase()}`}>{it.status}</span>
                </button>
              ))}
            </div>
            <p className="ccos-muted-line small">Tap an item to update its status. This list stays until everything is resolved.</p>
          </div>
        </div>
      </div>
      <p className="ccos-phone-caption">Recovery mode · the app doesn't disappear when the danger passes</p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Styles                                                                  */
/* ---------------------------------------------------------------------- */

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

      html, body { background: #0a0d12; margin: 0; }

      .ccos-root {
        --c-bg: #0a0d12;
        --c-surface: #12171f;
        --c-surface2: #1b222c;
        --c-line: #2a323d;
        --c-text: #f2f5f8;
        --c-text2: #8b96a3;
        --c-safe: #2fd673;
        --c-amber: #ffb443;
        --c-danger: #ff4438;
        --c-grey: #6b7684;
        --c-evac: #a78bfa;
        --c-water: #4da8ff;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        background: radial-gradient(circle at 20% 0%, #131a22 0%, #060809 60%);
        color: var(--c-text);
        width: 100%;
        min-width: 100%;
        min-height: 100vh;
        padding: 20px 16px 60px;
        box-sizing: border-box;
        font-variant-numeric: tabular-nums;
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1 1 auto;
        align-self: stretch;
        overflow-x: hidden;
      }
      .ccos-demo-bar, .ccos-phone-wrap, .ccos-coord { width: 100%; }
      .ccos-root * { box-sizing: border-box; }
      .ccos-root button { font-family: inherit; cursor: pointer; }

      .ccos-demo-bar {
        max-width: 1180px; margin: 0 auto 22px; display: flex; align-items: center;
        justify-content: flex-end; gap: 18px; flex-wrap: wrap;
      }
      .ccos-demo-group { display: flex; align-items: center; gap: 8px; }
      .ccos-demo-label { font-size: 11px; color: var(--c-text2); white-space: nowrap; }
      .ccos-demo-tabs { display: flex; background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 999px; padding: 3px; }
      .ccos-demo-tabs.local-tabs { margin-bottom: 4px; }
      .ccos-demo-tab { background: none; border: none; color: var(--c-text2); font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 999px; transition: all .15s; display: flex; align-items: center; gap: 5px; }
      .ccos-demo-tab.active { background: var(--c-surface2); color: var(--c-text); }
      .ccos-demo-tabs.conn .ccos-demo-tab.active.good { color: var(--c-safe); }
      .ccos-demo-tabs.conn .ccos-demo-tab.active.warn { color: var(--c-danger); }
      .ccos-battery-slider { accent-color: var(--c-water); width: 110px; }

      /* ---- phone frame ---- */
      .ccos-phone-wrap { display: flex; flex-direction: column; align-items: center; }
      .ccos-phone {
        width: 390px; max-width: 92vw; height: 780px; max-height: 82vh;
        background: #000; border-radius: 46px; padding: 12px;
        box-shadow: 0 0 0 2px #2a323d, 0 30px 60px rgba(0,0,0,.55);
        position: relative;
      }
      .ccos-phone-notch { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 120px; height: 22px; background: #000; border-radius: 0 0 16px 16px; z-index: 2; }
      .ccos-phone-screen { background: var(--c-bg); border-radius: 34px; height: 100%; overflow-y: auto; padding: 26px 18px 18px; }
      .ccos-phone-caption { color: var(--c-text2); font-size: 12px; margin-top: 16px; text-align: center; max-width: 320px; }

      .ccos-screen { display: flex; flex-direction: column; gap: 14px; min-height: 100%; }
      .ccos-center { align-items: center; justify-content: center; text-align: center; flex: 1; }

      .ccos-screen-header { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
      .ccos-screen-header h2 { font-size: 19px; margin: 0; font-weight: 700; }
      .ccos-back-btn { background: var(--c-surface); border: 1px solid var(--c-line); color: var(--c-text); width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }

      /* top strips */
      .ccos-strip { display: flex; align-items: center; gap: 10px; background: var(--c-surface); border: 1px solid var(--strip-color, var(--c-danger)); color: var(--strip-color, var(--c-danger)); border-radius: 14px; padding: 10px 12px; text-align: left; }
      .ccos-strip-text { flex: 1; display: flex; flex-direction: column; }
      .ccos-strip-text strong { font-size: 13px; color: var(--c-text); }
      .ccos-strip-text span { font-size: 11px; color: var(--c-text2); }
      .ccos-conn-strip { display: flex; align-items: center; gap: 10px; border-radius: 14px; padding: 10px 12px; text-align: left; border: 1px solid var(--c-line); background: var(--c-surface); }
      .ccos-conn-strip.good { border-color: rgba(47,214,115,.4); color: var(--c-safe); }
      .ccos-conn-strip.warn { border-color: rgba(255,68,56,.5); color: var(--c-danger); background: rgba(255,68,56,.07); }

      /* home buttons */
      .ccos-home-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 6px; }
      .ccos-big-btn { display: flex; align-items: center; gap: 14px; padding: 18px; border-radius: 20px; border: 1px solid var(--c-line); background: var(--c-surface); color: var(--c-text); text-align: left; transition: transform .1s; }
      .ccos-big-btn:active { transform: scale(0.98); }
      .ccos-big-btn-title { font-size: 17px; font-weight: 700; }
      .ccos-big-btn-sub { font-size: 12px; color: var(--c-text2); margin-top: 2px; }
      .ccos-big-btn.safe { border-color: rgba(47,214,115,.4); }
      .ccos-big-btn.safe svg { color: var(--c-safe); }
      .ccos-big-btn.safe.confirmed { background: rgba(47,214,115,.12); }
      .ccos-big-btn.help { border-color: rgba(255,180,67,.45); }
      .ccos-big-btn.help svg { color: var(--c-amber); }
      .ccos-big-btn.safety { border-color: rgba(77,168,255,.4); }
      .ccos-big-btn.safety svg { color: var(--c-water); }

      .ccos-sos-bar { margin-top: auto; background: var(--c-danger); color: #fff; border: none; border-radius: 18px; padding: 18px; font-weight: 800; font-size: 15px; letter-spacing: .3px; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 8px 24px rgba(255,68,56,.35); }
      .ccos-link-row-group { display: flex; flex-direction: column; }
      .ccos-link-row { background: none; border: none; color: var(--c-text2); font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px; }

      /* community snapshot */
      .ccos-muted-line { color: var(--c-text2); font-size: 13px; }
      .ccos-muted-line.center { text-align: center; }
      .ccos-muted-line.small { font-size: 11px; }
      .ccos-section-title { font-size: 12px; color: var(--c-text2); text-transform: none; margin: 4px 0 -6px; font-weight: 600; }
      .ccos-status-stack { display: flex; flex-direction: column; gap: 10px; }
      .ccos-status-row-top { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
      .ccos-status-track { background: var(--c-surface2); border-radius: 999px; height: 8px; overflow: hidden; }
      .ccos-status-fill { height: 100%; border-radius: 999px; transition: width .4s; }
      .ccos-need-grid-simple { display: flex; flex-wrap: wrap; gap: 8px; }
      .ccos-need-pill { display: flex; align-items: center; gap: 6px; background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 999px; padding: 7px 12px; font-size: 12px; }
      .ccos-need-pill strong { margin-left: 2px; }

      /* need help flow */
      .ccos-prompt { font-size: 15px; font-weight: 600; margin: 2px 0 0; }
      .ccos-prompt.center { text-align: center; }
      .ccos-dots { display: flex; gap: 6px; }
      .ccos-dot { width: 20px; height: 4px; border-radius: 4px; background: var(--c-line); }
      .ccos-dot.on { background: var(--c-water); }
      .ccos-need-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .ccos-need-chip { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 6px; border-radius: 16px; border: 1px solid var(--c-line); background: var(--c-surface); color: var(--c-text2); font-size: 12px; font-weight: 600; }
      .ccos-need-chip.active { border-color: var(--c-water); color: var(--c-text); background: rgba(77,168,255,.12); }
      .ccos-need-chip svg { color: inherit; }
      .ccos-need-chip.active svg { color: var(--c-water); }
      .ccos-cta { margin-top: auto; background: var(--c-water); color: #051018; border: none; border-radius: 16px; padding: 15px; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 6px; }
      .ccos-cta:disabled { opacity: .35; }
      .ccos-cta.danger { background: var(--c-danger); color: #fff; }
      .ccos-cta.secondary { background: var(--c-surface2); color: var(--c-text); border: 1px solid var(--c-line); margin-top: 4px; }
      .ccos-gps-btn { display: flex; align-items: center; gap: 8px; justify-content: center; background: rgba(77,168,255,.12); border: 1px solid rgba(77,168,255,.4); color: var(--c-water); border-radius: 14px; padding: 13px; font-weight: 700; font-size: 13px; }
      .ccos-or { text-align: center; font-size: 11px; color: var(--c-text2); margin: -2px 0; }
      .ccos-zone-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .ccos-zone-chip { display: flex; flex-direction: column; align-items: flex-start; border: 1px solid var(--c-line); background: var(--c-surface); border-radius: 12px; padding: 10px 12px; color: var(--c-text); font-size: 13px; font-weight: 600; }
      .ccos-zone-chip span { color: var(--c-text2); font-size: 11px; font-weight: 400; }
      .ccos-zone-chip.active { border-color: var(--c-water); background: rgba(77,168,255,.1); }
      .ccos-tag-grid { display: flex; flex-wrap: wrap; gap: 8px; }
      .ccos-tag-chip { border: 1px solid var(--c-line); background: var(--c-surface); color: var(--c-text2); border-radius: 999px; padding: 8px 13px; font-size: 12px; }
      .ccos-tag-chip.active { border-color: var(--c-amber); color: var(--c-amber); background: rgba(255,180,67,.1); }
      .ccos-review { background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 14px; padding: 12px; font-size: 12px; color: var(--c-text2); }
      .ccos-review-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
      .ccos-review-chip { background: var(--c-surface2); color: var(--c-text); border-radius: 999px; padding: 4px 10px; font-size: 11px; }
      .ccos-review-loc { display: flex; align-items: center; gap: 5px; color: var(--c-text); }

      .ccos-confirm-icon { width: 76px; height: 76px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
      .ccos-confirm-icon.help { background: rgba(255,180,67,.15); color: var(--c-amber); }
      .ccos-confirm-icon.offline { background: rgba(107,118,132,.18); color: var(--c-text2); }
      .ccos-confirm-icon.sos { background: rgba(255,68,56,.15); color: var(--c-danger); }
      .ccos-confirm-icon.pulse { animation: ccos-pulse 1.4s infinite; }
      @keyframes ccos-pulse { 0% { box-shadow: 0 0 0 0 rgba(255,68,56,.4);} 70% { box-shadow: 0 0 0 18px rgba(255,68,56,0);} 100% { box-shadow: 0 0 0 0 rgba(255,68,56,0);} }
      .ccos-coord-mock { font-size: 12px; color: var(--c-text2); display: flex; gap: 5px; align-items: center; }

      /* find safety */
      .ccos-crisis-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .ccos-crisis-chip { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px 8px; border-radius: 18px; border: 1px solid var(--c-line); background: var(--c-surface); color: var(--chip-color); font-weight: 700; font-size: 13px; }
      .ccos-situation-list { display: flex; flex-direction: column; gap: 8px; }
      .ccos-situation-btn { display: flex; align-items: center; justify-content: space-between; background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 14px; padding: 15px; color: var(--c-text); font-weight: 600; font-size: 14px; }
      .ccos-steps-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
      .ccos-steps-list li { display: flex; gap: 12px; align-items: flex-start; background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 14px; padding: 12px 14px; font-size: 13.5px; line-height: 1.4; }
      .ccos-steps-list li.urgent { border-color: rgba(255,68,56,.5); background: rgba(255,68,56,.08); }
      .ccos-step-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: var(--c-surface2); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
      .ccos-steps-list li.urgent .ccos-step-num { background: var(--c-danger); color: #fff; }

      /* sos */
      .ccos-sos-dial { position: relative; width: 190px; height: 190px; border-radius: 50%; border: none; background: var(--c-surface); margin: 20px auto; touch-action: none; }
      .ccos-sos-dial-ring { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(var(--c-danger) var(--p, 0%), transparent 0); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 10px), black calc(100% - 9px)); mask: radial-gradient(farthest-side, transparent calc(100% - 10px), black calc(100% - 9px)); }
      .ccos-sos-dial-inner { position: absolute; inset: 10px; border-radius: 50%; background: var(--c-danger); color: #fff; font-size: 26px; font-weight: 800; display: flex; align-items: center; justify-content: center; letter-spacing: 1px; }

      /* contacts */
      .ccos-contact-row { width: 100%; display: flex; align-items: center; justify-content: space-between; background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 14px; padding: 13px 14px; color: var(--c-text); transition: background .15s, border-color .15s; }
      .ccos-contact-row.urgent { border-color: rgba(255,68,56,.4); background: rgba(255,68,56,.08); }
      .ccos-contact-row.urgent svg { color: var(--c-danger); }
      .ccos-contact-row.active { border-color: var(--c-safe); background: rgba(47,214,115,.1); }
      .ccos-contact-row.active svg { color: var(--c-safe); }
      .ccos-contact-name { font-weight: 700; font-size: 13.5px; }
      .ccos-contact-role { font-size: 11.5px; color: var(--c-text2); margin-top: 1px; }
      .ccos-household-row { width: 100%; display: flex; align-items: center; gap: 8px; padding: 10px 8px; font-size: 13px; background: none; border: 1px solid transparent; border-radius: 12px; color: var(--c-text); text-align: left; transition: background .15s, border-color .15s; }
      .ccos-household-row:hover, .ccos-household-row:active { background: var(--c-surface); border-color: var(--c-line); }
      .ccos-household-status { margin-left: auto; font-size: 11px; color: var(--c-text2); }
      .ccos-dot-status { width: 8px; height: 8px; border-radius: 50%; }
      .ccos-dot-status.safe { background: var(--c-safe); }
      .ccos-dot-status.help { background: var(--c-amber); }

      /* network screen */
      .ccos-net-panel { background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 14px; padding: 12px 14px; }
      .ccos-net-panel-row { display: flex; align-items: center; gap: 10px; }
      .ccos-net-panel-row strong { font-size: 13px; }
      .ccos-net-panel-sub { font-size: 11px; color: var(--c-text2); margin-top: 1px; }
      .ccos-net-note { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--c-text2); background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 12px; padding: 9px 11px; }
      .ccos-net-note.good { color: var(--c-safe); border-color: rgba(47,214,115,.35); background: rgba(47,214,115,.08); }
      .ccos-net-note.warn { color: var(--c-amber); border-color: rgba(255,180,67,.35); background: rgba(255,180,67,.08); }

      .ccos-pipeline { display: flex; align-items: center; justify-content: space-between; background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 14px; padding: 14px 8px; }
      .ccos-pipeline-stage { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; text-align: center; }
      .ccos-pipeline-stage span { font-size: 8.5px; letter-spacing: .4px; color: var(--c-text2); font-weight: 700; }
      .ccos-pipeline-stage strong { font-size: 15px; }
      .ccos-pipeline-dot { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--c-surface2); }
      .ccos-pipeline-dot.you { color: var(--c-water); }
      .ccos-pipeline-dot.nearby { color: var(--c-amber); }
      .ccos-pipeline-dot.relay { color: var(--c-evac); }
      .ccos-pipeline-dot.command { color: var(--c-safe); }
      .ccos-pipeline-stage.flash .ccos-pipeline-dot { animation: ccos-pulse 1s ease-out 2; }
      .ccos-pipeline-arrow { flex: 0 0 14px; height: 1px; background: var(--c-line); margin-top: -14px; }

      .ccos-ladder { display: flex; flex-direction: column; gap: 6px; }
      .ccos-ladder-row { display: flex; align-items: center; gap: 10px; padding: 9px 11px; border-radius: 12px; border: 1px solid var(--c-line); background: var(--c-surface); color: var(--c-text2); }
      .ccos-ladder-row.active { border-color: var(--c-water); color: var(--c-text); background: rgba(77,168,255,.1); }
      .ccos-ladder-label { font-size: 12.5px; font-weight: 600; color: var(--c-text); }
      .ccos-ladder-desc { font-size: 10.5px; color: var(--c-text2); }
      .ccos-ladder-tag { margin-left: auto; font-size: 9px; font-weight: 800; color: var(--c-water); border: 1px solid var(--c-water); border-radius: 999px; padding: 2px 7px; }

      .ccos-report-list { display: flex; flex-direction: column; gap: 8px; }
      .ccos-report-card { background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 12px; padding: 10px 12px; }
      .ccos-report-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
      .ccos-report-id { font-size: 11px; color: var(--c-text2); font-weight: 700; }
      .ccos-report-card-body { font-size: 12.5px; }
      .ccos-delivery-badge { font-size: 9.5px; font-weight: 700; border: 1px solid; border-radius: 999px; padding: 2px 8px; }

      .ccos-cached-list { display: flex; flex-direction: column; gap: 8px; }
      .ccos-cached-row { display: flex; align-items: flex-start; gap: 10px; background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 12px; padding: 11px 12px; }
      .ccos-cached-name { font-size: 13.5px; font-weight: 600; }
      .ccos-cached-detail { font-size: 11.5px; color: var(--c-text2); margin-top: 1px; }

      /* ---- coordinator ---- */
      .ccos-coord { max-width: 1180px; margin: 0 auto; }
      .ccos-coord-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 18px; flex-wrap: wrap; gap: 10px; }
      .ccos-coord-header h1 { margin: 0; font-size: 24px; font-weight: 800; }
      .ccos-coord-header p { margin: 2px 0 0; color: var(--c-text2); font-size: 13px; }
      .ccos-sim-btn { display: flex; align-items: center; gap: 6px; background: var(--c-surface); border: 1px solid var(--c-line); color: var(--c-text); border-radius: 10px; padding: 9px 14px; font-size: 13px; font-weight: 600; }
      .ccos-sim-btn:hover { border-color: var(--c-water); }

      .ccos-coord-grid { display: grid; grid-template-columns: 1.1fr 1.1fr 1fr; grid-template-areas: "people needs feed" "relay relay queue" "map map queue"; gap: 14px; }
      .ccos-panel-people { grid-area: people; }
      .ccos-panel-feed { grid-area: feed; }
      .ccos-panel-map { grid-area: map; }
      .ccos-panel-queue { grid-area: queue; }
      .ccos-panel-relay { grid-area: relay; }
      @media (max-width: 900px) { .ccos-coord-grid { grid-template-columns: 1fr; grid-template-areas: "people" "needs" "relay" "map" "queue" "feed"; } }

      .ccos-panel { background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 18px; padding: 16px 16px 18px; }
      .ccos-panel h3 { margin: 0 0 12px; font-size: 13px; color: var(--c-text2); font-weight: 600; }

      .ccos-people-total { font-size: 40px; font-weight: 800; line-height: 1; margin-bottom: 12px; }
      .ccos-people-bar { display: flex; height: 12px; border-radius: 999px; overflow: hidden; background: var(--c-surface2); }
      .ccos-people-legend { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; font-size: 12px; color: var(--c-text2); }
      .ccos-people-legend span { display: flex; align-items: center; gap: 7px; }
      .ccos-people-legend i { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

      .ccos-needs-bars { display: flex; flex-direction: column; gap: 9px; }
      .ccos-needs-bar-row { display: grid; grid-template-columns: 16px 76px 1fr 24px; align-items: center; gap: 8px; font-size: 12px; }
      .ccos-needs-bar-track { background: var(--c-surface2); height: 7px; border-radius: 999px; overflow: hidden; }
      .ccos-needs-bar-fill { height: 100%; }

      .ccos-relay-stats { display: flex; gap: 10px; margin: 12px 0 10px; }
      .ccos-relay-stat { flex: 1; display: flex; flex-direction: column; gap: 2px; background: var(--c-surface2); border-radius: 12px; padding: 10px; text-align: center; }
      .ccos-relay-num { font-size: 20px; font-weight: 800; }
      .ccos-relay-stat span:last-child { font-size: 10px; color: var(--c-text2); }

      .ccos-feed-list { display: flex; flex-direction: column; gap: 10px; max-height: 180px; overflow-y: auto; }
      .ccos-feed-row { display: flex; flex-direction: column; font-size: 12.5px; border-left: 2px solid var(--c-line); padding-left: 10px; }
      .ccos-feed-row.good { border-left-color: var(--c-safe); }
      .ccos-feed-row.warn { border-left-color: var(--c-amber); }
      .ccos-feed-time { color: var(--c-text2); font-size: 10.5px; }

      .ccos-map-svg { width: 100%; height: auto; }
      .ccos-map-count { fill: #fff; font-size: 12px; font-weight: 800; }
      .ccos-map-label { fill: var(--c-text2); font-size: 10px; }
      .ccos-map-caption { display: flex; align-items: center; gap: 5px; color: var(--c-text2); font-size: 11px; margin: 8px 0 0; }

      .ccos-queue-list { display: flex; flex-direction: column; gap: 10px; max-height: 460px; overflow-y: auto; }
      .ccos-queue-row { display: flex; align-items: center; gap: 10px; background: var(--c-surface2); border-radius: 12px; padding: 10px 12px; }
      .ccos-queue-sev { width: 4px; align-self: stretch; border-radius: 4px; }
      .ccos-queue-main { flex: 1; }
      .ccos-queue-title { font-size: 12.5px; line-height: 1.35; }
      .ccos-queue-sub { display: flex; align-items: center; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
      .ccos-badge { font-size: 9.5px; font-weight: 700; border: 1px solid; border-radius: 999px; padding: 1px 7px; }
      .ccos-queue-action { font-size: 11px; font-weight: 700; border-radius: 8px; border: 1px solid var(--c-line); background: var(--c-bg); color: var(--c-text); padding: 7px 10px; white-space: nowrap; }
      .ccos-queue-action.responding { border-color: var(--c-amber); color: var(--c-amber); }
      .ccos-queue-action.resolved { border-color: var(--c-safe); color: var(--c-safe); opacity: .7; }
      .ccos-resolved-note { text-align: center; font-size: 11.5px; color: var(--c-text2); padding: 10px 4px; }

      /* recovery */
      .ccos-recovery-head h2 { margin: 0 0 4px; font-size: 20px; }
      .ccos-recovery-head p { margin: 0; font-size: 12.5px; color: var(--c-text2); }
      .ccos-recovery-progress { display: flex; align-items: center; gap: 10px; }
      .ccos-recovery-progress .ccos-status-track { flex: 1; }
      .ccos-recovery-progress span { font-size: 11px; color: var(--c-text2); white-space: nowrap; }
      .ccos-recovery-list { display: flex; flex-direction: column; gap: 9px; }
      .ccos-recovery-row { display: flex; align-items: center; gap: 12px; background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 14px; padding: 13px 14px; color: var(--c-text); }
      .ccos-recovery-label { flex: 1; text-align: left; font-size: 13.5px; font-weight: 600; }
      .ccos-status-pill { font-size: 10.5px; font-weight: 700; padding: 4px 9px; border-radius: 999px; }
      .ccos-status-pill.not-started { background: rgba(107,118,132,.2); color: var(--c-grey); }
      .ccos-status-pill.in-progress { background: rgba(255,180,67,.18); color: var(--c-amber); }
      .ccos-status-pill.resolved { background: rgba(47,214,115,.18); color: var(--c-safe); }
    `}</style>
  );
}