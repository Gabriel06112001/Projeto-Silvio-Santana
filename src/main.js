import './style.css'
import { WHATSAPP_NUMBER, LEAD_ENDPOINT, GA_MEASUREMENT_ID } from './config.js'

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

// ---------- Quiz de triagem ----------
const form = document.querySelector('#triagem')
const steps = [...form.querySelectorAll('[data-step]')]
const btnVoltar = document.querySelector('#quiz-voltar')
const btnAvancar = document.querySelector('#quiz-avancar')
const btnEnviar = document.querySelector('#quiz-enviar')
const erro = document.querySelector('#quiz-erro')
const progressoTexto = document.querySelector('#progresso-texto')
const progressoBarra = document.querySelector('#progresso-barra')
const STEP_TEMPO_CONTRIBUICAO = 4

let atual = 0

const checked = (name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)]
const nuncaContribuiu = () => {
  const v = checked('vinculo')
  return v.length === 1 && v[0].id === 'vinculo-nunca'
}

function animar(el, classe) {
  el.classList.remove('step-next', 'step-prev', 'fade-in')
  void el.offsetWidth // reinicia a animação
  el.classList.add(classe)
}

function mostrarStep(i, { focar = true } = {}) {
  const direcao = i >= atual ? 'step-next' : 'step-prev'
  atual = i
  steps.forEach((s, idx) => (s.hidden = idx !== i))
  if (focar) animar(steps[i], direcao)
  const ultimo = i === steps.length - 1
  btnVoltar.hidden = i === 0
  btnAvancar.hidden = ultimo
  btnEnviar.hidden = !ultimo
  erro.textContent = ''

  // Incentivo nas últimas etapas (reduz abandono)
  const incentivo = ultimo ? ' · última etapa' : i >= steps.length - 3 ? ' · falta pouco' : ''
  progressoTexto.textContent = `Pergunta ${i + 1} de ${steps.length}${incentivo}`
  progressoBarra.style.width = `${((i + 1) / steps.length) * 100}%`
  progressoBarra.parentElement.setAttribute('aria-valuenow', i + 1)

  if (focar) {
    // Funil no Analytics: mostra em que pergunta as pessoas param
    if (!quizIniciado && i > 0) {
      quizIniciado = true
      track('quiz_start', { origem: 'formulario' })
    }
    track('quiz_step', { step: i + 1 })
    const legend = steps[i].querySelector('legend')
    legend.tabIndex = -1
    legend.focus({ preventScroll: true })
    if (form.getBoundingClientRect().top < 0) form.scrollIntoView({ behavior: 'smooth' })
  }
}

function validar(i) {
  const step = steps[i]
  const radios = step.querySelectorAll('input[type="radio"]')
  if (radios.length && !step.querySelector('input[type="radio"]:checked')) {
    return 'Escolha uma das opções para continuar.'
  }
  const checkboxes = step.querySelectorAll('input[type="checkbox"][name="condicao"], input[type="checkbox"][name="vinculo"]')
  if (checkboxes.length && !step.querySelector('input[type="checkbox"]:checked')) {
    return 'Marque pelo menos uma opção para continuar.'
  }
  if (step.contains(form.condicaoOutro) && document.querySelector('#cond-outro').checked && !form.condicaoOutro.value.trim()) {
    form.condicaoOutro.focus()
    return 'Descreva brevemente a sua condição.'
  }
  if (i === steps.length - 1) {
    if (!form.nome.value.trim()) return form.nome.focus(), 'Informe o seu nome.'
    const digitos = form.whatsapp.value.replace(/\D/g, '')
    if (digitos.length < 10 || digitos.length > 11) return form.whatsapp.focus(), 'Informe um WhatsApp válido, com DDD.'
    if (!form.cidade.value.trim()) return form.cidade.focus(), 'Informe a sua cidade e estado.'
    if (!form.consentimento.checked) return form.consentimento.focus(), 'Para continuar, é preciso autorizar o uso das informações.'
  }
  return ''
}

btnAvancar.addEventListener('click', () => {
  const msg = validar(atual)
  if (msg) return (erro.textContent = msg)
  let proximo = atual + 1
  // Quem nunca contribuiu pula a pergunta sobre tempo de contribuição
  if (proximo === STEP_TEMPO_CONTRIBUICAO && nuncaContribuiu()) proximo++
  mostrarStep(proximo)
})

btnVoltar.addEventListener('click', () => {
  let anterior = atual - 1
  if (anterior === STEP_TEMPO_CONTRIBUICAO && nuncaContribuiu()) anterior--
  mostrarStep(anterior)
})

// Perguntas de escolha única avançam sozinhas ao clicar/tocar numa opção.
// Só com mouse/toque: quem navega pelo teclado (setas) continua usando o botão "Continuar".
let toqueEm = null
form.addEventListener('pointerdown', (e) => (toqueEm = e.target.closest('.quiz-option')))
form.addEventListener('change', (e) => {
  const step = steps[atual]
  const soRadios = step.querySelector('input[type="radio"]') && !step.querySelector('input:not([type="radio"]), textarea')
  const foiToque = toqueEm && toqueEm.contains(e.target)
  toqueEm = null
  if (e.target.type !== 'radio' || !soRadios || !foiToque) return
  const passo = atual
  setTimeout(() => passo === atual && btnAvancar.click(), 380)
})

// Pergunta 1 respondida direto no hero: marca a resposta e leva à pergunta 2
let quizIniciado = false
document.querySelectorAll('[data-inicio]').forEach((chip) =>
  chip.addEventListener('click', () => {
    const opcao = form.querySelector(`input[name="limitacao"][value="${chip.dataset.inicio}"]`)
    opcao.checked = true
    quizIniciado = true
    track('quiz_start', { origem: 'hero' })
    mostrarStep(1)
    document.querySelector('#analise').scrollIntoView({ behavior: 'smooth' })
  })
)
// Enter em campos de texto avança em vez de enviar
form.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName === 'INPUT' && atual < steps.length - 1) {
    e.preventDefault()
    btnAvancar.click()
  }
})

// "Outro" revela o campo de descrição
const condOutro = document.querySelector('#cond-outro')
const condOutroWrap = document.querySelector('#condicao-outro-wrap')
condOutro.addEventListener('change', () => {
  condOutroWrap.hidden = !condOutro.checked
  if (condOutro.checked) form.condicaoOutro.focus()
})

// "Nunca contribuí" é exclusivo com as outras formas de trabalho
form.querySelectorAll('input[name="vinculo"]').forEach((input) =>
  input.addEventListener('change', () => {
    if (!input.checked) return
    form.querySelectorAll('input[name="vinculo"]').forEach((other) => {
      if (other !== input && (input.id === 'vinculo-nunca' || other.id === 'vinculo-nunca')) other.checked = false
    })
  })
)

// Máscara do WhatsApp: (00) 00000-0000
form.whatsapp.addEventListener('input', () => {
  const d = form.whatsapp.value.replace(/\D/g, '').slice(0, 11)
  let v = d
  if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length > 6) v = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`
  form.whatsapp.value = v
})

// Cards da Seção 2 pré-marcam a condição na pergunta 2
document.querySelectorAll('[data-condicao]').forEach((card) =>
  card.addEventListener('click', () => {
    const input = document.querySelector(`#${card.dataset.condicao}`)
    if (!input.checked) {
      input.checked = true
      input.dispatchEvent(new Event('change'))
    }
    track('select_content', { content_type: 'condicao', item_id: card.dataset.condicao })
  })
)

function montarLead() {
  const radio = (name) => checked(name)[0]
  const condicoes = checked('condicao').map((i) =>
    i.id === 'cond-outro' ? `Outro: ${form.condicaoOutro.value.trim()}` : i.value
  )
  return {
    data: new Date().toISOString(),
    nome: form.nome.value.trim(),
    whatsapp: form.whatsapp.value,
    cidade: form.cidade.value.trim(),
    idade: radio('idade').value,
    limitacao: radio('limitacao').value,
    condicoes,
    tempoCondicao: radio('tempoCondicao').value,
    vinculo: checked('vinculo').map((i) => i.value),
    tempoContribuicao: nuncaContribuiu() ? 'Nunca contribuiu' : radio('tempoContribuicao').value,
    documentos: radio('documentos').value,
    mensagem: form.mensagem.value.trim(),
    consentimento: true,
    origem: window.location.href,
  }
}

function montarMensagemWhatsApp(lead) {
  const msg = (name) => checked(name)[0].dataset.msg
  const tipo = checked('condicao')
    .map((i) => (i.id === 'cond-outro' ? form.condicaoOutro.value.trim() : i.value.toLowerCase()))
    .join(', ')
  const vinculo = checked('vinculo').map((i) => i.dataset.msg).join(', ')

  return (
    `Olá, Dr. Silvio! Preenchi a análise inicial no site. ` +
    `Meu nome é ${lead.nome}, de ${lead.cidade}, tenho ${msg('idade')}. ` +
    `Minha condição: ${tipo}, ${msg('tempoCondicao')}. ` +
    `${msg('tempoContribuicao')} (${vinculo}). ` +
    `Documentos médicos: ${msg('documentos')}. ` +
    `Gostaria de saber se posso ter direito à aposentadoria da pessoa com deficiência.`
  )
}

function salvarLead(lead) {
  if (!LEAD_ENDPOINT) {
    console.warn('LEAD_ENDPOINT não configurado em src/config.js — lead não foi salvo.', lead)
    return
  }
  // keepalive garante o envio mesmo que o WhatsApp abra em seguida
  fetch(LEAD_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // evita preflight CORS (compatível com Google Apps Script)
    body: JSON.stringify(lead),
    keepalive: true,
  }).catch((err) => console.error('Falha ao salvar lead', err))
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const msg = validar(atual)
  if (msg) return (erro.textContent = msg)

  const lead = montarLead()
  salvarLead(lead)
  track('generate_lead', { nunca_contribuiu: nuncaContribuiu() })

  form.hidden = true

  if (nuncaContribuiu()) {
    const tela = document.querySelector('#tela-sem-contribuicao')
    tela.hidden = false
    animar(tela, 'fade-in')
    tela.focus()
    return
  }

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(montarMensagemWhatsApp(lead))}`
  const tela = document.querySelector('#tela-obrigado')
  document.querySelector('#link-whatsapp').href = url
  tela.hidden = false
  animar(tela, 'fade-in')
  tela.focus()
  window.open(url, '_blank', 'noopener')
})

mostrarStep(0, { focar: false })

// ---------- Botão fixo no mobile ----------
// Aparece depois do hero e some enquanto o formulário está visível
const barra = document.querySelector('#barra-fixa')
const barraLink = barra.querySelector('a')
const visivel = new Map()

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => visivel.set(entry.target.id, entry.isIntersecting))
  const mostrar = !visivel.get('inicio') && !visivel.get('analise')
  barra.classList.toggle('translate-y-full', !mostrar)
  barra.setAttribute('aria-hidden', String(!mostrar))
  barraLink.tabIndex = mostrar ? 0 : -1
})
observer.observe(document.querySelector('#inicio'))
observer.observe(document.querySelector('#analise'))

// ---------- Revelação dos elementos ao rolar ----------
const alvos = new Set(document.querySelectorAll('[data-reveal]'))
const secoes = 'main section:not(#inicio)'
document.querySelectorAll(`${secoes} .section-title`).forEach((h) => alvos.add(h.parentElement))
document
  .querySelectorAll(`${secoes} ul.grid > li, ${secoes} ol.grid > li, ${secoes} article, ${secoes} details, ${secoes} figure`)
  .forEach((el) => alvos.add(el))
document.querySelectorAll(`${secoes} img`).forEach((img) => alvos.add(img.closest('.relative') ?? img))
document.querySelectorAll(`${secoes} div.text-center > a.btn-cta`).forEach((a) => alvos.add(a.parentElement))
alvos.add(form.parentElement)

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
    (entries) => entries.forEach((entry) => entry.target.classList.toggle('is-active', entry.isIntersecting)),
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

// Pílula bronze que desliza até o link da seção visível
const nav = header.querySelector('.site-nav')
const indicador = nav.querySelector('.site-nav__indicator')
const linksNav = [...nav.querySelectorAll('a')]
const linksMenu = [...document.querySelectorAll('.menu-mobile__nav a')]
const secaoParaLink = { entenda: 'situacoes' } // seção sem link próprio herda a anterior
let secaoAtiva = null

function marcarAtivo(id) {
  secaoAtiva = id
  const alvo = `#${secaoParaLink[id] ?? id}`
  ;[...linksNav, ...linksMenu].forEach((a) => a.classList.toggle('is-active', a.hash === alvo))
  const link = linksNav.find((a) => a.hash === alvo)
  nav.classList.toggle('has-active', Boolean(link))
  if (link) {
    indicador.style.setProperty('--x', `${link.offsetLeft}px`)
    indicador.style.setProperty('--w', `${link.offsetWidth}px`)
  }
}

const observarSecoes = new IntersectionObserver(
  (entries) => entries.forEach((entry) => entry.isIntersecting && marcarAtivo(entry.target.id)),
  { rootMargin: '-45% 0px -54% 0px' }
)
document.querySelectorAll('main > section[id]').forEach((s) => observarSecoes.observe(s))
window.addEventListener('resize', () => marcarAtivo(secaoAtiva))
document.fonts?.ready.then(() => marcarAtivo(secaoAtiva))

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
