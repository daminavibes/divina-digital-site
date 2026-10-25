/* A Faísca, mascote da Divina Digital.
   Monta a estrela (corpo sem olhos + olhos em SVG), faz os olhos seguirem o cursor,
   pisca sozinha e entra "espiando": primeiro as mãozinhas na borda, depois os olhos,
   olha para os lados e se puxa para cima.
   Uso: <div data-faisca data-espelho data-maos data-entrada="espiada" data-sobe="16"></div>
   Medidas dos olhos geradas por tools/make_site_assets.py (em % da largura da imagem). */
(function () {
  "use strict";

  var PROPORCAO = 892 / 935; // altura / largura da arte (estrela inteira)
  var AZUL = "#0e50ef";
  var OLHOS = [
    { cx: 38.3300, cy: 37.8973, rx: 6.1897, ry: 4.9125, ang: 114.60, bx: 2.1323, by: -2.6092, br: 1.4112 },
    { cx: 65.9940, cy: 45.2365, rx: 6.1817, ry: 4.7515, ang: 100.11, bx: 1.4930, by: -2.8661, br: 1.4054 },
  ];
  var DESLOCA = 1.7; // quanto o olho anda dentro do rosto, em % da largura
  var BASE = (document.currentScript && document.currentScript.src.replace(/js\/faisca\.js.*$/, "")) || "assets/";
  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  var ponteiro = { x: -1, y: -1, ultimo: 0 };
  var rigs = [];

  function el(tag, attrs, pai) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (pai) pai.appendChild(e);
    return e;
  }

  /* Mãozinha no mesmo amarelo 3D da estrela: palma redonda e três dedos dobrados por cima
     da borda. Todas as formas usam o mesmo degradê no espaço do desenho (userSpaceOnUse),
     então palma e dedos se fundem sem emenda; o volume vem de uma sombra interna embaixo
     e de um brilho suave em cada dedo. */
  function maoSVG(id) {
    var dedos = [24, 50, 76];
    return (
      '<svg viewBox="0 0 100 80" aria-hidden="true"><defs>' +
      '<radialGradient id="' + id + '" gradientUnits="userSpaceOnUse" cx="38" cy="14" r="78">' +
      '<stop offset="0" stop-color="#FFF27A"/><stop offset="0.45" stop-color="#FFD31F"/><stop offset="1" stop-color="#F0A800"/></radialGradient>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0.45" stop-color="#C98500" stop-opacity="0"/><stop offset="1" stop-color="#C98500" stop-opacity="0.55"/></linearGradient>' +
      "</defs>" +
      '<g fill="url(#' + id + ')">' +
      '<rect x="6" y="26" width="88" height="54" rx="27"/>' +
      dedos.map(function (x) { return '<ellipse cx="' + x + '" cy="25" rx="15.5" ry="17"/>'; }).join("") +
      "</g>" +
      '<rect x="6" y="26" width="88" height="54" rx="27" fill="url(#' + id + 's)"/>' +
      [37, 63].map(function (x) {
        return '<path d="M' + x + ',22 Q' + (x + 0.8) + ',31 ' + x + ',40" stroke="#D08F00" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.45"/>';
      }).join("") +
      dedos.map(function (x) {
        return '<ellipse cx="' + (x - 4) + '" cy="16" rx="6" ry="4" fill="#FFFBD1" opacity="0.75"/>';
      }).join("") +
      "</svg>"
    );
  }

  var contador = 0;
  function montar(raiz) {
    var espelho = raiz.hasAttribute("data-espelho");
    raiz.classList.add("espiada");
    raiz.setAttribute("aria-hidden", "true");

    var estrela = document.createElement("div");
    estrela.className = "espiada__estrela";
    var faisca = document.createElement("div");
    faisca.className = "faisca" + (espelho ? " faisca--espelho" : "");
    var corpo = document.createElement("div");
    corpo.className = "faisca__corpo";
    var img = document.createElement("img");
    img.src = BASE + "img/faisca-corpo-480.webp";
    img.srcset = BASE + "img/faisca-corpo-480.webp 480w, " + BASE + "img/faisca-corpo.webp 900w";
    img.sizes = Math.max(120, Math.round(raiz.getBoundingClientRect().width)) + "px";
    img.alt = "";
    img.width = 900;
    img.height = 859;
    img.decoding = "async";
    if (raiz.hasAttribute("data-lazy")) img.loading = "lazy";
    corpo.appendChild(img);

    var svg = el("svg", { class: "faisca__olhos", viewBox: "0 0 100 " + (100 * PROPORCAO).toFixed(3), "aria-hidden": "true" });
    var olhos = OLHOS.map(function (o) {
      var encaixe = el("g", { transform: "translate(" + o.cx + " " + (o.cy * PROPORCAO).toFixed(3) + ")" }, svg);
      var marca = el("circle", { r: "0.01", fill: "none" }, encaixe); // ponto fixo para medir a posição na tela
      var pupila = el("g", {}, encaixe);
      var pisca = el("g", { class: "pisca" }, pupila);
      el("ellipse", { rx: o.rx, ry: o.ry, transform: "rotate(" + o.ang + ")", fill: AZUL }, pisca);
      var brilho = el("circle", { cx: o.bx, cy: o.by, r: o.br, fill: "#fff" }, pisca);
      return { o: o, marca: marca, pupila: pupila, brilho: brilho, x: 0, y: 0 };
    });
    corpo.appendChild(svg);
    faisca.appendChild(corpo);
    estrela.appendChild(faisca);
    raiz.appendChild(estrela);

    var maos = [];
    if (raiz.hasAttribute("data-maos")) {
      var caixa = document.createElement("div");
      caixa.className = "maos";
      // uma de cada lado do corpo, onde ficariam os bracinhos da estrela
      [0.24, 0.76].forEach(function (k, i) {
        var m = document.createElement("div");
        m.className = "mao mao--" + (i ? "dir" : "esq");
        m.style.left = (k * 100 - 12.5) + "%"; // centra a mão (25% da largura) no ponto k
        m.innerHTML = maoSVG("mao" + contador++ + "_" + i);
        caixa.appendChild(m);
        maos.push(m);
      });
      raiz.appendChild(caixa);
    }

    var rig = {
      raiz: raiz,
      estrela: estrela,
      corpo: corpo,
      svg: svg,
      olhos: olhos,
      maos: maos,
      espelho: espelho,
      visivel: true,
      olhar: null, // direção forçada (na entrada), em -1..1
      ocioso: { x: 0, y: 0.3, ate: 0 },
      inclina: 0,
      sobe: parseFloat(raiz.getAttribute("data-sobe") || "16"),
    };

    // clicar na estrela: pulinho e piscada
    img.style.pointerEvents = "auto";
    img.style.cursor = "pointer";
    img.addEventListener("click", function () {
      piscar(rig);
      if (window.gsap && !reduzido) {
        gsap.fromTo(corpo, { y: 0 }, { y: "-6%", duration: 0.22, ease: "power2.out", yoyo: true, repeat: 1 });
      }
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        rig.visivel = es[0].isIntersecting;
        if (rig.visivel && !rig.entrou) entrar(rig);
      }, { threshold: 0.2 }).observe(raiz);
    } else {
      entrar(rig);
    }
    agendaPiscada(rig);
    rigs.push(rig);
    return rig;
  }

  function piscar(rig, duplo) {
    rig.svg.classList.add("piscando");
    setTimeout(function () {
      rig.svg.classList.remove("piscando");
      if (duplo) setTimeout(function () { piscar(rig); }, 160);
    }, 130);
  }

  function agendaPiscada(rig) {
    setTimeout(function () {
      if (rig.visivel && !document.hidden) piscar(rig, Math.random() < 0.2);
      agendaPiscada(rig);
    }, 2400 + Math.random() * 3200);
  }

  /* entrada: mãos → espia → olha pros lados → se puxa pra cima */
  function entrar(rig) {
    rig.entrou = true;
    var final = rig.sobe;
    rig.estrela.style.transform = "none";
    if (!window.gsap || reduzido || rig.raiz.getAttribute("data-entrada") !== "espiada") {
      if (window.gsap) gsap.set(rig.estrela, { yPercent: final });
      else rig.estrela.style.transform = "translateY(" + final + "%)";
      return;
    }
    var maos = rig.maos;
    var tl = gsap.timeline({ delay: parseFloat(rig.raiz.getAttribute("data-atraso") || "0.3") });
    gsap.set(rig.estrela, { yPercent: 100 });
    if (maos.length) gsap.set(maos, { yPercent: 140 });
    if (maos.length) tl.to(maos, { yPercent: 0, duration: 0.5, ease: "back.out(1.7)", stagger: 0.12 });
    tl.to(rig.estrela, { yPercent: 68, duration: 0.7, ease: "power2.out" }, "+=0.15"); // pontinha da cabeça
    tl.to(rig.estrela, { yPercent: 52, duration: 0.6, ease: "sine.inOut" }); // os olhinhos aparecem
    tl.call(function () { rig.olhar = { x: -1, y: 0.2 }; }, null, "+=0.15");
    tl.call(function () { rig.olhar = { x: 1, y: 0.2 }; }, null, "+=0.55");
    tl.call(function () { rig.olhar = { x: 0, y: -0.2 }; piscar(rig); }, null, "+=0.55");
    if (maos.length) tl.to(maos, { scaleY: 0.86, duration: 0.14, yoyo: true, repeat: 1, ease: "sine.inOut" }, "+=0.25"); // aperta a borda
    tl.to(rig.estrela, { yPercent: final, duration: 0.75, ease: "back.out(1.6)" }, ">-0.05"); // se puxa pra cima
    tl.call(function () { rig.olhar = null; }, null, "+=0.1");
  }

  /* olhos seguindo o cursor (ou passeando sozinhos quando não há cursor) */
  function quadro(t) {
    var temPonteiro = ponteiro.x >= 0 && t - ponteiro.ultimo < 5000;
    for (var r = 0; r < rigs.length; r++) {
      var rig = rigs[r];
      if (!rig.visivel) continue;
      var largura = rig.svg.getBoundingClientRect().width || 1;
      var somaX = 0;
      for (var i = 0; i < rig.olhos.length; i++) {
        var o = rig.olhos[i];
        var alvoX, alvoY;
        if (rig.olhar) {
          alvoX = rig.olhar.x; alvoY = rig.olhar.y;
        } else if (temPonteiro) {
          var c = o.marca.getBoundingClientRect();
          var dx = ponteiro.x - c.left, dy = ponteiro.y - c.top;
          var d = Math.hypot(dx, dy) || 1;
          var forca = Math.min(d / (largura * 0.6), 1);
          alvoX = (dx / d) * forca; alvoY = (dy / d) * forca;
        } else {
          if (t > rig.ocioso.ate) {
            var a = Math.random() * Math.PI * 2, f = 0.3 + Math.random() * 0.6;
            rig.ocioso = { x: Math.cos(a) * f, y: Math.sin(a) * f * 0.7, ate: t + 1400 + Math.random() * 2200 };
          }
          alvoX = rig.ocioso.x; alvoY = rig.ocioso.y;
        }
        if (rig.espelho) alvoX = -alvoX; // o desenho está espelhado
        var k = reduzido ? 1 : 0.16;
        o.x += (alvoX * DESLOCA - o.x) * k;
        o.y += (alvoY * DESLOCA - o.y) * k;
        o.pupila.setAttribute("transform", "translate(" + o.x.toFixed(3) + " " + o.y.toFixed(3) + ")");
        o.brilho.setAttribute("transform", "translate(" + (o.x * 0.25).toFixed(3) + " " + (o.y * 0.25).toFixed(3) + ")");
        somaX += o.x;
      }
      // o corpo acompanha de leve, como quem vira a cabeça
      var alvoInc = reduzido ? 0 : (somaX / rig.olhos.length / DESLOCA) * 3;
      rig.inclina += (alvoInc - rig.inclina) * 0.08;
      rig.corpo.style.transform = (rig.espelho ? "scaleX(-1) " : "") + "rotate(" + rig.inclina.toFixed(2) + "deg)";
    }
  }
  // usa o relógio do GSAP quando ele existe (fica em sincronia com as outras animações)
  function rodar() {
    if (window.gsap) gsap.ticker.add(function () { quadro(performance.now()); });
    else (function laco(t) { quadro(t); requestAnimationFrame(laco); })(performance.now());
  }

  window.addEventListener("pointermove", function (e) {
    ponteiro.x = e.clientX; ponteiro.y = e.clientY; ponteiro.ultimo = performance.now();
  }, { passive: true });
  window.addEventListener("pointerdown", function (e) {
    ponteiro.x = e.clientX; ponteiro.y = e.clientY; ponteiro.ultimo = performance.now();
  }, { passive: true });

  function iniciar() {
    document.querySelectorAll("[data-faisca]").forEach(montar);
    if (rigs.length) rodar();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();

  window.Faisca = { piscar: function () { rigs.forEach(function (r) { piscar(r); }); } };
})();
