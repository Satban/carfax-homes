import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Progress } from "./components/ui/progress";
import { Badge } from "./components/ui/badge";
import { Textarea } from "./components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

const CURRENT_YEAR = new Date().getFullYear();

const STREETS = [
  "Maple","Oak","Pine","Cedar","Elm","Willow","Birch","Walnut","Chestnut","Sycamore",
  "Laurel","Holly","Juniper","Spruce","Poplar","Magnolia","Ash","Cypress","Redbud","Live Oak"
];
const pad = (n) => String(n).padStart(2, "0");
const yearsOld = (year) => (typeof year === "number" ? Math.max(0, CURRENT_YEAR - year) : undefined);

const DEFAULT_WEIGHTS = { roof: 0.25, hvac: 0.25, plumbing: 0.2, electrical: 0.15, waterHeater: 0.15 };
const ageToScore = (age) => {
  if (age <= 2) return 100;
  if (age <= 5) return 90;
  if (age <= 8) return 80;
  if (age <= 12) return 65;
  if (age <= 18) return 50;
  if (age <= 25) return 35;
  return 20;
};
const computeHealthScore = (home, weights) => {
  const w = weights || DEFAULT_WEIGHTS;
  const sys = home.systems || {};
  let total = 0, sum = 0;
  Object.keys(w).forEach((k) => {
    const y = sys[k] && sys[k].year ? yearsOld(sys[k].year) : undefined;
    const sub = typeof y === "number" ? ageToScore(y) : 60;
    total += sub * w[k];
    sum += w[k];
  });
  return Math.round(total / (sum || 1));
};
const riskTags = (home) => {
  const tags = [];
  const r = yearsOld(home.systems?.roof?.year);
  const h = yearsOld(home.systems?.hvac?.year);
  const p = yearsOld(home.systems?.plumbing?.year);
  if (typeof r === "number" && r > 18) tags.push("Roof aging");
  if (typeof h === "number" && h > 12) tags.push("HVAC aging");
  if (typeof p === "number" && p > 20) tags.push("Plumbing risk");
  if (home.yearBuilt < 1980) tags.push("Older electrical standards");
  return tags;
};

const buildHomes = (n) => {
  const homes = [];
  for (let i = 1; i <= n; i++) {
    const street = STREETS[i % STREETS.length];
    const num = 100 + i * 7;
    const zip = 78701 + (i % 60);
    const address = `${num} ${street} ${i % 2 ? "St" : "Ave"}, Austin, TX ${zip}`;
    const yearBuilt = 1975 + (i % 45);
    const sqFt = 1200 + ((i * 37) % 2500);
    const beds = 2 + (i % 4);
    const baths = i % 2 === 0 ? 2.5 : 2 + (i % 3);
    const lotSqFt = 4000 + ((i * 97) % 12000);

    const roofYear = Math.min(CURRENT_YEAR - (i % 3), yearBuilt + 10 + (i % 18));
    const hvacYear = Math.min(CURRENT_YEAR - (i % 2), yearBuilt + 8 + (i % 15));
    const plumbingYear = Math.min(CURRENT_YEAR - (i % 4), yearBuilt + 5 + (i % 28));
    const electricalYear = Math.min(CURRENT_YEAR - (i % 5), yearBuilt + 3 + (i % 22));
    const waterHeaterYear = Math.min(CURRENT_YEAR - (i % 2), yearBuilt + 12 + (i % 10));

    const soldYear = 2016 + (i % 8);
    const lastSold = { date: `${soldYear}-${pad(1 + (i % 12))}-${pad(1 + (i % 27))}`, price: 350000 + ((i * 15000) % 700000) };

    const permits = [];
    if (i % 2 === 0) permits.push({ id: `P-${1000 + i}`, date: `${roofYear}-${pad((i % 12) + 1)}-${pad((i % 27) + 1)}`, type: "Roof Replacement", contractor: "ATX Roofing Co." });
    if (i % 3 === 0) permits.push({ id: `P-${2000 + i}`, date: `${hvacYear}-${pad(((i + 3) % 12) + 1)}-${pad(((i + 5) % 27) + 1)}`, type: "HVAC Replacement", contractor: "Cool Breeze LLC" });
    if (i % 5 === 0) permits.push({ id: `P-${3000 + i}`, date: `${electricalYear}-${pad(((i + 6) % 12) + 1)}-${pad(((i + 9) % 27) + 1)}`, type: "Electrical Panel Upgrade", contractor: "SparkRight Electric" });

    const maintenance = [ { date: `${2022 - (i % 2)}-${pad(((i + 2) % 12) + 1)}-${pad(((i + 4) % 27) + 1)}`, item: "HVAC tune-up", provider: "Cool Breeze LLC" } ];
    if (i % 4 === 0) maintenance.push({ date: `${2023}-${pad(((i + 5) % 12) + 1)}-${pad(((i + 7) % 27) + 1)}`, item: "Gutter cleaning", provider: "LeafAway" });

    const disclosures = [];
    if (yearBuilt < 1985) disclosures.push("Older construction standards");
    if (i % 7 === 0) disclosures.push("Minor foundation shim (stable)");
    if (i % 9 === 0) disclosures.push("Previous roof leak repaired");

    homes.push({
      id: `AUS-${String(i).padStart(3, "0")}`,
      address, yearBuilt, sqFt, beds, baths, lotSqFt, lastSold,
      systems: {
        roof: { year: roofYear, type: i % 2 ? "Architectural Shingle" : "Metal" },
        hvac: { year: hvacYear, type: i % 3 ? "Heat Pump" : "Gas Furnace + AC" },
        plumbing: { year: plumbingYear, type: i % 2 ? "PEX" : "Copper" },
        electrical: { year: electricalYear, type: i % 2 ? "200A Panel" : "150A Panel" },
        waterHeater: { year: waterHeaterYear, type: i % 2 ? "Tankless" : "Tank" },
      },
      permits, maintenance, disclosures,
      notes: i % 2 ? "Owner reports good energy efficiency." : "Backs to greenbelt; good drainage.",
    });
  }
  return homes;
};
const MOCK_HOMES = buildHomes(50);

const ScoreBadge = ({ score }) => {
  const color = score >= 85 ? "#16a34a" : score >= 70 ? "#eab308" : "#dc2626";
  return <span style={{background: color}} className="inline-flex items-center px-2 py-1 text-white rounded-full text-xs font-semibold">Health {score}/100</span>;
};

const AgeBar = ({ label, year }) => {
  const age = yearsOld(year);
  const pct = typeof age === "number" ? Math.min(100, (age / 30) * 100) : 50;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1"><span>{label}</span><span>{year ?? "n/a"}</span></div>
      <div className="h-2 bg-[#e5e7eb] rounded"><div className="h-2 rounded" style={{ width: `${pct}%`, background: "#6366f1" }} /></div>
      <div className="text-[10px] text-[#6b7280] mt-1">{typeof age === "number" ? `${age} yrs old` : "age unknown"}</div>
    </div>
  );
};
const Section = ({ title, children }) => (
  <div className="mt-6"><h3 className="text-lg font-semibold" style={{color:"#312e81"}}>{title}</h3><div className="mt-2">{children}</div></div>
);

const ReportView = ({ home, onClose, weights }) => {
  const score = useMemo(() => computeHealthScore(home, weights), [home, weights]);

  const reportHtml = useMemo(() => {
    const styles = `
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; padding: 24px; }
        h1{ font-size:24px; margin:0 0 8px; }
        h2{ font-size:18px; margin:16px 0 8px; }
        .pill{ display:inline-block; background:#eef2ff; color:#3730a3; padding:4px 8px; border-radius:9999px; font-size:12px; margin-right:6px; }
        .row{ display:flex; gap:16px; }
        .col{ flex:1; }
        .box{ border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin:8px 0; }
        .muted{ color:#6b7280; font-size:12px; }
        .bar{ height:8px; background:#e5e7eb; border-radius:4px; overflow:hidden }
        .bar > div{ height:100%; background:#6366f1; }
      </style>`;
    const sys = home.systems || {};
    const subBar = (label, y) => {
      const a = typeof y === "number" ? CURRENT_YEAR - y : undefined;
      const pct = typeof a === "number" ? Math.min(100, (a / 30) * 100) : 50;
      return `<div style="margin-bottom:6px"><div class="muted">${label}: ${y ?? "n/a"} (${typeof a === "number" ? a : "?"} yrs)</div><div class="bar"><div style="width:${pct}%"></div></div></div>`;
    };
    const s = computeHealthScore(home, weights);
    const tags = riskTags(home);
    const tagsHtml = (tags.length ? tags : ["None significant detected"]).map(t=>`<span class="pill">${t}</span>`).join("");
    return `<!doctype html><html><head><meta charset="utf-8"/>${styles}<title>${home.address} — Home Report</title></head><body>
      <h1>Home Report</h1>
      <div class="muted">Generated ${new Date().toLocaleString()}</div>
      <div class="box"><strong>${home.address}</strong><div class="muted">Built ${home.yearBuilt} • ${(home.sqFt && home.sqFt.toLocaleString ? home.sqFt.toLocaleString() : home.sqFt)} sq ft • ${home.beds ?? "?"} bd / ${home.baths ?? "?"} ba</div></div>
      <div class="row">
        <div class="col box"><h2>Overall Health</h2><div class="bar"><div style="width:${s}%"></div></div><div class="muted" style="margin-top:6px">Score: ${s}/100</div></div>
        <div class="col box"><h2>Quick Risks</h2>${tagsHtml}</div>
      </div>
      <div class="box"><h2>Systems</h2>
        ${subBar("Roof", sys.roof?.year)}
        ${subBar("HVAC", sys.hvac?.year)}
        ${subBar("Plumbing", sys.plumbing?.year)}
        ${subBar("Electrical", sys.electrical?.year)}
        ${subBar("Water Heater", sys.waterHeater?.year)}
      </div>
      <div class="row">
        <div class="col box"><h2>Permits</h2>${(home.permits?.length?home.permits:[{date:"—",type:"None on file"}]).map(p=>`<div>${p.date} — ${p.type}${p.contractor?` · ${p.contractor}`:``}</div>`).join("")}</div>
        <div class="col box"><h2>Maintenance</h2>${(home.maintenance?.length?home.maintenance:[{date:"—",item:"None recorded"}]).map(m=>`<div>${m.date} — ${m.item}${m.provider?` · ${m.provider}`:``}</div>`).join("")}</div>
      </div>
      <div class="box"><h2>Disclosures / Notes</h2><div>${(home.disclosures||[]).map(d=>`<div>• ${d}</div>`).join("") || "—"}</div><div class="muted" style="margin-top:6px">${home.notes || ""}</div></div>
    </body></html>`;
  }, [home, weights]);

  const downloadHtml = () => {
    const blob = new Blob([reportHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${home.address.replace(/[^a-z0-9]+/gi, "_")}_Home_Report.html";
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportJson = () => {
    const data = new Blob([JSON.stringify(home, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${home.id}_raw.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
        <div className="p-6" style={{background:"linear-gradient(90deg,#4f46e5,#7c3aed,#d946ef)", color:"#fff", borderTopLeftRadius:16, borderTopRightRadius:16, position:"relative"}}>
          <div className="text-xs" style={{opacity:.9, textTransform:"uppercase", letterSpacing:".05em"}}>Carfax for Homes — Report</div>
          <button onClick={onClose} aria-label="Close report" style={{position:"absolute", top:16, right:16, fontSize:"20px", fontWeight:700, color:"#fff"}}>×</button>
          <div className="flex items-center justify-between mt-1">
            <h2 className="text-2xl font-semibold leading-tight">{home.address}</h2>
            <ScoreBadge score={score} />
          </div>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="col-span-2"><CardContent className="p-4">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div><span className="font-medium">Year Built:</span> {home.yearBuilt}</div>
                  <div><span className="font-medium">Size:</span> {(home.sqFt && home.sqFt.toLocaleString ? home.sqFt.toLocaleString() : home.sqFt)} sq ft</div>
                  <div><span className="font-medium">Beds/Baths:</span> {home.beds ?? "?"} / {home.baths ?? "?"}</div>
                  <div><span className="font-medium">Lot Size:</span> {(home.lotSqFt && home.lotSqFt.toLocaleString ? home.lotSqFt.toLocaleString() : home.lotSqFt)} sq ft</div>
                </div>
                <div>
                  <div><span className="font-medium">Last Sold:</span> {home.lastSold?.date || "—"}</div>
                  <div><span className="font-medium">Price:</span> {home.lastSold?.price ? `$${(home.lastSold.price && home.lastSold.price.toLocaleString ? home.lastSold.price.toLocaleString() : home.lastSold.price)}` : "—"}</div>
                  <div className="mt-2"><span className="font-medium">Risks:</span> {riskTags(home).map((t) => <Badge key={t} className="mr-1">{t}</Badge>)}</div>
                </div>
              </div>
              <Section title="Systems Age & Condition">
                <div className="grid sm:grid-cols-2 gap-4">
                  <AgeBar label="Roof" year={home.systems?.roof?.year} />
                  <AgeBar label="HVAC" year={home.systems?.hvac?.year} />
                  <AgeBar label="Plumbing" year={home.systems?.plumbing?.year} />
                  <AgeBar label="Electrical" year={home.systems?.electrical?.year} />
                  <AgeBar label="Water Heater" year={home.systems?.waterHeater?.year} />
                </div>
              </Section>
              <Section title="Permits & Maintenance">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium mb-2">Permits</div>
                    {(home.permits?.length ? home.permits : [{ date: "—", type: "None recorded" }]).map((p, idx) => (
                      <div key={`${p.id || p.type}-${idx}`} className="flex items-start justify-between border-b last:border-0 py-2">
                        <div><div className="font-medium">{p.type}</div><div className="text-xs" style={{color:"#6b7280"}}>{p.contractor || "—"}</div></div>
                        <div className="text-xs" style={{color:"#6b7280"}}>{p.date}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-medium mb-2">Maintenance</div>
                    {(home.maintenance?.length ? home.maintenance : [{ date: "—", item: "None recorded" }]).map((m, idx) => (
                      <div key={`${m.item || "item"}-${idx}`} className="flex items-start justify-between border-b last:border-0 py-2">
                        <div className="font-medium">{m.item}</div>
                        <div className="text-xs" style={{color:"#6b7280"}}>{m.date}{m.provider ? ` · ${m.provider}` : ""}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
              <Section title="Disclosures & Notes">
                <div className="space-y-1 text-sm">
                  {(home.disclosures || []).map((d, i) => (<div key={i}>• {d}</div>))}
                  {!(home.disclosures && home.disclosures.length) && <div>—</div>}
                  {home.notes && <div className="text-xs" style={{color:"#6b7280", marginTop:8}}>{home.notes}</div>}
                </div>
              </Section>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="font-medium mb-3">Overall Health</div>
              <Progress value={score} />
              <div className="text-sm mt-1">{score}/100</div>
              <div className="mt-6 font-medium">Actions</div>
              <div className="flex flex-col gap-2 mt-2">
                <Button onClick={downloadHtml}>Download Report (HTML)</Button>
                <Button variant="secondary" onClick={exportJson}>Export Raw JSON</Button>
              </div>
            </CardContent></Card>
          </div>
          <div className="flex justify-end gap-2 mt-6"><Button variant="secondary" onClick={onClose}>Close</Button></div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [query, setQuery] = useState("");
  const [homes, setHomes] = useState(MOCK_HOMES);
  const [selected, setSelected] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS });
  const [filters, setFilters] = useState({ minScore: 0, minBeds: 0, minBaths: 0, yearMin: 1900, yearMax: CURRENT_YEAR });

  const normalizedWeights = useMemo(() => {
    const s = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
    const out = {};
    Object.keys(weights).forEach((k) => { out[k] = weights[k] / s; });
    return out;
  }, [weights]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return homes.filter((h) => {
      const score = computeHealthScore(h, normalizedWeights);
      if (score < filters.minScore) return false;
      if (filters.minBeds && (h.beds || 0) < filters.minBeds) return false;
      if (filters.minBaths && (h.baths || 0) < filters.minBaths) return false;
      if (h.yearBuilt < filters.yearMin || h.yearBuilt > filters.yearMax) return false;
      if (q && !h.address.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [homes, query, filters, normalizedWeights]);

  const setHomeNote = (id, note) => setHomes((prev) => prev.map((h) => (h.id === id ? { ...h, notes: note } : h)));

  const exportAllJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `homes_${filtered.length}.json`; a.click(); URL.revokeObjectURL(url);
  };
  const exportAllCSV = () => {
    const headers = ["id","address","yearBuilt","sqFt","beds","baths","lotSqFt","lastSoldDate","lastSoldPrice","roofYear","hvacYear","plumbingYear","electricalYear","waterHeaterYear","score"];
    const rows = filtered.map((h) => {
      const score = computeHealthScore(h, normalizedWeights);
      const s = h.systems || {};
      const vals = [
        h.id, h.address, h.yearBuilt, h.sqFt, h.beds, h.baths, h.lotSqFt, (h.lastSold && h.lastSold.date) || "", (h.lastSold && h.lastSold.price) || "",
        (s.roof && s.roof.year) || "", (s.hvac && s.hvac.year) || "", (s.plumbing && s.plumbing.year) || "", (s.electrical && s.electrical.year) || "", (s.waterHeater && s.waterHeater.year) || "", score
      ];
      return vals.map((v) => (typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v)).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `homes_${filtered.length}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{background:"linear-gradient(180deg,#fff,#eef2ff)"}}>
      <header className="p-6" style={{background:"linear-gradient(90deg,#4f46e5,#7c3aed,#d946ef)", color:"#fff"}}>
        <div className="max-w-6xl" style={{margin:"0 auto"}}>
          <div className="text-xs" style={{opacity:.9, textTransform:"uppercase", letterSpacing:".05em"}}>MVP Preview</div>
          <h1 className="text-3xl font-bold leading-tight">Carfax for Homes</h1>
          <p style={{opacity:.8, marginTop:4}}>Search, filter, open a detailed report, export and share.</p>

          <div className="mt-4" style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, maxWidth:900}}>
            <div style={{display:"flex", gap:8}}>
              <Input placeholder="Search by address or city…" value={query} onChange={(e) => setQuery(e.target.value)} />
              <Button onClick={() => setQuery(query)}>Search</Button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="whitespace-nowrap">Min Score</span>
              <input type="range" min={0} max={100} value={filters.minScore} onChange={(e) => setFilters((f) => ({ ...f, minScore: Number(e.target.value) }))} className="w-full" />
              <span className="w-10 text-right">{filters.minScore}</span>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8}}>
              <Input type="number" placeholder="Min Beds" value={filters.minBeds} onChange={(e) => setFilters((f) => ({ ...f, minBeds: Number(e.target.value) }))} />
              <Input type="number" placeholder="Min Baths" value={filters.minBaths} onChange={(e) => setFilters((f) => ({ ...f, minBaths: Number(e.target.value) }))} />
              <Input type="number" placeholder="Year Min" value={filters.yearMin} onChange={(e) => setFilters((f) => ({ ...f, yearMin: Number(e.target.value) }))} />
              <Input type="number" placeholder="Year Max" value={filters.yearMax} onChange={(e) => setFilters((f) => ({ ...f, yearMax: Number(e.target.value) }))} />
            </div>
          </div>

          <div className="mt-4" style={{background:"rgba(255,255,255,.1)", borderRadius:12, padding:12, backdropFilter:"blur(4px)"}}>
            <div className="text-xs" style={{fontWeight:600, marginBottom:8}}>Scoring Weights (auto-normalized)</div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8}}>
              {Object.keys(DEFAULT_WEIGHTS).map((k) => (
                <div key={k} style={{display:"flex", alignItems:"center", gap:8}}>
                  <span style={{width:80, textTransform:"capitalize"}}>{k}</span>
                  <input type="range" min={0} max={100} value={Math.round(weights[k]*100)} onChange={(e) => setWeights((w) => ({ ...w, [k]: Number(e.target.value) / 100 }))} className="w-full" />
                  <span style={{width:40, textAlign:"right"}}>{Math.round((weights[k] / (Object.values(weights).reduce((a,b)=>a+b,0)||1)) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3" style={{display:"flex", gap:8}}>
            <Button variant="secondary" onClick={exportAllCSV}>Export Visible (CSV)</Button>
            <Button variant="secondary" onClick={exportAllJSON}>Export Visible (JSON)</Button>
          </div>
        </div>
      </header>

      <main className="p-6" style={{maxWidth:1200, margin:"0 auto"}}>
        <div className="text-xs" style={{color:"#6b7280", marginBottom:8}}>Showing {filtered.length} of {homes.length} homes</div>
        <div className="grid" style={{gridTemplateColumns:"2fr 1fr", gap:16}}>
          <div className="grid" style={{gridTemplateColumns:"1fr 1fr", gap:16}}>
            {filtered.map((home) => {
              const score = computeHealthScore(home, normalizedWeights);
              return (
                <motion.div key={home.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="rounded-2xl" style={{boxShadow:"0 4px 18px rgba(0,0,0,.08)"}}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between" style={{gap:12}}>
                        <div>
                          <div className="text-base font-semibold leading-tight">{home.address}</div>
                          <div className="text-xs" style={{color:"#6b7280"}}>Built {home.yearBuilt} • {(home.sqFt && home.sqFt.toLocaleString ? home.sqFt.toLocaleString() : home.sqFt)} sq ft</div>
                          <div className="mt-2" style={{display:"flex", flexWrap:"wrap", gap:6, fontSize:12}}>
                            {riskTags(home).map((t) => (<Badge key={t} variant="secondary">{t}</Badge>))}
                          </div>
                        </div>
                        <ScoreBadge score={score} />
                      </div>
                      <div className="grid" style={{gridTemplateColumns:"1fr 1fr", gap:12, marginTop:12}}>
                        <div>
                          <div className="text-xs" style={{color:"#6b7280", marginBottom:4}}>Systems Snapshot</div>
                          <div className="text-xs">Roof: {home.systems?.roof?.year ?? "—"}</div>
                          <div className="text-xs">HVAC: {home.systems?.hvac?.year ?? "—"}</div>
                          <div className="text-xs">Plumbing: {home.systems?.plumbing?.year ?? "—"}</div>
                          <div className="text-xs">Electrical: {home.systems?.electrical?.year ?? "—"}</div>
                        </div>
                        <div>
                          <div className="text-xs" style={{color:"#6b7280", marginBottom:4}}>Last Sold</div>
                          <div className="text-xs">{home.lastSold?.date || "—"}</div>
                          <div className="text-xs">{home.lastSold?.price ? `$${(home.lastSold.price && home.lastSold.price.toLocaleString ? home.lastSold.price.toLocaleString() : home.lastSold.price)}` : "—"}</div>
                        </div>
                      </div>
                      <div className="mt-4" style={{display:"flex", flexWrap:"wrap", gap:8}}>
                        <Button size="sm" onClick={() => setSelected(home)}>Open Report</Button>
                        <Button size="sm" variant="secondary" onClick={() => navigator.clipboard && navigator.clipboard.writeText((window?.location?.href || '') + `#${home.id}`)}>Copy Permalink</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          <div>
            <Card className="rounded-2xl"><CardContent className="p-4">
              <div className="font-medium">Quick Notes</div>
              <div className="text-xs" style={{color:"#6b7280", marginBottom:8}}>Attach internal notes to the currently selected home.</div>
              <Textarea placeholder="Type a note and save to the currently selected home…" value={newNote} onChange={(e) => setNewNote(e.target.value)} />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => selected && setHomeNote(selected.id, newNote)} disabled={!selected || !newNote.trim()}>Save to Selected</Button>
                <Button size="sm" variant="secondary" onClick={() => setNewNote("")}>Clear</Button>
              </div>
              <div className="text-xs" style={{color:"#6b7280", marginTop:12}}>Tip: Click any card's "Open Report" to select it.</div>
            </CardContent></Card>
          </div>
        </div>
      </main>

      <AnimatePresence>{selected && <ReportView home={selected} weights={normalizedWeights} onClose={() => setSelected(null)} />}</AnimatePresence>

      <footer className="p-6" style={{textAlign:"center", fontSize:12, color:"#6b7280"}}>© {new Date().getFullYear()} Carfax for Homes — Demo MVP</footer>
    </div>
  );
}
