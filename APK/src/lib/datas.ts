/**
 * Datas e fuso — PRD RN-02
 * - Timestamps em UTC; exibição no fuso do usuário (padrão America/Sao_Paulo).
 * - `data_referencia` = data local (yyyy-MM-dd).
 * - Semana começa na segunda (configurável: domingo ou segunda).
 */
import { addDays, endOfWeek, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { FUSO_PADRAO } from './config';

export type InicioSemana = 'segunda' | 'domingo';

const indiceInicio = (inicio: InicioSemana) => (inicio === 'domingo' ? 0 : 1) as 0 | 1;

/** Data local (yyyy-MM-dd) de um instante, no fuso informado. */
export function dataReferencia(instante: Date = new Date(), fuso: string = FUSO_PADRAO): string {
  return formatInTimeZone(instante, fuso, 'yyyy-MM-dd');
}

/** Atalho para data local de hoje (yyyy-MM-dd). */
export function dataHojeISO(): string {
  return dataReferencia();
}

/** Formata uma data no fuso (padrão: dd/MM/yyyy). */
export function formatarData(
  instante: Date,
  formato = 'dd/MM/yyyy',
  fuso: string = FUSO_PADRAO,
): string {
  return formatInTimeZone(instante, fuso, formato, { locale: ptBR });
}

/** Formata hora no fuso (HH:mm). */
export function formatarHora(instante: Date, fuso: string = FUSO_PADRAO): string {
  return formatInTimeZone(instante, fuso, 'HH:mm');
}

/** Data por extenso curta: "sex, 09 de out". */
export function formatarDataCurta(instante: Date, fuso: string = FUSO_PADRAO): string {
  return formatInTimeZone(instante, fuso, "EEE, dd 'de' MMM", { locale: ptBR });
}

/**
 * Intervalo da semana (datas locais yyyy-MM-dd) que contém o instante.
 * `inicio` define se a semana começa na segunda (padrão) ou no domingo.
 */
export function intervaloDaSemana(
  instante: Date = new Date(),
  inicio: InicioSemana = 'segunda',
  fuso: string = FUSO_PADRAO,
): { inicio: string; fim: string } {
  const local = toZonedTime(instante, fuso);
  const weekStartsOn = indiceInicio(inicio);
  const ini = startOfWeek(local, { weekStartsOn });
  const fim = endOfWeek(local, { weekStartsOn });
  return {
    inicio: formatarLocal(ini),
    fim: formatarLocal(fim),
  };
}

/** Os 7 dias (yyyy-MM-dd) da semana do instante. */
export function diasDaSemana(
  instante: Date = new Date(),
  inicio: InicioSemana = 'segunda',
  fuso: string = FUSO_PADRAO,
): string[] {
  const local = toZonedTime(instante, fuso);
  const ini = startOfWeek(local, { weekStartsOn: indiceInicio(inicio) });
  return Array.from({ length: 7 }, (_, i) => formatarLocal(addDays(ini, i)));
}

/** Converte "yyyy-MM-dd HH:mm" no fuso local para um instante UTC. */
export function localParaUtc(dataHoraLocal: string, fuso: string = FUSO_PADRAO): Date {
  return fromZonedTime(dataHoraLocal, fuso);
}

/** Saudação conforme a hora local. */
export function saudacao(instante: Date = new Date(), fuso: string = FUSO_PADRAO): string {
  const hora = Number(formatInTimeZone(instante, fuso, 'H'));
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatarLocal(d: Date): string {
  const a = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${a}-${m}-${dia}`;
}
