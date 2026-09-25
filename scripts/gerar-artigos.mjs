// Gera uma página HTML para cada artigo (artigos/<slug>.html) no padrão visual do site.
// Uso: npm run artigos   (roda automaticamente antes do build)

import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { artigos } from './artigos-conteudo.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const pasta = join(raiz, 'artigos')
mkdirSync(pasta, { recursive: true })

const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const outros = (atual) =>
  artigos
    .filter((a) => a.slug !== atual.slug)
    .slice(0, 3)
    .map(
      (a) => `            <a class="artigo artigo--mini" href="/artigos/${a.slug}.html">
              <p class="artigo__meta"><span class="artigo__tag">${a.tag}</span></p>
              <p class="artigo__titulo">${a.titulo}</p>
              <span class="artigo__link artigo__link--interno">Ler artigo</span>
            </a>`
    )
    .join('\n')

for (const a of artigos) {
  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(a.titulo)} | Silvio Santana</title>
    <meta name="description" content="${esc(a.resumo)}" />
    <meta name="robots" content="index, follow" />
    <meta name="author" content="Silvio Santana" />
    <meta name="theme-color" content="#242a28" />
    <link rel="canonical" href="%VITE_SITE_URL%/artigos/${a.slug}.html" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:title" content="${esc(a.titulo)}" />
    <meta property="og:description" content="${esc(a.resumo)}" />
    <meta property="og:image" content="%VITE_SITE_URL%/images/og-image.jpg" />
    <meta property="article:published_time" content="${a.data}" />
    <script type="application/ld+json">
      ${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: a.titulo,
        description: a.resumo,
        datePublished: a.data,
        inLanguage: 'pt-BR',
        author: { '@type': 'Person', name: 'Silvio Santana', jobTitle: 'Advogado Previdenciário' },
        image: '%VITE_SITE_URL%/images/og-image.jpg',
        mainEntityOfPage: `%VITE_SITE_URL%/artigos/${a.slug}.html`,
      })}
    </script>
    <link rel="icon" href="/favicon.png" type="image/png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap" rel="stylesheet" />
    <script>document.documentElement.classList.add('js')</script>
    <link rel="stylesheet" href="/src/style.css" />
    <script type="module" src="/src/artigos.js"></script>
  </head>
  <body>
    <!-- Página gerada por scripts/gerar-artigos.mjs — edite o conteúdo em scripts/artigos-conteudo.mjs -->
    <header id="site-header" class="site-header">
      <div class="site-header__bar">
        <a href="/" class="brand" aria-label="Silvio Santana — voltar ao site">
          <span class="brand__mark"><img src="/images/logo.webp" alt="" width="44" height="44" /></span>
          <span class="brand__text">
            <span class="brand__name">Silvio Santana</span>
            <span class="brand__role"><span>Advogado Previdenciário</span></span>
          </span>
        </a>
        <a href="/artigos.html" class="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-ivory/75 transition hover:text-ivory sm:inline-flex">← Todos os artigos</a>
        <a href="https://wa.me/" data-whatsapp="artigo-cabecalho" target="_blank" rel="noopener" class="btn-cta btn-sm shrink-0 whitespace-nowrap"><span class="sm:hidden">WhatsApp</span><span class="hidden sm:inline">Falar com a equipe</span></a>
      </div>
    </header>

    <main id="conteudo">
      <section class="bg-studio on-dark">
        <div class="mx-auto max-w-3xl px-5 pt-32 pb-20 md:px-8 md:pt-40 md:pb-24">
          <a href="/artigos.html" class="text-sm font-medium text-bronze-light hover:text-ivory">← Artigos</a>
          <p class="mt-6 flex flex-wrap items-center gap-3 text-sm text-ivory/60">
            <span class="rounded-full bg-bronze/20 px-3 py-1 text-xs font-semibold tracking-wide text-bronze-light">${a.tag}</span>
            <time datetime="${a.data}">${a.dataTexto}</time>
          </p>
          <h1 class="mt-4 font-serif text-[1.8rem] leading-tight font-medium text-ivory md:text-[2.6rem]">${a.titulo}</h1>
          <p class="mt-5 flex items-center gap-3 text-sm text-ivory/75">
            <img src="/images/silvio-sobre.webp" alt="" width="40" height="40" class="h-10 w-10 rounded-full object-cover object-top" />
            <span>Por <strong class="font-semibold text-ivory">Silvio Santana</strong> · Advogado Previdenciário</span>
          </p>
        </div>
      </section>

      <section class="relative z-10 -mt-6 rounded-t-3xl bg-ivory md:-mt-14 md:rounded-t-[3.5rem]">
        <div class="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
          <article class="artigo-corpo">
${a.corpo.trim()}
          </article>

          <!-- Créditos de autoria -->
          <aside class="mt-10 flex flex-col gap-4 rounded-2xl bg-white p-6 sm:flex-row sm:items-center">
            <img src="/images/silvio-sobre.webp" alt="" width="64" height="64" loading="lazy" class="h-16 w-16 shrink-0 rounded-full object-cover object-top" />
            <div class="text-sm leading-relaxed text-stone">
              <p class="font-serif text-lg text-ink">Silvio Santana</p>
              <p>Advogado Previdenciário · OAB/SP 493.305. Autor do Blog Artigos PREV.</p>
              <p class="mt-1 text-xs">© ${a.data.slice(0, 4)} Silvio Santana. Conteúdo informativo; não substitui a análise individual de cada caso.</p>
            </div>
          </aside>

          <div class="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-graphite p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <p class="font-serif text-lg text-ivory">Quer saber como isso se aplica ao seu caso?</p>
            <a href="https://wa.me/" data-whatsapp="artigo-cta" target="_blank" rel="noopener" class="btn-cta btn-sm shrink-0">Falar com a equipe</a>
          </div>
        </div>
      </section>

      <section class="bg-white">
        <div class="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-14">
          <p class="eyebrow">Continue lendo</p>
          <div class="mt-6 grid gap-4 md:grid-cols-3">
${outros(a)}
          </div>
        </div>
      </section>
    </main>

    <footer class="rodape relative z-20">
      <div class="mx-auto max-w-7xl px-5 md:px-8">
        <div class="flex flex-col gap-6 border-t border-ivory/10 py-8 md:flex-row md:items-center md:justify-between">
          <a href="/" class="flex items-center gap-3">
            <img src="/images/logo.webp" alt="" width="40" height="40" loading="lazy" class="h-10 w-10" />
            <span class="leading-tight">
              <span class="block font-serif text-base text-ivory">Silvio Santana</span>
              <span class="block text-[0.65rem] font-semibold tracking-[0.18em] text-bronze-light uppercase">Advogado Previdenciário</span>
            </span>
          </a>
          <ul class="rodape__lista !mt-0 sm:flex sm:flex-wrap sm:gap-x-6">
            <li><a href="https://wa.me/" data-whatsapp="artigo-rodape" target="_blank" rel="noopener">(11) 92722-2548</a></li>
            <li><a href="mailto:silvio.santana@adv.oabsp.org.br">silvio.santana@adv.oabsp.org.br</a></li>
            <li><a href="https://www.instagram.com/silviosantana.adv/" target="_blank" rel="noopener">@silviosantana.adv</a></li>
          </ul>
        </div>
        <div class="flex flex-col gap-2 border-t border-ivory/10 py-6 text-xs text-ivory/55 md:flex-row md:justify-between">
          <span>© <span id="ano"></span> Silvio Santana · OAB/SP 493.305</span>
          <span class="flex gap-5">
          </span>
        </div>
      </div>
    </footer>
  </body>
</html>
`
  writeFileSync(join(pasta, `${a.slug}.html`), html)
  console.log('artigos/' + a.slug + '.html')
}
