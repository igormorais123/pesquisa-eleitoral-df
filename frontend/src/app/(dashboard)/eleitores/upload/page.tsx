'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import {
  Upload,
  FileJson,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db/dexie';
import { useEleitoresStore } from '@/stores/eleitores-store';
import type { Eleitor } from '@/types';
import { cn } from '@/lib/utils';

interface ValidacaoResultado {
  validos: Eleitor[];
  erros: { linha: number; erro: string }[];
}

export default function PaginaUploadEleitores() {
  const router = useRouter();
  const { adicionarEleitores } = useEleitoresStore();

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [conteudo, setConteudo] = useState<string>('');
  const [validacao, setValidacao] = useState<ValidacaoResultado | null>(null);
  const [etapa, setEtapa] = useState<'upload' | 'validacao' | 'confirmacao' | 'sucesso'>('upload');

  // Validar JSON de eleitores
  const validarEleitores = useCallback((dados: unknown[]): ValidacaoResultado => {
    const validos: Eleitor[] = [];
    const erros: { linha: number; erro: string }[] = [];

    dados.forEach((item, index) => {
      try {
        const eleitor = item as Partial<Eleitor>;

        // Validações básicas
        if (!eleitor.nome) throw new Error('Nome é obrigatório');
        if (!eleitor.idade || eleitor.idade < 16) throw new Error('Idade inválida');
        if (!eleitor.regiao_administrativa) throw new Error('Região administrativa é obrigatória');
        if (!eleitor.cluster_socioeconomico) throw new Error('Cluster socioeconômico é obrigatório');
        if (!eleitor.orientacao_politica) throw new Error('Orientação política é obrigatória');
        if (!eleitor.historia_resumida) throw new Error('História resumida é obrigatória');

        // Gerar ID se não existir
        const id = eleitor.id || `df-up-${Date.now()}-${index}`;

        validos.push({
          ...eleitor,
          id,
          genero: eleitor.genero || 'masculino',
          cor_raca: eleitor.cor_raca || 'parda',
          escolaridade: eleitor.escolaridade || 'medio_completo_ou_sup_incompleto',
          profissao: eleitor.profissao || 'Não informado',
          ocupacao_vinculo: eleitor.ocupacao_vinculo || 'informal',
          renda_salarios_minimos: eleitor.renda_salarios_minimos || 'mais_de_1_ate_2',
          religiao: eleitor.religiao || 'catolica',
          estado_civil: eleitor.estado_civil || 'solteiro(a)',
          filhos: eleitor.filhos || 0,
          posicao_bolsonaro: eleitor.posicao_bolsonaro || 'neutro',
          interesse_politico: eleitor.interesse_politico || 'medio',
          valores: eleitor.valores || [],
          preocupacoes: eleitor.preocupacoes || [],
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        } as Eleitor);
      } catch (error) {
        erros.push({
          linha: index + 1,
          erro: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    });

    return { validos, erros };
  }, []);

  // Processar arquivo
  const processarArquivo = useCallback(
    (file: File) => {
      setArquivo(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const texto = e.target?.result as string;
        setConteudo(texto);

        try {
          const dados = JSON.parse(texto);
          const array = Array.isArray(dados) ? dados : [dados];
          const resultado = validarEleitores(array);
          setValidacao(resultado);
          setEtapa('validacao');
        } catch (error) {
          setValidacao({
            validos: [],
            erros: [{ linha: 0, erro: 'Arquivo JSON inválido' }],
          });
          setEtapa('validacao');
        }
      };
      reader.readAsText(file);
    },
    [validarEleitores]
  );

  // Dropzone
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processarArquivo(acceptedFiles[0]);
      }
    },
    [processarArquivo]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  // Mutation para salvar eleitores
  const mutationSalvar = useMutation({
    mutationFn: async (eleitores: Eleitor[]) => {
      await db.eleitores.bulkAdd(eleitores);
      return eleitores;
    },
    onSuccess: (eleitores) => {
      adicionarEleitores(eleitores);
      setEtapa('sucesso');
    },
  });

  // Confirmar importação
  const confirmarImportacao = () => {
    if (validacao?.validos.length) {
      mutationSalvar.mutate(validacao.validos);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/eleitores"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload de Eleitores</h1>
          <p className="text-muted-foreground">Importe eleitores de um arquivo JSON</p>
        </div>
      </div>

      {/* Etapa 1: Upload */}
      {etapa === 'upload' && (
        <div
          {...getRootProps()}
          className={cn(
            'glass-card rounded-2xl p-12 text-center border-2 border-dashed cursor-pointer transition-all',
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">
            {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um arquivo JSON ou clique para selecionar'}
          </p>
          <p className="text-sm text-muted-foreground">Formatos aceitos: .json, .txt</p>
        </div>
      )}

      {/* Etapa 2: Validação */}
      {etapa === 'validacao' && validacao && (
        <div className="space-y-6">
          {/* Resumo */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileJson className="w-5 h-5 text-primary" />
              Resultado da Validação
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-2 text-green-400 mb-1">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Válidos</span>
                </div>
                <p className="text-3xl font-bold text-green-400">{validacao.validos.length}</p>
              </div>

              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <div className="flex items-center gap-2 text-red-400 mb-1">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Com Erros</span>
                </div>
                <p className="text-3xl font-bold text-red-400">{validacao.erros.length}</p>
              </div>
            </div>
          </div>

          {/* Erros */}
          {validacao.erros.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-medium text-red-400 mb-3">Erros encontrados:</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {validacao.erros.map((erro, i) => (
                  <div key={i} className="text-sm p-2 bg-red-500/10 rounded">
                    <span className="text-red-400 font-medium">Linha {erro.linha}:</span>{' '}
                    <span className="text-muted-foreground">{erro.erro}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {validacao.validos.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-medium text-foreground mb-3">
                Preview dos primeiros {Math.min(5, validacao.validos.length)} eleitores:
              </h3>
              <div className="space-y-2">
                {validacao.validos.slice(0, 5).map((eleitor) => (
                  <div
                    key={eleitor.id}
                    className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{eleitor.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {eleitor.idade} anos • {eleitor.regiao_administrativa} •{' '}
                        {eleitor.orientacao_politica}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setEtapa('upload');
                setArquivo(null);
                setValidacao(null);
              }}
              className="flex-1 py-3 px-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarImportacao}
              disabled={validacao.validos.length === 0 || mutationSalvar.isPending}
              className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {mutationSalvar.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Importar {validacao.validos.length} Eleitores
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Etapa 3: Sucesso */}
      {etapa === 'sucesso' && validacao && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <CheckCircle className="w-20 h-20 mx-auto text-green-400 mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Importação Concluída!</h2>
          <p className="text-muted-foreground mb-6">
            {validacao.validos.length} eleitores foram adicionados ao banco de dados.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setEtapa('upload');
                setArquivo(null);
                setValidacao(null);
              }}
              className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
            >
              Importar Mais
            </button>
            <Link
              href="/eleitores"
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
              Ver Eleitores
            </Link>
          </div>
        </div>
      )}

      {/* Formato esperado */}
      <div className="mt-8 glass-card rounded-xl p-6">
        <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Formato Esperado do JSON
        </h3>
        <pre className="text-xs bg-secondary/50 p-4 rounded-lg overflow-x-auto text-muted-foreground">
          {`[
  {
    "nome": "Nome Completo",
    "idade": 35,
    "genero": "masculino",
    "regiao_administrativa": "Ceilândia",
    "cluster_socioeconomico": "G3_media_baixa",
    "orientacao_politica": "centro",
    "posicao_bolsonaro": "neutro",
    "religiao": "catolica",
    "valores": ["Família", "Trabalho"],
    "preocupacoes": ["Emprego", "Saúde"],
    "historia_resumida": "História do eleitor..."
  }
]`}
        </pre>
      </div>
    </div>
  );
}
