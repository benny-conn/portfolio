// These small samples are fetched only after a visitor requests sound.
export const SAMPLES = {
  trumpet: [
    [65, "F4"],
    [70, "As4"],
    [77, "F5"],
  ],
  trombone: [
    [46, "As2"],
    [53, "F3"],
    [58, "As3"],
  ],
  saxophone: [
    [58, "As3"],
    [62, "D4"],
    [67, "G4"],
  ],
  piano: [
    [48, "C3"],
    [60, "C4"],
    [72, "C5"],
  ],
  contrabass: [
    [34, "As1"],
    [40, "E2"],
  ],
}

for (const [role, notes] of Object.entries(SAMPLES)) {
  SAMPLES[role] = notes.map(([midi, pitch]) => ({
    midi,
    url: `/audio/band/${role}-${pitch}.mp3`,
  }))
}
