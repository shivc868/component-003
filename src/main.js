import "./style.css";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

const services = [
  {
    name: "Strategy",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    alt: "Team planning strategy on a whiteboard with sticky notes",
    desc: "We work closely with our clients to uncover what truly defines their brand. Through shared exploration, we find the idea that guides how it speaks and acts.",
  },
  {
    name: "Brand Identity",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
    alt: "Colour palettes and brand identity materials on a designer desk",
    desc: "A brand is more than a logo. We craft complete identities — voice, colour and visual language — that make a brand instantly recognisable everywhere it shows up.",
  },
  {
    name: "Design",
    image:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
    alt: "Designer sketching interface wireframes with a pen",
    desc: "From print to product, we design with intent. Every layout, typeface and detail is considered, so the work feels effortless and unmistakably on-brand.",
  },
  {
    name: "Film",
    image:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    alt: "Film clapperboard held up before a take",
    desc: "Stories move people. We concept, direct and produce films that bring brands to life — from quick social cuts to full campaign productions.",
  },
  {
    name: "Digital",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    alt: "Laptop showing a digital analytics dashboard",
    desc: "Websites, campaigns and experiences built to connect. We translate brand thinking into digital products that people genuinely enjoy using.",
  },
];

document.querySelector("#app").innerHTML = `
<section class="spacer" id="top">
  <span class="spacer__badge">Made for Award</span>
  <h1 class="spacer__title">Built to <em>win</em></h1>
  <p class="spacer__text">
    Every component here is crafted with award-grade precision — the kind of
    motion that turns heads and earns recognition. Keep scrolling; the section
    ahead pins in place and reveals each expertise as you move.
  </p>
  <div class="spacer__actions">
    <a class="btn btn--primary" href="#">Get Code</a>
    <a class="btn btn--ghost" href="#">Back to Collections</a>
  </div>
  <div class="spacer__scroll">
    <span>Scroll</span>
    <span class="spacer__mouse"></span>
  </div>
</section>

<section class="services">
  <figure class="services__media">
    <div class="services__media-layer">
      <img src="${services[0].image}" alt="${services[0].alt}" />
    </div>
  </figure>

  <div class="services__content">
    <nav class="services__list" aria-label="Our services">
      <span class="services__eyebrow">( Our Services )</span>
      ${services
        .map(
          (s, i) =>
            `<button type="button" class="services__item${i === 0 ? " is-active" : ""}" data-index="${i}"${i === 0 ? ' aria-current="true"' : ""}>${s.name}</button>`,
        )
        .join("\n      ")}
    </nav>

    <div class="services__desc-wrap">
      <p class="services__desc">${services[0].desc}</p>
    </div>
  </div>
</section>

<section class="spacer">
  <span class="spacer__badge">End of Showcase</span>
  <h2 class="spacer__title">Ready to <em>ship</em></h2>
  <p class="spacer__text">
    That's the full expertise reel. Grab the code, drop it into your project,
    and go make something worth an award.
  </p>
  <div class="spacer__actions">
    <a class="btn btn--primary" href="#">Get Code</a>
    <a class="btn btn--ghost" href="#top">Back to Top</a>
  </div>
</section>
`;

const media = document.querySelector(".services__media");
const descWrap = document.querySelector(".services__desc-wrap");
const buttons = [...document.querySelectorAll(".services__item")];

// preload every image so switching feels instant
services.forEach((s) => {
  const img = new Image();
  img.src = s.image;
});

let active = 0;
let currentDesc = document.querySelector(".services__desc");

/* ---------- scroll reveal (plays once) ---------- */

const revealLayer = media.querySelector(".services__media-layer");
const revealImg = revealLayer.querySelector("img");

// hide everything before the reveal
gsap.set(revealLayer, { clipPath: "inset(0% 100% 0% 0%)" });
gsap.set(revealImg, { scale: 1.3 });
gsap.set(".services__eyebrow", { autoAlpha: 0, y: 24 });
gsap.set(".services__item", { autoAlpha: 0, y: 64 });
gsap.set(currentDesc, { autoAlpha: 0 });

function revealDesc() {
  const p = currentDesc;
  if (!p) return;
  const split = new SplitText(p, { type: "lines", mask: "lines" });
  p._split = split;
  gsap.set(p, { autoAlpha: 1 });
  gsap.set(split.lines, { yPercent: 110 });
  gsap.to(split.lines, {
    yPercent: 0,
    duration: 0.7,
    stagger: 0.07,
    ease: "power3.out",
    onComplete: () => {
      split.revert();
      delete p._split;
    },
  });
}

function playReveal() {
  gsap
    .timeline({ defaults: { ease: "power3.out" } })
    .to(
      revealLayer,
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power3.inOut" },
      0,
    )
    .to(revealImg, { scale: 1, duration: 1.8, ease: "power2.out" }, 0)
    .to(".services__eyebrow", { autoAlpha: 1, y: 0, duration: 0.6 }, 0.2)
    .to(
      ".services__item",
      { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09 },
      0.3,
    )
    .add(revealDesc, 0.65);
}

ScrollTrigger.create({
  trigger: ".services",
  start: "top 65%",
  once: true,
  onEnter: playReveal,
});

function swapImage(service) {
  // each swap gets its own layer stacked on top, so fast clicks just
  // produce overlapping wipes instead of cancelled/broken ones
  const layer = document.createElement("div");
  layer.className = "services__media-layer";
  const img = new Image();
  img.src = service.image;
  img.alt = service.alt;
  layer.appendChild(img);
  media.appendChild(layer);

  gsap.set(layer, { clipPath: "inset(0% 100% 0% 0%)" });
  gsap.set(img, { scale: 1.25 });

  gsap
    .timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        // this layer now fully covers everything beneath it
        while (layer.previousElementSibling)
          layer.previousElementSibling.remove();
      },
    })
    .to(layer, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6 }, 0)
    .to(img, { scale: 1, duration: 1, ease: "power2.out" }, 0);
}

function swapDesc(text) {
  const oldDesc = currentDesc;
  if (oldDesc) {
    // reuse the live split if it is still mid-animation, otherwise split fresh
    const oldSplit =
      oldDesc._split ||
      new SplitText(oldDesc, { type: "lines", mask: "lines" });
    gsap.killTweensOf(oldSplit.lines);
    gsap.to(oldSplit.lines, {
      yPercent: -110,
      duration: 0.2,
      stagger: 0.035,
      ease: "none",
      onComplete: () => oldDesc.remove(),
    });
  }

  const p = document.createElement("p");
  p.className = "services__desc";
  p.textContent = text;
  descWrap.appendChild(p);

  const split = new SplitText(p, { type: "lines", mask: "lines" });
  p._split = split;
  gsap.set(split.lines, { yPercent: 110 });
  gsap.to(split.lines, {
    yPercent: 0,
    duration: 0.55,
    stagger: 0.06,
    ease: "power3.out",
    delay: 0.1,
    onComplete: () => {
      // unwrap once settled so text reflows naturally on resize
      split.revert();
      delete p._split;
    },
  });

  currentDesc = p;
}

function setActive(index) {
  if (index === active) return;
  active = index;

  buttons.forEach((btn, i) => {
    btn.classList.toggle("is-active", i === index);
    if (i === index) btn.setAttribute("aria-current", "true");
    else btn.removeAttribute("aria-current");
  });

  const service = services[index];
  swapImage(service);
  swapDesc(service.desc);
}

document.querySelector(".services__list").addEventListener("click", (e) => {
  const btn = e.target.closest(".services__item");
  if (btn) setActive(Number(btn.dataset.index));
});
