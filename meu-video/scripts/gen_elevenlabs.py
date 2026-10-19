"""Gera a narração do vídeo da Dimaq com a ElevenLabs.

A chave vem da variável de ambiente ELEVENLABS_API_KEY (nunca escreva a chave no código).

Uso:
  python scripts/gen_elevenlabs.py vozes              # lista as vozes da conta
  python scripts/gen_elevenlabs.py gerar <voice_id>   # gera as 23 falas

O modo "gerar" grava out/elevenlabs/voz.wav e out/elevenlabs/bounds.json, que entram em
scripts/build_voice_track.py exatamente como a gravação da sua voz entrou.
"""

import io
import json
import os
import sys
import urllib.request

import numpy as np
import soundfile as sf

API = "https://api.elevenlabs.io/v1"
KEY = os.environ.get("ELEVENLABS_API_KEY")
SR = 44100
PAUSE = 0.6


def call(path, body=None, accept="application/json"):
    req = urllib.request.Request(
        API + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers={
            "xi-api-key": KEY or "",
            "Content-Type": "application/json",
            "Accept": accept,
        },
        method="POST" if body is not None else "GET",
    )
    with urllib.request.urlopen(req) as r:
        return r.read()


def lines():
    # O roteiro fica em um só lugar: a lista "lines" de scripts/gen_audio.py.
    src = open(os.path.join(os.path.dirname(__file__), "gen_audio.py")).read()
    ns = {}
    exec(src[src.index("lines = [") : src.index("]\n\nkokoro") + 1], ns)
    return ns["lines"]


if __name__ == "__main__":
    if not KEY:
        # Com "Network secrets" o proxy injeta a chave no cabeçalho; sem ela, só avisamos.
        print("Aviso: ELEVENLABS_API_KEY não definida; usando a credencial do proxy, se houver.")

    if sys.argv[1] == "vozes":
        for v in json.loads(call("/voices"))["voices"]:
            print(v["voice_id"], "|", v["name"], "|", v.get("labels", {}))
        sys.exit()

    voice_id = sys.argv[2]
    out = os.path.join(os.path.dirname(__file__), "..", "out", "elevenlabs")
    os.makedirs(out, exist_ok=True)

    parts, bounds, t = [], [], 0.0
    for i, text in enumerate(lines(), 1):
        mp3 = call(
            f"/text-to-speech/{voice_id}?output_format=mp3_44100_128",
            {
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "language_code": "pt",
                "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.2},
            },
            accept="audio/mpeg",
        )
        open(os.path.join(out, f"fala{i:02d}.mp3"), "wb").write(mp3)
        audio, sr = sf.read(io.BytesIO(mp3))
        if audio.ndim > 1:
            audio = audio.mean(axis=1)
        assert sr == SR, sr
        bounds.append(t)
        parts += [audio, np.zeros(int(PAUSE * SR))]
        t += len(audio) / SR + PAUSE
        print(f"fala {i:02d}: {len(audio) / SR:.1f} s")
    bounds.append(t)

    sf.write(os.path.join(out, "voz.wav"), np.concatenate(parts), SR)
    json.dump(bounds, open(os.path.join(out, "bounds.json"), "w"))
    print("pronto:", out)
