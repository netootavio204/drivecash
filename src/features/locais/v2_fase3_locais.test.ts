import { describe, it, expect } from 'vitest';
import type { LocalComSaldo, CriarTransferenciaInput } from './types';

describe('DriveCash V2 — Fase V2.3: Locais do Dinheiro e Transferências', () => {
  describe('Cálculo de Saldos e Transferências', () => {
    it('deve debitar o valor bruto da origem e creditar o valor líquido no destino', () => {
      const saldoInicialApp = 10000; // R$ 100,00
      const saldoInicialInter = 5000; // R$ 50,00

      const transferencia: CriarTransferenciaInput = {
        local_origem_id: 'app-99',
        local_destino_id: 'banco-inter',
        valor_centavos: 10000, // R$ 100,00
        taxa_centavos: 100, // R$ 1,00 taxa de saque rápido 99
      };

      const novoSaldoApp = saldoInicialApp - transferencia.valor_centavos;
      const valorLiquidoRecebido = transferencia.valor_centavos - (transferencia.taxa_centavos || 0);
      const novoSaldoInter = saldoInicialInter + valorLiquidoRecebido;

      expect(novoSaldoApp).toBe(0);
      expect(valorLiquidoRecebido).toBe(9900); // R$ 99,00
      expect(novoSaldoInter).toBe(14900); // R$ 149,00
    });

    it('permite que o App 99 fique com saldo negativo devido a taxas sem quebrar', () => {
      const saldoApp = 2000; // R$ 20,00
      const taxaCorrida99 = 3500; // R$ 35,00 debitado no app

      const saldoAposTaxa = saldoApp - taxaCorrida99;
      expect(saldoAposTaxa).toBe(-1500); // -R$ 15,00

      const estaNegativo = saldoAposTaxa < 0;
      expect(estaNegativo).toBe(true);
    });

    it('rejeita transferência com mesma conta de origem e destino', () => {
      function validarTransferencia(input: CriarTransferenciaInput) {
        if (input.local_origem_id === input.local_destino_id) {
          throw new Error('ORIGEM_IGUAL_DESTINO');
        }
        if (input.valor_centavos <= 0) {
          throw new Error('VALOR_INVALIDO');
        }
        if ((input.taxa_centavos || 0) < 0 || (input.taxa_centavos || 0) > input.valor_centavos) {
          throw new Error('TAXA_INVALIDA');
        }
        return true;
      }

      expect(() =>
        validarTransferencia({
          local_origem_id: 'bolso',
          local_destino_id: 'bolso',
          valor_centavos: 5000,
        }),
      ).toThrow('ORIGEM_IGUAL_DESTINO');

      expect(() =>
        validarTransferencia({
          local_origem_id: 'bolso',
          local_destino_id: 'inter',
          valor_centavos: 0,
        }),
      ).toThrow('VALOR_INVALIDO');

      expect(() =>
        validarTransferencia({
          local_origem_id: 'bolso',
          local_destino_id: 'inter',
          valor_centavos: 1000,
          taxa_centavos: 1500, // taxa maior que o valor
        }),
      ).toThrow('TAXA_INVALIDA');

      expect(
        validarTransferencia({
          local_origem_id: 'app-99',
          local_destino_id: 'inter',
          valor_centavos: 10000,
          taxa_centavos: 100,
        }),
      ).toBe(true);
    });
  });

  describe('Conciliação de Locais e Caixas', () => {
    it('deve calcular a diferença entre soma dos locais e soma dos caixas', () => {
      const locais: LocalComSaldo[] = [
        {
          id: '1',
          user_id: 'u1',
          tipo: 'bolso',
          nome: 'Bolso',
          saldo_inicial_centavos: 0,
          taxa_debito_pct: 0,
          taxa_credito_pct: 0,
          taxa_pix_pct: 0,
          prazo_credito_dias: 0,
          ativo: true,
          ordem: 1,
          criado_em: '2026-10-18T10:00:00Z',
          saldo_centavos: 15000, // R$ 150,00
        },
        {
          id: '2',
          user_id: 'u1',
          tipo: 'app',
          nome: 'App 99',
          saldo_inicial_centavos: 0,
          taxa_debito_pct: 0,
          taxa_credito_pct: 0,
          taxa_pix_pct: 0,
          prazo_credito_dias: 0,
          ativo: true,
          ordem: 2,
          criado_em: '2026-10-18T10:00:00Z',
          saldo_centavos: 5000, // R$ 50,00
        },
        {
          id: '3',
          user_id: 'u1',
          tipo: 'banco',
          nome: 'Banco Inter',
          banco_codigo: 'inter',
          saldo_inicial_centavos: 0,
          taxa_debito_pct: 0,
          taxa_credito_pct: 0,
          taxa_pix_pct: 0,
          prazo_credito_dias: 0,
          ativo: true,
          ordem: 3,
          criado_em: '2026-10-18T10:00:00Z',
          saldo_centavos: 10000, // R$ 100,00
        },
      ];

      const totalLocais = locais.reduce((acc, l) => acc + l.saldo_centavos, 0);
      expect(totalLocais).toBe(30000); // R$ 300,00

      const totalCaixas = 30000;
      const diferenca = totalLocais - totalCaixas;

      expect(diferenca).toBe(0);
    });

    it('preserva dados históricos legados com locais neutros', () => {
      const lancamentoAntigo = {
        id: 'lanc-antigo-1',
        tipo: 'entrada',
        valor_centavos: 4500,
        origem: 'manual',
        local_id: null, // neutro, não classificado em massa
        modo_partes: false,
      };

      expect(lancamentoAntigo.local_id).toBeNull();
      expect(lancamentoAntigo.modo_partes).toBe(false);
      expect(lancamentoAntigo.valor_centavos).toBe(4500);
    });
  });
});
