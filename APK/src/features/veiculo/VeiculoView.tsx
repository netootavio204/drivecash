import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Estados';
import { toast } from '@/components/ui/Toast';
import { traduzirErro } from '@/lib/erros';
import { useVeiculoPrincipal, useSalvarVeiculo } from './api';
import {
  Car,
  Fuel,
  Wrench,
  Edit2,
  Gauge,
} from 'lucide-react';

export const VeiculoView: React.FC = () => {
  const { data: veiculo, isLoading } = useVeiculoPrincipal();
  const { mutateAsync: salvarVeiculo, isPending: salvando } = useSalvarVeiculo();

  const [modalAberto, setModalAberto] = useState(false);
  const [formModelo, setFormModelo] = useState('');
  const [formPlaca, setFormPlaca] = useState('');
  const [formAno, setFormAno] = useState('');
  const [formKmAtual, setFormKmAtual] = useState('');

  // Abrir modal com dados atuais
  const handleAbrirEdicao = () => {
    setFormModelo(veiculo?.modelo || '');
    setFormPlaca(veiculo?.placa || '');
    setFormAno(veiculo?.ano ? String(veiculo.ano) : '');
    setFormKmAtual(veiculo?.km_atual ? String(veiculo.km_atual) : '0');
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    if (!formModelo.trim()) {
      toast.erro('Informe o modelo do veículo.');
      return;
    }

    try {
      await salvarVeiculo({
        id: veiculo?.id,
        modelo: formModelo.trim(),
        placa: formPlaca.trim() || null,
        ano: formAno ? parseInt(formAno, 10) : null,
        kmAtual: formKmAtual ? parseInt(formKmAtual, 10) : 0,
      });
      toast.sucesso('Dados do veículo atualizados!');
      setModalAberto(false);
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  const kmAtual = veiculo?.km_atual || 0;

  // Cálculos de intervalos de manutenção preventiva
  const intervaloOleo = 10000;
  const kmRestanteOleo = Math.max(0, intervaloOleo - (kmAtual % intervaloOleo));
  const pctOleo = Math.min(100, Math.round(((intervaloOleo - kmRestanteOleo) / intervaloOleo) * 100));

  const intervaloPastilhas = 30000;
  const kmRestantePastilhas = Math.max(0, intervaloPastilhas - (kmAtual % intervaloPastilhas));
  const pctPastilhas = Math.min(100, Math.round(((intervaloPastilhas - kmRestantePastilhas) / intervaloPastilhas) * 100));

  return (
    <div className="space-y-5 pb-20">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-texto-1">Meu Veículo</h1>
          <p className="text-xs text-texto-3">Controle de quilometragem e alertas de manutenção</p>
        </div>
        <Button
          variante="primario"
          className="text-xs h-9 px-3"
          onClick={handleAbrirEdicao}
          icone={<Edit2 className="size-3.5" />}
        >
          {veiculo ? 'Editar Carro' : 'Cadastrar Carro'}
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-44 w-full rounded-xl" />
      ) : veiculo ? (
        <>
          {/* Card do Carro com Odômetro */}
          <Card variante="destaque" className="p-5 space-y-4 shadow-neon relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-laranja-400">
                  VEÍCULO ATIVO
                </span>
                <h2 className="text-2xl font-black text-texto-1 tracking-tight">
                  {veiculo.modelo}
                </h2>
                <div className="flex items-center gap-2 text-xs text-texto-3">
                  {veiculo.placa && (
                    <span className="font-mono uppercase bg-bg-3 px-2 py-0.5 rounded border border-line/50">
                      {veiculo.placa}
                    </span>
                  )}
                  {veiculo.ano && <span>Ano {veiculo.ano}</span>}
                  <span>• Flex</span>
                </div>
              </div>

              <div className="size-14 rounded-2xl bg-laranja-500/20 border border-laranja-500/40 grid place-items-center text-laranja-400 shrink-0">
                <Car className="size-7" />
              </div>
            </div>

            {/* Odômetro Atual */}
            <div className="pt-3 border-t border-line/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-texto-2 text-xs font-bold">
                <Gauge className="size-4 text-laranja-400" />
                <span>Odômetro Atual:</span>
              </div>
              <span className="text-xl font-black font-mono text-texto-1">
                {kmAtual.toLocaleString('pt-BR')} <span className="text-xs font-normal text-texto-3">km</span>
              </span>
            </div>
          </Card>

          {/* Alertas Preventivos de Manutenção */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-texto-1 flex items-center gap-2">
              <Wrench className="size-4 text-laranja-400" />
              Alertas Preventivos de Manutenção
            </h3>

            {/* Troca de Óleo e Filtros */}
            <Card className="p-4 bg-bg-2 border-line/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fuel className="size-4 text-amber-400" />
                  <span className="font-bold text-sm text-texto-1">Troca de Óleo & Filtro</span>
                </div>
                <span className="text-xs font-bold text-amber-400">
                  Faltam {kmRestanteOleo.toLocaleString('pt-BR')} km
                </span>
              </div>

              <div className="space-y-1">
                <div className="h-2 w-full bg-bg-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pctOleo > 85 ? 'bg-negativo' : 'bg-gradient-to-r from-laranja-500 to-amber-400'
                    }`}
                    style={{ width: `${pctOleo}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-texto-3">
                  <span>A cada 10.000 km</span>
                  <span>{pctOleo}% do ciclo</span>
                </div>
              </div>
            </Card>

            {/* Pastilhas de Freio */}
            <Card className="p-4 bg-bg-2 border-line/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="size-4 text-blue-400" />
                  <span className="font-bold text-sm text-texto-1">Pastilhas de Freio</span>
                </div>
                <span className="text-xs font-bold text-blue-400">
                  Faltam {kmRestantePastilhas.toLocaleString('pt-BR')} km
                </span>
              </div>

              <div className="space-y-1">
                <div className="h-2 w-full bg-bg-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${pctPastilhas}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-texto-3">
                  <span>Revisão preventiva a cada 30.000 km</span>
                  <span>{pctPastilhas}% do ciclo</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        /* Sem Veículo Cadastrado */
        <Card className="text-center py-12 space-y-3 bg-bg-2 border-line/60">
          <Car className="size-12 text-texto-3 mx-auto" />
          <h3 className="font-bold text-base text-texto-1">Nenhum veículo cadastrado</h3>
          <p className="text-xs text-texto-3 max-w-xs mx-auto">
            Cadastre seu carro para acompanhar o odômetro e receber alertas automáticos de troca de óleo e manutenção.
          </p>
          <Button variante="primario" onClick={handleAbrirEdicao}>
            Cadastrar Meu Veículo
          </Button>
        </Card>
      )}

      {/* Modal de Criação / Edição do Carro */}
      <Modal
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        titulo={veiculo ? 'Editar Veículo' : 'Cadastrar Veículo'}
        descricao="Mantenha os dados do seu carro atualizados para cálculos corretos."
        rodape={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button variante="fantasma" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button variante="primario" onClick={handleSalvar} carregando={salvando}>
              Salvar Veículo
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            rotulo="Modelo do Carro"
            placeholder="Ex: Chevrolet Onix 1.0, Fiat Cronos, Renault Kwid"
            value={formModelo}
            onChange={(e) => setFormModelo(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              rotulo="Placa (opcional)"
              placeholder="Ex: ABC-1D23"
              value={formPlaca}
              onChange={(e) => setFormPlaca(e.target.value)}
            />
            <Input
              rotulo="Ano (opcional)"
              type="number"
              placeholder="Ex: 2022"
              value={formAno}
              onChange={(e) => setFormAno(e.target.value)}
            />
          </div>

          <Input
            rotulo="Quilometragem Atual (Odômetro)"
            type="number"
            placeholder="Ex: 65400"
            value={formKmAtual}
            onChange={(e) => setFormKmAtual(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
