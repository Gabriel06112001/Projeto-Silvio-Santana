// Gera todas as imagens otimizadas do site a partir de fotos-originais/.
// Uso: npm run imagens
//
// Para trocar uma foto: substitua o arquivo em fotos-originais/ (mantendo o nome) e rode o comando.

import sharp from 'sharp'
import { mkdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const origem = join(raiz, 'fotos-originais')
const destino = join(raiz, 'public', 'images')
mkdirSync(join(destino, 'cards'), { recursive: true })

const kb = (arquivo) => `${Math.round(statSync(arquivo).size / 1024)} KB`

// ---------- Fotos (WebP) ----------
const fotos = [
  // Qualidade alta: as fotos do Silvio saem na resolução original (sem ampliar) e os cards em 1200px (nítidos em telas retina)
  ['silvio-hero.jpg', 'silvio-hero-800.webp', 800],
  ['silvio-hero.jpg', 'silvio-hero-1200.webp', 1200],
  ['silvio-sobre.jpg', 'silvio-sobre.webp', 1400],
  ['silvio-cta.jpg', 'silvio-cta.webp', 1400],
  ...['coluna', 'visao', 'audicao', 'mobilidade', 'acidente', 'mental', 'outra'].map((n) => [`cards/${n}.jpg`, `cards/${n}.webp`, 1200]),
]
for (const [entrada, saida, largura] of fotos) {
  const arquivo = join(destino, saida)
  await sharp(join(origem, entrada))
    .resize({ width: largura, withoutEnlargement: true, kernel: 'lanczos3' })
    .sharpen({ sigma: 0.5 })
    .webp({ quality: 88, smartSubsample: true, effort: 6 })
    .toFile(arquivo)
  console.log(`${saida.padEnd(24)} ${kb(arquivo)}`)
}

// ---------- Logo: recorta o emblema circular com fundo transparente ----------
const logoOriginal = join(origem, 'logo-original.png')
const { data, info } = await sharp(logoOriginal).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
let minX = info.width, minY = info.height, maxX = 0, maxY = 0
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 4
    const visivel = data[i + 3] > 40 && Math.min(data[i], data[i + 1], data[i + 2]) < 225
    if (visivel) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x)
      minY = Math.min(minY, y); maxY = Math.max(maxY, y)
    }
  }
}
const lado = Math.max(maxX - minX, maxY - minY) + 1
const cx = Math.round((minX + maxX) / 2), cy = Math.round((minY + maxY) / 2)
const mascara = Buffer.from(`<svg width="${lado}" height="${lado}"><circle cx="${lado / 2}" cy="${lado / 2}" r="${lado / 2 - 1.5}" fill="#fff"/></svg>`)
const logo = await sharp(logoOriginal)
  .extract({ left: cx - Math.floor(lado / 2), top: cy - Math.floor(lado / 2), width: lado, height: lado })
  .ensureAlpha()
  .composite([{ input: mascara, blend: 'dest-in' }])
  .png()
  .toBuffer()
await sharp(logo).resize(384, 384).webp({ quality: 95 }).toFile(join(destino, 'logo.webp'))
await sharp(logo).resize(64, 64).png({ compressionLevel: 9 }).toFile(join(raiz, 'public', 'favicon.png'))
await sharp(logo).resize(180, 180).png({ compressionLevel: 9 }).toFile(join(raiz, 'public', 'apple-touch-icon.png'))
console.log('logo.webp, favicon.png, apple-touch-icon.png')

// ---------- Imagem de compartilhamento (WhatsApp, redes sociais): 1200x630 ----------
const W = 1200, H = 630
const foto = await sharp(join(origem, 'silvio-hero.jpg')).resize({ width: 520, height: H, fit: 'cover', position: 'top' }).toBuffer()
const texto = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="f" x1="0" x2="1"><stop offset="0" stop-color="#242a28"/><stop offset="1" stop-color="#242a28" stop-opacity="0"/></linearGradient></defs>
  <rect x="640" y="0" width="120" height="${H}" fill="url(#f)"/>
  <rect x="70" y="92" width="56" height="2" fill="#d2b07a"/>
  <text x="70" y="140" font-family="Georgia, serif" font-size="22" letter-spacing="4" fill="#d2b07a">APOSENTADORIA DA PESSOA COM DEFICIÊNCIA</text>
  <text font-family="Georgia, serif" font-size="54" fill="#f7f4ee"><tspan x="70" y="240">Sua condição de saúde</tspan><tspan x="70" y="308">pode fazer diferença</tspan><tspan x="70" y="376">na sua aposentadoria.</tspan></text>
  <text x="70" y="500" font-family="Georgia, serif" font-size="34" fill="#f7f4ee">Silvio Santana</text>
  <text x="70" y="540" font-family="Arial, sans-serif" font-size="18" letter-spacing="4" fill="#d2b07a">ADVOGADO PREVIDENCIÁRIO</text>
</svg>`)
const og = join(destino, 'og-image.jpg')
await sharp({ create: { width: W, height: H, channels: 3, background: '#242a28' } })
  .composite([{ input: foto, left: 680, top: 0 }, { input: texto, left: 0, top: 0 }])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(og)
console.log(`og-image.jpg             ${kb(og)}`)
