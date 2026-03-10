# API - Diário da Justiça Eletrônico - TJMS

API robusta para automação de consultas e downloads do Diário da Justiça Eletrônico do Mato Grosso do Sul (TJMS). Desenvolvida em Node.js com Puppeteer, conta com recursos avançados de resiliência, cache e processamento assíncrono.

## 🚀 Principais Funcionalidades

- **Busca Síncrona e Assíncrona**: Realize pesquisas pesadas via Webhooks para evitar timeouts de HTTP.
- **Extração de Texto de PDF**: Localiza o termo pesquisado dentro do corpo do PDF e retorna o contexto (snippet).
- **Sistema de Cache (Redis)**: Evita consultas repetidas ao portal do TJMS, economizando recursos e tempo.
- **Metadados Dinâmicos**: Rota dedicada para listar comarcas, cadernos e tipos de publicação oficiais.
- **Segurança (Bearer Auth)**: Todas as rotas protegidas por SECRET_KEY.
- **Resiliência Avançada**: Lógica de auto-recuperação para instabilidades do portal e-SAJ (Frame Detached).
- **Auto-Restart do Browser**: Gerenciamento inteligente de memória para execuções de longa duração.

---

## 🛠️ Configuração Inicial

### Variáveis de Ambiente (.env)

```env
NODE_ENV=production
HOST=localhost
PORT=8009
SECRET_KEY=sua_chave_segura_aqui

# Configurações de Cache
USE_REDIS=true
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# Extração de PDF
EXTRACT_PDF_TEXT=true

# Gestão de Browser
BROWSER_REQUEST_LIMIT=50
```

---

## 📡 Endpoints da API

### **1. Metadados**
`GET /metadata`
Retorna as listas oficiais de Foros (cdForo), Cadernos (cdCaderno) e Tipos de Publicação (cdTipoPublicacao).

### **2. Busca Avançada (Síncrona)**
`POST /searchAdvanced`
Realiza a busca e retorna os resultados na mesma conexão.

**Payload:**
```json
{
  "dtInicio": "01/01/2024",
  "dtFim": "10/01/2024",
  "cdCaderno": "-11",
  "pesquisaLivre": "\"Alex Martines\"",
  "nuDiario": "",
  "cdForo": "-1",
  "cdTipoPublicacao": "-1"
}
```

### **3. Busca Avançada (Assíncrona / Webhook)**
`POST /searchAsync`
Inicia a busca e responde `202 Accepted` com um `taskId`. O resultado é enviado via POST para a `webhookUrl`.

**Payload:**
```json
{
  "webhookUrl": "https://seu-sistema.com/api/callback",
  "dtInicio": "01/01/2023",
  "dtFim": "31/12/2023",
  "cdCaderno": "-11",
  "pesquisaLivre": "NOME DA PARTE",
  ...
}
```

### **4. Download de Cadernos**
`POST /downloadCad`
Baixa um caderno específico em Base64.

---

## 🏗️ Rodando via Docker

```bash
# Criar imagem
docker build -t api-tjms:latest -f Dockerfile.backend .

# Rodar container
docker run -d \
  --name ApiTJMS \
  -p 8009:8009 \
  -e SECRET_KEY='sua_chave' \
  -e USE_REDIS=false \
  api-tjms:latest
```

---

## 📝 Licença
Este projeto está sob a licença [MIT](LICENSE).
