import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  Download,
  Share2,
  Printer,
  Palette,
  SunMedium,
} from 'lucide-react';
import {
  baixarRelatorioPdfV2,
  compartilharRelatorioPdfV2,
  imprimirRelatorioPdfV2,
  type DadosRelatorioPdfV2,
  type OpcoesRelatorioPdf,
} from './geradorPdfV2';
import { toast } from '@/components/ui/Toast';
import { formatarMoeda } from '@/lib/money';

interface ModalRelatorioPdfProps {
  aberto: boolean;
  aoFechar: () => void;
  dados: DadosRelatorioPdfV2;
}

export const ModalRelatorioPdf: React.FC<ModalRelatorioPdfProps> = ({
  aberto,
  aoFechar,
  dados,
}) => {
  const [modo, setModo] = useState<'colorido' | 'economico'>('colorido');
  const [incluirLancamentos, setIncluirLancamentos] = useState<boolean>(true);
  const [gerando, setGerando] = useState<boolean>(false);

  const opcoes: OpcoesRelatorioPdf = {
    modo,
    incluirLancamentos,
  };

  const handleBaixar = async () => {
    try {
      setGerando(true);
      await baixarRelatorioPdfV2(dados, opcoes);
      toast.sucesso('Relatório PDF baixado com sucesso!');
    } catch (e: any) {
      console.error('[DriveCash] Erro ao baixar PDF:', e);
      toast.erro('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGerando(false);
    }
  };

  const handleCompartilhar = async () => {
    try {
      setGerando(true);
      await compartilharRelatorioPdfV2(dados, opcoes);
    } catch (e: any) {
      console.error('[DriveCash] Erro ao compartilhar PDF:', e);
      toast.erro('Não foi possível compartilhar o PDF.');
    } finally {
      setGerando(false);
    }
  };

  const handleImprimir = async () => {
    try {
      setGerando(true);
      await imprimirRelatorioPdfV2(dados, opcoes);
    } catch (e: any) {
      console.error('[DriveCash] Erro ao imprimir PDF:', e);
      toast.erro('Não foi possível enviar para a impressora.');
    } finally {
      setGerando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Relatório Diário em PDF"
      descricao={`Fechamento do dia ${dados.dataReferencia}`}
    >
      <div className="space-y-4">
        {/* Card de Resumo Rápido do Relatório */}
        <div className="p-3.5 bg-bg-2 rounded-lg border border-line space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-texto-3 font-medium">Ganho Líquido:</span>
            <span className="text-sm font-bold text-texto-1 font-mono">
              {formatarMoeda(dados.ganhoLiquidoCentavos)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-texto-3 font-medium">Lucro Líquido Final:</span>
            <span className="text-sm font-black text-positivo font-mono">
              {formatarMoeda(dados.lucroLiquidoCentavos)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-texto-3 font-medium">Taxas Totais ({dados.taxaEfetivaPct.toFixed(1)}%):</span>
            <span className="text-xs font-semibold text-amber-400 font-mono">
              −{formatarMoeda(dados.totalTaxasCentavos)}
            </span>
          </div>
        </div>

        {/* Escolha do Estilo do PDF */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-texto-3 block">
            Estilo Visual
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setModo('colorido')}
              className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                modo === 'colorido'
                  ? 'border-laranja-500 bg-laranja-500/10 text-texto-1 shadow-sm'
                  : 'border-line bg-bg-2 text-texto-3 hover:text-texto-1'
              }`}
            >
              <Palette className={`size-4 mt-0.5 shrink-0 ${modo === 'colorido' ? 'text-laranja-400' : ''}`} />
              <div>
                <span className="text-xs font-bold block">Colorido Elegante</span>
                <span className="text-[10px] text-texto-3 block mt-0.5">
                  Visual escuro com cartões coloridos (ideal para celular/WhatsApp)
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setModo('economico')}
              className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                modo === 'economico'
                  ? 'border-laranja-500 bg-laranja-500/10 text-texto-1 shadow-sm'
                  : 'border-line bg-bg-2 text-texto-3 hover:text-texto-1'
              }`}
            >
              <SunMedium className={`size-4 mt-0.5 shrink-0 ${modo === 'economico' ? 'text-laranja-400' : ''}`} />
              <div>
                <span className="text-xs font-bold block">Econômico P&B</span>
                <span className="text-[10px] text-texto-3 block mt-0.5">
                  Fundo branco limpo (ideal para economizar tinta de impressora)
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Opção da Lista Completa de Lançamentos */}
        <label className="flex items-center gap-2.5 p-3 rounded-lg bg-bg-2 border border-line cursor-pointer hover:bg-bg-1 transition-colors">
          <input
            type="checkbox"
            checked={incluirLancamentos}
            onChange={(e) => setIncluirLancamentos(e.target.checked)}
            className="size-4 rounded border-line text-laranja-500 focus:ring-laranja-500"
          />
          <div className="flex-1">
            <span className="text-xs font-bold text-texto-1 block">
              Incluir lista detalhada de corridas e gastos
            </span>
            <span className="text-[10px] text-texto-3 block">
              Mostra cada lançamento com horário, valor e meio de pagamento
            </span>
          </div>
        </label>

        {/* Ações: Baixar, Compartilhar, Imprimir */}
        <div className="space-y-2 pt-2 border-t border-line">
          <Button
            variante="primario"
            tamanho="lg"
            className="w-full justify-center"
            onClick={handleBaixar}
            carregando={gerando}
            icone={<Download className="size-4" />}
          >
            Baixar PDF (Salvar no Aparelho)
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variante="secundario"
              className="w-full justify-center"
              onClick={handleCompartilhar}
              disabled={gerando}
              icone={<Share2 className="size-4 text-laranja-400" />}
            >
              WhatsApp / Compartilhar
            </Button>

            <Button
              variante="secundario"
              className="w-full justify-center"
              onClick={handleImprimir}
              disabled={gerando}
              icone={<Printer className="size-4" />}
            >
              Imprimir
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
