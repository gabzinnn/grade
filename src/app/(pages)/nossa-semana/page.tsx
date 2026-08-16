import { AppShell } from "@/app/components/AppShell";
import { Card } from "@/app/components/ui/Card";
import { NossaSemanaGrid } from "@/app/components/grade/NossaSemanaGrid";
import { COR_EU, COR_COLEGA } from "@/app/components/grade/SharedWeekGrid";
import { getSessionPerfilId } from "@/lib/auth";
import { construirNossaSemana, nomeDoDia } from "@/lib/nossaSemana";

export default async function NossaSemanaPage() {
  const perfilId = await getSessionPerfilId();
  const dados = await construirNossaSemana(perfilId);

  if (!dados) {
    return (
      <AppShell title="Nossa semana">
        <Card>
          <p className="text-body-sm text-ink-2">
            Ninguém compartilhou um plano com você ainda. Peça pra outra pessoa te dar acesso ao plano dela.
          </p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Nossa semana"
      subtitulo={`${dados.eu.nome} & ${dados.colega.nome}`}
      usuarioNome={dados.eu.nome}
    >
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="min-w-[640px]">
            <NossaSemanaGrid eu={dados.eu} colega={dados.colega} janelasComuns={dados.janelasComuns} />
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-5 lg:w-[320px]">
          <Card>
            <h3 className="mb-1 text-body font-semibold text-ink">Melhores janelas</h3>
            <p className="mb-4 text-label text-ink-2">
              {dados.melhoresJanelas.length > 0
                ? `${dados.melhoresJanelas.length} janela(s) em comum de pelo menos 1h essa semana.`
                : "Nenhuma janela em comum de pelo menos 1h essa semana."}
            </p>
            <div className="flex flex-col gap-2">
              {dados.melhoresJanelas.map((j, i) => (
                <div key={i} className="rounded-card border border-success/30 bg-success/5 p-3">
                  <p className="text-body-sm font-medium text-ink">{nomeDoDia(j.diaSemana)}</p>
                  <p className="text-label text-ink-2">
                    {Math.floor(j.inicioMin / 60)}h - {Math.floor(j.fimMin / 60)}h ({(j.minutos / 60).toFixed(1)}h)
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-1 text-body font-semibold text-ink">Quem é quem</h3>
            <p className="mb-3 text-label text-ink-2">
              A borda colorida diz de quem é o bloco; o fundo é a cor da disciplina, igual ao Planejador.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="h-4 w-1.5 rounded-full" style={{ backgroundColor: COR_EU }} />
                <span className="text-body-sm text-ink">{dados.eu.nome}</span>
                <span className="text-caps text-ink-3">à esquerda</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-1.5 rounded-full" style={{ backgroundColor: COR_COLEGA }} />
                <span className="text-body-sm text-ink">{dados.colega.nome}</span>
                <span className="text-caps text-ink-3">à direita</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
