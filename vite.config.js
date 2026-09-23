import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

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
          privacidade: 'politica-de-privacidade.html',
          termos: 'termos-de-uso.html',
        },
      },
    },
  }
})
