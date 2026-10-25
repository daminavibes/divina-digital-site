/* Divina Digital · comportamento das páginas (menu, entradas, contadores, gráficos,
   abas, simulador e formulário que abre o WhatsApp). GSAP é opcional: sem ele tudo
   aparece no estado final. */
(function () {
  "use strict";

  var WHATSAPP = "5548996448476";
  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var temGsap = !!(window.gsap && window.ScrollTrigger);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- cabeçalho ---------- */
  var topo = $(".topo");
  function aoRolar() { if (topo) topo.classList.toggle("rolou", window.scrollY > 20); }
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  var botaoMenu = $(".menu-botao");
  if (botaoMenu) {
    var menuAberto = function (sim) {
      topo.classList.toggle("aberto", sim);
      document.documentElement.classList.toggle("menu-aberto", sim);
      botaoMenu.setAttribute("aria-expanded", sim ? "true" : "false");
      botaoMenu.setAttribute("aria-label", sim ? "Fechar menu" : "Abrir menu");
    };
    botaoMenu.addEventListener("click", function () { menuAberto(!topo.classList.contains("aberto")); });
    $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { menuAberto(false); }); });
    // tocar fora do menu fecha
    document.addEventListener("click", function (e) {
      if (topo.classList.contains("aberto") && !topo.contains(e.target)) menuAberto(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && topo.classList.contains("aberto")) { menuAberto(false); botaoMenu.focus(); }
    });
  }

  $$("[data-ano]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* ---------- links de WhatsApp com mensagem pronta ---------- */
  function linkZap(msg) { return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg); }
  $$("[data-zap]").forEach(function (a) {
    a.href = linkZap(a.getAttribute("data-zap") || "Olá! Vim pelo site da Divina Digital e quero um orçamento.");
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------- números que contam ---------- */
  function formata(v, casas) {
    return v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  }
  function contar(e) {
    if (e.dataset.contou) return;
    e.dataset.contou = "1";
    var alvo = parseFloat(e.dataset.conta), casas = parseInt(e.dataset.casas || "0", 10);
    var pre = e.dataset.pre || "", pos = e.dataset.pos || "";
    if (reduzido || !temGsap) { e.textContent = pre + formata(alvo, casas) + pos; return; }
    var obj = { v: 0 };
    gsap.to(obj, {
      v: alvo, duration: 1.6, ease: "power2.out",
      onUpdate: function () { e.textContent = pre + formata(obj.v, casas) + pos; },
    });
  }

  /* ---------- linhas de gráfico que se desenham ---------- */
  function prepararLinha(p) {
    var L = p.getTotalLength();
    p.style.strokeDasharray = L;
    p.style.strokeDashoffset = L;
    p.dataset.comp = L;
  }
  function desenhar(svg) {
    if (svg.dataset.desenhou) return;
    svg.dataset.desenhou = "1";
    $$("[data-linha]", svg).forEach(function (p, i) {
      if (!temGsap || reduzido) { p.style.strokeDashoffset = 0; return; }
      gsap.to(p, { strokeDashoffset: 0, duration: 1.8, delay: i * 0.25, ease: "power2.inOut" });
    });
    $$("[data-area]", svg).forEach(function (a) {
      if (!temGsap || reduzido) { a.style.opacity = 1; return; }
      gsap.fromTo(a, { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 0.8 });
    });
    $$("[data-ponto]", svg).forEach(function (c, i, todos) {
      if (!temGsap || reduzido) { c.style.opacity = 1; return; }
      gsap.fromTo(c, { scale: 0, opacity: 0, transformOrigin: "center", transformBox: "fill-box" },
        { scale: 1, opacity: 1, duration: 0.35, delay: 0.2 + (1.6 * i) / todos.length, ease: "back.out(2.5)" });
    });
  }

  function crescer(alvo) {
    if (alvo.dataset.cresceu) return;
    alvo.dataset.cresceu = "1";
    var itens = $$("[data-barra]", alvo);
    if (!temGsap || reduzido) return;
    gsap.fromTo(itens, { scaleY: 0, scaleX: function (i, e) { return e.dataset.barra === "x" ? 0 : 1; } },
      { scaleY: 1, scaleX: 1, duration: 1, ease: "power3.out", stagger: 0.09 });
  }

  function ativarDados(raiz) {
    $$("[data-conta]", raiz).forEach(contar);
    if (raiz.matches && raiz.matches("[data-conta]")) contar(raiz);
    $$("svg[data-desenha]", raiz).forEach(desenhar);
    if (raiz.matches && raiz.matches("svg[data-desenha]")) desenhar(raiz);
    $$("[data-cresce]", raiz).forEach(crescer);
    if (raiz.matches && raiz.matches("[data-cresce]")) crescer(raiz);
  }

  $$("svg[data-desenha] [data-linha]").forEach(prepararLinha);
  $$("svg[data-desenha] [data-area], svg[data-desenha] [data-ponto]").forEach(function (e) { e.style.opacity = 0; });

  var observaDados = "IntersectionObserver" in window
    ? new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { ativarDados(en.target); observaDados.unobserve(en.target); } });
      }, { threshold: 0.35 })
    : null;
  $$("[data-conta], svg[data-desenha], [data-cresce]").forEach(function (e) {
    if (observaDados) observaDados.observe(e); else ativarDados(e);
  });

  /* ---------- entradas com GSAP ---------- */
  if (temGsap && !reduzido) {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("anima");

    // o título e o texto do herói entram por CSS (style.css), sem esperar este script

    ScrollTrigger.batch("[data-revela]", {
      start: "top 88%",
      once: true,
      onEnter: function (lote) {
        gsap.to(lote, { opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.1, overwrite: true });
      },
    });

    // linha do processo enchendo conforme rola
    $$(".passos").forEach(function (p) {
      gsap.fromTo(p, { "--progresso": 0 }, {
        "--progresso": 1, ease: "none",
        scrollTrigger: { trigger: p, start: "top 75%", end: "bottom 60%", scrub: 0.6 },
      });
    });

    // estrela do herói afunda um pouco ao rolar (paralaxe)
    var palco = $(".heroi__palco");
    if (palco) {
      gsap.to(palco, { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".heroi", start: "top top", end: "bottom top", scrub: true } });
    }

    // brilhos do herói piscando
    $$(".brilho-estrela").forEach(function (b) {
      gsap.fromTo(b, { scale: 0.4, opacity: 0.15, rotate: 0 }, {
        scale: 1, opacity: 0.9, rotate: 45, duration: 1.4 + Math.random() * 1.6,
        repeat: -1, yoyo: true, ease: "sine.inOut", delay: Math.random() * 2,
      });
    });
  }

  /* ---------- abas ---------- */
  $$("[role=tablist]").forEach(function (lista) {
    var abas = $$("[role=tab]", lista);
    function seleciona(aba, foco) {
      abas.forEach(function (a) {
        var sel = a === aba;
        a.setAttribute("aria-selected", sel ? "true" : "false");
        a.tabIndex = sel ? 0 : -1;
        var painel = document.getElementById(a.getAttribute("aria-controls"));
        if (painel) {
          painel.hidden = !sel;
          if (sel) {
            $$("[data-contou]", painel).forEach(function (e) { delete e.dataset.contou; });
            $$("[data-desenhou]", painel).forEach(function (e) { delete e.dataset.desenhou; $$("[data-linha]", e).forEach(prepararLinha); });
            $$("[data-cresceu]", painel).forEach(function (e) { delete e.dataset.cresceu; });
            ativarDados(painel);
          }
        }
      });
      if (foco) aba.focus();
    }
    abas.forEach(function (a, i) {
      a.addEventListener("click", function () { seleciona(a); });
      a.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = abas[(i + 1) % abas.length];
        if (e.key === "ArrowLeft") n = abas[(i - 1 + abas.length) % abas.length];
        if (e.key === "Home") n = abas[0];
        if (e.key === "End") n = abas[abas.length - 1];
        if (n) { e.preventDefault(); seleciona(n, true); }
      });
    });
  });

  /* ---------- simulador de campanha ---------- */
  var sim = $("[data-simulador]");
  if (sim) {
    var campos = {
      verba: $("#sim-verba", sim), cpl: $("#sim-cpl", sim), conv: $("#sim-conv", sim), ticket: $("#sim-ticket", sim),
    };
    var saidas = {
      leads: $("[data-sim=leads]", sim), vendas: $("[data-sim=vendas]", sim),
      investe: $("[data-sim=investe]", sim), receita: $("[data-sim=receita]", sim),
    };
    var reais = function (v) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); };
    function calcula() {
      var verba = +campos.verba.value, cpl = +campos.cpl.value, conv = +campos.conv.value / 100, ticket = +campos.ticket.value;
      $("[for=sim-verba] output", sim).textContent = reais(verba) + "/dia";
      $("[for=sim-cpl] output", sim).textContent = reais(cpl);
      $("[for=sim-conv] output", sim).textContent = (conv * 100).toLocaleString("pt-BR") + "%";
      $("[for=sim-ticket] output", sim).textContent = reais(ticket);
      var mes = verba * 30;
      var leads = Math.floor(mes / cpl);
      var vendas = Math.floor(leads * conv);
      saidas.investe.textContent = reais(mes);
      saidas.leads.textContent = leads.toLocaleString("pt-BR");
      saidas.vendas.textContent = vendas.toLocaleString("pt-BR");
      saidas.receita.textContent = reais(vendas * ticket);
    }
    Object.keys(campos).forEach(function (k) { campos[k].addEventListener("input", calcula); });
    calcula();
  }

  /* ---------- formulário → WhatsApp ---------- */
  var form = $("[data-form-zap]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$("[required]", form).forEach(function (c) {
        var erro = document.getElementById(c.id + "-erro");
        var valido = c.value.trim().length > 1;
        c.setAttribute("aria-invalid", valido ? "false" : "true");
        if (erro) erro.hidden = valido;
        if (!valido && ok) { c.focus(); ok = false; }
      });
      if (!ok) return;
      var servicos = $$("input[name=servico]:checked", form).map(function (c) { return c.value; });
      var linhas = [
        "Olá, Divina Digital! Vim pelo site.",
        "Nome: " + form.nome.value.trim(),
        form.empresa.value.trim() ? "Empresa: " + form.empresa.value.trim() : "",
        servicos.length ? "Interesse: " + servicos.join(", ") : "",
        form.verba.value ? "Verba mensal de anúncio: " + form.verba.value : "",
        form.mensagem.value.trim() ? "Mensagem: " + form.mensagem.value.trim() : "",
      ].filter(Boolean);
      window.open(linkZap(linhas.join("\n")), "_blank", "noopener");
      var aviso = $("[data-aviso]", form);
      if (aviso) aviso.hidden = false;
      if (window.Faisca) window.Faisca.piscar();
    });
  }
})();
