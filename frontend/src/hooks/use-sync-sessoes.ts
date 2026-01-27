/**
 * Hook para Sincronização Automática de Sessões
 *
 * Gerencia a sincronização entre IndexedDB local e PostgreSQL na nuvem.
 * Garante que o usuário sempre tenha acesso às suas pesquisas de qualquer dispositivo.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { carregarSessoesDoServidor, sincronizarBidirecional } from '@/services/sessoes-api';
import { notify } from '@/stores/notifications-store';

interface SyncState {
  carregando: boolean;
  ultimaSync: Date | null;
  erro: string | null;
  sessoesCarregadas: number;
}

export function useSyncSessoes() {
  const { autenticado, usuario, token } = useAuthStore();
  const [syncState, setSyncState] = useState<SyncState>({
    carregando: false,
    ultimaSync: null,
    erro: null,
    sessoesCarregadas: 0,
  });

  // Ref para controlar se já sincronizou nesta sessão
  const jaSincronizouRef = useRef(false);
  const sincronizandoRef = useRef(false);

  /**
   * Carrega sessões do servidor para o IndexedDB local
   */
  const carregarDoServidor = useCallback(async () => {
    if (!autenticado || !token || sincronizandoRef.current) {
      return;
    }

    sincronizandoRef.current = true;
    setSyncState((prev) => ({ ...prev, carregando: true, erro: null }));

    try {
      console.log('[Sync] Carregando sessões do servidor...');
      const carregadas = await carregarSessoesDoServidor();

      setSyncState({
        carregando: false,
        ultimaSync: new Date(),
        erro: null,
        sessoesCarregadas: carregadas,
      });

      if (carregadas > 0) {
        console.log(`[Sync] ${carregadas} sessões carregadas do servidor`);
        notify.success(
          'Sessões sincronizadas',
          `${carregadas} pesquisa${carregadas > 1 ? 's' : ''} carregada${carregadas > 1 ? 's' : ''} da nuvem.`
        );
      } else {
        console.log('[Sync] Nenhuma sessão nova no servidor');
      }

      jaSincronizouRef.current = true;
    } catch (error) {
      console.error('[Sync] Erro ao carregar sessões:', error);
      setSyncState((prev) => ({
        ...prev,
        carregando: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
      }));
    } finally {
      sincronizandoRef.current = false;
    }
  }, [autenticado, token]);

  /**
   * Sincroniza bidirecionalmente (local <-> servidor)
   */
  const sincronizar = useCallback(async () => {
    if (!autenticado || !token || sincronizandoRef.current) {
      return { enviadas: 0, recebidas: 0, erros: [] };
    }

    sincronizandoRef.current = true;
    setSyncState((prev) => ({ ...prev, carregando: true, erro: null }));

    try {
      console.log('[Sync] Iniciando sincronização bidirecional...');
      const resultado = await sincronizarBidirecional();

      setSyncState({
        carregando: false,
        ultimaSync: new Date(),
        erro: resultado.erros.length > 0 ? resultado.erros.join(', ') : null,
        sessoesCarregadas: resultado.recebidas,
      });

      if (resultado.enviadas > 0 || resultado.recebidas > 0) {
        console.log(
          `[Sync] Sincronização concluída: ${resultado.enviadas} enviadas, ${resultado.recebidas} recebidas`
        );
      }

      return resultado;
    } catch (error) {
      console.error('[Sync] Erro na sincronização:', error);
      setSyncState((prev) => ({
        ...prev,
        carregando: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
      }));
      return { enviadas: 0, recebidas: 0, erros: [String(error)] };
    } finally {
      sincronizandoRef.current = false;
    }
  }, [autenticado, token]);

  // Sincronizar automaticamente após login
  useEffect(() => {
    if (autenticado && token && !jaSincronizouRef.current && !sincronizandoRef.current) {
      // Pequeno delay para garantir que o token está configurado na API
      const timeoutId = setTimeout(() => {
        carregarDoServidor();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [autenticado, token, carregarDoServidor]);

  // Reset quando usuário deslogar
  useEffect(() => {
    if (!autenticado) {
      jaSincronizouRef.current = false;
      setSyncState({
        carregando: false,
        ultimaSync: null,
        erro: null,
        sessoesCarregadas: 0,
      });
    }
  }, [autenticado]);

  return {
    ...syncState,
    sincronizar,
    carregarDoServidor,
    jaSincronizou: jaSincronizouRef.current,
  };
}

/**
 * Hook simplificado para componentes que só precisam disparar sync
 */
export function useSyncOnMount() {
  const { sincronizar } = useSyncSessoes();

  useEffect(() => {
    sincronizar();
  }, [sincronizar]);
}

export default useSyncSessoes;
