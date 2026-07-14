import './style.css'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

const services = [
  {
    name: 'Strategy',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    alt: 'Team planning strategy on a whiteboard with sticky notes',
    desc: 'We work closely with our clients to uncover what truly defines their brand. Through shared exploration, we find the idea that guides how it speaks and acts.',
  },
  {
    name: 'Brand Identity',
    image:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80',
    alt: 'Colour palettes and brand identity materials on a designer desk',
    desc: 'A brand is more than a logo. We craft complete identities — voice, colour and visual language — that make a brand instantly recognisable everywhere it shows up.',
  },
  {
    name: 'Design',
    image:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    alt: 'Designer sketching interface wireframes with a pen',
    desc: 'From print to product, we design with intent. Every layout, typeface and detail is considered, so the work feels effortless and unmistakably on-brand.',
  },
  {
    name: 'Film',
    image:
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    alt: 'Film clapperboard held up before a take',
    desc: 'Stories move people. We concept, direct and produce films that bring brands to life — from quick social cuts to full campaign productions.',
  },
  {
    name: 'Digital',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    alt: 'Laptop showing a digital analytics dashboard',
    desc: 'Websites, campaigns and experiences built to connect. We translate brand thinking into digital products that people genuinely enjoy using.',
  },
]

document.querySelector('#app').innerHTML = `
<section class="services">
  <figure class="services__media">
    <div class="services__media-layer">
      <img src="${services[0].image}" alt="${services[0].alt}" />
    </div>
  </figure>

  <div class="services__content">
    <nav class="services__list" aria-label="Our services">
      ${services
        .map(
          (s, i) =>
            `<button type="button" class="services__item${i === 0 ? ' is-active' : ''}" data-index="${i}"${i === 0 ? ' aria-current="true"' : ''}>${s.name}</button>`
        )
        .join('\n      ')}
    </nav>

    <div class="services__desc-wrap">
      <p class="services__desc">${services[0].desc}</p>
    </div>
  </div>
</section>
`

const media = document.querySelector('.services__media')
const descWrap = document.querySelector('.services__desc-wrap')
const buttons = [...document.querySelectorAll('.services__item')]

// preload every image so switching feels instant
services.forEach((s) => {
  const img = new Image()
  img.src = s.image
})

let active = 0
let currentDesc = document.querySelector('.services__desc')

function swapImage(service) {
  // each swap gets its own layer stacked on top, so fast clicks just
  // produce overlapping wipes instead of cancelled/broken ones
  const layer = document.createElement('div')
  layer.className = 'services__media-layer'
  const img = new Image()
  img.src = service.image
  img.alt = service.alt
  layer.appendChild(img)
  media.appendChild(layer)

  gsap.set(layer, { clipPath: 'inset(0% 100% 0% 0%)' })
  gsap.set(img, { scale: 1.25 })

  gsap
    .timeline({
      defaults: { duration: 0.8, ease: 'power3.inOut' },
      onComplete: () => {
        // this layer now fully covers everything beneath it
        while (layer.previousElementSibling) layer.previousElementSibling.remove()
      },
    })
    .to(layer, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
    .to(img, { scale: 1 }, 0)
}

function swapDesc(text) {
  const oldDesc = currentDesc
  if (oldDesc) {
    // reuse the live split if it is still mid-animation, otherwise split fresh
    const oldSplit =
      oldDesc._split || new SplitText(oldDesc, { type: 'lines', mask: 'lines' })
    gsap.killTweensOf(oldSplit.lines)
    gsap.to(oldSplit.lines, {
      yPercent: -110,
      duration: 0.3,
      stagger: 0.035,
      ease: 'none',
      onComplete: () => oldDesc.remove(),
    })
  }

  const p = document.createElement('p')
  p.className = 'services__desc'
  p.textContent = text
  descWrap.appendChild(p)

  const split = new SplitText(p, { type: 'lines', mask: 'lines' })
  p._split = split
  gsap.set(split.lines, { yPercent: 110 })
  gsap.to(split.lines, {
    yPercent: 0,
    duration: 0.55,
    stagger: 0.06,
    ease: 'power3.out',
    delay: 0.1,
    onComplete: () => {
      // unwrap once settled so text reflows naturally on resize
      split.revert()
      delete p._split
    },
  })

  currentDesc = p
}

function setActive(index) {
  if (index === active) return
  active = index

  buttons.forEach((btn, i) => {
    btn.classList.toggle('is-active', i === index)
    if (i === index) btn.setAttribute('aria-current', 'true')
    else btn.removeAttribute('aria-current')
  })

  const service = services[index]
  swapImage(service)
  swapDesc(service.desc)
}

document.querySelector('.services__list').addEventListener('click', (e) => {
  const btn = e.target.closest('.services__item')
  if (btn) setActive(Number(btn.dataset.index))
})
