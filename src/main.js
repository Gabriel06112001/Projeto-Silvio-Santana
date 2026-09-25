import { WHATSAPP_NUMBER, GA_MEASUREMENT_ID } from './config.js'

// ---------- Google Analytics 4 ----------
if (GA_MEASUREMENT_ID) {
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.append(script)
  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID)
}

function track(event, params = {}) {
  window.gtag?.('event', event, params)
  // Meta Pixel, se instalado
  if (event === 'generate_lead') window.fbq?.('track', 'Lead')
}

// ---------- Rodapé ----------
document.querySelector('#ano').textContent = new Date().getFullYear()

// ---------- WhatsApp ----------
// Todos os botões com [data-whatsapp] abrem a conversa com uma mensagem pronta.
const MENSAGEM_PADRAO =
  'Olá, Dr. Silvio! Vim pelo site e gostaria de saber se posso ter direito à aposentadoria da pessoa com deficiência.'

// Texto usado quando a pessoa clica num card de situação (mensagem personalizada)
const CONDICOES = {
  'cond-coluna': 'problema na coluna ou nos ossos',
  'cond-visao': 'uma condição de visão',
  'cond-audicao': 'perda auditiva',
  'cond-mobilidade': 'dificuldade de mobilidade',
  'cond-acidente': 'sequelas de um acidente',
  'cond-mental': 'uma condição intelectual, mental ou psicossocial',
}

const linkWhatsApp = (texto) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`

document.querySelectorAll('[data-whatsapp]').forEach((a) => (a.href = linkWhatsApp(MENSAGEM_PADRAO)))

// Conversão principal no Analytics: clique em qualquer botão de WhatsApp
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-whatsapp]')
  if (!link) return
  track('generate_lead', { origem: link.dataset.whatsapp })
})

// ---------- Revelação dos elementos ao rolar ----------
const alvos = new Set(document.querySelectorAll('[data-reveal]'))
const secoes = 'main section:not(#inicio)'
document.querySelectorAll(`${secoes} .section-title`).forEach((h) => alvos.add(h.parentElement))
document
  .querySelectorAll(`${secoes} ul.grid > li, ${secoes} ol.grid > li, ${secoes} article, ${secoes} details, ${secoes} figure`)
  .forEach((el) => alvos.add(el))
document.querySelectorAll(`${secoes} img`).forEach((img) => alvos.add(img.closest('div.relative') ?? img))
document.querySelectorAll(`${secoes} div.text-center > a.btn-cta`).forEach((a) => alvos.add(a.parentElement))

// Itens irmãos entram em sequência (efeito cascata)
const contagem = new Map()
alvos.forEach((el) => {
  el.setAttribute('data-reveal', '')
  const n = contagem.get(el.parentElement) ?? 0
  contagem.set(el.parentElement, n + 1)
  el.style.setProperty('--reveal-delay', `${Math.min(n, 5) * 90}ms`)
})

const revelar = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-visible')
      revelar.unobserve(entry.target)
    }),
  { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
)
alvos.forEach((el) => revelar.observe(el))

// ---------- Fotos dos cards em telas de toque ----------
// Sem hover no celular: a foto aparece quando o card passa pelo centro da tela
if (window.matchMedia('(hover: none)').matches) {
  const centro = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.target.classList.contains('is-selected')) entry.target.classList.toggle('is-active', entry.isIntersecting)
      }),
    { rootMargin: '-40% 0px -40% 0px' }
  )
  document.querySelectorAll('.card-hover').forEach((card) => centro.observe(card))
}

// ---------- Cabeçalho ----------
const header = document.querySelector('#site-header')

// Cápsula ao rolar + anel de progresso de leitura em volta do logo
let agendado = false
function atualizarHeader() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  header.classList.toggle('is-scrolled', window.scrollY > 24)
  header.style.setProperty('--progress', max > 0 ? Math.min(window.scrollY / max, 1).toFixed(4) : '0')
  agendado = false
}
window.addEventListener(
  'scroll',
  () => {
    if (!agendado) {
      agendado = true
      requestAnimationFrame(atualizarHeader)
    }
  },
  { passive: true }
)
atualizarHeader()

// ---------- Navegação: seção ativa, clique suave e pílula que acompanha o mouse ----------
const nav = header.querySelector('.site-nav')
const indicador = nav.querySelector('.site-nav__indicator')
const linksNav = [...nav.querySelectorAll('a')]
const linksMenu = [...document.querySelectorAll('.menu-mobile__nav a')]
const secoesPagina = [...document.querySelectorAll('main > section[id]')]
// Seções sem link próprio herdam o link mais próximo; o topo não marca nenhum
const secaoParaLink = { inicio: null, entenda: 'situacoes', analise: 'regras', contato: 'duvidas' }
let linkAtivo = null
let travaRolagem = 0 // durante o scroll suave de um clique, não recalcula (evita a pílula "pular" pelas seções do meio)

function moverIndicador(link) {
  nav.classList.toggle('has-active', Boolean(link))
  if (!link) return
  indicador.style.setProperty('--x', `${link.offsetLeft}px`)
  indicador.style.setProperty('--w', `${link.offsetWidth}px`)
}

function ativarLink(hash) {
  linkAtivo = hash
  ;[...linksNav, ...linksMenu].forEach((a) => {
    const ativo = a.hash === hash
    a.classList.toggle('is-active', ativo)
    if (ativo) a.setAttribute('aria-current', 'true')
    else a.removeAttribute('aria-current')
  })
  moverIndicador(linksNav.find((a) => a.hash === hash))
}

// Seção atual = a última cujo topo já passou de 35% da altura da tela
function detectarSecao() {
  if (Date.now() < travaRolagem) return
  const linha = window.innerHeight * 0.35
  let atual = secoesPagina[0]
  for (const secao of secoesPagina) if (secao.getBoundingClientRect().top <= linha) atual = secao
  // No fim da página, a última seção sempre fica ativa
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) atual = secoesPagina.at(-1)
  const id = atual.id in secaoParaLink ? secaoParaLink[atual.id] : atual.id
  const hash = id ? `#${id}` : null
  if (hash !== linkAtivo) ativarLink(hash)
}

let quadroNav = 0
window.addEventListener('scroll', () => (quadroNav ||= requestAnimationFrame(() => ((quadroNav = 0), detectarSecao()))), { passive: true })
window.addEventListener('resize', () => moverIndicador(linksNav.find((a) => a.hash === linkAtivo)))
document.fonts?.ready.then(() => moverIndicador(linksNav.find((a) => a.hash === linkAtivo)))
detectarSecao()

// Clique: marca o destino na hora e trava a detecção até o scroll suave terminar
;[...linksNav, ...linksMenu].forEach((a) =>
  a.addEventListener('click', () => {
    ativarLink(a.hash)
    travaRolagem = Date.now() + 1000
    window.addEventListener('scrollend', () => ((travaRolagem = 0), detectarSecao()), { once: true })
  })
)

// Mouse sobre o menu: a pílula acompanha o item; ao sair, volta para a seção atual
linksNav.forEach((a) => a.addEventListener('mouseenter', () => moverIndicador(a)))
nav.addEventListener('mouseleave', () => moverIndicador(linksNav.find((a) => a.hash === linkAtivo)))

// Menu mobile: círculo que se expande a partir do botão
const menuToggle = header.querySelector('.menu-toggle')
const menuMobile = document.querySelector('#menu-mobile')

function alternarMenu(abrir) {
  const r = menuToggle.getBoundingClientRect()
  menuMobile.style.setProperty('--cx', `${r.left + r.width / 2}px`)
  menuMobile.style.setProperty('--cy', `${r.top + r.height / 2}px`)
  menuMobile.classList.toggle('is-open', abrir)
  menuMobile.inert = !abrir
  menuMobile.setAttribute('aria-hidden', String(!abrir))
  menuToggle.setAttribute('aria-expanded', String(abrir))
  menuToggle.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu')
  document.documentElement.classList.toggle('menu-open', abrir)
}

menuToggle.addEventListener('click', () => alternarMenu(!menuMobile.classList.contains('is-open')))
menuMobile.addEventListener('click', (e) => e.target.closest('a') && alternarMenu(false))
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuMobile.classList.contains('is-open')) {
    alternarMenu(false)
    menuToggle.focus()
  }
})
window.matchMedia('(min-width: 1200px)').addEventListener('change', (e) => e.matches && alternarMenu(false))

// ---------- Widget de WhatsApp ----------
// Ao carregar: abre o balão, mostra "digitando..." e depois a mensagem da equipe.
// Abre sempre que a página é carregada (inclusive ao recarregar).
const chat = document.querySelector('#whats-chat')
const digitando = chat.querySelector('.whats-chat__digitando')
const mensagem = chat.querySelector('.whats-chat__msg')
const badge = document.querySelector('.whats-fab__badge')

function abrirChat() {
  chat.hidden = false
  requestAnimationFrame(() => chat.classList.add('is-open'))
  digitando.hidden = false
  mensagem.hidden = true
  setTimeout(() => {
    digitando.hidden = true
    mensagem.hidden = false
    badge.classList.add('is-visible')
  }, 2200)
}

chat.querySelector('.whats-chat__fechar').addEventListener('click', () => {
  chat.classList.remove('is-open')
  setTimeout(() => (chat.hidden = true), 300)
})

setTimeout(abrirChat, 1800)

// ---------- Cards de situações: painel de detalhes ----------
// [Nota] Textos informativos a validar pelo Silvio (precisão técnica e Provimento 205/2021).
const DETALHES = {
  'cond-coluna': {
    titulo: 'Coluna e ossos',
    texto:
      'Problemas como hérnia de disco ou artrose, por si só, não garantem o direito. O que se avalia é se a condição é de longo prazo e se gera limitações reais no trabalho e no dia a dia, como dor ao fazer esforço, dificuldade para ficar muito tempo sentado ou em pé.',
  },
  'cond-visao': {
    titulo: 'Visão',
    texto:
      'A visão monocular é reconhecida por lei como deficiência visual. Baixa visão e perda parcial da visão também podem ser relevantes. O grau da deficiência é definido em avaliação médica e social do INSS.',
  },
  'cond-audicao': {
    titulo: 'Audição',
    texto:
      'A perda auditiva de longo prazo pode ser considerada quando cria barreiras no trabalho e na comunicação do dia a dia. O grau da deficiência é definido em avaliação médica e social do INSS.',
  },
  'cond-mobilidade': {
    titulo: 'Mobilidade',
    texto:
      'Dificuldade para andar, ficar em pé ou fazer força, e o uso de prótese, órtese ou outros aparelhos, podem ser considerados quando a limitação é de longo prazo e afeta o trabalho.',
  },
  'cond-acidente': {
    titulo: 'Sequelas de acidente',
    texto:
      'Sequelas que causam limitações de longo prazo podem ser consideradas. É preciso analisar quando o acidente aconteceu, quais limitações ficaram e o seu tempo de contribuição.',
  },
  'cond-mental': {
    titulo: 'Intelectual, mental ou psicossocial',
    texto:
      'Condições intelectuais, mentais ou psicossociais de longo prazo também entram na avaliação, que considera as barreiras enfrentadas no trabalho, no aprendizado e nas relações do dia a dia.',
  },
}

const painel = document.querySelector('#painel-condicao')
const painelCard = painel.querySelector('.painel-condicao__card')
const painelFoto = painel.querySelector('.painel-condicao__foto')
const painelWhats = painel.querySelector('[data-whatsapp="painel-condicao"]')
const cardsCondicao = [...document.querySelectorAll('[data-condicao]')]
let condicaoAberta = null

function fecharPainel() {
  painel.classList.remove('is-open')
  cardsCondicao.forEach((c) => {
    c.classList.remove('is-selected', 'is-active')
    c.setAttribute('aria-expanded', 'false')
  })
  condicaoAberta = null
}

function abrirPainel(card) {
  const id = card.dataset.condicao
  if (condicaoAberta === id) return fecharPainel()
  const info = DETALHES[id]
  const jaAberto = painel.classList.contains('is-open')

  cardsCondicao.forEach((c) => {
    const escolhido = c === card
    c.classList.toggle('is-selected', escolhido)
    c.classList.toggle('is-active', escolhido)
    c.setAttribute('aria-expanded', String(escolhido))
  })

  painel.querySelector('.painel-condicao__titulo').textContent = info.titulo
  painel.querySelector('.painel-condicao__texto').textContent = info.texto
  painelFoto.src = card.querySelector('.card-photo').src
  const condicao = CONDICOES[id]
  painelWhats.href = linkWhatsApp(
    `Olá, Dr. Silvio! Vim pelo site. Convivo com ${condicao} e gostaria de saber se posso ter direito à aposentadoria da pessoa com deficiência.`
  )

  if (jaAberto) {
    painelCard.classList.remove('trocando')
    void painelCard.offsetWidth
    painelCard.classList.add('trocando')
  }
  painel.classList.add('is-open')
  condicaoAberta = id
  track('select_content', { content_type: 'condicao', item_id: id })

  // Depois que o painel abre, rola suavemente até ele
  setTimeout(() => painel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), jaAberto ? 50 : 350)
}

cardsCondicao.forEach((card) =>
  card.addEventListener('click', (e) => {
    e.preventDefault()
    abrirPainel(card)
  })
)
painel.querySelector('.painel-condicao__fechar').addEventListener('click', () => {
  const card = cardsCondicao.find((c) => c.dataset.condicao === condicaoAberta)
  fecharPainel()
  card?.focus()
})

// ---------- Carrossel parallax de situações ----------
const carrossel = document.querySelector('.carrossel')
const itensCarrossel = [...carrossel.children]
const setas = [...document.querySelectorAll('[data-carrossel]')]
let quadroCarrossel = 0
function atualizarCarrossel() {
  quadroCarrossel = 0
  const caixa = carrossel.getBoundingClientRect()
  const centro = caixa.left + caixa.width / 2
  itensCarrossel.forEach((li) => {
    const r = li.getBoundingClientRect()
    const p = Math.max(-1.5, Math.min(1.5, (r.left + r.width / 2 - centro) / caixa.width))
    li.firstElementChild.style.setProperty('--px', p.toFixed(3))
  })
  const fim = carrossel.scrollWidth - carrossel.clientWidth
  setas[0].disabled = carrossel.scrollLeft <= 4
  setas[1].disabled = carrossel.scrollLeft >= fim - 4
}
const agendarCarrossel = () => (quadroCarrossel ||= requestAnimationFrame(atualizarCarrossel))
carrossel.addEventListener('scroll', agendarCarrossel, { passive: true })
window.addEventListener('resize', agendarCarrossel)
atualizarCarrossel()
setas.forEach((s) =>
  s.addEventListener('click', () =>
    carrossel.scrollBy({ left: (itensCarrossel[0].offsetWidth + 16) * Number(s.dataset.carrossel), behavior: 'smooth' })
  )
)
// Arrastar com o mouse (no toque o navegador já desliza)
let arraste = null
carrossel.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse') return
  arraste = { x: e.clientX, scroll: carrossel.scrollLeft, moveu: false }
})
window.addEventListener('pointermove', (e) => {
  if (!arraste) return
  const dx = e.clientX - arraste.x
  if (Math.abs(dx) > 5) { arraste.moveu = true; carrossel.classList.add('arrastando') }
  carrossel.scrollLeft = arraste.scroll - dx
})
window.addEventListener('pointerup', () => {
  if (!arraste) return
  const moveu = arraste.moveu
  arraste = null
  carrossel.classList.remove('arrastando')
  // impede que o fim de um arraste conte como clique no card
  if (moveu) carrossel.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault() }, { capture: true, once: true })
})

// ---------- Vídeo de fundo ----------
// Pausa fora da tela (economiza bateria/dados) e respeita "reduzir movimento"
const videoFundo = document.querySelector('.video-fundo')
if (videoFundo) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    videoFundo.removeAttribute('autoplay')
    videoFundo.pause()
  } else {
    new IntersectionObserver(([e]) => (e.isIntersecting ? videoFundo.play().catch(() => {}) : videoFundo.pause())).observe(videoFundo)
  }
}

// ---------- Regras: dispara o fluxo animado quando a seção aparece ----------
const fluxo = document.querySelector('.fluxo')
if (fluxo) {
  const obsFluxo = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return
      fluxo.classList.add('fluxo-ativo')
      obsFluxo.disconnect()
    },
    { threshold: 0.25 }
  )
  obsFluxo.observe(fluxo)
}

// ---------- Passo a passo: preenche a linha do tempo quando a seção aparece ----------
const passos = document.querySelector('.passos')
if (passos) {
  const obsPassos = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return
      passos.classList.add('passos-ativo')
      obsPassos.disconnect()
    },
    { threshold: 0.35 }
  )
  obsPassos.observe(passos)
}

// ---------- Proteção das imagens ----------
// Bloqueia o menu do botão direito e o "arrastar para salvar" das imagens.
// Obs.: dificulta a cópia casual, mas não impede totalmente (capturas de tela e ferramentas do navegador continuam funcionando).
document.addEventListener('contextmenu', (e) => e.preventDefault())
document.addEventListener('dragstart', (e) => {
  if (e.target.closest('img, video')) e.preventDefault()
})

// ---------- Seta da seção de vídeo: desenha quando aparece ----------
const setaFluxo = document.querySelector('.seta-fluxo')
if (setaFluxo) {
  const obsSeta = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return
    setaFluxo.classList.add('is-visible')
    obsSeta.disconnect()
  }, { threshold: 0.6 })
  obsSeta.observe(setaFluxo)
}
