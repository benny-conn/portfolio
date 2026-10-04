export const BAND_SCORE = (() => {
  const events = [],
    beat = 60 / 120
  // Concert Bb: the user's twelve bars, including the ii–V into IV in bar four.
  const chords = {
    Bb7: {
      root: 34,
      third: 4,
      fifth: 7,
      piano: [56, 60, 62, 67],
      bones: [50, 53, 56],
    },
    Eb7: {
      root: 39,
      third: 4,
      fifth: 7,
      piano: [55, 60, 61, 65],
      bones: [51, 55, 61],
    },
    Fm7: {
      root: 41,
      third: 3,
      fifth: 7,
      piano: [56, 60, 63, 67],
      bones: [53, 56, 63],
    },
    Edim7: {
      root: 40,
      third: 3,
      fifth: 6,
      piano: [55, 58, 61, 64],
      bones: [52, 55, 58],
    },
    Dm7: {
      root: 38,
      third: 3,
      fifth: 7,
      piano: [53, 57, 60, 64],
      bones: [50, 53, 60],
    },
    G7: {
      root: 31,
      third: 4,
      fifth: 7,
      piano: [53, 57, 59, 64],
      bones: [47, 50, 53],
    },
    Cm7: {
      root: 36,
      third: 3,
      fifth: 7,
      piano: [51, 55, 58, 62],
      bones: [48, 51, 58],
    },
    F7: {
      root: 41,
      third: 4,
      fifth: 7,
      piano: [51, 55, 57, 62],
      bones: [51, 53, 57],
    },
  }
  const changes = [
    ["Bb7"],
    ["Eb7"],
    ["Bb7"],
    ["Fm7", "Bb7"],
    ["Eb7"],
    ["Edim7"],
    ["Bb7"],
    ["Dm7", "G7"],
    ["Cm7"],
    ["F7"],
    ["Bb7", "G7"],
    ["Cm7", "F7"],
  ]
  // Benny's bassline, exactly one quarter note per beat. Octaves are arranged low.
  const bassline = [
    [34, 38, 41, 40],
    [39, 39, 40, 40],
    [41, 39, 38, 36],
    [34, 36, 37, 38],
    [39, 43, 46, 39],
    [40, 43, 46, 40],
    [41, 41, 39, 39],
    [38, 32, 31, 35],
    [36, 38, 39, 40],
    [29, 33, 36, 33],
    [34, 32, 31, 35],
    [36, 30, 29, 33],
  ]
  const atChord = (bar, at) =>
    chords[changes[bar][changes[bar].length === 2 && at >= 2 ? 1 : 0]]
  const add = (bar, at, midi, duration, role, player, volume) =>
    events.push({
      time: (bar * 4 + at) * beat,
      midi,
      duration: duration * beat,
      role,
      player,
      volume,
    })
  const swing = (at) => Math.floor(at) + (at % 1 === 0.5 ? 2 / 3 : at % 1)
  // Original short horn phrases, with space between the trumpet calls and sax answers.
  const phrases = [
    [
      [0.5, 65, 0.35],
      [1, 68, 0.65],
      [2, 70, 0.7],
      [3.5, 67, 0.35],
    ],
    [
      [0, 67, 0.55],
      [1.5, 65, 0.35],
      [2, 63, 1.1],
    ],
    [
      [0.5, 62, 0.35],
      [1, 65, 0.65],
      [2.5, 68, 0.35],
      [3, 67, 0.7],
    ],
    [
      [0, 68, 0.55],
      [1.5, 67, 0.35],
      [2, 68, 0.6],
      [3, 62, 0.65],
    ],
    [
      [0.5, 67, 0.35],
      [1, 70, 0.65],
      [2, 73, 0.7],
      [3.5, 72, 0.35],
    ],
    [
      [0, 70, 0.6],
      [1.5, 67, 0.35],
      [2, 64, 0.65],
      [3, 61, 0.65],
    ],
    [
      [0.5, 62, 0.35],
      [1, 65, 0.65],
      [2, 68, 0.9],
    ],
    [
      [0, 65, 0.55],
      [1.5, 64, 0.35],
      [2, 62, 0.6],
      [3, 59, 0.65],
    ],
    [
      [0.5, 63, 0.35],
      [1, 67, 0.65],
      [2.5, 70, 0.35],
      [3, 69, 0.7],
    ],
    [
      [0, 69, 0.55],
      [1.5, 67, 0.35],
      [2, 63, 0.6],
      [3, 60, 0.65],
    ],
    [
      [0, 62, 0.55],
      [1.5, 65, 0.35],
      [2, 65, 0.6],
      [3, 59, 0.65],
    ],
    [
      [0, 63, 0.6],
      [1.5, 62, 0.35],
      [2, 60, 0.6],
      [3.5, 69, 0.25],
    ],
  ]
  for (let bar = 0; bar < 12; bar++) {
    bassline[bar].forEach((n, b) =>
      add(bar, b, n, 0.96, "contrabass", 10, 0.24),
    )
    const comp = bar % 2 ? [0, 2 + 2 / 3] : [2 / 3, 2.5]
    comp.forEach((at) =>
      atChord(bar, at).piano.forEach((n) =>
        add(bar, at, n, 0.46, "piano", 9, 0.074),
      ),
    )
    // Ride's ding-ding-da-ding, quiet backbeat, and feathered bass drum.
    ;[0, 1, 1 + 2 / 3, 2, 3, 3 + 2 / 3].forEach((at) =>
      add(bar, at, 0, 0.25, "ride", 11, Number.isInteger(at) ? 0.075 : 0.045),
    )
    ;[1, 3].forEach((at) => add(bar, at, 0, 0.2, "snare", 11, 0.045))
    ;[0, 2].forEach((at) => add(bar, at, 40, 0.15, "kick", 11, 0.08))
    const role = bar % 2 ? "saxophone" : "trumpet",
      section = bar % 2 ? [1, 3, 7] : [0, 2, 4]
    phrases[bar].forEach(([at, n, duration]) => {
      const onset = swing(at),
        c = atChord(bar, onset),
        tones = c.piano.map((x) => x % 12),
        harmony = []
      for (let pitch = n - 1; pitch >= n - 12 && harmony.length < 2; pitch--)
        if (tones.includes(pitch % 12)) harmony.push(pitch)
      add(
        bar,
        onset,
        n,
        duration,
        role,
        section[0],
        role === "trumpet" ? 0.3 : 0.27,
      )
      harmony.forEach((pitch, j) =>
        add(bar, onset, pitch, duration * 0.9, role, section[j + 1], 0.115),
      )
    })
    ;[1 + 2 / 3, 3].forEach((at) =>
      atChord(bar, at).bones.forEach((n, j) =>
        add(bar, at, n, 0.55, "trombone", [5, 6, 8][j], j === 0 ? 0.19 : 0.13),
      ),
    )
  }
  return {
    events: events.sort((a, b) => a.time - b.time),
    duration: 48 * beat,
    beat,
    changes,
    bassline,
  }
})()
