import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

/** Verifica se está rodando em ambiente nativo (Android ou iOS) */
export function isNativo(): boolean {
  return Capacitor.isNativePlatform();
}

/** Retorna a plataforma atual */
export function getPlataforma(): 'android' | 'ios' | 'web' {
  return Capacitor.getPlatform() as 'android' | 'ios' | 'web';
}

/** Vibração sutil ao tocar em botões ou registrar valores */
export async function vibrarToque() {
  if (!isNativo()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Silencioso em caso de falta de permissão ou não suporte
  }
}

/** Vibração de sucesso (metas batidas, fechamento concluído) */
export async function vibrarSucesso() {
  if (!isNativo()) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // Silencioso
  }
}

/** Vibração de alerta (caixa negativo, exclusão) */
export async function vibrarAlerta() {
  if (!isNativo()) return;
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {
    // Silencioso
  }
}

/** Configuração inicial de StatusBar e SplashScreen */
export async function inicializarAppNativo() {
  if (!isNativo()) return;

  try {
    // Ocultar a splash screen nativa suavemente após a inicialização do app
    await SplashScreen.hide();

    // Configurar a barra de status com fundo escuro e ícones claros
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#0A0A0A' });
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch {
        // Silencioso se não suportado na versão do SO
      }
    }
  } catch (err) {
    console.warn('[Meta Driver Nativo] Erro ao inicializar barras:', err);
  }
}

/**
 * Registra o ouvinte para o botão físico 'Voltar' do Android.
 * Se estiver na tela inicial, exige 2 toques para sair (evita fechar acidentalmente).
 */
export function configurarBotaoVoltar(
  estaNoInicio: () => boolean,
  voltarNavegacao: () => void,
  exibirAvisoSaida: () => void
) {
  if (!isNativo()) return () => {};

  let ultimoToque = 0;

  const listener = App.addListener('backButton', () => {
    if (estaNoInicio()) {
      const agora = Date.now();
      if (agora - ultimoToque < 2500) {
        App.exitApp();
      } else {
        ultimoToque = agora;
        exibirAvisoSaida();
      }
    } else {
      voltarNavegacao();
    }
  });

  return () => {
    listener.then((h) => h.remove()).catch(() => {});
  };
}

/**
 * Escuta eventos de deep link (ex: metadriver://recuperar-senha#access_token=...)
 */
export function configurarDeepLinks(aoAbrirUrl: (url: string) => void) {
  if (!isNativo()) return () => {};

  const listener = App.addListener('appUrlOpen', (dados) => {
    aoAbrirUrl(dados.url);
  });

  return () => {
    listener.then((h) => h.remove()).catch(() => {});
  };
}

/**
 * Compartilha arquivo ou texto usando o menu nativo do Android
 */
export async function compartilharExportacao(nomeArquivo: string, conteudo: string, mimeType: string = 'text/csv') {
  if (isNativo()) {
    try {
      const arquivoGravado = await Filesystem.writeFile({
        path: nomeArquivo,
        data: conteudo,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      await Share.share({
        title: 'Meta Driver — Exportação',
        text: `Arquivo gerado pelo Meta Driver: ${nomeArquivo}`,
        url: arquivoGravado.uri,
        dialogTitle: 'Compartilhar relatório',
      });
      return true;
    } catch (err) {
      console.warn('[Meta Driver Nativo] Erro ao compartilhar nativamente:', err);
    }
  }

  // Fallback para Web Browser
  const blob = new Blob([conteudo], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
