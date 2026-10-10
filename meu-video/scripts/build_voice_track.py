"""Builds the narration track from a recorded voice.

Usage: python build_voice_track.py clean.wav bounds.json out_audio_dir timing.json

bounds.json holds 24 times (seconds): the start of each of the 23 lines in the
recording plus the end of the last one. Each line is placed at the start of its
scene; the scene lasts as long as the line, so the screens follow the voice.
"""

import json
import sys

import numpy as np
import soundfile as sf

clean, bounds_path, out_audio, out_json = sys.argv[1:5]
FPS = 30
TRANSITION = 15
SR = 44100
LEAD = 0.35
TAIL = 0.6

voice_in, sr = sf.read(clean)
if voice_in.ndim > 1:
    voice_in = voice_in.mean(axis=1)
assert sr == SR, sr
bounds = json.load(open(bounds_path))

clips = []
durations = []
for i in range(len(bounds) - 1):
    clip = voice_in[int(bounds[i] * SR) : int(bounds[i + 1] * SR)].copy()
    fade = int(0.08 * SR)
    clip[:fade] *= np.linspace(0, 1, fade)
    clip[-fade:] *= np.linspace(1, 0, fade)
    clips.append(clip)
    durations.append(max(120, int(np.ceil((LEAD + len(clip) / SR + TAIL) * FPS))))

total_frames = sum(durations) - (len(durations) - 1) * TRANSITION
total = int(total_frames / FPS * SR) + SR
voice = np.zeros(total)
start_frame = 0
for clip, dur in zip(clips, durations):
    s = int((start_frame / FPS + LEAD) * SR)
    voice[s : s + len(clip)] += clip
    start_frame += dur - TRANSITION

hop = SR // FPS
rms = np.array(
    [np.sqrt(np.mean(voice[i * hop : (i + 1) * hop] ** 2)) for i in range(total_frames)]
)
mouth = np.clip(rms / (np.percentile(rms[rms > 0.01], 90) + 1e-6), 0, 1)
mouth = np.round(np.convolve(mouth, [0.25, 0.5, 0.25], mode="same"), 2)

# Background music: I–V–vi–IV in C major at 96 BPM, generated additively.
t = np.arange(total) / SR
beat = 60 / 96
bar = beat * 4
chords = [
    [48, 52, 55, 60, 64],
    [43, 50, 55, 59, 62],
    [45, 52, 57, 60, 64],
    [41, 48, 53, 57, 60],
]


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


music = np.zeros(total)
music_end = total_frames / FPS
for b in range(int(np.ceil(music_end / bar)) + 1):
    chord = chords[(b // 2) % 4]
    b0 = b * bar
    i0, i1 = int(b0 * SR), min(total, int((b0 + bar) * SR))
    if i0 >= total:
        break
    seg = t[i0:i1] - b0
    env = np.minimum(1, seg / 0.6) * np.minimum(1, (bar - seg) / 0.4 + 0.2)
    pad = sum(
        np.sin(2 * np.pi * hz(m) * seg * d) * a
        for m in chord[1:]
        for d, a in ((1, 0.5), (1.003, 0.3), (2, 0.08))
    )
    music[i0:i1] += 0.05 * pad * env
    music[i0:i1] += 0.16 * np.sin(2 * np.pi * hz(chord[0] - 12) * seg) * np.exp(-seg * 0.5)
    arp = [chord[1] + 12, chord[2] + 12, chord[3] + 12, chord[4] + 12]
    for k in range(8):
        n0 = b0 + k * beat / 2
        j0, j1 = int(n0 * SR), min(total, int((n0 + 0.9) * SR))
        if j0 >= total or b0 < 4 * bar:
            continue
        s = t[j0:j1] - n0
        music[j0:j1] += 0.07 * np.sin(2 * np.pi * hz(arp[[0, 1, 2, 3, 2, 1, 2, 3][k]]) * s) * np.exp(-s * 6)
    if 4 * bar <= b0 < music_end - 2 * bar:
        for k in range(4):
            n0 = b0 + k * beat
            if k % 2 == 0:
                j0, j1 = int(n0 * SR), min(total, int((n0 + 0.35) * SR))
                s = t[j0:j1] - n0
                f = 50 + 90 * np.exp(-s * 30)
                music[j0:j1] += 0.35 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-s * 9)
            h0 = n0 + beat / 2
            j0, j1 = int(h0 * SR), min(total, int((h0 + 0.06) * SR))
            noise = np.diff(np.random.default_rng(b * 8 + k).standard_normal(j1 - j0 + 1))
            music[j0:j1] += 0.025 * noise * np.exp(-(t[j0:j1] - h0) * 60)

music *= np.clip(np.minimum(t / 2.0, (music_end - t) / 3.0), 0, 1)
music /= np.abs(music).max()

# Duck the music under the voice.
win = int(0.3 * SR)
env = np.convolve(np.abs(voice), np.ones(win) / win, mode="same")
speaking = np.clip(env / (np.percentile(env[env > 1e-4], 50) * 0.5), 0, 1)
music *= 0.22 - 0.16 * speaking

mix = voice + music
mix /= max(1.0, np.abs(mix).max() / 0.95)
sf.write(f"{out_audio}/narracao-e-musica.wav", mix.astype(np.float32), SR)

timing = json.load(open(out_json))
timing["durations"] = durations
timing["mouth"] = mouth.tolist()
json.dump(timing, open(out_json, "w"))
print("frames", total_frames, "seconds", round(total_frames / FPS, 1), durations)
