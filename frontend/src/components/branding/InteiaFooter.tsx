'use client';

import { cn } from '@/lib/utils';
import { InteiaLogo } from './InteiaLogo';
import { Building2, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

interface InteiaFooterProps {
  variant?: 'minimal' | 'compact' | 'full';
  className?: string;
}

const DADOS_EMPRESA = {
  nome: 'INTEIA - Instituto de Treinamento e Estudos em Inteligencia Artificial LTDA',
  cnpj: '63.918.490/0001-20',
  endereco: 'SHN Quadra 2 Bloco F, Sala 625/626 - Asa Norte, Brasilia/DF',
  cep: '70702-000',
  email: 'contato@inteia.com.br',
  telefone: '(61) 3123-4567',
  presidente: 'Igor Morais Vasconcelos, PhD',
  cargo: 'Presidente | Pesquisador Responsavel',
  registro: 'OAB 35.376',
};

export function InteiaFooter({ variant = 'compact', className }: InteiaFooterProps) {
  if (variant === 'minimal') {
    return (
      <footer className={cn('border-t border-border py-4', className)}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <InteiaLogo size="xs" variant="full" />
            <span className="hidden sm:inline">|</span>
            <span className="text-xs">{new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>CNPJ: {DADOS_EMPRESA.cnpj}</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">{DADOS_EMPRESA.presidente}</span>
          </div>
        </div>
      </footer>
    );
  }

  if (variant === 'compact') {
    return (
      <footer className={cn('border-t border-border bg-card/50 py-6', className)}>
        <div className="px-6 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <InteiaLogo size="sm" variant="full" showTagline />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                CNPJ: {DADOS_EMPRESA.cnpj}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                Brasilia/DF
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              {DADOS_EMPRESA.presidente} - {DADOS_EMPRESA.cargo}
            </p>
            <p className="text-[10px] text-muted-foreground/70">
              © {new Date().getFullYear()} INTEIA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // variant === 'full'
  return (
    <footer className={cn('border-t border-border bg-card py-8', className)}>
      <div className="px-6 space-y-6">
        {/* Header do Footer */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          {/* Logo e Descrição */}
          <div className="space-y-3 max-w-md">
            <InteiaLogo size="lg" variant="full" showTagline />
            <p className="text-sm text-muted-foreground">
              Pesquisa eleitoral cientifica com agentes sinteticos de IA.
              Simulacoes de cenarios politicos para o Distrito Federal.
            </p>
          </div>

          {/* Contato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                Dados Empresariais
              </h4>
              <div className="space-y-1 text-muted-foreground text-xs">
                <p>CNPJ: {DADOS_EMPRESA.cnpj}</p>
                <p className="flex items-start gap-1">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{DADOS_EMPRESA.endereco}</span>
                </p>
                <p>CEP: {DADOS_EMPRESA.cep}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" />
                Contato
              </h4>
              <div className="space-y-1 text-muted-foreground text-xs">
                <p className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {DADOS_EMPRESA.email}
                </p>
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {DADOS_EMPRESA.telefone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Responsável */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <span className="font-bold text-white text-lg">IM</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{DADOS_EMPRESA.presidente}</p>
              <p className="text-xs text-muted-foreground">{DADOS_EMPRESA.cargo}</p>
              <p className="text-xs text-amber-500">{DADOS_EMPRESA.registro}</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} INTEIA - Instituto de Inteligencia Artificial
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              Todos os direitos reservados. Dados conforme LGPD.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
