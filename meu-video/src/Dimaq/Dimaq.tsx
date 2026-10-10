import { loadFont } from "@remotion/fonts";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Presenter } from "./Presenter";
import timing from "./timing.json";

const display = "Oswald";
const body = "Public Sans";

loadFont({
  family: display,
  url: staticFile("fonts/oswald-latin-700-normal.woff2"),
  weight: "700",
});
for (const weight of ["400", "600", "700"]) {
  loadFont({
    family: body,
    url: staticFile(`fonts/public-sans-latin-${weight}-normal.woff2`),
    weight,
  });
}

const DARK = "#1F1F1F";
const LIGHT = "#F4F2EE";
const ACCENT = "#F5A500";
const EYEBROW_ON_LIGHT = "#8A5A00";
const MUTED_ON_DARK = "#C9C4BC";
const MUTED_ON_LIGHT = "#4A4744";

const TRANSITION = 15;

const img = (name: string) => staticFile(`dimaq/${name}.png`);

const useEnter = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 200 } });
};

const Rise: React.FC<{
  delay: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay, children, style }) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Scene: React.FC<{
  dark: boolean;
  children: React.ReactNode;
  accent?: boolean;
}> = ({ dark, children, accent }) => (
  <AbsoluteFill
    style={{
      backgroundColor: accent ? ACCENT : dark ? DARK : LIGHT,
      color: dark && !accent ? LIGHT : DARK,
      fontFamily: body,
      padding: "110px 128px 120px",
      flexDirection: "column",
      gap: 44,
    }}
  >
    {children}
  </AbsoluteFill>
);

const Heading: React.FC<{ eyebrow?: string; title: string; dark: boolean }> = ({
  eyebrow,
  title,
  dark,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    {eyebrow ? (
      <Rise delay={0}>
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: dark ? ACCENT : EYEBROW_ON_LIGHT,
          }}
        >
          {eyebrow}
        </div>
      </Rise>
    ) : null}
    <Rise delay={4}>
      <div
        style={{
          fontFamily: display,
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
    </Rise>
  </div>
);

const Shot: React.FC<{
  name: string;
  width: number;
  height: number;
  delay: number;
  dark: boolean;
}> = ({ name, width, height, delay, dark }) => {
  const frame = useCurrentFrame();
  const p = useEnter(delay);
  const zoom = interpolate(frame, [delay, delay + 240], [1, 1.06], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 16,
        overflow: "hidden",
        opacity: p,
        transform: `scale(${interpolate(p, [0, 1], [0.94, 1])})`,
        boxShadow: dark
          ? "0 30px 80px rgba(0,0,0,0.55)"
          : "0 24px 60px rgba(31,31,31,0.18)",
        border: dark ? "1px solid #3A3A3A" : "1px solid #E2DED6",
        backgroundColor: "#FBFAF7",
        flexShrink: 0,
      }}
    >
      <Img
        src={img(name)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: `scale(${zoom})`,
        }}
      />
    </div>
  );
};

const Points: React.FC<{
  items: React.ReactNode[];
  dark: boolean;
  start: number;
}> = ({ items, dark, start }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 30, flex: 1 }}>
    {items.map((item, i) => (
      <Rise key={i} delay={start + i * 12}>
        <div
          style={{
            fontSize: 34,
            lineHeight: 1.4,
            color: dark ? MUTED_ON_DARK : MUTED_ON_LIGHT,
            borderLeft: `6px solid ${ACCENT}`,
            paddingLeft: 24,
          }}
        >
          {item}
        </div>
      </Rise>
    ))}
  </div>
);

const Hi: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: ACCENT, fontWeight: 700 }}>{children}</span>
);
const B: React.FC<{ children: React.ReactNode; dark: boolean }> = ({
  children,
  dark,
}) => (
  <span style={{ color: dark ? LIGHT : DARK, fontWeight: 700 }}>
    {children}
  </span>
);

const ScreenScene: React.FC<{
  dark: boolean;
  eyebrow: string;
  title: string;
  shot: string;
  points: React.ReactNode[];
  shotLeft?: boolean;
}> = ({ dark, eyebrow, title, shot, points, shotLeft }) => {
  const s = (
    <Shot name={shot} width={1040} height={650} delay={10} dark={dark} />
  );
  const p = <Points items={points} dark={dark} start={22} />;
  return (
    <Scene dark={dark}>
      <Heading eyebrow={eyebrow} title={title} dark={dark} />
      <div style={{ display: "flex", gap: 64, alignItems: "center" }}>
        {shotLeft ? s : p}
        {shotLeft ? p : s}
      </div>
    </Scene>
  );
};

const Cards: React.FC<{
  items: { title: string; text: string }[];
  dark: boolean;
  start: number;
  columns: number;
}> = ({ items, dark, start, columns }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 28,
    }}
  >
    {items.map((c, i) => (
      <Rise key={c.title} delay={start + i * 8}>
        <div
          style={{
            backgroundColor: dark ? "#2A2A2A" : DARK,
            borderRadius: 18,
            padding: "36px 40px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            height: "100%",
          }}
        >
          <div style={{ fontSize: 38, fontWeight: 700, color: ACCENT }}>
            {c.title}
          </div>
          <div style={{ fontSize: 29, lineHeight: 1.4, color: "#E4DFD7" }}>
            {c.text}
          </div>
        </div>
      </Rise>
    ))}
  </div>
);

const Divider: React.FC<{ eyebrow: string; title: string; text: string }> = ({
  eyebrow,
  title,
  text,
}) => {
  const p = useEnter(0);
  return (
    <Scene dark accent>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
        }}
      >
        <div
          style={{
            width: interpolate(p, [0, 1], [0, 220]),
            height: 10,
            backgroundColor: DARK,
          }}
        />
        <Rise delay={4}>
          <div
            style={{ fontSize: 30, fontWeight: 700, letterSpacing: 6 }}
          >
            {eyebrow}
          </div>
        </Rise>
        <Rise delay={8}>
          <div
            style={{
              fontFamily: display,
              fontSize: 128,
              fontWeight: 700,
              lineHeight: 1.05,
              maxWidth: 1500,
            }}
          >
            {title}
          </div>
        </Rise>
        <Rise delay={18}>
          <div style={{ fontSize: 38, lineHeight: 1.4, maxWidth: 1400 }}>
            {text}
          </div>
        </Rise>
      </div>
    </Scene>
  );
};

const Table: React.FC<{
  head: string[];
  rows: string[][];
  start: number;
  widths: string;
}> = ({ head, rows, start, widths }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      borderRadius: 14,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        display: "grid",
        gridTemplateColumns: widths,
        backgroundColor: DARK,
        color: ACCENT,
        fontWeight: 700,
        fontSize: 30,
        padding: "18px 28px",
      }}
    >
      {head.map((h) => (
        <div key={h}>{h}</div>
      ))}
    </div>
    {rows.map((r, i) => (
      <Rise key={r[0]} delay={start + i * 10}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: widths,
            fontSize: 29,
            padding: "16px 28px",
            backgroundColor: i % 2 ? "#EFEBE4" : "#FBFAF7",
            color: DARK,
          }}
        >
          {r.map((c, j) => (
            <div
              key={j}
              style={{
                fontWeight: j === 0 ? 700 : 400,
                color: j === 0 ? DARK : MUTED_ON_LIGHT,
                paddingRight: 24,
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </Rise>
    ))}
  </div>
);

const Intro: React.FC = () => {
  const p = useEnter(0);
  return (
    <Scene dark>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 24,
          backgroundColor: ACCENT,
          transform: `scaleY(${p})`,
          transformOrigin: "top",
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 36,
        }}
      >
        <Rise delay={0}>
          <Img src={img("logo")} style={{ width: 460 }} />
        </Rise>
        <Rise delay={10}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 6,
              color: ACCENT,
            }}
          >
            APRESENTAÇÃO DO NOVO SISTEMA
          </div>
        </Rise>
        <Rise delay={18}>
          <div
            style={{
              fontFamily: display,
              fontSize: 128,
              fontWeight: 700,
              lineHeight: 1.05,
            }}
          >
            Cada diária cobrada.
            <br />
            Cada máquina rendendo.
          </div>
        </Rise>
        <Rise delay={34}>
          <div style={{ fontSize: 36, color: MUTED_ON_DARK, maxWidth: 1200 }}>
            Locação, medição, ordens de serviço, financeiro e site em um só
            lugar, feitos sob medida para a Dimaq.
          </div>
        </Rise>
      </div>
    </Scene>
  );
};

const Outro: React.FC = () => (
  <Scene dark>
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 40,
        textAlign: "center",
      }}
    >
      <Rise delay={0}>
        <Img src={img("logo")} style={{ width: 520 }} />
      </Rise>
      <Rise delay={12}>
        <div
          style={{
            fontFamily: display,
            fontSize: 110,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          Gestão de locações
          <br />
          <span style={{ color: ACCENT }}>em um só lugar</span>
        </div>
      </Rise>
      <Rise delay={28}>
        <div style={{ fontSize: 32, color: "#A8A29A" }}>
          Desenvolvido por{" "}
          <span style={{ color: LIGHT, fontWeight: 700 }}>SEO AMPLIFY</span>
        </div>
      </Rise>
    </div>
  </Scene>
);

const scenes: { duration: number; node: React.ReactNode }[] = [
  { duration: 180, node: <Intro /> },
  {
    duration: 270,
    node: (
      <Scene dark={false}>
        <Heading
          eyebrow="O desafio"
          title="O custo escondido do papel e da planilha"
          dark={false}
        />
        <Table
          widths="1.1fr 1.3fr 1fr"
          head={["Situação", "O que acontece", "Impacto"]}
          start={14}
          rows={[
            ["Reserva dupla", "Cliente fica sem a máquina", "Pedido perdido"],
            [
              "Diária de atraso esquecida",
              "Contrato fecha sem o excedente",
              "Receita que não entra",
            ],
            ["Avaria sem registro", "A Dimaq paga o conserto", "Custo que era do cliente"],
            ["Preventiva atrasada", "Máquina quebra na obra", "Parada e frete extra"],
            ["Cobrança atrasada", "Vencidos acumulam sem alerta", "Caixa apertado"],
            ["Orçamento demorado", "Cliente fecha com outro", "Venda perdida"],
          ]}
        />
      </Scene>
    ),
  },
  {
    duration: 210,
    node: (
      <Scene dark={false}>
        <Heading eyebrow="A solução" title="Um sistema, toda a operação" dark={false} />
        <Cards
          columns={3}
          start={12}
          dark={false}
          items={[
            { title: "Locação", text: "Orçamento, reserva, entrega, renovação e devolução." },
            { title: "Medição", text: "Cobrança pro-rata por ciclo, opcional por contrato." },
            { title: "Ordens de serviço", text: "Preventiva por horímetro, corretiva e revisão." },
            { title: "Vendas e estoque", text: "Peças e produtos com baixa automática." },
            { title: "Financeiro e NF", text: "Receber, pagar, juros, recibos e dados da nota." },
            { title: "Site e cliente", text: "Catálogo, pedido de orçamento e área do cliente." },
          ]}
        />
      </Scene>
    ),
  },
  {
    duration: 210,
    node: (
      <ScreenScene
        dark
        eyebrow="Painel"
        title="O dia inteiro numa tela"
        shot="painel"
        points={[
          <>Cada locação vira um cartão com <Hi>contagem regressiva</Hi>.</>,
          <>Atrasos, devoluções do dia, pedidos do site e vencidos em indicadores.</>,
          <>Renovar, devolver ou chamar no WhatsApp direto do cartão.</>,
        ]}
      />
    ),
  },
  {
    duration: 210,
    node: (
      <ScreenScene
        dark={false}
        shotLeft
        eyebrow="Nova locação"
        title="Preço certo, sem conflito de reserva"
        shot="novaloc"
        points={[
          <><B dark={false}>Disponibilidade ao vivo</B> por peça ou por quantidade.</>,
          <><B dark={false}>Melhor tarifa automática:</B> 10 dias = 1 semana + 3 diárias.</>,
          <>Sem estoque no período, só salva como orçamento: <B dark={false}>reserva dupla nunca mais</B>.</>,
        ]}
      />
    ),
  },
  {
    duration: 210,
    node: (
      <Scene dark={false}>
        <Heading title="Quadro e agenda: a frota à vista" dark={false} />
        <div style={{ display: "flex", gap: 64 }}>
          {[
            { shot: "quadro", label: "Quadro:", text: "arraste o cartão e o sistema faz a reserva, a entrega ou a devolução." },
            { shot: "agenda", label: "Agenda:", text: "cada equipamento numa linha do tempo; clique num dia livre para orçar." },
          ].map((x, i) => (
            <div key={x.shot} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
              <Shot name={x.shot} width={800} height={500} delay={8 + i * 10} dark={false} />
              <Rise delay={24 + i * 10}>
                <div style={{ fontSize: 30, lineHeight: 1.4, color: MUTED_ON_LIGHT }}>
                  <B dark={false}>{x.label}</B> {x.text}
                </div>
              </Rise>
            </div>
          ))}
        </div>
      </Scene>
    ),
  },
  {
    duration: 210,
    node: (
      <ScreenScene
        dark
        eyebrow="Devolução"
        title="Nenhuma diária esquecida"
        shot="devolucao"
        points={[
          <><Hi>Devolução parcial:</Hi> voltam 50 de 60 andaimes e o contrato segue com o resto.</>,
          <><Hi>Atraso</Hi> calculado e lançado sozinho: 2 dias = R$ 660,00.</>,
          <><Hi>Avaria</Hi> vira cobrança e abre a OS de revisão na hora.</>,
        ]}
      />
    ),
  },
  {
    duration: 210,
    node: (
      <ScreenScene
        dark={false}
        shotLeft
        eyebrow="Cobrança por medição"
        title="Pro-rata: cobra só o que ficou na obra"
        shot="medicao"
        points={[
          <>A cada ciclo, soma <B dark={false}>quantidade × dias</B> de cada item.</>,
          <>Devolução parcial e item novo entram pela data real.</>,
          <>Gera a conta a receber e o <B dark={false}>boletim de medição</B>.</>,
        ]}
      />
    ),
  },
  {
    duration: 120,
    node: (
      <Divider
        eyebrow="ECONOMIA"
        title="Onde o sistema devolve dinheiro para o caixa"
        text="Receita que escapava, custos que eram do cliente e horas de trabalho manual."
      />
    ),
  },
  {
    duration: 270,
    node: (
      <Scene dark={false}>
        <Heading eyebrow="Economia" title="Dinheiro que deixa de escapar" dark={false} />
        <Table
          widths="0.9fr 1.4fr 1.1fr"
          head={["Fonte de ganho", "Como o sistema resolve", "Exemplo nas telas"]}
          start={14}
          rows={[
            ["Diárias excedentes", "Atraso calculado na devolução", "2 dias = R$ 660,00"],
            ["Medição pro-rata", "Quantidade × dias, pela data real", "Boletim de R$ 2.270,00"],
            ["Avarias", "Viram cobrança e abrem OS", "Custo volta ao cliente"],
            ["Multa e juros", "Calculados na baixa", "Sem conta de cabeça"],
            ["Inadimplência", "Vencidos em destaque no painel", "R$ 1.315,00 à vista"],
            ["Reserva dupla", "Disponibilidade bloqueia conflito", "Sem frete perdido"],
          ]}
        />
      </Scene>
    ),
  },
  {
    duration: 270,
    node: (
      <Scene dark={false}>
        <Heading eyebrow="Economia de tempo" title="Antes e depois do sistema" dark={false} />
        <Table
          widths="0.9fr 1.1fr 1.3fr"
          head={["Tarefa", "Antes", "Com o sistema"]}
          start={14}
          rows={[
            ["Orçar", "Conferir estoque e calcular", "Preço e disponibilidade na hora"],
            ["Quem devolve hoje", "Revisar contrato por contrato", "Painel com contagem regressiva"],
            ["Medição mensal", "Planilha por obra", "Boletim gerado em um clique"],
            ["Contrato", "Digitar no Word", "Pronto com a marca, por link"],
            ["Avisar o cliente", "Mensagem do zero", "WhatsApp com texto pronto"],
            ["Fechar o mês", "Juntar recibos e extratos", "Relatórios de caixa prontos"],
          ]}
        />
      </Scene>
    ),
  },
  {
    duration: 120,
    node: (
      <Divider
        eyebrow="QUALIDADE"
        title="O mesmo padrão em todo contrato, toda máquina, todo cliente"
        text="Documentos, manutenção, atendimento e controle de acesso."
      />
    ),
  },
  {
    duration: 210,
    node: (
      <Scene dark>
        <Heading eyebrow="Documentos" title="Prontos com a marca Dimaq" dark />
        <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
          {[
            ["doc-contrato", "Contrato de locação"],
            ["doc-devolucao", "Devolução"],
            ["doc-boletim", "Boletim de medição"],
          ].map(([name, label], i) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
              <Shot name={name} width={400} height={566} delay={8 + i * 8} dark />
              <Rise delay={20 + i * 8}>
                <div style={{ fontSize: 30, fontWeight: 600 }}>{label}</div>
              </Rise>
            </div>
          ))}
          <Points
            dark
            start={40}
            items={[
              <>Também: orçamento, checklist, fatura, OS, pedido de venda e recibo.</>,
              <Hi key="x">Imprimir, salvar em PDF ou mandar o link.</Hi>,
            ]}
          />
        </div>
      </Scene>
    ),
  },
  {
    duration: 210,
    node: (
      <ScreenScene
        dark={false}
        eyebrow="Ordens de serviço"
        title="Máquina revisada é máquina alugando"
        shot="os"
        points={[
          <><B dark={false}>Preventiva por horímetro</B> (ex.: a cada 250 h), com alerta no painel.</>,
          <>Corretiva, revisão de retorno e serviço para cliente.</>,
          <>Peças saem do estoque; a máquina fica bloqueada com a OS aberta.</>,
        ]}
      />
    ),
  },
  {
    duration: 210,
    node: (
      <Scene dark={false}>
        <Heading eyebrow="Site e celular" title="O site vende, o celular opera" dark={false} />
        <div style={{ display: "flex", gap: 56, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <Cards
              columns={2}
              start={10}
              dark={false}
              items={[
                { title: "Catálogo", text: "Equipamentos, preços e disponibilidade no site." },
                { title: "Orçamento online", text: "Chega no sistema já com preço." },
                { title: "Área do cliente", text: "Locações, faturas e pedido de renovação." },
                { title: "WhatsApp", text: "Botão no site e mensagens prontas." },
              ]}
            />
          </div>
          <Shot name="celular" width={290} height={628} delay={20} dark={false} />
        </div>
      </Scene>
    ),
  },
  {
    duration: 210,
    node: (
      <Scene dark={false}>
        <Heading eyebrow="Segurança" title="Cada pessoa vê o que precisa" dark={false} />
        <Table
          widths="0.6fr 1.8fr"
          head={["Perfil", "Acesso"]}
          start={12}
          rows={[
            ["Administrador", "Tudo, inclusive configurações e o site"],
            ["Gerente", "Operação completa, financeiro e relatórios"],
            ["Operador", "Clientes, frota, locações, OS, vendas e estoque"],
            ["Cliente", "Só a própria área no site"],
          ]}
        />
        <Rise delay={60}>
          <div style={{ fontSize: 30, color: MUTED_ON_LIGHT }}>
            Login próprio em /sistema e histórico de alterações em cada registro.
          </div>
        </Rise>
      </Scene>
    ),
  },
  {
    duration: 210,
    node: (
      <Scene dark>
        <Heading eyebrow="Financeiro e relatórios" title="O caixa sob controle" dark />
        <div style={{ display: "flex", gap: 64 }}>
          {[
            { shot: "financeiro", label: "Receber e pagar:", text: "baixa parcial, multa e juros automáticos, recibo." },
            { shot: "relatorios", label: "Relatórios:", text: "utilização e retorno por máquina, fluxo de caixa, inadimplência." },
          ].map((x, i) => (
            <div key={x.shot} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
              <Shot name={x.shot} width={800} height={500} delay={8 + i * 10} dark />
              <Rise delay={24 + i * 10}>
                <div style={{ fontSize: 30, lineHeight: 1.4, color: MUTED_ON_DARK }}>
                  <Hi>{x.label}</Hi> {x.text}
                </div>
              </Rise>
            </div>
          ))}
        </div>
      </Scene>
    ),
  },
  {
    duration: 120,
    node: (
      <Divider
        eyebrow="OPORTUNIDADES"
        title="O que o sistema abre de novo para a Dimaq"
        text="Mais pedidos, frota mais ocupada e decisões com dados."
      />
    ),
  },
  {
    duration: 300,
    node: (
      <Scene dark>
        <Heading eyebrow="Oportunidades" title="Seis caminhos para crescer" dark />
        <Cards
          columns={3}
          start={12}
          dark
          items={[
            { title: "Vender 24 horas", text: "O site recebe orçamentos fora do horário, já com preço." },
            { title: "Ocupar a frota parada", text: "A agenda mostra o que está livre: base para promoções." },
            { title: "Decidir a frota", text: "Retorno por máquina mostra o que comprar, manter ou vender." },
            { title: "Atender obras maiores", text: "Medição pro-rata e boletim no formato que construtoras pedem." },
            { title: "Peças e serviços", text: "OS para terceiros e vendas com estoque viram nova receita." },
            { title: "Fidelizar", text: "Área do cliente com renovação e avisos pelo WhatsApp." },
          ]}
        />
      </Scene>
    ),
  },
  {
    duration: 240,
    node: (
      <Scene dark={false}>
        <Heading eyebrow="Indicadores" title="Números para acompanhar todo mês" dark={false} />
        <Table
          widths="0.9fr 1.2fr"
          head={["Indicador", "Para que serve"]}
          start={12}
          rows={[
            ["Utilização da frota", "Achar máquina ociosa e agir"],
            ["Faturamento previsto × recebido", "Prever o caixa"],
            ["Inadimplência", "Cobrar antes de virar perda"],
            ["Ranking de clientes", "Priorizar quem mais rende"],
            ["Manutenção", "Custo real por máquina"],
          ]}
        />
      </Scene>
    ),
  },
  {
    duration: 240,
    node: (
      <Scene dark accent>
        <Heading title="O que a Dimaq ganha" dark={false} />
        <Cards
          columns={3}
          start={10}
          dark={false}
          items={[
            { title: "Nenhuma reserva dupla", text: "O sistema bloqueia o que já está comprometido." },
            { title: "Nenhuma diária perdida", text: "Atraso, avaria e medição calculados sozinhos." },
            { title: "Atendimento rápido", text: "Orçamento com preço e disponibilidade na hora." },
            { title: "Caixa previsível", text: "Contas a receber geradas e cobradas em dia." },
            { title: "Frota que rende", text: "Preventiva em dia e retorno por máquina." },
            { title: "Sistema da casa", text: "No próprio site, com a marca da Dimaq." },
          ]}
        />
      </Scene>
    ),
  },
  {
    duration: 210,
    node: (
      <Scene dark>
        <Heading eyebrow="Implantação" title="Próximos passos" dark />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            "Instalar no site e cadastrar a equipe",
            "Migrar clientes, frota e contratos em aberto",
            "Ajustar cláusulas do contrato e regras da medição",
            "Treinamento com o manual e ligar e-mail e nota fiscal",
          ].map((t, i) => (
            <Rise key={t} delay={12 + i * 12}>
              <div
                style={{
                  display: "flex",
                  gap: 48,
                  alignItems: "center",
                  padding: "26px 0",
                  borderBottom: "1px solid #3A3A3A",
                }}
              >
                <div style={{ fontFamily: display, fontSize: 56, fontWeight: 700, color: ACCENT, width: 90 }}>
                  0{i + 1}
                </div>
                <div style={{ fontSize: 38 }}>{t}</div>
              </div>
            </Rise>
          ))}
        </div>
      </Scene>
    ),
  },
  { duration: 180, node: <Outro /> },
];

// Each scene lasts as long as its narration line (see timing.json).
scenes.forEach((s, i) => {
  s.duration = timing.durations[i];
});

const sceneStarts = scenes.map(
  (_, i) =>
    scenes.slice(0, i).reduce((sum, s) => sum + s.duration, 0) -
    i * TRANSITION,
);

export const DIMAQ_DURATION =
  scenes.reduce((sum, s) => sum + s.duration, 0) -
  (scenes.length - 1) * TRANSITION;

const Caption: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let index = 0;
  sceneStarts.forEach((start, i) => {
    if (frame >= start) {
      index = i;
    }
  });
  const local = frame - sceneStarts[index];
  const end = scenes[index].duration - Math.round(0.6 * fps);
  const opacity = interpolate(local, [6, 14, end - 8, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 128,
        bottom: 34,
        maxWidth: 1440,
        opacity,
        backgroundColor: "rgba(20,20,20,0.86)",
        color: "#FBFAF7",
        fontFamily: body,
        fontSize: 28,
        lineHeight: 1.35,
        padding: "12px 22px",
        borderRadius: 10,
      }}
    >
      {timing.lines[index]}
    </div>
  );
};

const PresenterOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shrink = spring({
    frame: frame - (scenes[0].duration - TRANSITION),
    fps,
    config: { damping: 200 },
  });
  const appear = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const size = interpolate(shrink, [0, 1], [400, 230]);
  const right = interpolate(shrink, [0, 1], [70, 36]);
  const bottom = interpolate(shrink, [0, 1], [340, 36]);
  return (
    <div
      style={{
        position: "absolute",
        right,
        bottom,
        width: size,
        height: size,
        borderRadius: "50%",
        boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        transform: `scale(${appear})`,
      }}
    >
      <Presenter size={size} />
    </div>
  );
};

export const DimaqApresentacao: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: DARK }}>
      <Audio src={staticFile("dimaq/audio/narracao-e-musica.mp3")} />
      <TransitionSeries>
        {scenes.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 ? (
              <TransitionSeries.Transition
                presentation={i % 2 ? fade() : slide({ direction: "from-right" })}
                timing={linearTiming({ durationInFrames: TRANSITION })}
              />
            ) : null}
            <TransitionSeries.Sequence durationInFrames={s.duration}>
              {s.node}
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>
      <Caption />
      <PresenterOverlay />
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 8,
          width: `${(frame / durationInFrames) * 100}%`,
          backgroundColor: ACCENT,
        }}
      />
    </AbsoluteFill>
  );
};
