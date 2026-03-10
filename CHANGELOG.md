## Changelog

_Todas as mudanças notáveis ​​neste projeto serão documentadas neste arquivo._

**2.0.0** (10 Março 2026)

### 🚀 Novidades
- **Busca Assíncrona (Webhooks)**: Nova rota `/searchAsync` para processamento de longas datas.
- **Extração de Conteúdo de PDF**: Integração com `pdf-parse` para extrair snippets de texto diretamente do Diário.
- **Sistema de Cache (Redis)**: Implementação de cache para evitar buscas repetidas ao tribunal.
- **Metadados Dinâmicos**: Rota `/metadata` para extrair listas oficiais de comarcas e cadernos.
- **Segurança**: Adicionado Middleware de autenticação Bearer Token (`SECRET_KEY`).

### 🛠️ Melhorias Técnicas
- **Resiliência**: Lógica avançada de auto-recuperação para o erro "Frame Detached" no portal e-SAJ.
- **Performance**: Padrão Singleton para a instância do navegador Puppeteer (Chromium reutilizável).
- **Gestão de Recursos**: Implementado Auto-Restart do navegador após limite de requisições.
- **Refatoração de Rotas**: Removido o prefixo `/instance/` de todos os endpoints.
- **Modernização**: Migração de `var` para `const/let` e limpeza de código legado.

### 🐛 Correções
- **ReCAPTCHA Token**: Corrigida a captura do token que retornava vazio no link das publicações.
- **File-Type Error**: Corrigido erro de inicialização causado pela dependência `file-type`.
- **Navegação**: Aumento de timeouts e ajustes de `waitUntil` para maior compatibilidade com VPS fora do Brasil.

---

**1.0.3** (26 maio 2023)
- Add Dockerfile and Docker-Compose file config
- Add validate version

**1.0.2** (21 maio 2023)
- Fix bugs

**1.0.1** (21 maio 2023)
- Add Caderno unificado
- Add Download dos cadernos

**1.0.0** (21 maio 2023)
- Add Pesquisa avançada
