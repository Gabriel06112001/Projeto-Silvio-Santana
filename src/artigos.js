import { WHATSAPP_NUMBER } from './config.js'

// Página de artigos: WhatsApp, ano do rodapé, cabeçalho que vira cápsula ao rolar e proteção das imagens

const MENSAGEM =
  'Olá, Dr. Silvio! Vim pela página de artigos do site e gostaria de saber se posso ter direito à aposentadoria da pessoa com deficiência.'
document
  .querySelectorAll('[data-whatsapp]')
  .forEach((a) => (a.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MENSAGEM)}`))

document.querySelector('#ano').textContent = new Date().getFullYear()

const header = document.querySelector('#site-header')
const atualizar = () => header.classList.toggle('is-scrolled', window.scrollY > 24)
window.addEventListener('scroll', atualizar, { passive: true })
atualizar()

document.addEventListener('contextmenu', (e) => e.preventDefault())
document.addEventListener('dragstart', (e) => {
  if (e.target.closest('img, video')) e.preventDefault()
})
