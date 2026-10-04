#!/usr/bin/env bash
# Two-pass loudness normalization (-16 LUFS, -1.5 dBTP) of the raw render for web playback.
set -euo pipefail
cd "$(dirname "$0")/.."

RAW=out/tour-ops-demo-raw.mp4
OUT=out/tour-ops-demo.mp4

MEASURED=$(ffmpeg -hide_banner -i "$RAW" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 |
  sed -n '/{/,/}/p' |
  python3 -c "import sys,json;d=json.load(sys.stdin);print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")

ffmpeg -loglevel error -y -i "$RAW" -c:v copy \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11:${MEASURED}:linear=true" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT"

echo "wrote $OUT"
