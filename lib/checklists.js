// Karimu audit checklist definitions and applicability rules.
// Ported verbatim from the field-audit prototype (single source of truth
// for what a School building / School bathroom audit contains).

const SCHOOLS = ["Ayalagaya","Arri Primary","Bacho","Dareda Kati","Dohom Primary","Gajal","Haysam","Ufani"];

const BUILDING_NAMES = ["Academic office","Boys hostel","Extra classroom","Five classes building (Faru block)","Girls hostel","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Head of school","Kitchen","Laboratory (Swala block)","Library building (Nyati block)","New classroom","Nursery","Staff and teachers' room","Staff room building (Tembo block)","Teacher house","Three classes building (Kiboko block)"];

const BUILDING_TYPES = [
  {id:"classroom",   label:"Classroom"},
  {id:"nursery",     label:"Nursery"},
  {id:"laboratory",  label:"Laboratory"},
  {id:"office",      label:"Office (head of school / academic)"},
  {id:"staffroom",   label:"Staff and teachers' room"},
  {id:"library",     label:"Library"},
  {id:"kitchen",     label:"Kitchen"},
  {id:"teacherhouse",label:"Teacher house"},
  {id:"hostel",      label:"Hostel"},
  {id:"other",       label:"Other building"}
];
const TEACHING_SPACES = ["classroom","nursery","laboratory"];
const COOKING_SPACES  = ["kitchen","teacherhouse"];

const BATHROOM_UNITS = [
  {id:"girls",          label:"Girls",               side:"girls"},
  {id:"female_teachers",label:"Female teachers",     side:"girls"},
  {id:"girls_hostel",   label:"Girls hostel",        side:"girls"},
  {id:"boys",           label:"Boys",                side:"boys"},
  {id:"male_teachers",  label:"Male teachers",       side:"boys"},
  {id:"boys_hostel",    label:"Boys hostel",         side:"boys"},
  {id:"handwashing",    label:"Sink for handwashing", side:"sink"}
];

/* --- School building: 3 sections, 79 items ------------------------ */
const SCHOOL_BUILDING = [
  {id:"outside", title:"Outside", groups:[
    ["Gutters",["are leaking","are falling","are clogged","are dirty"]],
    ["Downspouts",["are leaking","are falling","are clogged","discharge water is eroding the foundation","discharge water is eroding the landscape around"]],
    ["Eaves",["have water infiltration spots","have bee or wasp nests","need repainting","vents are broken","gable vents are broken or not properly screened"]],
    ["Walls",["are cracked","have water infiltration","need repainting","are dirty"]],
    ["Foundations",["are washing away","need maintenance"]],
    ["Windows",["glass is broken","are dirty","are hard to open or close","hinge is broken","lock is broken or missing","handle is broken or missing","putty is falling off","need repainting"]],
    ["Doors",["are hard to open or close","are rusting","need repainting","hinge is broken","glass is broken","stick on the frame","putty is falling off"]],
    ["Access ramps or steps",["are cracked or broken","have steps or bumps (not connecting smoothly at both ends: outdoor paving and indoor floor)"]],
    ["Outdoor floors",["are cracked or broken","are dirty (need cleaning)"]],
    ["Vegetation",["is growing outside where planned","is interfering with building functionality"]],
    ["Karimu plaque",["is missing or falling","is cracked, broken, or damaged","is faded"]],
    ["Equipment",["is broken","water storage tank is broken or overflowing"]]
  ]},
  {id:"inside", title:"Inside", groups:[
    ["Ceiling",["is cracked, broken or falling off","has water infiltration spots","needs repainting or cleaning"]],
    ["Windows",["glass is broken","are dirty","are hard to open or close","hinge is broken","lock is broken or missing","handle is broken or missing","need repainting","putty is falling off"]],
    ["Walls",["are cracked","have water infiltration","are dirty","need repainting","are incomplete"]],
    ["Floors",["are cracked or broken","are dirty"]],
    ["Blackboard",["is cracked, broken or falling","needs repainting"],"teaching"],
    ["Stove",["is dirty","is cracked or broken","smoke remains inside the room","chimney is in poor condition (not working properly)"],"cooking"],
    ["Lights",["are not working","socket or switch is broken","bulb or tube light is missing"]]
  ]},
  {id:"grounds", title:"School farm, garden and trees", schoolLevel:true,
   note:"These are school-level questions, not building-level. Answer them once per school visit — on the first building you inspect that day.",
   groups:[
    ["Farm",["crops are being used for purposes other than sustaining the school","crops look poor"]],
    ["Garden",["vegetables or fruits are being used for purposes other than sustaining the school","vegetables or fruits look poor"]],
    ["Trees",["some trees look in poor condition","some trees died this quarter"]]
  ]}
];

/* --- School bathroom: 5 sections, 150 items ----------------------- */
const SCHOOL_BATHROOM = [
  {id:"outside", title:"Outside", groups:[
    ["Gutters",["are leaking","are falling","are clogged"],"main"],
    ["Downspouts",["are leaking","are falling","are clogged","discharge water is eroding the foundation","discharge water is eroding the landscape around"],"main"],
    ["Eaves",["have water infiltration spots","have bee or wasp nests","need repainting","vents are broken","gable vents are broken or not properly screened"],"main"],
    ["Walls",["are cracked","have water infiltration","need repainting"],"main"],
    ["Foundations",["are washing away","need maintenance"],"main"],
    ["Windows",["glass is broken","are dirty","are hard to open or close","hinge is broken","lock is broken or missing","handle is broken or missing","putty is falling off","need repainting"],"main"],
    ["External doors",["are hard to open or close","are rusting","need repainting"],"main"],
    ["Inspection boxes",["are structurally in bad condition","are hard to open or close","are malfunctioning"],"main"],
    ["Clean-out pipes",["are difficult to access","are hard to open or close","are clogged","are damaged"],"main"],
    ["External valves",["are hard to open or close","are leaking"],"main"],
    ["Septic tank vent",["is falling","is malfunctioning"],"main"],
    ["Access ramps or steps",["are cracked or broken","have steps or bumps (not connecting smoothly at both ends: outdoor paving and indoor floor)"],"main"],
    ["Outdoor paving",["is cracked or broken","is dirty (needs cleaning)"],"main+sink"],
    ["Vegetation",["is growing outside where planned","is interfering with building functionality"],"main+sink"],
    ["Karimu plaque",["is missing or falling","is cracked, broken, or damaged","is faded"],"main+sink"]
  ]},
  {id:"inside", title:"Inside", groups:[
    ["Wash basins",["are cracked or broken","drain is clogged","tap is leaking","are dirty"],"main+sink"],
    ["Mirrors",["are cracked or broken","are dirty"],"main"],
    ["Water faucets",["are hard to open or close","are dripping when shut off","are broken or missing","are dirty"],"main+sink"],
    ["Water (flush) tanks",["are cracked or broken","are having difficulty refilling, or are flushing poorly","pull chains are missing or broken","flush tube is leaking"],"main"],
    ["Toilet stalls",["are flushing poorly","toilet bowl (or steps for squatting) is cracked or broken","toilet bowl (or steps for squatting) is clogged","toilet bowl (or steps for squatting) and lid are dirty","are dirty"],"main"],
    ["Stall doors",["are missing","are hard to open or close","are rusting","need repainting"],"main"],
    ["Washing hose and spray in stalls",["nozzle is spraying poorly","nozzle is dripping","hose is cracked or broken","hose is leaking","hose valve is hard to open and close","nozzle and hose are dirty","stall with washing hose is inaccessible to the girls"],"main"],
    ["Water faucet in stalls",["is delivering not enough water","is broken or missing","is leaking when turned off"],"main"],
    ["Walls",["tiles are cracked, broken or falling","have water infiltration","are dirty","need repainting"],"main"],
    ["Floors",["tiles are cracked, broken or falling off","drain is clogged or broken","are dirty"],"main"],
    ["Inside doors",["are hard to open or close","are rusting","need repainting"],"main"],
    ["Ceiling",["is cracked, broken or falling off","has water infiltration spots","needs repainting"],"main"],
    ["Windows",["are dirty","are hard to open or close"],"main"],
    ["Lights",["are not working","socket or switch is broken","bulb or tube light is missing"],"main"]
  ]},
  {id:"patio", title:"Girls' bathroom — internal patio", groups:[
    ["Wash tanks",["tiles are cracked, broken, or falling off","drain is clogged","trap is leaking","are dirty"],"girls"],
    ["Water faucets",["are hard to open or close","are dripping when shut off","are dirty"],"girls"],
    ["Counters",["tiles are cracked, broken, or falling off","are dirty"],"girls"],
    ["Walls",["tiles are cracked, broken, or falling off","have water infiltration","are dirty","need repainting"],"girls"],
    ["Floors",["tiles are cracked, broken, or falling off","are dirty"],"girls"],
    ["Clothes lines",["are loose (not tight)","are rusted","are broken","are missing"],"girls"],
    ["External door",["is hard to open or close","is rusting","needs repainting"],"girls"],
    ["Incinerator",["is not burning properly","trap door is hard to open or close","firewood is missing or not enough","chimney is cracked or broken","chimney is venting poorly"],"girls"]
  ]},
  {id:"storage", title:"Girls' bathroom — storage", groups:[
    ["Walls",["tiles are cracked, broken or falling","have water infiltration","are dirty","need repainting"],"girls"],
    ["Floor",["tiles are cracked, broken or falling off","drain is clogged or broken","is dirty"],"girls"],
    ["Ceiling",["is cracked, broken or falling off","has water infiltration spots","needs repainting"],"girls"],
    ["Window",["is dirty","is hard to open or close"],"girls"],
    ["Door",["is hard to open or close","is rusting","needs repainting"],"girls"]
  ]},
  {id:"urinals", title:"Boys' and male teachers' bathroom", groups:[
    ["Urinals",["are flushing poorly","bowl is cracked or broken","bowl is clogged","valves are opening and closing poorly","valves are dripping when shut off","flush tube is leaking","tap is leaking","are dirty"],"boys"]
  ]}
];

const AUDIT_TYPES = {
  school_building:{
    id:"school_building", label:"School building",
    blurb:"Quarterly maintenance inspection of one school building or room — outside, inside, and the school grounds.",
    sections:SCHOOL_BUILDING, unitLabel:"Building or room", available:true,
    glyph:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/><path d="M9 11h.01M15 11h.01"/></svg>'
  },
  school_bathroom:{
    id:"school_bathroom", label:"School bathroom",
    blurb:"Maintenance inspection of one bathroom block — girls, boys, teachers, hostels, or a standalone handwashing sink.",
    sections:SCHOOL_BATHROOM, unitLabel:"Bathroom unit", available:true,
    glyph:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4Z"/><path d="M7 12V6a2 2 0 0 1 2-2h1"/><path d="M12 4h4"/><path d="M8 20l-1 2M16 20l1 2"/></svg>'
  },
  water_point:{
    id:"water_point", label:"Water point", available:false,
    blurb:"Taps, plaque, fence, drainage pit, and banana-tree encroachment. Checklist not defined yet.",
    glyph:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3 4.5 5 7.4 5 10a5 5 0 0 1-10 0c0-2.6 2-5.5 5-10Z"/></svg>'
  },
  health_post:{
    id:"health_post", label:"Health post", available:false,
    blurb:"Health facility inspection. Scope and checklist still to be confirmed.",
    glyph:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M12 9v7M8.5 12.5h7"/></svg>'
  }
};

/* ==================================================================
   APPLICABILITY
   ================================================================== */
function groupApplies(scope, ctx){
  if(!scope) return true;
  if(ctx.type === "school_building"){
    if(scope === "teaching") return TEACHING_SPACES.includes(ctx.buildingType);
    if(scope === "cooking")  return COOKING_SPACES.includes(ctx.buildingType);
    return true;
  }
  const side = (BATHROOM_UNITS.find(u => u.id === ctx.unitId) || {}).side;
  if(scope === "main")      return side === "girls" || side === "boys";
  if(scope === "main+sink") return true;
  if(scope === "girls")     return side === "girls";
  if(scope === "boys")      return side === "boys";
  return true;
}

/* Flatten an audit's applicable items into an ordered list. */
function buildItems(audit){
  const def = AUDIT_TYPES[audit.type];
  const ctx = {type:audit.type, unitId:audit.unitId, buildingType:audit.buildingType};
  const out = [];
  def.sections.forEach(sec => {
    sec.groups.forEach(([group, statements, scope]) => {
      if(!groupApplies(scope, ctx)) return;
      statements.forEach((text, i) => {
        out.push({
          key: sec.id + "/" + slug(group) + "/" + i,
          sectionId: sec.id, sectionTitle: sec.title,
          group, text
        });
      });
    });
  });
  return out;
}
function sectionsFor(audit){
  const def = AUDIT_TYPES[audit.type];
  const ctx = {type:audit.type, unitId:audit.unitId, buildingType:audit.buildingType};
  return def.sections.map(sec => ({
    ...sec,
    groups: sec.groups.filter(g => groupApplies(g[2], ctx))
  })).filter(sec => sec.groups.length > 0);
}
function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }

export {
  SCHOOLS, BUILDING_NAMES, BUILDING_TYPES, TEACHING_SPACES, COOKING_SPACES,
  BATHROOM_UNITS, SCHOOL_BUILDING, SCHOOL_BATHROOM, AUDIT_TYPES,
  groupApplies, buildItems, sectionsFor, slug
};
