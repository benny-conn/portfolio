// Event scale and production status supplied by Benny. Keep planned work
// separate from delivered events; a planned budget is never reported as spend.
export const events = {
  spotify: {
    id: "spotify",
    name: "Spotify × Aetna",
    category: "Creative direction & event production",
    location: "New York",
    description:
      "A corporate benefits fair reimagined as a wellness carnival. Hands-on activities, thoughtful food, and playful digital experiences gave people a reason to participate.",
    role: "Through Curation Events, I led creative direction and production, bringing the concept, vendors, and on-site team together.",
    stats: [
      { value: "400", label: "guests" },
      { value: "$25k", label: "budget" },
      { value: "20", label: "on-site staff" },
      { value: "10", label: "vendors" },
    ],
    source: "https://curation.events/blog/spotify-aetna-wellness-event",
  },
  ambrook: {
    id: "ambrook-jazz",
    name: "Jazz at Ambrook",
    category: "Monthly community programming",
    location: "New York",
    description:
      "I started a monthly jazz night at Ambrook, where I work. The first evening brought 140 people together around live music, and gave us a reason to do it again.",
    stats: [
      { value: "140", label: "at the first night" },
      { value: "Monthly", label: "ongoing series" },
    ],
  },
  gig: {
    id: "gig-launch",
    name: "Gig App × Curation",
    category: "Ticketed launch & organic outreach",
    location: "Williamsburg, Brooklyn",
    description:
      "For my first event with Curation Events, I brought 120 people to a ticketed Gig App launch in a rented Williamsburg bar. All attendance came through organic outreach, filling the venue to its 120-person capacity.",
    stats: [
      { value: "120 / 120", label: "venue capacity filled" },
      { value: "100%", label: "organic outreach" },
    ],
  },
  chobani: {
    id: "chobani",
    name: "Chobani",
    category: "Concept & pre-production",
    description:
      "Developed concepts and production plans for a series of $250k Chobani events, with approval to source vendors and finalize budgets.",
    stats: [{ value: "$250k", label: "planned event scale" }],
  },
}
