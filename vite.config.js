import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync } from 'node:fs'

const paginasArtigos = Object.fromEntries(
  readdirSync('artigos')
    .filter((f) => f.endsWith('.html'))
    .map((f) => [`artigo-${f.replace('.html', '')}`, `artigos/${f}`])
)

// Gera sitemap.xml e robots.txt no build, usando o domínio definido em .env (VITE_SITE_URL)
function seo(siteUrl) {
  return {
    name: 'seo-arquivos',
    apply: 'build',
    generateBundle() {
      if (!siteUrl || siteUrl.includes('seudominio')) {
        this.warn('VITE_SITE_URL ainda não foi configurado no .env — troque pelo domínio definitivo antes de publicar.')
      }
      const hoje = new Date().toISOString().slice(0, 10)
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${hoje}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/artigos.html</loc>
    <lastmod>${hoje}</lastmod>
    <priority>0.7</priority>
  </url>
${Object.values(paginasArtigos).map((f) => `  <url>
    <loc>${siteUrl}/${f}</loc>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>
`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`,
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [tailwindcss(), seo(env.VITE_SITE_URL)],
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
          artigos: 'artigos.html',
          feedbacks: 'feedbacks.html',
          ...paginasArtigos,
        },
      },
    },
  }
})
