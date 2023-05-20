# API - Diário da Justiça Eletrônico - TJMS

Este projeto usa como base o [Puppeteer](https://github.com/puppeteer/puppeteer "Puppeteer"), um navegador virtual sem interface gráfica que abre o site do [Diário da Justiça Eletrônico - TJMS](https://esaj.tjms.jus.br/cdje/consultaAvancada.do#buscaavancada "Diário da Justiça Eletrônico - TJMS") e executa todos os comandos via código possibilitando assim a automação de todas as funções.

![](https://img.shields.io/github/stars/AlanMartines/diario-da-justica-eletronico-tjms.svg) ![](https://img.shields.io/github/tag/AlanMartines/diario-da-justica-eletronico-tjms.svg) ![](https://img.shields.io/github/v/release/AlanMartines/diario-da-justica-eletronico-tjms.svg) ![](https://img.shields.io/github/issues/AlanMartines/diario-da-justica-eletronico-tjms.svg) ![](https://img.shields.io/badge/express-v4.17.2-green.svg) ![](https://img.shields.io/badge/node-v14.0-green.svg) ![](https://img.shields.io/badge/npm-v8.3.2-green.svg) ![](https://img.shields.io/github/license/AlanMartines/diario-da-justica-eletronico-tjms) ![](https://img.shields.io/github/downloads/AlanMartines/diario-da-justica-eletronico-tjms/total) ![](https://img.shields.io/github/forks/AlanMartines/diario-da-justica-eletronico-tjms)

## Nota

Esta Api, segue os mesmos termos de serviço do WhatsApp. É importante que você leia atentamente a estes termos. Você é responsável pelo uso da ferramenta e pelas conseqüências do mau uso. Reforçamos que a API não é destinada para prática de SPAM e que o envio de mensagens indesejadas, viola os termos de serviço do WhatsApp. A violação dos termos pode acarretar no bloqueio e banimento definitivo de sua conta no WhatsApp.

#### Dependências Debian (e.g. Ubuntu) 64bits

```bash
sudo apt update && \
apt upgrade -y && \
apt install -y \
git \
curl \
yarn \
gcc \
g++ \
make \
libgbm-dev \
wget \
unzip \
fontconfig \
locales \
gconf-service \
libasound2 \
libatk1.0-0 \
libc6 \
libcairo2 \
libcups2 \
libdbus-1-3 \
libexpat1 \
libfontconfig1 \
libgconf-2-4 \
libgdk-pixbuf2.0-0 \
libglib2.0-0 \
libgtk-3-0 \
libnspr4 \
libpango-1.0-0 \
libpangocairo-1.0-0 \
libstdc++6 \
libx11-6 \
libx11-xcb1 \
libxcb1 \
libxcomposite1 \
libxcursor1 \
libxdamage1 \
libxext6 \
libxfixes3 \
libxi6 \
libxrandr2 \
libxrender1 \
libxss1 \
libxtst6 \
ca-certificates \
fonts-liberation \
libnss3 \
lsb-release \
xdg-utils \
libatk-bridge2.0-0 \
libgbm1 \
libgcc1 \
build-essential \
nodejs \
libappindicator1 \
sudo
```

#### Dependências CentOS 7/8 64bits (Validar)

```bash
sudo yum install -y \
alsa-lib.x86_64 \
atk.x86_64 \
cups-libs.x86_64 \
gtk3.x86_64 \
ipa-gothic-fonts \
libXcomposite.x86_64 \
libXcursor.x86_64 \
libXdamage.x86_64 \
libXext.x86_64 \
libXi.x86_64 \
libXrandr.x86_64 \
libXScrnSaver.x86_64 \
libXtst.x86_64 \
pango.x86_64 \
xorg-x11-fonts-100dpi \
xorg-x11-fonts-75dpi \
xorg-x11-fonts-cyrillic \
xorg-x11-fonts-misc \
xorg-x11-fonts-Type1 \
xorg-x11-utils
```

#### Dependências Alpine 64bits (Validar)

```bash
# replacing default repositories with edge ones
echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" > /etc/apk/repositories && \
echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories && \
echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories && \
echo "http://dl-cdn.alpinelinux.org/alpine/v3.9/main" >> /etc/apk/repositories && \
echo "http://dl-cdn.alpinelinux.org/alpine/v3.9/community" >> /etc/apk/repositories && \
apk update && \
apk upgrade && \
apk add --update --no-cache dumb-init curl make gcc g++ linux-headers binutils-gold gnupg \
libstdc++ nss chromium chromium-chromedriver git vim curl yarn nodejs nodejs-npm npm python \
python3 dpkg wget
```

#### Instale o Google Chrome Debian (e.g. Ubuntu) 64bits

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

sudo apt install ./google-chrome-stable_current_amd64.deb
```

#### Instale o Google Chrome CentOS 7/8 64bits

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm

sudo yum install ./google-chrome-stable_current_*.rpm
```

#### Instale o Google Chrome Alpine 64bits

```bash
apk add chromium chromium-chromedriver
```

#### Instale o NodeJs Debian (e.g. Ubuntu)

###### Instalar

```bash
# Ir para seu diretório home
cd ~

# Recuperar o script de instalação para sua versão de preferência
curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -

# Instalar o pacote Node.js
sudo apt install -y git nodejs yarn gcc g++ make vim curl python python3

# Remover pacotes que não são mais necessários
sudo apt autoremove -y
```

#### Instale o NodeJs CentOS 7/8 64bits

###### Instalar

```bash
# Ir para seu diretório home
cd ~

# Recuperar o script de instalação para sua versão de preferência
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -

# Instalar o pacote Node.js
sudo yum install -y git nodejs yarn gcc g++ tar make vim curl python3

# Remover pacotes que não são mais necessários
sudo yum autoremove -y
```

## Gerar SECRET_KEY para uso local de validação

```bash
node -e "console.log(require('crypto').randomBytes(45).toString('base64').slice(0, 60));"
```

## Configuração inicial do arquivo ".env-example"

```sh
NODE_EN=production
#
# Defina o HOST aqui caso voce utilize uma VPS deve ser colocado o IP da VPS
# Exemplos:
# HOST=204.202.54.2 => IP da VPS, caso esteja usando virtualização via hospedagem
# HOST=10.0.0.10 => IP da VM, caso esteja usando virtualização
# HOST=localhost => caso esteja usando na sua proprima maquina local
# HOST=.0.0.0.0 => caso esteja usando em um cotainer
HOST=localhost
#
# Defina o numero da porta a ser usada pela API.
PORT=8009
#
# CASO UTILIZE CERTIFICADO SSL COM REDIRECIONAMENTO DE PORTA, DEVE PREENCHER A VARIAVEL DOMAIN_SSL
# CASO DE NÃO SER CONFIGURADO UM DOMÍNIO MATENHA A VARIAVEL DOMAIN_SSL VAZIA
# Exemplos:
# DOMAIN_SSL=api.meudomai.com.br ou meudomai.com.br
# DOMAIN_SSL=
DOMAIN_SSL=
#
# Chave de segurança para validação
SECRET_KEY=
#
```

## Rodando a aplicação

```bash
# Ir para seu diretório home
cd ~

# Clone este repositório
git clone https://github.com/AlanMartines/diario-da-justica-eletronico-tjms.git ApiTJMS

# Acesse a pasta do projeto no terminal/cmd
cd ApiTJMS

# Instale as dependências
npm install --allow-root --unsafe-perm=true

# Clone este repositório
git clone https://github.com/wppconnect-team/wppconnect.git

# Acesse a pasta do projeto no terminal/cmd
cd wppconnect

# Instale as dependências
npm install --allow-root --unsafe-perm=true

# Building WPPConnect
npm run build

# Ir para seu diretório anterior
cd ..

# Configuração inicial
cp .env-example .env

# Execute a aplicação
node server.js

# Manter os processos ativos a cada reinicialização do servidor
npm install pm2 -g

pm2 start server.js --name ApiTJMS --watch

pm2 save

pm2 startup

# Para remover do init script
pm2 unstartup systemd

# O servidor iniciará na porta:9001

# Pronto, escaneie o código QR-Code do Whatsapp e aproveite!
```

## Rotas

> As rota se encontra no arquivo [Insomnia.json](https://github.com/AlanMartines/mywhatsapp-api-node-baileys-md/blob/master/Insomnia.json "Insomnia.json"), importe para seu Insomnia e desfrute da API.

#### Json (POST)

```json
{
	"dtInicio": "01/01/2019",
	"dtFim": "31/12/2019",
	"cdCaderno": "-11",
	"pesquisaLivre": "\"Palavras-chave aqui\""
}
```

#### Pesquisa avançada (POST method)

```js
await fetch("http://localhost:8009/instance/searchAdvanced", {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
		"dtInicio": "01/01/2019",
		"dtFim": "31/12/2019",
		"cdCaderno": "-11",
		"pesquisaLivre": "\"Palavras-chave aqui\""
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```


## Reflexão

<blockquote>
O conhecimento que adquirimos não merece ficar parado. Compartilhar tudo o que sabemos e gerar valor na vida de outras pessoas pode ter efeitos incríveis. Viver em constante compartilhamento de informações ajuda nossa comunidade profissional a evoluir cada vez mais.

Todos nós, independente do nível de conhecimento técnico, temos algum tipo de diferencial a oferecer para o próximo.

Já que temos a incrível capacidade de oferecer algo diferente para o próximo, devemos aproveitar isso para compartilhar todo esse nosso conhecimento.

Às vezes temos o sentimento de que aquilo que estamos fazendo de tão especial merece ser compartilhado, a internet está aí para nos possibilitar isso.

Temos a chance de buscar um conhecimento hoje e amanhã criar um artigo, vídeo ou qualquer outro tipo de material para compartilhar com as pessoas esse conhecimento que adquirimos.

Muitas pessoas, e talvez você se inclua nesse grupo, ainda têm aquele sentimento forte de mudar o próximo. Um sentimento que a faz ter um propósito de vida para buscar algo a mais, algo que possa contribuir para as gerações que por aqui estão e que ainda virá a passar.

Isso fica ainda mais expressivo quando se trata da comunidade específica de seu campo de estudo ou trabalho, pois deixar algum “legado” para sua área de conhecimento é algo que chama atenção de profissionais, pesquisadores e estudantes do mundo todo.

Muitos são movidos exatamente por essa energia de deixar seu nome registrado para o mundo.

A sua carreira é construída ao longo do tempo com uma série de conhecimentos e habilidades que são adquiras ao longo da vida.

Mas essa tarefa não precisa ser uma ação solitária e tão complicada assim, ainda mais levando em conta que uma sede grande pela busca de conhecimento e alguns ainda mais motivados para compartilhar tudo aquilo que já aprenderam.

Em outras palavras, as pessoas acabam tendo uma certa tendência em escutar o que as outras pessoas têm a dizer e também fazer a sua voz ser ouvida.

A informação não fica parada!

Quando entendemos a força desse hábito de compartilhar conhecimento, estamos contribuindo para que as pessoas ao nosso redor, que também precisam desse conhecimento, não parem de aprender.

Informação que fica parada, se perde! Tudo está na rede, esperando por você.

Faça dessa prática um de seus hábitos também. As informações que são compartilhadas por você podem contribuir para o crescimento e ascensão de alguém, já imaginou isso?

Envolva-se com as pessoas. Isso é ter propósito!

</blockquote>

## License

[MIT](https://choosealicense.com/licenses/mit/)