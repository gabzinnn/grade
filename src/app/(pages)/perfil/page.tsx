import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import { Card } from "@/app/components/ui/Card";
import { EnfaseForm } from "@/app/components/perfil/EnfaseForm";
import { BlocosFixos } from "@/app/components/perfil/BlocosFixos";
import { Compartilhamento } from "@/app/components/perfil/Compartilhamento";
import { PreferenciasForm } from "@/app/components/perfil/PreferenciasForm";
import { getSessionPerfilId } from "@/lib/auth";
import { construirPerfil } from "@/lib/perfil";

export default async function PerfilPage() {
  const perfilId = await getSessionPerfilId();
  const { perfil, plano, outrosPerfis } = await construirPerfil(perfilId);
  if (!plano) notFound();

  return (
    <AppShell
      title="Meu perfil"
      subtitulo="Gerencie suas informações e preferências"
      planoNome={plano.nome}
      usuarioNome={perfil.apelido ?? perfil.nome}
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <h2 className="border-b border-hairline pb-2 text-body font-semibold text-ink">Dados do curso</h2>
          <div className="flex flex-col gap-2 text-body-sm">
            <div className="grid grid-cols-[140px_1fr]">
              <span className="text-caps text-ink-2">Nome</span>
              <span className="text-ink">{perfil.nome}</span>
            </div>
            <div className="grid grid-cols-[140px_1fr]">
              <span className="text-caps text-ink-2">DRE</span>
              <span className="text-ink">{perfil.dre ?? "—"}</span>
            </div>
            <div className="grid grid-cols-[140px_1fr]">
              <span className="text-caps text-ink-2">Curso</span>
              <span className="text-ink">{perfil.versaoCurricular?.curso.nome ?? "—"}</span>
            </div>
            <div className="grid grid-cols-[140px_1fr]">
              <span className="text-caps text-ink-2">Versão curricular</span>
              <span className="text-ink">{perfil.versaoCurricular?.codigo ?? "—"}</span>
            </div>
          </div>
          <EnfaseForm
            planoId={plano.id}
            categorias={perfil.versaoCurricular?.categorias ?? []}
            enfasePrincipalId={plano.enfasePrincipalId}
            contraEnfaseId={plano.contraEnfaseId}
          />
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="border-b border-hairline pb-2 text-body font-semibold text-ink">Meus horários fixos</h2>
          <BlocosFixos blocos={perfil.blocos} />
        </Card>

        <Card className="flex flex-col gap-4 xl:col-span-2">
          <h2 className="border-b border-hairline pb-2 text-body font-semibold text-ink">Compartilhamento</h2>
          <p className="text-body-sm text-ink-2">
            Convide alguém aqui para que ela veja e/ou edite o seu plano. Para aparecer a página{" "}
            <span className="font-medium text-ink">Nossa semana</span> com uma pessoa, é ela quem precisa te convidar
            por aqui, no perfil dela — peça para repetir esse passo escolhendo o seu nome.
          </p>
          <Compartilhamento
            planoId={plano.id}
            dono={{ id: perfil.id, nome: perfil.nome }}
            acessos={plano.acessos}
            outrosPerfis={outrosPerfis}
          />
        </Card>

        <Card className="flex flex-col gap-4 xl:col-span-2">
          <h2 className="border-b border-hairline pb-2 text-body font-semibold text-ink">Preferências de montagem</h2>
          <PreferenciasForm
            evitarAntesDeMin={perfil.preferencias?.evitarAntesDeMin ?? null}
            janelaMaximaMin={perfil.preferencias?.janelaMaximaMin ?? null}
            maxDiasPresenciais={perfil.preferencias?.maxDiasPresenciais ?? null}
          />
        </Card>
      </div>
    </AppShell>
  );
}
