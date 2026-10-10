import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Flame,
  Star,
  Fuel,
  Car,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { NumericKeypad } from '@/components/ui/NumericKeypad';
import { useToast } from '@/components/ui/Toast';
import { formatarMoeda } from '@/lib/money';
import { textos, t } from '@/lib/textos';

export function InicioPage() {
  const [diaAberto, setDiaAberto] = useState(true);
  const [caixaAtual, setCaixaAtual] = useState(38500); // R$ 385,00
  const [sheetEntradaAberta, setSheetEntradaAberta] = useState(false);
  const [valorEntrada, setValorEntrada] = useState(3200); // R$ 32,00
  const toast = useToast();
  const navigate = useNavigate();

  const handleSalvarEntrada = () => {
    if (valorEntrada <= 0) return;
    setCaixaAtual((prev) => prev + valorEntrada);
    setSheetEntradaAberta(false);
    toast({
      tipo: 'sucesso',
      mensagem: t(textos.lancamento.entradaSalva, { valor: formatarMoeda(valorEntrada) }),
      acao: {
        rotulo: textos.lancamento.desfazer,
        aoClicar: () => {
          setCaixaAtual((prev) => prev - valorEntrada);
          toast({ tipo: 'info', mensagem: 'Lançamento desfeito com sucesso.' });
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Barra superior de status do motorista */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-md bg-bg-2 border border-line">
        <div className="flex items-center gap-2">
          <Badge tom="marca" className="gap-1.5 py-1">
            <Flame className="size-3.5 fill-laranja-500 text-laranja-500" />
            <span>5 dias seguidos</span>
          </Badge>
          <span className="text-sm font-semibold text-texto-2 hidden sm:inline">Olá, Motorista!</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-texto-2">
          <span className="flex items-center gap-1 text-ouro">
            <Star className="size-3.5 fill-ouro" /> 142
          </span>
          <span>•</span>
          <span className="text-laranja-400">Fase 3</span>
        </div>
      </div>

      {diaAberto ? (
        <>
          {/* Caixa Atual - Destaque */}
          <Card variante="destaque" className="relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-texto-3">CAIXA ATUAL</p>
                <div className="numero text-3xl sm:text-4xl lg:text-5xl font-extrabold text-texto-1 mt-1 tracking-tight">
                  {formatarMoeda(caixaAtual)}
                </div>
                <p className="text-xs text-texto-2 mt-2 flex items-center gap-1.5 font-medium">
                  <Clock className="size-3.5 text-laranja-400" />
                  Abertura R$ 150,00 • aberto às 06:12 • 5h42 online
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="numero text-sm font-bold text-positivo flex items-center gap-1 bg-positivo/10 px-3 py-1.5 rounded-full border border-positivo/20">
                  <TrendingUp className="size-4" /> +R$ 235,00 hoje
                </span>
              </div>
            </div>

            {/* Ações rápidas */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-line/60">
              <Button
                variante="primario"
                tamanho="lg"
                icone={<ArrowUpRight className="text-white" />}
                onClick={() => setSheetEntradaAberta(true)}
              >
                + ENTRADA
              </Button>
              <Button
                variante="secundario"
                tamanho="lg"
                icone={<ArrowDownLeft className="text-negativo" />}
                onClick={() => {
                  toast({
                    tipo: 'info',
                    mensagem: 'Abertura de saída rápida. Na Fase 3 conectaremos as categorias!',
                  });
                }}
              >
                − SAÍDA
              </Button>
            </div>
          </Card>

          {/* Meta do Dia */}
          <Card className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <ProgressRing
                percentual={133}
                rotulo="Progresso da meta diária"
                tamanho={130}
              />
            </div>
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="font-bold text-lg text-texto-1">Meta do Dia (Receita)</h2>
                <Badge tom="positivo">133% batida</Badge>
              </div>
              <p className="numero text-2xl font-bold text-laranja-400">
                R$ 400,00 <span className="text-sm font-normal text-texto-3">/ R$ 300,00</span>
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                <span className="text-bronze font-bold">🥉 R$ 210 ✔</span>
                <span>•</span>
                <span className="text-prata font-bold">🥈 R$ 300 ✔</span>
                <span>•</span>
                <span className="text-ouro font-bold">🥇 R$ 390 ✔</span>
              </div>
            </div>
          </Card>

          {/* Indicadores em grade */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard rotulo="Receita Bruta" centavos={40000} tom="positivo" />
            <StatCard rotulo="Despesas" centavos={14500} tom="negativo" />
            <StatCard rotulo="Lucro Líquido" centavos={25500} tom="marca" />
            <StatCard rotulo="Reserva Manut." centavos={2000} tom="neutro" />
          </div>

          {/* Últimos lançamentos do dia */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-texto-1">Últimos lançamentos</h3>
              <button
                type="button"
                onClick={() => navigate('/caixa')}
                className="text-xs font-bold text-laranja-400 hover:underline flex items-center gap-1"
              >
                Ver extrato completo <ChevronRight className="size-3.5" />
              </button>
            </div>

            <div className="divide-y divide-line/40 text-sm">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-bg-3 border border-line grid place-items-center text-laranja-400">
                    <Car className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-texto-1">Uber (Corrida)</p>
                    <p className="text-xs text-texto-3">14:05 • Dinheiro</p>
                  </div>
                </div>
                <span className="numero font-bold text-positivo">+R$ 32,00</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-bg-3 border border-line grid place-items-center text-negativo">
                    <Fuel className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-texto-1">Combustível</p>
                    <p className="text-xs text-texto-3">12:30 • Posto Shell</p>
                  </div>
                </div>
                <span className="numero font-bold text-negativo">−R$ 90,00</span>
              </div>
            </div>
          </Card>

          {/* Botão de Fechar o Dia */}
          <div className="pt-2">
            <Button
              variante="secundario"
              tamanho="lg"
              bloco
              onClick={() => navigate('/dia/fechar')}
            >
              FECHAR O DIA
            </Button>
          </div>
        </>
      ) : (
        /* Estado com dia fechado / pronto para abrir */
        <Card variante="destaque" className="text-center py-10 space-y-4">
          <div className="size-16 rounded-2xl bg-laranja-500/15 border border-laranja-500/30 grid place-items-center text-laranja-400 mx-auto">
            <Clock className="size-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-texto-1">{textos.dia.abrirTitulo}</h2>
            <p className="text-sm text-texto-2">
              Seu caixa acumulado atual: <strong className="text-texto-1 numero">R$ 380,00</strong>
            </p>
          </div>
          <div className="pt-2 max-w-sm mx-auto">
            <Button
              variante="primario"
              tamanho="lg"
              bloco
              onClick={() => {
                setDiaAberto(true);
                toast({
                  tipo: 'sucesso',
                  mensagem: t(textos.dia.pontoBatido, { hora: '07:00' }),
                });
              }}
            >
              {textos.dia.abrirBotao}
            </Button>
          </div>
        </Card>
      )}

      {/* Sheet de Demonstração de Entrada Rápida */}
      <Sheet
        aberto={sheetEntradaAberta}
        aoFechar={() => setSheetEntradaAberta(false)}
        titulo="Nova entrada rápida"
      >
        <div className="space-y-5 py-2">
          <MoneyInput
            grande
            rotulo="Valor da corrida / entrada"
            valor={valorEntrada}
            onValorChange={setValorEntrada}
          />

          <NumericKeypad
            onDigito={(d) => setValorEntrada((v) => (v * 10 + d <= 100000000 ? v * 10 + d : v))}
            onApagar={() => setValorEntrada((v) => Math.trunc(v / 10))}
            onVirgula={() => setValorEntrada((v) => v * 100)}
          />

          <div className="pt-2">
            <Button variante="primario" tamanho="lg" bloco onClick={handleSalvarEntrada}>
              Salvar Entrada ({formatarMoeda(valorEntrada)})
            </Button>
          </div>
        </div>
      </Sheet>

      {/* Banner de atalho para o Design System */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-bg-2 to-bg-3 border border-line flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="size-5 text-laranja-400 shrink-0" />
          <p className="text-xs text-texto-2">
            <strong className="text-texto-1">Fase 1 pronta:</strong> Todos os botões, cartões, inputs e design tokens estão disponíveis para teste.
          </p>
        </div>
        <Button variante="secundario" onClick={() => navigate('/design-system')}>
          Explorar
        </Button>
      </div>
    </div>
  );
}
