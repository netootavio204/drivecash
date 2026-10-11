import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Progress';
import {
  User,
  Car,
  Layers,
  Wallet,
  Target,
  ArrowRight,
  ArrowLeft,
  Plus,
  Check,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlataformaItem {
  id: string;
  nome: string;
  cor: string;
  ativa: boolean;
}

export const OnboardingView: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Passo 1: Nome
  const [nome, setNome] = useState<string>(profile?.nome || '');

  // Passo 2: Veículo
  const [veiculoModelo, setVeiculoModelo] = useState<string>('');
  const [veiculoPlaca, setVeiculoPlaca] = useState<string>('');
  const [veiculoKm, setVeiculoKm] = useState<string>('');

  // Passo 3: Plataformas
  const [plataformas, setPlataformas] = useState<PlataformaItem[]>([]);
  const [novaPlataforma, setNovaPlataforma] = useState<string>('');
  const [mostraAddPlataforma, setMostraAddPlataforma] = useState<boolean>(false);

  // Passo 4: Dinheiro em mãos agora (saldo inicial)
  const [saldoInicialCentavos, setSaldoInicialCentavos] = useState<number>(0);

  // Passo 5: Reserva de Manutenção e Meta Diária
  const [reservaCentavos, setReservaCentavos] = useState<number>(2000); // R$ 20,00
  const [metaDiariaCentavos, setMetaDiariaCentavos] = useState<number>(30000); // R$ 300,00

  // Carregar plataformas já criadas para o usuário
  useEffect(() => {
    if (!user) return;
    supabase
      .from('plataformas')
      .select('id, nome, cor, ativa')
      .eq('user_id', user.id)
      .order('ordem', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPlataformas(data);
        } else {
          setPlataformas([
            { id: '1', nome: 'Uber', cor: '#FFFFFF', ativa: true },
            { id: '2', nome: '99', cor: '#FFC83D', ativa: true },
            { id: '3', nome: 'inDrive', cor: '#22C55E', ativa: true },
            { id: '4', nome: 'Particular', cor: '#FF7A00', ativa: true },
            { id: '5', nome: 'Outros', cor: '#B4B4BB', ativa: true },
          ]);
        }
      });
  }, [user]);

  const togglePlataforma = (index: number) => {
    setPlataformas((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, ativa: !item.ativa } : item
      )
    );
  };

  const handleAddPlataforma = async () => {
    if (!novaPlataforma.trim() || !user) return;
    const nomeLimpo = novaPlataforma.trim();

    try {
      const { data } = await supabase
        .from('plataformas')
        .insert({
          user_id: user.id,
          nome: nomeLimpo,
          cor: '#FF7A00',
          ordem: plataformas.length + 1,
          ativa: true,
        })
        .select()
        .single();

      if (data) {
        setPlataformas((prev) => [...prev, data]);
      } else {
        setPlataformas((prev) => [
          ...prev,
          { id: Math.random().toString(), nome: nomeLimpo, cor: '#FF7A00', ativa: true },
        ]);
      }
    } catch {
      setPlataformas((prev) => [
        ...prev,
        { id: Math.random().toString(), nome: nomeLimpo, cor: '#FF7A00', ativa: true },
      ]);
    }
    setNovaPlataforma('');
    setMostraAddPlataforma(false);
  };

  const handleConcluir = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Atualizar Profile
      await supabase
        .from('profiles')
        .update({
          nome: nome.trim() || 'Motorista',
          onboarding_concluido: true,
        })
        .eq('id', user.id);

      // 2. Salvar Veículo se preenchido
      if (veiculoModelo.trim()) {
        await supabase.from('veiculos').insert({
          user_id: user.id,
          apelido: veiculoModelo.trim(),
          modelo: veiculoModelo.trim(),
          placa: veiculoPlaca.trim() || null,
          km_atual: veiculoKm ? parseInt(veiculoKm, 10) : 0,
          ativo: true,
        });
      }

      // 3. Salvar saldo inicial no caixa principal se > 0
      if (saldoInicialCentavos > 0) {
        await supabase
          .from('caixas')
          .update({ saldo_inicial_centavos: saldoInicialCentavos })
          .eq('user_id', user.id)
          .eq('tipo', 'principal');
      }

      // 4. Salvar configuração de manutenção
      await supabase
        .from('configuracoes')
        .update({
          manutencao_modo: reservaCentavos > 0 ? 'fixo' : 'desativado',
          manutencao_valor_centavos: reservaCentavos,
        })
        .eq('user_id', user.id);

      // 5. Salvar Meta Diária se > 0
      if (metaDiariaCentavos > 0) {
        await supabase.from('metas').insert({
          user_id: user.id,
          titulo: 'Meta Diária de Receita',
          periodo: 'diaria',
          metrica: 'receita_bruta',
          valor_alvo: metaDiariaCentavos,
          pct_bronze: 70,
          pct_prata: 100,
          pct_ouro: 130,
          recorrente: true,
          ativa: true,
        });
      }

      // Efeito de confetes comemorativo
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF2D2D', '#FF7A00', '#FFC83D', '#22C55E'],
        });
      } catch {
        // silencioso
      }

      await refreshProfile();
      navigate('/');
    } catch (err) {
      console.error('[Meta Driver] Erro ao concluir onboarding:', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-0 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-5">
        {/* Topo com indicador de passo */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-texto-3">
            <span className="font-semibold text-texto-1">
              Passo {step} de 5
            </span>
            <span>
              {step === 1 && 'Identificação'}
              {step === 2 && 'Seu Carro'}
              {step === 3 && 'Plataformas'}
              {step === 4 && 'Caixa Inicial'}
              {step === 5 && 'Manutenção & Meta'}
            </span>
          </div>
          <ProgressBar
            rotulo="Progresso do onboarding"
            percentual={(step / 5) * 100}
          />
        </div>

        {/* Card do Passo Atual */}
        <Card variante="padrao" className="p-6">
          {/* PASSO 1: NOME */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-vermelho-500/10 border border-vermelho-500/30 flex items-center justify-center text-vermelho-400">
                  <User className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-texto-1">
                    Como devemos te chamar?
                  </h2>
                  <p className="text-xs text-texto-3">
                    Seu nome ou apelido para personalizarmos seu painel
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <Input
                  rotulo="Seu nome ou apelido"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoFocus
                />
              </div>

              <Button
                variante="primario"
                bloco
                className="mt-4"
                iconeDireita={<ArrowRight className="size-4" />}
                onClick={() => setStep(2)}
              >
                Avançar
              </Button>
            </div>
          )}

          {/* PASSO 2: VEÍCULO */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-laranja-500/10 border border-laranja-500/30 flex items-center justify-center text-laranja-400">
                  <Car className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-texto-1">
                    Qual carro você roda?
                  </h2>
                  <p className="text-xs text-texto-3">
                    Opcional — você pode ajustar ou pular agora
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-1">
                <Input
                  rotulo="Modelo do carro"
                  value={veiculoModelo}
                  onChange={(e) => setVeiculoModelo(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    rotulo="Placa (opcional)"
                    value={veiculoPlaca}
                    onChange={(e) => setVeiculoPlaca(e.target.value.toUpperCase())}
                  />
                  <Input
                    rotulo="Km atual (opcional)"
                    type="number"
                    value={veiculoKm}
                    onChange={(e) => setVeiculoKm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variante="fantasma"
                  className="flex-1"
                  icone={<ArrowLeft className="size-4" />}
                  onClick={() => setStep(1)}
                >
                  Voltar
                </Button>
                <Button
                  variante="primario"
                  className="flex-1"
                  iconeDireita={<ArrowRight className="size-4" />}
                  onClick={() => setStep(3)}
                >
                  Avançar
                </Button>
              </div>
            </div>
          )}

          {/* PASSO 3: PLATAFORMAS */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amarelo-500/10 border border-amarelo-500/30 flex items-center justify-center text-amarelo-400">
                  <Layers className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-texto-1">
                    Onde você trabalha?
                  </h2>
                  <p className="text-xs text-texto-3">
                    Selecione as plataformas que costuma usar
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-1">
                {plataformas.map((plat, idx) => (
                  <button
                    key={plat.id || idx}
                    type="button"
                    onClick={() => togglePlataforma(idx)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition-all border ${
                      plat.ativa
                        ? 'bg-bg-2 text-texto-1 border-laranja-500 shadow-[0_0_12px_rgba(255,122,0,0.2)]'
                        : 'bg-bg-1 text-texto-3 border-line opacity-50'
                    }`}
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: plat.cor }}
                    />
                    {plat.nome}
                    {plat.ativa && <Check className="size-3 text-positivo" />}
                  </button>
                ))}
              </div>

              {mostraAddPlataforma ? (
                <div className="flex gap-2 items-center mt-2">
                  <input
                    type="text"
                    placeholder="Nome da plataforma (ex: Garupa)"
                    className="campo flex-1 h-10 px-3 text-xs"
                    value={novaPlataforma}
                    onChange={(e) => setNovaPlataforma(e.target.value)}
                    autoFocus
                  />
                  <Button variante="primario" onClick={handleAddPlataforma}>
                    Salvar
                  </Button>
                  <Button
                    variante="fantasma"
                    onClick={() => setMostraAddPlataforma(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMostraAddPlataforma(true)}
                  className="flex items-center gap-1.5 text-xs text-laranja-400 hover:text-laranja-300 font-medium transition-colors"
                >
                  <Plus className="size-3.5" /> Adicionar outra plataforma
                </button>
              )}

              <div className="flex gap-2 mt-4">
                <Button
                  variante="fantasma"
                  className="flex-1"
                  icone={<ArrowLeft className="size-4" />}
                  onClick={() => setStep(2)}
                >
                  Voltar
                </Button>
                <Button
                  variante="primario"
                  className="flex-1"
                  iconeDireita={<ArrowRight className="size-4" />}
                  onClick={() => setStep(4)}
                >
                  Avançar
                </Button>
              </div>
            </div>
          )}

          {/* PASSO 4: DINHEIRO EM MÃOS (SALDO INICIAL) */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-positivo/10 border border-positivo/30 flex items-center justify-center text-positivo">
                  <Wallet className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-texto-1">
                    Dinheiro em mãos agora
                  </h2>
                  <p className="text-xs text-texto-3">
                    Quanto você tem no bolso ou no caixa hoje para começar?
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <MoneyInput
                  rotulo="Saldo inicial do seu caixa"
                  valor={saldoInicialCentavos}
                  onValorChange={setSaldoInicialCentavos}
                />
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variante="fantasma"
                  className="flex-1"
                  icone={<ArrowLeft className="size-4" />}
                  onClick={() => setStep(3)}
                >
                  Voltar
                </Button>
                <Button
                  variante="primario"
                  className="flex-1"
                  iconeDireita={<ArrowRight className="size-4" />}
                  onClick={() => setStep(5)}
                >
                  Avançar
                </Button>
              </div>
            </div>
          )}

          {/* PASSO 5: RESERVA & METAS */}
          {step === 5 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-vermelho-500/10 border border-vermelho-500/30 flex items-center justify-center text-vermelho-400">
                  <Target className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-texto-1">
                    Manutenção & Meta Diária
                  </h2>
                  <p className="text-xs text-texto-3">
                    Defina seus objetivos para ganhar medalhas e proteger seu carro
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-1">
                <MoneyInput
                  rotulo="Reserva diária de manutenção"
                  valor={reservaCentavos}
                  onValorChange={setReservaCentavos}
                />

                <MoneyInput
                  rotulo="Meta diária de ganhos brutos"
                  valor={metaDiariaCentavos}
                  onValorChange={setMetaDiariaCentavos}
                />
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variante="fantasma"
                  className="flex-1"
                  icone={<ArrowLeft className="size-4" />}
                  onClick={() => setStep(4)}
                >
                  Voltar
                </Button>
                <Button
                  variante="primario"
                  className="flex-1"
                  icone={<Sparkles className="size-4 text-amarelo-400" />}
                  onClick={handleConcluir}
                  carregando={loading}
                >
                  Concluir e Começar!
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
