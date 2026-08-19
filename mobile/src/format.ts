import { RecordType } from './api/client';

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  CLOCK_IN: 'Entrada',
  BREAK_START: 'Saída para descanso',
  BREAK_END: 'Volta do descanso',
  CLOCK_OUT: 'Saída',
};

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
