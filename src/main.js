import "./style.css";
import "./demo.css"; // showcase page styles only — do NOT copy into your project
import "./spacer.css"; // showcase spacer sections only — do NOT copy into your project
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// registering twice is harmless — safe even if the host site registers too
gsap.registerPlugin(SplitText, ScrollTrigger);

/* ---------------------------------------------------------------------------
   Smooth scrolling (optional)

   - Set SMOOTH_SCROLL to false if the host site manages its own scrolling.
   - If the site already runs Lenis (exposed as window.lenis, the common
     convention), that instance is reused — two Lenis instances would fight
     over wheel events and break scrolling.
   - The global GSAP tweaks (ticker driving, lagSmoothing) are applied ONLY
     when this component creates and owns the Lenis instance.
--------------------------------------------------------------------------- */

const SMOOTH_SCROLL = true;

if (SMOOTH_SCROLL && !window.lenis) {
  const lenis = new Lenis({ autoRaf: false, anchors: true });
  window.lenis = lenis; // expose so other scripts (or a second copy) reuse it
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

const services = [
  {
    name: "Strategy",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    alt: "Team planning strategy on a whiteboard with sticky notes",
    desc: "We work closely with our clients to uncover what truly defines their brand. Through shared exploration, we find the idea that guides how it speaks and acts.",
    link: "#strategy",
  },
  {
    name: "Brand Identity",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
    alt: "Colour palettes and brand identity materials on a designer desk",
    desc: "A brand is more than a logo. We craft complete identities — voice, colour and visual language — that make a brand instantly recognisable everywhere it shows up.",
    link: "#brand-identity",
  },
  {
    name: "Design",
    image:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
    alt: "Designer sketching interface wireframes with a pen",
    desc: "From print to product, we design with intent. Every layout, typeface and detail is considered, so the work feels effortless and unmistakably on-brand.",
    link: "#design",
  },
  {
    name: "Film",
    image:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    alt: "Film clapperboard held up before a take",
    desc: "Stories move people. We concept, direct and produce films that bring brands to life — from quick social cuts to full campaign productions.",
    link: "#film",
  },
  {
    name: "Digital",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    alt: "Laptop showing a digital analytics dashboard",
    desc: "Websites, campaigns and experiences built to connect. We translate brand thinking into digital products that people genuinely enjoy using.",
    link: "#digital",
  },
];

/* ---------------------------------------------------------------------------
   Services section

   Everything lives inside gsap.context() scoped to the .mfa-services element:
   - selector strings in tweens only match INSIDE this section, so they can
     never touch the host site's own elements or animations
   - the returned cleanup() reverts every tween/ScrollTrigger and removes
     every listener this component added (useful for SPA route changes)
--------------------------------------------------------------------------- */

function initServices() {
  const section = document.querySelector(".mfa-services");
  if (!section) return () => {};

  // every listener is registered through this helper so cleanup can undo it
  const teardowns = [];
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    teardowns.push(() => target.removeEventListener(type, fn, opts));
  };

  const ctx = gsap.context(() => {
    const media = section.querySelector(".mfa-services__media");
    const descWrap = section.querySelector(".mfa-services__desc-wrap");
    const list = section.querySelector(".mfa-services__list");
    const buttons = [...section.querySelectorAll(".mfa-services__item")];
    const cta = section.querySelector(".mfa-services__cta");
    const ctaArrow = cta.querySelector("svg");
    const indicator = section.querySelector(".mfa-services__indicator");

    // preload every image so switching feels instant
    services.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });

    let active = 0;
    let currentDesc = section.querySelector(".mfa-services__desc");

    /* ---------- white strip indicator ---------- */

    // glide the single white strip over a title row; mix-blend-mode:
    // difference inverts the covered row, so its text flips dark automatically
    function moveStrip(index, instant = false) {
      const item = buttons[index];
      const props = { y: item.offsetTop, height: item.offsetHeight };
      if (instant) gsap.set(indicator, props);
      else
        gsap.to(indicator, {
          ...props,
          duration: 0.4,
          ease: "power3.out",
          overwrite: true,
        });
    }

    // row heights depend on fonts/viewport, so re-anchor when they settle
    on(window, "load", () => moveStrip(active, true));
    on(window, "resize", () => moveStrip(active, true));
    moveStrip(0, true);

    /* ---------- arrow cta ---------- */

    function swapArrow() {
      // redirect any in-flight swap from its current position — no snapping
      gsap.killTweensOf(ctaArrow);
      gsap
        .timeline({ defaults: { ease: "none" } })
        .to(ctaArrow, { x: 46, y: -46, duration: 0.12 })
        .set(ctaArrow, { x: -46, y: 46 })
        .to(ctaArrow, { x: 0, y: 0, duration: 0.16 });
    }

    /* ---------- scroll reveal (plays once) ---------- */

    const revealLayer = media.querySelector(".mfa-services__media-layer");
    const revealImg = revealLayer.querySelector("img");

    // hide everything before the reveal
    gsap.set(revealLayer, { clipPath: "inset(50%)" });
    gsap.set(revealImg, { scale: 1.3 });
    gsap.set(".mfa-services__eyebrow", { autoAlpha: 0, y: 24 });
    gsap.set(".mfa-services__item", { autoAlpha: 0, y: 64 });
    gsap.set(indicator, { autoAlpha: 0 });
    gsap.set(currentDesc, { autoAlpha: 0 });
    gsap.set(cta, { autoAlpha: 0, scale: 0.6 });

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
        // stagger: 0.07,
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
          { clipPath: "inset(0%)", duration: 1, ease: "power3.inOut" },
          0,
        )
        .to(revealImg, { scale: 1, duration: 1.8, ease: "power2.out" }, 0)
        .to(
          ".mfa-services__eyebrow",
          { autoAlpha: 1, y: 0, duration: 0.6 },
          0.2,
        )
        .to(
          ".mfa-services__item",
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09 },
          0.3,
        )
        .add(() => moveStrip(active, true), 0.3)
        .to(indicator, { autoAlpha: 1, duration: 0.5 }, 0.9)
        .add(revealDesc, 0.65)
        .to(
          cta,
          { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)" },
          0.8,
        );
    }

    ScrollTrigger.create({
      trigger: section,
      start: "top 65%",
      once: true,
      onEnter: playReveal,
    });

    /* ---------- image swap ---------- */

    function swapImage(service) {
      // each swap gets its own layer stacked on top, so fast clicks just
      // produce overlapping reveals instead of cancelled/broken ones
      const layer = document.createElement("div");
      layer.className = "mfa-services__media-layer";
      const img = new Image();
      img.src = service.image;
      img.alt = service.alt;
      layer.appendChild(img);
      media.appendChild(layer);

      // the new image expands out of the center over the old one
      gsap.set(layer, { clipPath: "inset(50%)" });
      gsap.set(img, { scale: 1.25 });

      gsap
        .timeline({
          onComplete: () => {
            // this layer now fully covers everything beneath it
            while (layer.previousElementSibling)
              layer.previousElementSibling.remove();
          },
        })
        .to(layer, { clipPath: "inset(0%)", duration: 1, ease: "circ.out" }, 0)
        .to(img, { scale: 1, duration: 1, ease: "power2.out" }, 0);
    }

    /* ---------- description swap ---------- */

    function swapDesc(text) {
      const oldDesc = currentDesc;
      if (oldDesc) {
        // reuse the live split if still mid-animation, otherwise split fresh
        const oldSplit =
          oldDesc._split ||
          new SplitText(oldDesc, { type: "lines", mask: "lines" });
        gsap.killTweensOf(oldSplit.lines);
        gsap.to(oldSplit.lines, {
          yPercent: -110,
          duration: 0.2,
          // stagger: 0.035,
          ease: "none",
          onComplete: () => oldDesc.remove(),
        });
      }

      const p = document.createElement("p");
      p.className = "mfa-services__desc";
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

    /* ---------- activation ---------- */

    function setActive(index) {
      if (index === active) return;
      active = index;

      buttons.forEach((btn, i) => {
        btn.classList.toggle("mfa-is-active", i === index);
        if (i === index) btn.setAttribute("aria-current", "true");
        else btn.removeAttribute("aria-current");
      });

      const service = services[index];
      cta.setAttribute("href", service.link);
      cta.setAttribute("aria-label", `View ${service.name} service`);
      swapImage(service);
      swapDesc(service.desc);
      swapArrow();
      moveStrip(index);
    }

    on(list, "click", (e) => {
      const btn = e.target.closest(".mfa-services__item");
      if (btn) setActive(Number(btn.dataset.index));
    });

    /* ---------- superhover: activate on hover, even while scrolling ------ */

    // browsers don't update :hover or fire hover events when the page scrolls
    // under a still cursor, so track the pointer and hit-test it on both
    // pointer moves and scroll frames, driving hover state via a class
    let pointerX = -1;
    let pointerY = -1;
    let hovered = null;

    function setHovered(btn) {
      if (btn === hovered) return;
      if (hovered) hovered.classList.remove("mfa-is-hovered");
      hovered = btn;
      if (hovered) hovered.classList.add("mfa-is-hovered");
    }

    function updateHover() {
      if (pointerX < 0) return;
      const el = document.elementFromPoint(pointerX, pointerY);
      let btn = el ? el.closest(".mfa-services__item") : null;
      // ignore matches outside this section — the host site may happen to
      // use the same class name elsewhere
      if (btn && !section.contains(btn)) btn = null;
      setHovered(btn);
      if (btn) setActive(Number(btn.dataset.index));
    }

    on(
      window,
      "pointermove",
      (e) => {
        pointerX = e.clientX;
        pointerY = e.clientY;
        updateHover();
      },
      { passive: true },
    );

    on(window, "scroll", updateHover, { passive: true });
  }, section);

  return () => {
    teardowns.forEach((off) => off());
    ctx.revert();
  };
}

initServices();
