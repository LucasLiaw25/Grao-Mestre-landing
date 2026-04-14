// ========================
// SISTEMA DE CANVAS OTIMIZADO
// ========================

const canvas = document.getElementById("hero-canvas");
const ctx = canvas.getContext("2d", { alpha: false });

const FRAME_COUNT = 240;
const images = [];
const imageSeq = { frame: 0 };
let imagesLoaded = 0;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawImageCover(img) {
  const canvasWidth = canvas.clientWidth;
  const canvasHeight = canvas.clientHeight;
  const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
  const x = (canvasWidth - img.width * scale) / 2;
  const y = (canvasHeight - img.height * scale) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
}

function render() {
  const frameIndex = Math.min(Math.max(Math.floor(imageSeq.frame), 0), FRAME_COUNT - 1);
  const img = images[frameIndex];
  if (!img || !img.complete) return;
  drawImageCover(img);
}

function preloadFrames() {
  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    const frameNum = String(i).padStart(4, "0");
    img.src = `frames/frame_${frameNum}.webp`;
    img.loading = "eager";

    img.onload = () => {
      imagesLoaded += 1;
      if (imagesLoaded === 1) {
        render();
      }
      if (imagesLoaded === FRAME_COUNT) {
        console.log(`✅ Todas as ${FRAME_COUNT} imagens carregadas`);
      }
      if (imagesLoaded % 30 === 0) {
        console.log(`📦 Carregadas ${imagesLoaded}/${FRAME_COUNT} imagens`);
      }
    };

    images.push(img);
  }
}

resizeCanvas();
preloadFrames();
window.addEventListener("resize", () => {
  resizeCanvas();
  render();
});

// ========================
// GSAP + SCROLLTRIGGER
// ========================

gsap.registerPlugin(ScrollTrigger);

const cardEls = gsap.utils.toArray(".hero-cards .card");

const mainScrollTrigger = {
  trigger: "#hero",
  start: "top top",
  end: "bottom+=4200 top",
  scrub: false,
  pin: true,
};

let frameTween;

gsap.to({ progress: 0 }, {
  progress: 1,
  ease: "none",
  scrollTrigger: {
    ...mainScrollTrigger,
    onUpdate(self) {
      const targetFrame = (FRAME_COUNT - 1) * self.progress;
      if (frameTween) {
        frameTween.kill();
      }
      frameTween = gsap.to(imageSeq, {
        frame: targetFrame,
        duration: 0.8,
        ease: "power3.out",
        onUpdate: render,
      });
    },
  },
});

const textTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom+=4200 top",
    scrub: 0.5,
    pin: false,
  },
});

// Timeline de textos removida - textos não aparecem mais com scroll
// textTimeline
//   .from(".hero-text.text-1", { opacity: 0, y: 90, duration: 1.2, ease: "power4.out" }, 0)
//   .to(".hero-text.text-1", { opacity: 0, y: -80, duration: 0.9, ease: "power3.inOut" }, 1.5)
//   .from(".hero-text.text-2", { opacity: 0, y: 90, duration: 1.1, ease: "power4.out" }, 1.4)
//   .to(".hero-text.text-2", { opacity: 0, y: -80, duration: 0.9, ease: "power3.inOut" }, 2.7)
//   .from(".hero-text.text-3", { opacity: 0, y: 90, duration: 1.1, ease: "power4.out" }, 2.6)
//   .to(".hero-text.text-3", { opacity: 0, y: -80, duration: 0.9, ease: "power3.inOut" }, 3.7)
//   .from(".hero-cards", { opacity: 0, y: 70, duration: 1.2, ease: "power4.out" }, 3.6)
//   .from(cardEls, { opacity: 0, y: 30, stagger: 0.14, duration: 0.8, ease: "power2.out" }, 3.8);

function adaptToDevice() {
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth < 1024;
  const scrubValue = isMobile ? 0.9 : isTablet ? 0.7 : 0.5;

  ScrollTrigger.getAll().forEach((trigger) => {
    if (trigger.vars.scrub !== false) {
      trigger.vars.scrub = scrubValue;
      if (trigger.animation?.vars) {
        trigger.animation.vars.scrub = scrubValue;
      }
    }
  });
}

adaptToDevice();
window.addEventListener("resize", adaptToDevice);

console.log("✨ Sistema de scroll trigger e animação de textos carregado");
console.log(`📹 ${FRAME_COUNT} frames prontos para renderização`);

