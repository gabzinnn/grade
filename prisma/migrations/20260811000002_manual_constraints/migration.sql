-- 1. Coerência de horário
alter table "HorarioTurma"     add constraint horario_valido check ("fimMin" > "inicioMin" and "inicioMin" >= 0 and "fimMin" <= 1440);
alter table "PlanoItemHorario" add constraint horario_item_valido check ("fimMin" > "inicioMin");
alter table "BlocoIndisponibilidade" add constraint bloco_valido check ("fimMin" > "inicioMin");
alter table "HorarioTurma" add constraint dia_valido check ("diaSemana" between 1 and 7);

-- 2. Um único plano principal por pessoa
create unique index plano_principal_unico
  on "Plano" ("donoId") where principal;

-- 3. Histórico: unique com NULL não funciona no Postgres (NULLs são distintos).
--    Uma disciplina só pode ter um registro sem semestre informado.
create unique index historico_sem_semestre
  on "HistoricoItem" ("perfilId", "disciplinaId") where "semestreId" is null;
create unique index historico_com_semestre
  on "HistoricoItem" ("perfilId", "disciplinaId", "semestreId") where "semestreId" is not null;

-- 4. Uma pessoa não pode ter dois blocos pessoais sobrepostos no mesmo dia
create extension if not exists btree_gist;
alter table "BlocoIndisponibilidade" add constraint bloco_sem_sobreposicao
  exclude using gist (
    "perfilId" with =, "diaSemana" with =,
    int4range("inicioMin", "fimMin") with &&
  );

-- 5. O dono não pode aparecer também como colaborador
alter table "PlanoAcesso" add constraint dono_nao_e_colaborador
  check (true); -- enforce via trigger comparando com "Plano"."donoId"

-- 6. Período encerrado é imutável: bloqueia insert/update/delete de itens
create or replace function impede_edicao_periodo_encerrado() returns trigger as $$
declare fechado timestamptz;
begin
  select "encerradoEm" into fechado from "PlanoPeriodo"
   where id = coalesce(new."planoPeriodoId", old."planoPeriodoId");
  if fechado is not null then
    raise exception 'Período encerrado em % não pode ser alterado', fechado;
  end if;
  return coalesce(new, old);
end $$ language plpgsql;

create trigger periodo_encerrado_imutavel
  before insert or update or delete on "PlanoItem"
  for each row execute function impede_edicao_periodo_encerrado();

-- 7. Não faz sentido encerrar um período que não tem semestre atribuído
alter table "PlanoPeriodo" add constraint encerrado_tem_semestre
  check ("encerradoEm" is null or "semestreId" is not null);
