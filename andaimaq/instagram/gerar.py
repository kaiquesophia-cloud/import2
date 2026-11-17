# uso: gerar.py <pasta_saida> — gera carrossel (1080x1350) e stories (1080x1920) do case Andaimaq (dados GA4 + Search Console)
import sys, os
from PIL import Image, ImageDraw, ImageFont
OUT = sys.argv[1]; D = os.path.dirname(os.path.abspath(__file__))
F = lambda w, s: ImageFont.truetype(os.path.join(D, f'M{w}.ttf'), s)
BG, CARD, TX, MUT, AC, UP = (14, 9, 26), (34, 22, 58), (255, 255, 255), (178, 166, 205), (168, 72, 240), (34, 220, 110)
OR1, OR2, PK = (255, 196, 40), (255, 120, 30), (226, 60, 200)
FONTE = 'Fonte: Google Analytics 4 e Google Search Console · 22/09–19/10 vs 20/10–16/11/2026'
SEM = [('22/09', 5), ('29/09', 5), ('06/10', 6), ('13/10', 16), ('20/10', 30), ('27/10', 18), ('03/11', 32), ('10/11', 34)]
KPI = [('Visitas do Google orgânico', '32', '113', '+253%'), ('Cliques na busca do Google', '19', '63', '+232%'), ('Posição média no Google', '18,0', '8,4', '10 posições acima')]
from PIL import ImageFilter, ImageChops

def grad_text(im, xy, txt, font, c1, c2, anchor='la'):
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).text(xy, txt, font=font, fill=255, anchor=anchor)
    bb = m.getbbox(); g = Image.new('RGB', im.size, c1)
    if bb:
        gd = ImageDraw.Draw(g); y0, y1 = bb[1], bb[3]
        for y in range(y0, y1 + 1):
            t = (y - y0) / max(1, y1 - y0); gd.line((0, y, im.size[0], y), fill=tuple(int(a + (b - a) * t) for a, b in zip(c1, c2)))
    im.paste(g, (0, 0), m)

def logo(im, d, x, y, s=1.0):
    grad_text(im, (x, y), 'SE', F(800, int(44 * s)), OR1, OR2)
    w = d.textlength('SE', font=F(800, int(44 * s)))
    d.text((x + w + 8 * s, y + 4 * s), 'AMPLIFY', font=F(800, int(34 * s)), fill=TX)

def base(h):
    im = Image.new('RGB', (1080, h), BG)
    glow = Image.new('RGB', (1080, h), BG); gd = ImageDraw.Draw(glow)
    gd.ellipse((520, -380, 1480, 520), fill=(90, 30, 150)); gd.ellipse((-420, h - 520, 420, h + 360), fill=(70, 20, 110))
    im = glow.filter(ImageFilter.GaussianBlur(170)); d = ImageDraw.Draw(im)
    logo(im, d, 80, 64)
    d.text((1000, 78), 'CASE', font=F(700, 24), fill=MUT, anchor='ra')
    return im, d

def wrap(d, txt, font, maxw):
    out, line = [], ''
    for w in txt.split():
        t = (line + ' ' + w).strip()
        if d.textlength(t, font=font) <= maxw: line = t
        else: out.append(line); line = w
    return out + [line]

def para(d, xy, txt, font, fill, maxw, gap=1.25, anchor='la'):
    x, y = xy
    for l in wrap(d, txt, font, maxw):
        d.text((x, y), l, font=font, fill=fill, anchor=anchor); y += int(font.size * gap)
    return y

def rodape(d, h, pag=None):
    d.text((80, h - 150), 'SEO AMPLIFY · NOVEMBRO 2026', font=F(700, 20), fill=MUT)
    para(d, (80, h - 110), FONTE, F(500, 22), MUT, 920)
    if pag: d.text((1000, h - 60), pag, font=F(700, 22), fill=MUT, anchor='ra')

def grafico(d, x, y, w, h):
    mx = max(v for _, v in SEM); bw = w / len(SEM)
    d.text((x, y - 60), 'Visitas do Google orgânico por semana', font=F(700, 28), fill=TX)
    for i, (lab, v) in enumerate(SEM):
        bh = (h - 70) * v / mx; x0 = x + i * bw + 12; x1 = x + (i + 1) * bw - 12
        cor = AC if i >= 4 else (72, 58, 100)
        d.rounded_rectangle((x0, y + h - 40 - bh, x1, y + h - 40), 8, fill=cor)
        d.text(((x0 + x1) / 2, y + h - 48 - bh), str(v), font=F(700, 24), fill=TX, anchor='mb')
        d.text(((x0 + x1) / 2, y + h - 30), lab, font=F(500, 20), fill=MUT, anchor='mt')
    d.text((x, y + h + 10), '■ 4 semanas antes', font=F(500, 22), fill=(110, 120, 140))
    d.text((x + 300, y + h + 10), '■ 4 semanas depois', font=F(500, 22), fill=(200, 120, 255))

def kpis(d, y, gap=24, ch=190):
    for t, a, b, delta in KPI:
        k = (ch - 190) // 2; d.rounded_rectangle((80, y, 1000, y + ch), 22, fill=CARD)
        d.text((120, y + 30), t, font=F(700, 28), fill=MUT)
        d.text((120, y + 80 + k), a, font=F(700, 64), fill=(130, 118, 160))
        xa = 120 + d.textlength(a, font=F(700, 64)) + 30
        d.text((xa, y + 88 + k), '→', font=F(700, 54), fill=MUT)
        d.text((xa + 80, y + 80 + k), b, font=F(800, 64), fill=TX)
        d.text((960, y + 96 + k), delta, font=F(800, 36), fill=UP, anchor='ra')
        y += ch + gap
    return y

FEITO = ['Página de preços reescrita para quem pesquisa "quanto custa"', 'Páginas para cada região de São Paulo atendida', 'Artigos que respondem as dúvidas de quem está em obra', 'Títulos, links internos e ajustes técnicos no site']

def capa(h, story=False):
    im, d = base(h); y = 300 if story else 180
    d.text((80, y), 'C A S E', font=F(700, 24), fill=OR1); y += 50
    lg = Image.open(os.path.join(D, 'logo-andaimaq.png')); lw = 460 if story else 420; lg = lg.resize((lw, int(lg.height * lw / lg.width)), Image.LANCZOS)
    im.paste(lg, (80, y), lg); y += lg.height + 40
    fz = F(800, 240 if story else 220); d.text((70, y), '+', font=fz, fill=UP); d.text((70 + d.textlength('+', font=fz), y), '253%', font=fz, fill=TX); y += 270 if story else 250
    y = para(d, (80, y), 'de visitas vindas do Google orgânico em 28 dias', F(700, 58), TX, 900) + 40
    y = para(d, (80, y), 'De 32 para 113 visitas, comparando 28 dias com os 28 dias anteriores. Visitas do Google sem pagar por clique.', F(500, 34), MUT, 900)
    if story:
        d.rounded_rectangle((80, h - 420, 1000, h - 260), 80, fill=AC)
        d.text((540, h - 340), 'Veja como foi →', font=F(800, 46), fill=TX, anchor='mm')
    else:
        d.text((1000, h - 190), 'Arraste para o lado →', font=F(700, 28), fill=OR1, anchor='ra')
    rodape(d, h, None if story else '1/3'); return im

def numeros(h, story=False):
    im, d = base(h); y = 200 if story else 170
    d.text((80, y), 'Os números', font=F(800, 64), fill=TX); y += 110
    y = kpis(d, y, 30, 190) + 90 if story else kpis(d, y, 16, 150) + 76
    grafico(d, 80, y + (40 if story else 0), 920, 400 if story else 240)
    rodape(d, h, None if story else '2/3'); return im

def fechamento(h, story=False):
    im, d = base(h); y = 300 if story else 170
    d.text((80, y), 'O que fizemos', font=F(800, 64), fill=TX); y += 120
    for t in FEITO:
        d.ellipse((80, y + 14, 104, y + 38), fill=OR1)
        y = para(d, (130, y), t, F(700, 36 if story else 32), TX, 860) + (28 if story else 16)
    y += 30
    d.rounded_rectangle((80, y, 1000, y + 200), 22, fill=CARD)
    d.text((120, y + 34), 'Resultado que vira cliente', font=F(700, 28), fill=MUT)
    para(d, (120, y + 80), '20 contatos pelo WhatsApp vindos do Google orgânico em 28 dias', F(800, 38), TX, 820)
    y += 330 if story else 240
    y = para(d, (80, y), 'Quer que o Google traga clientes para a sua empresa?', F(800, 48 if story else 42), TX, 920) + 30
    bh = 120 if story else 100
    d.rounded_rectangle((80, y, 1000, y + bh), bh // 2, fill=AC)
    d.text((540, y + bh // 2), 'Fale com a SEO Amplify', font=F(800, 40), fill=TX, anchor='mm')
    rodape(d, h, None if story else '3/3'); return im

os.makedirs(OUT, exist_ok=True)
for i, f in enumerate([capa, numeros, fechamento], 1):
    f(1350).save(f'{OUT}/carrossel-andaimaq-{i}.png')
    f(1920, True).save(f'{OUT}/stories-andaimaq-{i}.png')
print('ok')
