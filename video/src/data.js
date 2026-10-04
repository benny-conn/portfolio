// One fictional tour drives every surface in the video so the details agree.
// The first five dates mirror the "Tour Ops Sandbox" tour in Master Tour.

export const TOUR = {
  artist: "The Lanterns",
  name: "The Lanterns — Fall 2026",
  today: { date: "MON OCT 19", city: "NEW YORK", venue: "LANTERN HALL" },
}

export const SHOWS = [
  { date: "10/19", day: "Mon", city: "New York, NY", short: "NYC", venue: "Lantern Hall" },
  { date: "10/20", day: "Tue", city: "Philadelphia, PA", short: "PHL", venue: "Foundry Room" },
  { date: "10/21", day: "Wed", city: "Washington, DC", short: "DC", venue: "Capitol Room" },
  { date: "10/22", day: "Thu", city: "Richmond, VA", short: "RIC", venue: "River Room" },
  { date: "10/23", day: "Fri", city: "Raleigh, NC", short: "RAL", venue: "Oak Room" },
  { date: "10/24", day: "Sat", city: "Asheville, NC", short: "AVL", venue: "Mill Hall" },
  { date: "10/26", day: "Mon", city: "Atlanta, GA", short: "ATL", venue: "Signal House" },
  { date: "10/27", day: "Tue", city: "Nashville, TN", short: "NSH", venue: "Cumberland Room" },
  { date: "10/29", day: "Thu", city: "Chicago, IL", short: "CHI", venue: "Lakeview Assembly" },
  { date: "11/01", day: "Sun", city: "Minneapolis, MN", short: "MSP", venue: "North Loop Room" },
  { date: "11/03", day: "Tue", city: "Denver, CO", short: "DEN", venue: "Larimer Hall · night 1" },
  { date: "11/04", day: "Wed", city: "Denver, CO", short: "DEN", venue: "Larimer Hall · night 2" },
]

export const MT_SHOWS = SHOWS.slice(0, 5)

// Your own day (Layer 3) — shown along the top of the frame.
export const RUN_OF_SHOW = [
  { t: 9 * 60, label: "Lobby call" },
  { t: 11 * 60, label: "Load-in" },
  { t: 16 * 60, label: "Soundcheck" },
  { t: 19 * 60, label: "Doors" },
  { t: 21 * 60 + 15, label: "Show" },
  { t: 23 * 60 + 30, label: "Settlement" },
  { t: 25 * 60, label: "Bus call" },
]

export const NOTIFS = [
  { app: "mail", from: "Dana Whitfield · River Room", subject: "RE: RE: Advance — The Lanterns, Thursday", to: "mail" },
  { app: "mail", from: "Oak Room Raleigh", subject: "Tech pack v3 + production advance", to: "pdf", attach: true },
  { app: "msg", from: "Jess (drums)", subject: "can I get +2 for DC?", to: "texts" },
  { app: "mail", from: "Glenwood Hotel Raleigh", subject: "Reservation confirmation #RG-44812", to: "pdf", attach: true },
  { app: "mail", from: "Capitol Room DC", subject: "Guest list policy + settlement contact", to: "mail" },
  { app: "mail", from: "Coachworks Bus Co.", subject: "Driver hours / Richmond parking?", to: "mail" },
  { app: "msg", from: "Maya (management)", subject: "did DC confirm the merch split?", to: "texts" },
  { app: "mail", from: "Foundry Room Philadelphia", subject: "Hospitality rider — counter?", to: "mail" },
  { app: "mail", from: "Lantern Hall NYC", subject: "Tonight: settlement at 11:30", to: "mail" },
  { app: "msg", from: "Sam (FOH)", subject: "need the Raleigh input list", to: "texts" },
]

export const RICHMOND_EMAIL = {
  from: "Dana Whitfield",
  email: "dana@riverroom-rva.com",
  initials: "DW",
  time: "11:14 AM",
  subject: "RE: RE: Advance — The Lanterns, Thursday",
  lines: [
    "Hi! Answers for Thursday below.",
    "Load-in: 2:00 PM at the Canal St dock",
    "Parking: 1 bus spot on Canal St",
    "Power: shore power, 50A",
    "Catering: buyout, $25 per person",
    "Settlement: me, after the show",
    "",
    "Also, heads up: the city moved our weeknight",
    "curfew to 10:30 PM. Hard out.",
    "",
    "— Dana",
  ],
}

// Advance Tracker (Google Sheet the assistant keeps as its ledger).
export const FIELDS = ["Load-in", "Set times", "Curfew", "Parking", "Power", "Catering", "Hotel", "Guest list", "Merch", "Settle w/"]

const VALUES = [
  ["12:00 PM", "1:00 PM", "12:30 PM", "2:00 PM", "1:30 PM", "2:00 PM", "1:00 PM", "12:00 PM", "2:00 PM", "1:00 PM", "12:00 PM", "3:00 PM"],
  ["9:15–10:45", "9:15–10:45", "9:00–10:30", "9:15–10:45", "9:15–10:45", "9:00–10:30", "9:15–10:45", "9:15–10:45", "9:30–11:00", "9:15–10:45", "9:15–10:45", "9:15–10:45"],
  ["11:00 PM", "11:00 PM", "11:30 PM", "10:30 PM", "11:00 PM", "11:00 PM", "12:00 AM", "11:00 PM", "11:30 PM", "11:00 PM", "11:00 PM", "11:00 PM"],
  ["44th St", "Dock", "Rear lot", "Canal St", "Dock B", "Lot C", "2 spots", "Alley", "Clark St", "Lot", "Dock", "Dock"],
  ["50A", "50A", "None", "50A", "50A", "30A", "50A", "50A", "50A", "None", "50A", "50A"],
  ["Buyout $30", "Hot meal", "Buyout $25", "Buyout $25", "Hot meal", "Buyout $20", "Hot meal", "Buyout $25", "Hot meal", "Buyout $25", "Hot meal", "Hot meal"],
  ["12 rooms", "12 rooms", "12 rooms", "12 rooms", "10 of 12", "12 rooms", "12 rooms", "12 rooms", "12 rooms", "12 rooms", "12 rooms", "12 rooms"],
  ["10 comps", "8 comps", "10 comps", "8 comps", "8 comps", "6 comps", "10 comps", "8 comps", "12 comps", "8 comps", "10 comps", "10 comps"],
  ["85/15", "80/20", "Self-sell", "85/15", "80/20", "Self-sell", "85/15", "80/20", "85/15", "Self-sell", "80/20", "80/20"],
  ["J. Ortiz", "P. Kim", "R. Bell", "D. Whitfield", "T. Nash", "A. Ruiz", "M. Grant", "L. Shaw", "K. Diaz", "E. Lund", "C. Moss", "C. Moss"],
]

// C = confirmed, M = missing, A = asked / waiting on reply, X = conflict (needs you)
const START = [
  "CCCCCCCCCC",
  "CCCCCCCMCC",
  "CCCCCCCMCM",
  "CCXCCCCCMC",
  "MCMMCMXCMM",
  "MMMMMMCMMM",
  "MCMMMMCMMM",
  "MMMMMMCMMM",
  "MMMMMMMMMM",
  "MMMMMMCMMM",
  "MMMMMMCMMM",
  "MMMMMMCMMM",
]

const END = [
  "CCCCCCCCCC",
  "CCCCCCCCCC",
  "CCCCCCCCCC",
  "CCXCCCCCCC",
  "CCCCCCXCCC",
  "CCCACCCCAC",
  "CCCCCACCCC",
  "CCACCCCCAC",
  "CACCACCCCA",
  "ACCACCCACC",
  "CCCCACCCCC",
  "CCCCACCCCA",
]

export const GRID = SHOWS.map((show, r) => ({
  ...show,
  cells: FIELDS.map((field, c) => ({
    value: VALUES[c][r],
    start: START[r][c],
    end: END[r][c],
  })),
}))

export const GRID_STATS = (() => {
  let missing = 0
  let filled = 0
  let waiting = 0
  let conflicts = 0
  GRID.forEach((row) =>
    row.cells.forEach((cell) => {
      if (cell.start === "M") missing++
      if (cell.start === "M" && cell.end === "C") filled++
      if (cell.end === "A") waiting++
      if (cell.end === "X") conflicts++
    })
  )
  const venuesAsked = GRID.filter((row) => row.cells.some((cell) => cell.start === "M")).length
  return { missing, filled, waiting, conflicts, venuesAsked }
})()

// Fields filled from the Richmond email in the hero scene.
export const HERO_UPDATES = 5
