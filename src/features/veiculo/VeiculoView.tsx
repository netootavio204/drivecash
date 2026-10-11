import React, { useState, useEffect } from 'react';
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
  Plus,
  Trash2,
  CheckCircle2,
  CircleDot,
  Disc,
} from 'lucide-react';

export type CategoriaAlerta = 'oleo' | 'pneu' | 'freio' | 'mecanica' | 'outro';

export type AlertaItem = {
  id: string;
  nome: string;
  categoria: CategoriaAlerta;
  intervaloKm: number;
  ultimoKm: number;
};

const ALERTAS_PADRAO: AlertaItem[] = [
  {
    id: 'oleo',
    nome: 'Troca de Óleo & Filtros',
    categoria: 'oleo',
    intervaloKm: 10000,
    ultimoKm: 0,
  },
  {
    id: 'pneu',
    nome: 'Troca / Rodízio de Pneus',
    categoria: 'pneu',
    intervaloKm: 40000,
    ultimoKm: 0,
  },
  {
    id: 'freio',
    nome: 'Pastilhas de Freio',
    categoria: 'freio',
    intervaloKm: 30000,
    ultimoKm: 0,
  },
  {
    id: 'alinhamento',
    nome: 'Alinhamento & Balanceamento',
    categoria: 'mecanica',
    intervaloKm: 10000,
    ultimoKm: 0,
  },
  {
    id: 'velas',
    nome: 'Velas de Ignição',
    categoria: 'mecanica',
    intervaloKm: 40000,
    ultimoKm: 0,
  },
];

export const VeiculoView: React.FC = () => {
  const { data: veiculo, isLoading } = useVeiculoPrincipal();
  const { mutateAsync: salvarVeiculo, isPending: salvando } = useSalvarVeiculo();

  // Modais
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [modalNovoAlertaAberto, setModalNovoAlertaAberto] = useState(false);
  const [alertaParaResetar, setAlertaParaResetar] = useState<AlertaItem | null>(null);

  // Form do Veículo
  const [formModelo, setFormModelo] = useState('');
  const [formPlaca, setFormPlaca] = useState('');
  const [formAno, setFormAno] = useState('');
  const [formKmAtual, setFormKmAtual] = useState('');

  // Form de Novo Alerta
  const [formAlertaNome, setFormAlertaNome] = useState('');
  const [formAlertaCategoria, setFormAlertaCategoria] = useState<CategoriaAlerta>('pneu');
  const [formAlertaIntervalo, setFormAlertaIntervalo] = useState('10000');
  const [formAlertaUltimoKm, setFormAlertaUltimoKm] = useState('0');

  // Alertas dinâmicos com persistência local
  const [alertas, setAlertas] = useState<AlertaItem[]>([]);

  // Carregar alertas salvos ou padrão quando o veículo carregar
  useEffect(() => {
    const chaveStorage = veiculo ? `metadriver_alertas_${veiculo.id}` : 'metadriver_alertas_padrao';
    try {
      const salvo = localStorage.getItem(chaveStorage);
      if (salvo) {
        setAlertas(JSON.parse(salvo));
      } else {
        setAlertas(ALERTAS_PADRAO);
      }
    } catch {
      setAlertas(ALERTAS_PADRAO);
    }
  }, [veiculo]);

  // Salvar alertas
  const salvarListaAlertas = (novaLista: AlertaItem[]) => {
    setAlertas(novaLista);
    const chaveStorage = veiculo ? `metadriver_alertas_${veiculo.id}` : 'metadriver_alertas_padrao';
    try {
      localStorage.setItem(chaveStorage, JSON.stringify(novaLista));
    } catch (e) {
      console.warn('Erro ao salvar alertas no localStorage:', e);
    }
  };

  // Abrir modal de edição com dados atuais
  const handleAbrirEdicao = () => {
    setFormModelo(veiculo?.modelo || '');
    setFormPlaca(veiculo?.placa || '');
    setFormAno(veiculo?.ano ? String(veiculo.ano) : '');
    setFormKmAtual(veiculo?.km_atual ? String(veiculo.km_atual) : '0');
    setModalEdicaoAberto(true);
  };

  const handleSalvarCarro = async () => {
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
      setModalEdicaoAberto(false);
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  // Adicionar novo alerta personalizado
  const handleCriarAlerta = () => {
    if (!formAlertaNome.trim()) {
      toast.erro('Informe o nome da manutenção.');
      return;
    }
    const intervalo = parseInt(formAlertaIntervalo, 10);
    if (isNaN(intervalo) || intervalo <= 0) {
      toast.erro('Informe um intervalo de km válido.');
      return;
    }

    const kmAtual = veiculo?.km_atual || 0;
    const ultimoKm = formAlertaUltimoKm ? parseInt(formAlertaUltimoKm, 10) : kmAtual;

    const novo: AlertaItem = {
      id: `alerta_${Date.now()}`,
      nome: formAlertaNome.trim(),
      categoria: formAlertaCategoria,
      intervaloKm: intervalo,
      ultimoKm: isNaN(ultimoKm) ? 0 : ultimoKm,
    };

    salvarListaAlertas([...alertas, novo]);
    toast.sucesso(`Alerta "${novo.nome}" cadastrado com sucesso!`);
    setModalNovoAlertaAberto(false);
    setFormAlertaNome('');
    setFormAlertaIntervalo('10000');
    setFormAlertaUltimoKm('0');
  };

  // Excluir alerta
  const handleExcluirAlerta = (id: string, nome: string) => {
    const filtrados = alertas.filter((a) => a.id !== id);
    salvarListaAlertas(filtrados);
    toast.info(`Alerta "${nome}" removido.`);
  };

  // Confirmar reset / registro de manutenção feita
  const handleConfirmarReset = () => {
    if (!alertaParaResetar) return;
    const kmAtual = veiculo?.km_atual || 0;

    const atualizados = alertas.map((a) => {
      if (a.id === alertaParaResetar.id) {
        return { ...a, ultimoKm: kmAtual };
      }
      return a;
    });

    salvarListaAlertas(atualizados);
    toast.sucesso(`Manutenção de "${alertaParaResetar.nome}" registrada no km ${kmAtual.toLocaleString('pt-BR')}!`);
    setAlertaParaResetar(null);
  };

  const kmAtual = veiculo?.km_atual || 0;

  // Renderizar ícone da categoria
  const renderIconeCategoria = (cat: CategoriaAlerta) => {
    switch (cat) {
      case 'oleo':
        return <Fuel className="size-4 text-amber-400 shrink-0" />;
      case 'pneu':
        return <Disc className="size-4 text-emerald-400 shrink-0" />;
      case 'freio':
        return <Wrench className="size-4 text-blue-400 shrink-0" />;
      case 'mecanica':
        return <CircleDot className="size-4 text-laranja-400 shrink-0" />;
      default:
        return <Wrench className="size-4 text-purple-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-texto-1">Meu Veículo</h1>
          <p className="text-xs text-texto-3">Controle de quilometragem e alertas de manutenção</p>
        </div>
        <Button
          variante="primario"
          className="text-xs self-start sm:self-auto px-4 py-2 min-h-[42px] inline-flex items-center justify-center gap-2"
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
                    <span className="font-mono uppercase bg-bg-3 px-2 py-0.5 rounded border border-line/50 text-texto-1 font-bold">
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
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-texto-1 flex items-center gap-2">
                <Wrench className="size-4 text-laranja-400" />
                Alertas Preventivos ({alertas.length})
              </h3>
              <Button
                variante="secundario"
                className="text-xs h-8 px-3"
                onClick={() => {
                  setFormAlertaNome('');
                  setFormAlertaCategoria('pneu');
                  setFormAlertaIntervalo('10000');
                  setFormAlertaUltimoKm(String(kmAtual));
                  setModalNovoAlertaAberto(true);
                }}
                icone={<Plus className="size-3.5" />}
              >
                Adicionar Alerta
              </Button>
            </div>

            {alertas.length === 0 ? (
              <Card className="p-6 text-center text-xs text-texto-3 space-y-2">
                <p>Nenhum alerta cadastrado.</p>
                <Button
                  variante="secundario"
                  className="text-xs mx-auto"
                  onClick={() => salvarListaAlertas(ALERTAS_PADRAO)}
                >
                  Restaurar Alertas Padrão
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {alertas.map((alerta) => {
                  const kmRodados = Math.max(0, kmAtual - alerta.ultimoKm);
                  const kmRestante = Math.max(0, alerta.intervaloKm - (kmRodados % alerta.intervaloKm));
                  const pct = Math.min(100, Math.round(((alerta.intervaloKm - kmRestante) / alerta.intervaloKm) * 100));
                  const urgente = kmRestante <= 1000 || pct >= 90;

                  return (
                    <Card
                      key={alerta.id}
                      className={`p-4 bg-bg-2 border transition-all space-y-3 ${
                        urgente ? 'border-negativo/60 bg-negativo/5' : 'border-line/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {renderIconeCategoria(alerta.categoria)}
                          <span className="font-bold text-sm text-texto-1 truncate">
                            {alerta.nome}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-xs font-bold font-mono ${
                              urgente ? 'text-negativo' : 'text-laranja-400'
                            }`}
                          >
                            {urgente ? '⚠️ ' : ''}Faltam {kmRestante.toLocaleString('pt-BR')} km
                          </span>
                        </div>
                      </div>

                      {/* Barra de Progresso */}
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-bg-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              urgente
                                ? 'bg-negativo shadow-[0_0_8px_rgba(255,45,45,0.5)]'
                                : pct > 60
                                ? 'bg-amber-400'
                                : 'bg-gradient-to-r from-laranja-500 to-emerald-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-texto-3 pt-0.5">
                          <span>A cada {alerta.intervaloKm.toLocaleString('pt-BR')} km</span>
                          <span>{pct}% do ciclo concluído</span>
                        </div>
                      </div>

                      {/* Botões de Ação do Alerta */}
                      <div className="pt-2 border-t border-line/40 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setAlertaParaResetar(alerta)}
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors py-1 px-2 rounded-lg hover:bg-emerald-500/10 cursor-pointer"
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span>Registrar Troca Feita</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExcluirAlerta(alerta.id, alerta.nome)}
                          className="p-1.5 text-texto-3 hover:text-negativo rounded-lg transition-colors cursor-pointer"
                          title="Excluir alerta"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Sem Veículo Cadastrado */
        <Card className="text-center py-12 space-y-3 bg-bg-2 border-line/60">
          <Car className="size-12 text-texto-3 mx-auto" />
          <h3 className="font-bold text-base text-texto-1">Nenhum veículo cadastrado</h3>
          <p className="text-xs text-texto-3 max-w-xs mx-auto">
            Cadastre seu carro para acompanhar o odômetro e receber alertas automáticos de troca de óleo, pneus e manutenção.
          </p>
          <Button variante="primario" onClick={handleAbrirEdicao}>
            Cadastrar Meu Veículo
          </Button>
        </Card>
      )}

      {/* Modal de Criação / Edição do Carro */}
      <Modal
        aberto={modalEdicaoAberto}
        aoFechar={() => setModalEdicaoAberto(false)}
        titulo={veiculo ? 'Editar Veículo' : 'Cadastrar Veículo'}
        descricao="Mantenha os dados do seu carro atualizados para cálculos corretos."
        rodape={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button variante="fantasma" onClick={() => setModalEdicaoAberto(false)}>
              Cancelar
            </Button>
            <Button variante="primario" onClick={handleSalvarCarro} carregando={salvando}>
              Salvar Veículo
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            rotulo="Modelo do Carro"
            placeholder="Ex: Chevrolet Onix 1.0, Ford Ka, Renault Kwid"
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
            dica="Ao alterar o odômetro, todos os alertas de manutenção atualizam automaticamente."
          />
        </div>
      </Modal>

      {/* Modal de Adição de Novo Alerta */}
      <Modal
        aberto={modalNovoAlertaAberto}
        aoFechar={() => setModalNovoAlertaAberto(false)}
        titulo="Novo Alerta de Manutenção"
        descricao="Monitore trocas de pneus, correias, filtros ou qualquer revisão."
        rodape={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button variante="fantasma" onClick={() => setModalNovoAlertaAberto(false)}>
              Cancelar
            </Button>
            <Button variante="primario" onClick={handleCriarAlerta}>
              Salvar Alerta
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            rotulo="Nome da Manutenção / Peça"
            placeholder="Ex: Pneus Dianteiros, Rodízio de Pneus, Correia Dentada"
            value={formAlertaNome}
            onChange={(e) => setFormAlertaNome(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-texto-2 mb-1.5">
              Tipo / Categoria
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'pneu', rotulo: '🛞 Pneus' },
                  { id: 'oleo', rotulo: '🛢️ Óleo/Filtros' },
                  { id: 'freio', rotulo: '🛑 Freios' },
                  { id: 'mecanica', rotulo: '⚙️ Mecânica' },
                  { id: 'outro', rotulo: '🔧 Outros' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormAlertaCategoria(cat.id)}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all ${
                    formAlertaCategoria === cat.id
                      ? 'bg-laranja-500/20 text-laranja-400 border-laranja-500/60 shadow-sm'
                      : 'bg-bg-2 text-texto-3 border-line/60 hover:text-texto-1'
                  }`}
                >
                  {cat.rotulo}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              rotulo="Revisar a cada (km)"
              type="number"
              placeholder="Ex: 40000"
              value={formAlertaIntervalo}
              onChange={(e) => setFormAlertaIntervalo(e.target.value)}
              dica="Intervalo recomendado para a peça"
            />
            <Input
              rotulo="Km da última troca"
              type="number"
              placeholder={String(kmAtual)}
              value={formAlertaUltimoKm}
              onChange={(e) => setFormAlertaUltimoKm(e.target.value)}
              dica="Odômetro quando trocou"
            />
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação de Troca Feita */}
      <Modal
        aberto={!!alertaParaResetar}
        aoFechar={() => setAlertaParaResetar(null)}
        titulo="Registrar Manutenção Realizada"
        descricao={`Confirmar a troca/revisão de "${alertaParaResetar?.nome}"?`}
        rodape={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button variante="fantasma" onClick={() => setAlertaParaResetar(null)}>
              Cancelar
            </Button>
            <Button variante="primario" onClick={handleConfirmarReset}>
              Confirmar Troca no Km {kmAtual.toLocaleString('pt-BR')}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-texto-2">
          <p>
            O odômetro atual do carro é de{' '}
            <strong className="text-texto-1 font-mono">{kmAtual.toLocaleString('pt-BR')} km</strong>.
          </p>
          <p>
            Ao confirmar, o ciclo de <strong>{alertaParaResetar?.nome}</strong> será reiniciado a partir desta quilometragem.
          </p>
        </div>
      </Modal>
    </div>
  );
};
