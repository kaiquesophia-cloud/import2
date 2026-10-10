import json
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

here, out_audio, out_json = sys.argv[1], sys.argv[2], sys.argv[3]
VOICE = sys.argv[4] if len(sys.argv) > 4 else "pf_dora"
FPS = 30
TRANSITION = 15
SR = 44100
LEAD = 0.5
TAIL = 1.0

lines = [
    "Olá! Vou te apresentar o novo sistema da Dimaq. Gestão de locações em um só lugar: cada diária cobrada, e cada máquina rendendo.",
    "Uma locadora tem muita coisa girando ao mesmo tempo. Quando tudo fica no papel e na planilha, o erro aparece no caixa: reserva dupla, diária esquecida, avaria sem registro e cobrança atrasada.",
    "O novo sistema junta toda a operação: locação, medição, ordens de serviço, vendas e estoque, financeiro e o site. Tudo conversando entre si.",
    "No painel, o dia inteiro cabe numa tela. Cada locação vira um cartão com contagem regressiva. Dá para renovar, devolver ou chamar o cliente no WhatsApp com um clique.",
    "Na nova locação, o sistema mostra a disponibilidade ao vivo e aplica a melhor tarifa sozinho. Se não houver estoque no período, ele só salva como orçamento. Reserva dupla, nunca mais.",
    "No quadro, você arrasta o cartão e o sistema faz a reserva, a entrega ou a devolução. Na agenda, cada equipamento aparece numa linha do tempo.",
    "Na devolução, nenhuma diária fica esquecida. O atraso é calculado e lançado automaticamente, e a avaria vira cobrança e já abre a ordem de serviço.",
    "Para as obras, a cobrança por medição é pró-rata: o sistema cobra só o que realmente ficou na obra, e já gera o boletim de medição.",
    "Agora, vamos falar de economia.",
    "O sistema devolve ao caixa o dinheiro que escapava: diárias excedentes, avarias, multa e juros, e os valores vencidos, que agora aparecem logo no painel.",
    "E economiza o tempo da equipe. Orçar, saber quem devolve hoje, fazer a medição e fechar o mês deixam de ser trabalho manual.",
    "Qualidade: o mesmo padrão em todo contrato, em toda máquina e para todo cliente.",
    "Contratos, devoluções e boletins saem prontos, com a marca Dimaq, para imprimir, salvar em PDF ou enviar por link.",
    "Máquina revisada é máquina alugando. A preventiva por horímetro avisa a hora certa da revisão, e as peças saem do estoque automaticamente.",
    "O site vende, e o celular opera: catálogo, orçamento online, área do cliente e WhatsApp, tudo integrado.",
    "E cada pessoa vê só o que precisa, com perfis de acesso e histórico de alterações em cada registro.",
    "No financeiro, o caixa fica sob controle, com relatórios de utilização da frota, fluxo de caixa e inadimplência.",
    "E o mais importante: as novas oportunidades.",
    "Com o sistema, a Dimaq pode vender vinte e quatro horas pelo site, ocupar a frota parada, decidir compras com dados, atender obras maiores, vender peças e serviços, e fidelizar clientes.",
    "E acompanhar, todo mês, os números que importam: utilização da frota, faturamento, inadimplência e custo de manutenção.",
    "No fim, a Dimaq ganha: nenhuma reserva dupla, nenhuma diária perdida, atendimento rápido, caixa previsível, e uma frota que rende.",
    "A implantação é simples: instalar e cadastrar a equipe, migrar os dados, ajustar os contratos e treinar o time.",
    "Sistema Dimaq: gestão de locações em um só lugar. Vamos começar?",
]

kokoro = Kokoro(f"{here}/kokoro.onnx", f"{here}/voices.bin")

clips = []
durations = []
for text in lines:
    audio, sr = kokoro.create(text, voice=VOICE, speed=1.05, lang="pt-br")
    n = int(len(audio) * SR / sr)
    audio = np.interp(np.linspace(0, len(audio) - 1, n), np.arange(len(audio)), audio)
    clips.append(audio.astype(np.float32))
    durations.append(max(120, int(np.ceil((LEAD + n / SR + TAIL) * FPS))))

total_frames = sum(durations) - (len(durations) - 1) * TRANSITION
total = int(total_frames / FPS * SR) + SR
voice = np.zeros(total, dtype=np.float32)
start_frame = 0
for clip, dur in zip(clips, durations):
    s = int((start_frame / FPS + LEAD) * SR)
    voice[s : s + len(clip)] += clip
    start_frame += dur - TRANSITION
voice /= max(1e-6, np.abs(voice).max()) / 0.89

# Mouth openness per video frame from the narration loudness.
hop = SR // FPS
rms = np.array(
    [np.sqrt(np.mean(voice[i * hop : (i + 1) * hop] ** 2)) for i in range(total_frames)]
)
mouth = np.clip(rms / (np.percentile(rms[rms > 0.01], 90) + 1e-6), 0, 1)
mouth = np.round(np.convolve(mouth, [0.25, 0.5, 0.25], mode="same"), 2)

# Background music: I–V–vi–IV in C major at 96 BPM, generated additively.
t = np.arange(total) / SR
bpm = 96
beat = 60 / bpm
bar = beat * 4
chords = [
    [48, 52, 55, 60, 64],  # C
    [43, 50, 55, 59, 62],  # G
    [45, 52, 57, 60, 64],  # Am
    [41, 48, 53, 57, 60],  # F
]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
music = np.zeros(total)
music_end = total_frames / FPS
n_bars = int(np.ceil(music_end / bar)) + 1

for b in range(n_bars):
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
        note = arp[[0, 1, 2, 3, 2, 1, 2, 3][k]]
        music[j0:j1] += 0.07 * np.sin(2 * np.pi * hz(note) * s) * np.exp(-s * 6)
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

fade = np.clip(np.minimum(t / 2.0, (music_end - t) / 3.0), 0, 1)
music *= fade
music /= np.abs(music).max()

# Duck the music under the voice.
win = int(0.3 * SR)
env = np.convolve(np.abs(voice), np.ones(win) / win, mode="same")
speaking = np.clip(env / 0.02, 0, 1)
gain = 0.30 - 0.20 * speaking
music *= gain

mix = voice + music
mix /= max(1.0, np.abs(mix).max() / 0.95)

sf.write(f"{out_audio}/narracao-e-musica.wav", mix.astype(np.float32), SR)
sf.write(f"{out_audio}/so-musica.wav", music.astype(np.float32), SR)
json.dump({"durations": durations, "mouth": mouth.tolist()}, open(out_json, "w"))
print("frames", total_frames, "seconds", round(total_frames / FPS, 1), durations)
