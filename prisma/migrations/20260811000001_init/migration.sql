-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StatusHistorico" AS ENUM ('CONCLUIDA', 'CURSANDO', 'REPROVADA', 'TRANCADA', 'DISPENSADA');

-- CreateEnum
CREATE TYPE "TipoRequisito" AS ENUM ('PRE', 'CO');

-- CreateEnum
CREATE TYPE "PapelEnfase" AS ENUM ('PRINCIPAL', 'CONTRA');

-- CreateEnum
CREATE TYPE "PapelAcesso" AS ENUM ('EDITOR', 'LEITOR');

-- CreateEnum
CREATE TYPE "TipoBloco" AS ENUM ('ESTAGIO', 'TRABALHO', 'PESSOAL', 'DESLOCAMENTO');

-- CreateTable
CREATE TABLE "Instituicao" (
    "id" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Instituicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curso" (
    "id" TEXT NOT NULL,
    "instituicaoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersaoCurricular" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tetoCreditosPadrao" INTEGER NOT NULL,
    "prazoMaximoPeriodos" INTEGER NOT NULL,

    CONSTRAINT "VersaoCurricular_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "versaoCurricularId" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "corHex" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "ehEnfase" BOOLEAN NOT NULL DEFAULT false,
    "creditosExigidos" DECIMAL(5,1),
    "cargaHorariaExigida" INTEGER,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegraEnfase" (
    "versaoCurricularId" TEXT NOT NULL,
    "papel" "PapelEnfase" NOT NULL,
    "creditosExigidos" DECIMAL(5,1) NOT NULL,

    CONSTRAINT "RegraEnfase_pkey" PRIMARY KEY ("versaoCurricularId","papel")
);

-- CreateTable
CREATE TABLE "Disciplina" (
    "id" TEXT NOT NULL,
    "instituicaoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "creditos" DECIMAL(4,1) NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,

    CONSTRAINT "Disciplina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplinaVersao" (
    "id" TEXT NOT NULL,
    "versaoCurricularId" TEXT NOT NULL,
    "disciplinaId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "periodoSugerido" INTEGER,

    CONSTRAINT "DisciplinaVersao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requisito" (
    "id" TEXT NOT NULL,
    "disciplinaVersaoId" TEXT NOT NULL,
    "disciplinaExigidaId" TEXT NOT NULL,
    "tipo" "TipoRequisito" NOT NULL DEFAULT 'PRE',

    CONSTRAINT "Requisito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equivalencia" (
    "versaoCurricularId" TEXT NOT NULL,
    "cursadaId" TEXT NOT NULL,
    "satisfazId" TEXT NOT NULL,

    CONSTRAINT "Equivalencia_pkey" PRIMARY KEY ("versaoCurricularId","cursadaId","satisfazId")
);

-- CreateTable
CREATE TABLE "Semestre" (
    "id" SERIAL NOT NULL,
    "ano" INTEGER NOT NULL,
    "periodo" INTEGER NOT NULL,
    "inicioAulas" DATE,
    "fimAulas" DATE,

    CONSTRAINT "Semestre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professor" (
    "id" TEXT NOT NULL,
    "instituicaoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Local" (
    "id" TEXT NOT NULL,
    "instituicaoId" TEXT NOT NULL,
    "predio" TEXT NOT NULL,
    "sala" TEXT NOT NULL,

    CONSTRAINT "Local_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turma" (
    "id" TEXT NOT NULL,
    "disciplinaId" TEXT NOT NULL,
    "semestreId" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT,
    "vagas" INTEGER,

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurmaProfessor" (
    "turmaId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,

    CONSTRAINT "TurmaProfessor_pkey" PRIMARY KEY ("turmaId","professorId")
);

-- CreateTable
CREATE TABLE "HorarioTurma" (
    "id" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "inicioMin" INTEGER NOT NULL,
    "fimMin" INTEGER NOT NULL,
    "localId" TEXT,

    CONSTRAINT "HorarioTurma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perfil" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "apelido" TEXT,
    "dre" TEXT,
    "versaoCurricularId" TEXT,
    "semestreIngressoId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preferencia" (
    "perfilId" UUID NOT NULL,
    "evitarAntesDeMin" INTEGER,
    "evitarDepoisDeMin" INTEGER,
    "janelaMaximaMin" INTEGER,
    "maxDiasPresenciais" INTEGER,

    CONSTRAINT "Preferencia_pkey" PRIMARY KEY ("perfilId")
);

-- CreateTable
CREATE TABLE "HistoricoItem" (
    "id" TEXT NOT NULL,
    "perfilId" UUID NOT NULL,
    "disciplinaId" TEXT NOT NULL,
    "semestreId" INTEGER,
    "status" "StatusHistorico" NOT NULL,
    "nota" DECIMAL(3,1),

    CONSTRAINT "HistoricoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plano" (
    "id" TEXT NOT NULL,
    "donoId" UUID NOT NULL,
    "versaoCurricularId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "arquivado" BOOLEAN NOT NULL DEFAULT false,
    "enfasePrincipalId" TEXT,
    "contraEnfaseId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanoAcesso" (
    "planoId" TEXT NOT NULL,
    "perfilId" UUID NOT NULL,
    "papel" "PapelAcesso" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanoAcesso_pkey" PRIMARY KEY ("planoId","perfilId")
);

-- CreateTable
CREATE TABLE "PlanoPeriodo" (
    "id" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "semestreId" INTEGER,
    "tetoCreditos" INTEGER,
    "encerradoEm" TIMESTAMP(3),
    "trancado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlanoPeriodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanoItem" (
    "id" TEXT NOT NULL,
    "planoPeriodoId" TEXT NOT NULL,
    "disciplinaId" TEXT NOT NULL,
    "turmaId" TEXT,
    "fixado" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,

    CONSTRAINT "PlanoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanoItemHorario" (
    "id" TEXT NOT NULL,
    "planoItemId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "inicioMin" INTEGER NOT NULL,
    "fimMin" INTEGER NOT NULL,

    CONSTRAINT "PlanoItemHorario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlocoIndisponibilidade" (
    "id" TEXT NOT NULL,
    "perfilId" UUID NOT NULL,
    "semestreId" INTEGER,
    "titulo" TEXT NOT NULL,
    "tipo" "TipoBloco" NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "inicioMin" INTEGER NOT NULL,
    "fimMin" INTEGER NOT NULL,

    CONSTRAINT "BlocoIndisponibilidade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Instituicao_sigla_key" ON "Instituicao"("sigla");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_instituicaoId_codigo_key" ON "Curso"("instituicaoId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "VersaoCurricular_cursoId_codigo_key" ON "VersaoCurricular"("cursoId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_versaoCurricularId_chave_key" ON "Categoria"("versaoCurricularId", "chave");

-- CreateIndex
CREATE UNIQUE INDEX "Disciplina_instituicaoId_codigo_key" ON "Disciplina"("instituicaoId", "codigo");

-- CreateIndex
CREATE INDEX "DisciplinaVersao_categoriaId_idx" ON "DisciplinaVersao"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "DisciplinaVersao_versaoCurricularId_disciplinaId_key" ON "DisciplinaVersao"("versaoCurricularId", "disciplinaId");

-- CreateIndex
CREATE INDEX "Requisito_disciplinaExigidaId_idx" ON "Requisito"("disciplinaExigidaId");

-- CreateIndex
CREATE UNIQUE INDEX "Requisito_disciplinaVersaoId_disciplinaExigidaId_tipo_key" ON "Requisito"("disciplinaVersaoId", "disciplinaExigidaId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "Semestre_ano_periodo_key" ON "Semestre"("ano", "periodo");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_instituicaoId_nome_key" ON "Professor"("instituicaoId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "Local_instituicaoId_predio_sala_key" ON "Local"("instituicaoId", "predio", "sala");

-- CreateIndex
CREATE INDEX "Turma_semestreId_idx" ON "Turma"("semestreId");

-- CreateIndex
CREATE UNIQUE INDEX "Turma_disciplinaId_semestreId_codigo_key" ON "Turma"("disciplinaId", "semestreId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Turma_id_disciplinaId_key" ON "Turma"("id", "disciplinaId");

-- CreateIndex
CREATE INDEX "HorarioTurma_diaSemana_inicioMin_idx" ON "HorarioTurma"("diaSemana", "inicioMin");

-- CreateIndex
CREATE UNIQUE INDEX "HorarioTurma_turmaId_diaSemana_inicioMin_key" ON "HorarioTurma"("turmaId", "diaSemana", "inicioMin");

-- CreateIndex
CREATE INDEX "HistoricoItem_perfilId_status_idx" ON "HistoricoItem"("perfilId", "status");

-- CreateIndex
CREATE INDEX "HistoricoItem_disciplinaId_idx" ON "HistoricoItem"("disciplinaId");

-- CreateIndex
CREATE INDEX "Plano_donoId_arquivado_idx" ON "Plano"("donoId", "arquivado");

-- CreateIndex
CREATE UNIQUE INDEX "Plano_donoId_nome_key" ON "Plano"("donoId", "nome");

-- CreateIndex
CREATE INDEX "PlanoAcesso_perfilId_idx" ON "PlanoAcesso"("perfilId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanoPeriodo_planoId_ordem_key" ON "PlanoPeriodo"("planoId", "ordem");

-- CreateIndex
CREATE INDEX "PlanoItem_disciplinaId_idx" ON "PlanoItem"("disciplinaId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanoItem_planoPeriodoId_disciplinaId_key" ON "PlanoItem"("planoPeriodoId", "disciplinaId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanoItemHorario_planoItemId_diaSemana_inicioMin_key" ON "PlanoItemHorario"("planoItemId", "diaSemana", "inicioMin");

-- CreateIndex
CREATE INDEX "BlocoIndisponibilidade_perfilId_diaSemana_idx" ON "BlocoIndisponibilidade"("perfilId", "diaSemana");

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_instituicaoId_fkey" FOREIGN KEY ("instituicaoId") REFERENCES "Instituicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersaoCurricular" ADD CONSTRAINT "VersaoCurricular_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_versaoCurricularId_fkey" FOREIGN KEY ("versaoCurricularId") REFERENCES "VersaoCurricular"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegraEnfase" ADD CONSTRAINT "RegraEnfase_versaoCurricularId_fkey" FOREIGN KEY ("versaoCurricularId") REFERENCES "VersaoCurricular"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disciplina" ADD CONSTRAINT "Disciplina_instituicaoId_fkey" FOREIGN KEY ("instituicaoId") REFERENCES "Instituicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaVersao" ADD CONSTRAINT "DisciplinaVersao_versaoCurricularId_fkey" FOREIGN KEY ("versaoCurricularId") REFERENCES "VersaoCurricular"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaVersao" ADD CONSTRAINT "DisciplinaVersao_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaVersao" ADD CONSTRAINT "DisciplinaVersao_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requisito" ADD CONSTRAINT "Requisito_disciplinaVersaoId_fkey" FOREIGN KEY ("disciplinaVersaoId") REFERENCES "DisciplinaVersao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requisito" ADD CONSTRAINT "Requisito_disciplinaExigidaId_fkey" FOREIGN KEY ("disciplinaExigidaId") REFERENCES "Disciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equivalencia" ADD CONSTRAINT "Equivalencia_versaoCurricularId_fkey" FOREIGN KEY ("versaoCurricularId") REFERENCES "VersaoCurricular"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equivalencia" ADD CONSTRAINT "Equivalencia_cursadaId_fkey" FOREIGN KEY ("cursadaId") REFERENCES "Disciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equivalencia" ADD CONSTRAINT "Equivalencia_satisfazId_fkey" FOREIGN KEY ("satisfazId") REFERENCES "Disciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_instituicaoId_fkey" FOREIGN KEY ("instituicaoId") REFERENCES "Instituicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Local" ADD CONSTRAINT "Local_instituicaoId_fkey" FOREIGN KEY ("instituicaoId") REFERENCES "Instituicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_semestreId_fkey" FOREIGN KEY ("semestreId") REFERENCES "Semestre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaProfessor" ADD CONSTRAINT "TurmaProfessor_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaProfessor" ADD CONSTRAINT "TurmaProfessor_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioTurma" ADD CONSTRAINT "HorarioTurma_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioTurma" ADD CONSTRAINT "HorarioTurma_localId_fkey" FOREIGN KEY ("localId") REFERENCES "Local"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perfil" ADD CONSTRAINT "Perfil_versaoCurricularId_fkey" FOREIGN KEY ("versaoCurricularId") REFERENCES "VersaoCurricular"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perfil" ADD CONSTRAINT "Perfil_semestreIngressoId_fkey" FOREIGN KEY ("semestreIngressoId") REFERENCES "Semestre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preferencia" ADD CONSTRAINT "Preferencia_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoItem" ADD CONSTRAINT "HistoricoItem_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoItem" ADD CONSTRAINT "HistoricoItem_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoItem" ADD CONSTRAINT "HistoricoItem_semestreId_fkey" FOREIGN KEY ("semestreId") REFERENCES "Semestre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plano" ADD CONSTRAINT "Plano_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plano" ADD CONSTRAINT "Plano_versaoCurricularId_fkey" FOREIGN KEY ("versaoCurricularId") REFERENCES "VersaoCurricular"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plano" ADD CONSTRAINT "Plano_enfasePrincipalId_fkey" FOREIGN KEY ("enfasePrincipalId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plano" ADD CONSTRAINT "Plano_contraEnfaseId_fkey" FOREIGN KEY ("contraEnfaseId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoAcesso" ADD CONSTRAINT "PlanoAcesso_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoAcesso" ADD CONSTRAINT "PlanoAcesso_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoPeriodo" ADD CONSTRAINT "PlanoPeriodo_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoPeriodo" ADD CONSTRAINT "PlanoPeriodo_semestreId_fkey" FOREIGN KEY ("semestreId") REFERENCES "Semestre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoItem" ADD CONSTRAINT "PlanoItem_planoPeriodoId_fkey" FOREIGN KEY ("planoPeriodoId") REFERENCES "PlanoPeriodo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoItem" ADD CONSTRAINT "PlanoItem_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoItem" ADD CONSTRAINT "PlanoItem_turmaId_disciplinaId_fkey" FOREIGN KEY ("turmaId", "disciplinaId") REFERENCES "Turma"("id", "disciplinaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoItemHorario" ADD CONSTRAINT "PlanoItemHorario_planoItemId_fkey" FOREIGN KEY ("planoItemId") REFERENCES "PlanoItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlocoIndisponibilidade" ADD CONSTRAINT "BlocoIndisponibilidade_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlocoIndisponibilidade" ADD CONSTRAINT "BlocoIndisponibilidade_semestreId_fkey" FOREIGN KEY ("semestreId") REFERENCES "Semestre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

