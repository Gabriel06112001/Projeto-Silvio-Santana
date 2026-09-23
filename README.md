# Landing Page — Aposentadoria PcD · Dr. Silvio Santana

Landing page de captação para o Dr. Silvio Santana, advogado previdenciarista, sobre **aposentadoria da pessoa com deficiência** (Lei Complementar 142/2013). O objetivo da página é levar o visitante a responder um formulário de triagem de 8 perguntas e, ao final, falar com o advogado pelo WhatsApp.

- **Conteúdo:** a copy completa está em [docs/copy.md](docs/copy.md), com a lista de diferenças intencionais entre a copy e o site.
- **Stack:** HTML + [Vite 8](https://vite.dev) + [Tailwind CSS 4](https://tailwindcss.com) + JavaScript puro (sem framework).

## Como rodar

Requisitos: **Node.js 20.19 ou superior** (testado no Node 24).

```bash
npm install        # instala as dependências
npm run dev        # servidor local em http://localhost:5173 (recarrega ao salvar)
npm run build      # gera a versão de produção em dist/
npm run preview    # abre a versão de produção localmente
npm run imagens    # regenera as imagens otimizadas a partir de fotos-originais/
```

## Estrutura

```
├── index.html                    Página principal (todas as seções)
├── politica-de-privacidade.html  Rascunho — conteúdo pendente
├── termos-de-uso.html            Rascunho — conteúdo pendente
├── src/
│   ├── config.js                 WhatsApp, destino dos leads e Google Analytics
│   ├── main.js                   Formulário, cabeçalho, animações, eventos de conversão
│   ├── style.css                 Paleta, tipografia, componentes e animações
│   ├── header.css                Cabeçalho dinâmico e menu mobile
│   └── legal.js                  Estilos das páginas legais
├── public/                       Arquivos publicados como estão (imagens otimizadas, ícones)
├── fotos-originais/              Fotos e logo em resolução original (não vão para o site)
├── scripts/imagens.mjs           Gera as imagens de public/ a partir de fotos-originais/
├── docs/copy.md                  Copy de referência
├── vite.config.js                Build + geração de sitemap.xml e robots.txt
└── .env                          Domínio do site (VITE_SITE_URL)
```

## Configuração antes de publicar

| O quê | Onde |
|---|---|
| Domínio definitivo do site | `.env` → `VITE_SITE_URL` (o build avisa enquanto estiver `seudominio.com.br`) |
| Número do WhatsApp que recebe os contatos | `src/config.js` → `WHATSAPP_NUMBER` (só dígitos, com 55 + DDD) |
| Destino dos leads (planilha, CRM, e-mail) | `src/config.js` → `LEAD_ENDPOINT` (recebe um POST com JSON). Vazio = o lead não é salvo |
| Google Analytics 4 | `src/config.js` → `GA_MEASUREMENT_ID` |

O `.env` é versionado porque só contém o domínio. **Não coloque senhas ou chaves nele**: use `.env.local`, que é ignorado pelo Git.

### Dados que o Dr. Silvio Santana precisa enviar

Tudo o que está entre colchetes em `index.html` (busque por `[`):

- número da OAB e estado;
- tempo de atuação em Direito Previdenciário;
- formação e especializações;
- onde atende (online / presencial em qual cidade);
- endereço, telefone e e-mail para o rodapé;
- valor da análise inicial (última pergunta do FAQ).

Com esses dados, completar também os dados estruturados (schema.org) no `<head>` de `index.html`. O ponto exato está marcado com `[Nota]`.

### Revisões pendentes

- Números da seção de regras e respostas do FAQ (precisão técnica).
- Página inteira quanto ao Provimento 205/2021 da OAB (publicidade na advocacia).
- Texto da tela final para quem "nunca contribuiu para o INSS".
- As 3 frases de confiança abaixo do formulário.
- Conteúdo da **Política de Privacidade** (o formulário coleta dados de saúde, que a LGPD trata como sensíveis) e dos **Termos de Uso**.

## Como o site funciona

- **Formulário de triagem:** 8 perguntas, uma por tela. A pergunta 1 também aparece no topo da página, com respostas rápidas. Perguntas de escolha única avançam sozinhas ao tocar numa opção. Ao enviar, o lead é salvo (se `LEAD_ENDPOINT` estiver configurado) e o WhatsApp abre com a mensagem pré-preenchida. Quem marcou apenas "Nunca contribuí para o INSS" vê uma tela diferente e o WhatsApp não abre.
- **Cards de situações:** cada card leva ao formulário com a condição já marcada na pergunta 2.
- **Eventos no Analytics:** `quiz_start`, `quiz_step` (1 a 8), `generate_lead` (conversão principal) e `select_content` (clique nos cards).
- **Acessibilidade:** respeita "reduzir movimento" do sistema, tem navegação por teclado e textos alternativos, e usa letra grande e contraste alto (parte do público tem baixa visão).
- **Responsivo:** testado de 320px a 1920px, sem rolagem horizontal.

## Imagens

As fotos de `public/images/` são **geradas** a partir de `fotos-originais/`. Para trocar uma foto, substitua o arquivo original mantendo o nome e rode `npm run imagens`.

Os resultados são: WebP otimizado de cada foto, o logo recortado (`logo.webp`, `favicon.png`, `apple-touch-icon.png`) e a imagem de compartilhamento `og-image.jpg` (1200×630).

As fotos dos cards de situações vêm do [Unsplash](https://unsplash.com/license), na licença gratuita, que permite uso comercial sem atribuição:

| Card | Foto |
|---|---|
| Coluna e ossos | [bNdiJ1FEbV4](https://unsplash.com/photos/bNdiJ1FEbV4) |
| Visão | [aVvZJC0ynBQ](https://unsplash.com/photos/aVvZJC0ynBQ) |
| Audição | [TBUWFIbiUvc](https://unsplash.com/photos/TBUWFIbiUvc) |
| Mobilidade | [75xbITy2szk](https://unsplash.com/photos/75xbITy2szk) |
| Sequelas de acidente | [lw39yeycynE](https://unsplash.com/photos/lw39yeycynE) |
| Mental / psicossocial | [tw-mAZXr6H4](https://unsplash.com/photos/tw-mAZXr6H4) |
| Outra condição | [Ey-IxmbZ5TQ](https://unsplash.com/photos/Ey-IxmbZ5TQ) |

## Publicação

O site é estático: basta publicar a pasta `dist/` gerada por `npm run build` em qualquer hospedagem (Vercel, Netlify, Cloudflare Pages, Hostinger etc.). Em plataformas que fazem o build sozinhas, use o comando `npm run build` e a pasta de saída `dist`.

Depois de publicar:

1. Cadastrar o site no **Google Search Console** e enviar `https://SEU-DOMINIO/sitemap.xml`.
2. Criar o **Perfil de Empresa no Google**, que é o que mais pesa em buscas locais como "advogado previdenciário [cidade]".
3. Testar o compartilhamento do link no WhatsApp (deve aparecer a imagem `og-image.jpg`).
4. Testar a página num celular real (iPhone e Android).

## Direitos

Projeto privado, desenvolvido para o Dr. Silvio Santana. Fotos, logotipo e textos são de uso exclusivo do cliente. Todos os direitos reservados.
