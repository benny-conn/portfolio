# Writes src/audio-manifest.json from the files in public/audio (durations in seconds).
import json, os, subprocess

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
audio = os.path.join(root, "public", "audio")

def dur(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path])
    return round(float(out.strip()), 3)

manifest = {"music": "audio/music.mp3", "vo": {}, "sfx": {}}
for kind in ("vo", "sfx"):
    for name in sorted(os.listdir(os.path.join(audio, kind))):
        if name.endswith(".mp3"):
            manifest[kind][name[:-4]] = dur(os.path.join(audio, kind, name))

with open(os.path.join(root, "src", "audio-manifest.json"), "w") as f:
    json.dump(manifest, f, indent=2)
print(json.dumps(manifest, indent=2))
