import { useState } from 'react';
import {
  Sparkles,
  Zap,
  Plus,
  Trash2,
  AlertTriangle,
  Layers,
  Award,
  Wallet,
  Car,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton, Fab } from '@/components/ui/IconButton';
import { Card, StatCard } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { NumericKeypad } from '@/components/ui/NumericKeypad';
import { Chip, Badge } from '@/components/ui/Chip';
import { Switch } from '@/components/ui/Switch';
import { Tabs } from '@/components/ui/Tabs';
import { Sheet } from '@/components/ui/Sheet';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ProgressRing, ProgressBar } from '@/components/ui/Progress';
import { SkeletonCard, EmptyState, ErrorState } from '@/components/ui/Estados';
import { Medalha } from '@/components/ui/Medalha';
import { celebrar } from '@/lib/confete';
import { formatarMoeda } from '@/lib/money';
import { APP_NAME } from '@/lib/config';

export function DesignSystemPage() {
  const toast = useToast();

  // Estados interativos
  const [valorCentavos, setValorCentavos] = useState(12345); // R$ 123,45
  const [chipAtivo, setChipAtivo] = useState('uber');
  const [switchLigado, setSwitchLigado] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'diaria' | 'semanal' | 'mensal'>('diaria');
  const [sheetAberto, setSheetAberto] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmDialogAberto, setConfirmDialogAberto] = useState(false);
  const [progresso, setProgresso] = useState(85);

  return (
    <div className="space-y-12 py-4">
      {/* Cabeçalho da vitrine */}
      <div className="border-b border-line pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-laranja-400 bg-laranja-500/10 px-3 py-1 rounded-full border border-laranja-500/20">
              Fase 1 • Design System & Base
            </span>
            <span className="text-xs text-texto-3">Tokens e Componentes Base</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight texto-gradiente">
            {APP_NAME} — Guia de Estilo
          </h1>
          <p className="text-sm text-texto-2 mt-1 max-w-xl">
            Fundação técnica e visual oficial: gradiente vermelho para laranja, superfícies escuras,
            cantos bem arredondados, brilho e animações fluidas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo oficial"
            className="size-16 rounded-2xl object-contain border border-line p-1 bg-bg-2 shadow-lg"
          />
        </div>
      </div>

      {/* 1. Cores e Identidade */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-texto-1">
          <Layers className="size-5 text-laranja-400" /> 1. Paleta de Cores e Tokens
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-md bg-[#FF2D2D] text-white font-bold text-center shadow-md">
            Red 500<br />#FF2D2D
          </div>
          <div className="p-3 rounded-md bg-[#FF7A00] text-white font-bold text-center shadow-md">
            Orange 500<br />#FF7A00
          </div>
          <div className="p-3 rounded-md bg-gradient-to-r from-vermelho-500 to-laranja-500 text-white font-bold text-center shadow-md">
            Gradiente Marca<br />Brand Neon
          </div>
          <div className="p-3 rounded-md bg-positivo text-bg-0 font-bold text-center shadow-md">
            Positivo<br />#22C55E
          </div>
          <div className="p-3 rounded-md bg-negativo text-white font-bold text-center shadow-md">
            Negativo<br />#FF4D4D
          </div>
          <div className="p-3 rounded-md bg-bg-2 border border-line text-texto-1 font-bold text-center shadow-md">
            Superfície Bg-2<br />#141416
          </div>
        </div>
      </section>

      {/* 2. Botões */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-texto-1">
          <Zap className="size-5 text-laranja-400" /> 2. Botões "Modernos" (PRD 9.5)
        </h2>
        <p className="text-xs text-texto-3">
          Variantes com borda animada, sombra e brilho suave. Teste passar o mouse e focar com Tab.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Button variante="primario" tamanho="lg">
            Primário LG
          </Button>
          <Button variante="primario" tamanho="md">
            Primário MD
          </Button>
          <Button variante="secundario">Secundário</Button>
          <Button variante="perigo" icone={<Trash2 />}>
            Perigo
          </Button>
          <Button variante="fantasma">Fantasma</Button>
          <Button variante="primario" carregando>
            Carregando
          </Button>
          <Button variante="primario" disabled>
            Desabilitado
          </Button>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <IconButton rotulo="Adicionar" icone={<Plus />} />
          <IconButton rotulo="Alerta" icone={<AlertTriangle />} />
          <Fab rotulo="Lançamento Rápido" onClick={() => setSheetAberto(true)} />
          <span className="text-xs text-texto-3">← FAB central com animação de giro contínuo</span>
        </div>
      </section>

      {/* 3. Cartões e Indicadores */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-texto-1">
          <Wallet className="size-5 text-laranja-400" /> 3. Cartões & Indicadores
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variante="padrao">
            <h3 className="font-bold text-sm text-texto-2">Cartão Padrão</h3>
            <p className="text-xs text-texto-3 mt-1">Superfície bg-2 com borda sutil e cantos 28px.</p>
          </Card>

          <Card variante="destaque">
            <h3 className="font-bold text-sm texto-gradiente">Cartão em Destaque</h3>
            <p className="text-xs text-texto-3 mt-1">Gradiente no contorno com brilho neon nas bordas.</p>
          </Card>

          <Card variante="vidro">
            <h3 className="font-bold text-sm text-texto-1">Cartão Efeito Vidro</h3>
            <p className="text-xs text-texto-3 mt-1">Backdrop-filter blur e transparência com reflexo.</p>
          </Card>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <StatCard rotulo="Receita Total" centavos={42000} variacao={12000} tom="positivo" />
          <StatCard rotulo="Combustível" centavos={14000} variacao={-3500} tom="negativo" />
          <StatCard rotulo="Caixa Acumulado" centavos={28000} tom="marca" />
          <StatCard rotulo="Média Horária" texto="R$ 45,50/h" tom="neutro" />
        </div>
      </section>

      {/* 4. Campo de Dinheiro & Teclado Numérico */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-texto-1">
          <Sparkles className="size-5 text-laranja-400" /> 4. Máscara de Dinheiro (RN-01) & Teclado
        </h2>
        <p className="text-xs text-texto-3">
          Valores sempre em centavos inteiros. Digite abaixo com o teclado físico ou toque nos botões do teclado numérico.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl bg-bg-2 border border-line">
          <div className="space-y-4">
            <MoneyInput
              rotulo="Valor do Lançamento"
              valor={valorCentavos}
              onValorChange={setValorCentavos}
            />

            <MoneyInput
              grande
              rotulo="Exibição Destaque (Sheet)"
              valor={valorCentavos}
              onValorChange={setValorCentavos}
            />

            <div className="p-3 rounded-lg bg-bg-3 border border-line text-xs font-mono">
              <span className="text-texto-3">Armazenado (inteiro centavos): </span>
              <strong className="text-laranja-400">{valorCentavos}</strong>
              <br />
              <span className="text-texto-3">Formatado (pt-BR / BRL): </span>
              <strong className="text-positivo">{formatarMoeda(valorCentavos)}</strong>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-texto-2 mb-2 uppercase tracking-wide">
              Teclado Numérico Touch (Botões ≥ 56px)
            </p>
            <NumericKeypad
              onDigito={(d) => setValorCentavos((v) => (v * 10 + d <= 100000000 ? v * 10 + d : v))}
              onApagar={() => setValorCentavos((v) => Math.trunc(v / 10))}
              onVirgula={() => setValorCentavos((v) => v * 100)}
            />
          </div>
        </div>
      </section>

      {/* 5. Chips, Switches, Abas e Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-texto-1">5. Seletores, Chips e Abas</h2>

        <div className="flex flex-wrap items-center gap-2">
          {['uber', '99', 'indrive', 'particular'].map((plat) => (
            <Chip
              key={plat}
              selecionado={chipAtivo === plat}
              onClick={() => setChipAtivo(plat)}
              icone={<Car />}
            >
              {plat.toUpperCase()}
            </Chip>
          ))}
        </div>

        <div className="max-w-md">
          <Tabs
            rotulo="Intervalo de visualização"
            valor={abaAtiva}
            onMudar={setAbaAtiva}
            abas={[
              { valor: 'diaria', rotulo: 'Diária' },
              { valor: 'semanal', rotulo: 'Semanal' },
              { valor: 'mensal', rotulo: 'Mensal' },
            ]}
          />
        </div>

        <div className="max-w-md p-4 rounded-xl bg-bg-2 border border-line">
          <Switch
            rotulo="Caixa Manutenção Automático"
            descricao="Reservar 10% do lucro líquido diário no fechamento."
            ligado={switchLigado}
            onMudar={setSwitchLigado}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge tom="neutro">Neutro</Badge>
          <Badge tom="marca">Meta Driver</Badge>
          <Badge tom="positivo">Entrada +R$ 50</Badge>
          <Badge tom="negativo">Saída −R$ 30</Badge>
          <Badge tom="aviso">Revisão próxima</Badge>
        </div>
      </section>

      {/* 6. Progresso e Gamificação */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-texto-1">
          <Award className="size-5 text-ouro" /> 6. Gamificação, Metas e Celebrações
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 rounded-xl bg-bg-2 border border-line">
          <div className="flex flex-col items-center gap-3">
            <ProgressRing percentual={progresso} rotulo="Progresso da meta" />
            <div className="flex items-center gap-2">
              <Button tamanho="md" variante="fantasma" onClick={() => setProgresso((p) => Math.max(0, p - 25))}>
                -25%
              </Button>
              <Button tamanho="md" variante="secundario" onClick={() => setProgresso((p) => Math.min(150, p + 25))}>
                +25%
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <ProgressBar percentual={progresso} rotulo="Meta de Receita Diária" />
            <ProgressBar percentual={60} rotulo="Reserva de Manutenção" />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-texto-2 text-center uppercase tracking-wide">
              Medalhas SVG & Confetes
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="cursor-pointer" onClick={() => celebrar('bronze')}>
                <Medalha tipo="bronze" rotulo="Bronze" />
              </div>
              <div className="cursor-pointer" onClick={() => celebrar('prata')}>
                <Medalha tipo="prata" rotulo="Prata" />
              </div>
              <div className="cursor-pointer" onClick={() => celebrar('ouro')}>
                <Medalha tipo="ouro" rotulo="Ouro" />
              </div>
            </div>
            <div className="flex justify-center pt-2">
              <Button
                variante="primario"
                tamanho="md"
                icone={<Sparkles />}
                onClick={() => celebrar('fase')}
              >
                Chuva de Confetes & Serpentina
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Diálogos, Sheets, Toasts */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-texto-1">7. Sobreposições, Modais e Avisos (Toasts)</h2>
        <div className="flex flex-wrap gap-3">
          <Button variante="secundario" onClick={() => setSheetAberto(true)}>
            Abrir Bottom Sheet
          </Button>

          <Button variante="secundario" onClick={() => setModalAberto(true)}>
            Abrir Modal Central
          </Button>

          <Button variante="perigo" onClick={() => setConfirmDialogAberto(true)}>
            Diálogo de Exclusão Segura
          </Button>

          <Button
            variante="primario"
            onClick={() => {
              toast({
                tipo: 'sucesso',
                mensagem: 'Corrida de R$ 32,50 registrada com sucesso!',
                acao: {
                  rotulo: 'Desfazer',
                  aoClicar: () => toast({ tipo: 'info', mensagem: 'Lançamento desfeito!' }),
                },
              });
            }}
          >
            Disparar Toast com "Desfazer"
          </Button>
        </div>
      </section>

      {/* 8. Estados Obrigatórios (Skeleton, Vazio, Erro) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-texto-1">8. Estados de Tela (PRD 8.6)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold text-texto-3 mb-2 uppercase">Carregando (Skeleton com brilho)</p>
            <SkeletonCard />
          </div>

          <div>
            <p className="text-xs font-semibold text-texto-3 mb-2 uppercase">Vazio (EmptyState)</p>
            <div className="card p-2">
              <EmptyState
                titulo="Nenhum lançamento"
                descricao="Registre a primeira corrida para calcular o caixa."
                acao={
                  <Button variante="primario" tamanho="md" icone={<Plus />}>
                    Novo Lançamento
                  </Button>
                }
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-texto-3 mb-2 uppercase">Erro (ErrorState)</p>
            <div className="card p-2">
              <ErrorState
                mensagem="Não foi possível sincronizar o extrato."
                aoTentarDeNovo={() => toast({ tipo: 'info', mensagem: 'Tentando reconectar...' })}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Sheet interativo */}
      <Sheet
        aberto={sheetAberto}
        aoFechar={() => setSheetAberto(false)}
        titulo="Bottom Sheet Demonstrativo"
        rodape={
          <div className="flex gap-2 justify-end">
            <Button variante="fantasma" onClick={() => setSheetAberto(false)}>
              Fechar
            </Button>
            <Button variante="primario" onClick={() => setSheetAberto(false)}>
              Salvar Alterações
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-texto-2">
            Este componente arrasta para baixo no celular e tem trava de rolagem no fundo com foco acessível.
          </p>
          <Input rotulo="Título do Lançamento" defaultValue="Uber Black Centro" />
        </div>
      </Sheet>

      {/* Modal Central */}
      <Modal
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        titulo="Modal Informativo"
        rodape={
          <Button variante="primario" onClick={() => setModalAberto(false)}>
            Entendi
          </Button>
        }
      >
        <p className="text-sm text-texto-2">
          Janela de diálogo centralizada para desktop e tablet com foco preso (focus trap) e fechamento por tecla Escape.
        </p>
      </Modal>

      {/* Diálogo de confirmação perigoso */}
      <ConfirmDialog
        aberto={confirmDialogAberto}
        aoFechar={() => setConfirmDialogAberto(false)}
        aoConfirmar={() => {
          toast({ tipo: 'sucesso', mensagem: 'Ação confirmada.' });
          setConfirmDialogAberto(false);
        }}
        titulo="Excluir Lançamento?"
        mensagem="Tem certeza que deseja apagar este registro do caixa? Esta ação recalculará o saldo diário."
        textoConfirmar="Excluir"
        perigoso
        palavraConfirmacao="EXCLUIR"
      />
    </div>
  );
}
