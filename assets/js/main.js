/* Tech&Grow — landing. Sin dependencias. */
(function () {
  'use strict';

  var CORREO = 'nrrosendi@gmail.com';
  var ASUNTO = 'Quiero agendar una demo de Tech&Grow';
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var nf = new Intl.NumberFormat('es-AR');

  function mailto(cuerpo) {
    var url = 'mailto:' + CORREO + '?subject=' + encodeURIComponent(ASUNTO);
    if (cuerpo) url += '&body=' + encodeURIComponent(cuerpo);
    return url;
  }

  /* ---------- Tema (misma clave que la app) ---------- */
  var botonTema = $('[data-tema-boton]');
  function pintarBotonTema() {
    var oscuro = document.documentElement.dataset.tema === 'oscuro';
    botonTema.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', oscuro ? '#1d1c1a' : '#f6f5f1');
  }
  botonTema.addEventListener('click', function () {
    var nuevo = document.documentElement.dataset.tema === 'oscuro' ? 'claro' : 'oscuro';
    document.documentElement.dataset.tema = nuevo;
    try { localStorage.setItem('tg:tema', nuevo); } catch (e) {}
    pintarBotonTema();
    dibujarGraficos();
  });
  pintarBotonTema();

  /* ---------- Mailto con asunto y cuerpo armados ---------- */
  var cuerpoBase = 'Hola, quiero agendar una demo de Tech&Grow.\n\nNombre:\nEmpresa o agencia:\nTamaño del equipo:\nPara cuándo lo necesito:\n¿Qué me gustaría resolver?:\n\n¡Gracias!';
  $$('[data-mailto]').forEach(function (a) { a.href = mailto(cuerpoBase); });

  /* ---------- Nav: fondo al bajar, menú móvil, sección activa ---------- */
  var nav = $('[data-nav]');
  var botonMenu = $('[data-menu-boton]');
  var menu = $('[data-menu]');
  var flotante = $('.flotante');
  var heroAlto = $('.hero').offsetHeight;
  function alBajar() {
    var y = window.scrollY;
    nav.classList.toggle('con-fondo', y > 8);
    var demo = $('#demo').getBoundingClientRect();
    flotante.classList.toggle('mostrar', y > heroAlto * 0.6 && demo.top > window.innerHeight);
  }
  window.addEventListener('scroll', alBajar, { passive: true });
  window.addEventListener('resize', function () { heroAlto = $('.hero').offsetHeight; });
  alBajar();

  botonMenu.addEventListener('click', function () {
    var abierto = botonMenu.getAttribute('aria-expanded') === 'true';
    botonMenu.setAttribute('aria-expanded', String(!abierto));
    botonMenu.setAttribute('aria-label', abierto ? 'Abrir menú' : 'Cerrar menú');
    menu.hidden = abierto;
  });
  $$('a', menu).forEach(function (a) {
    a.addEventListener('click', function () { menu.hidden = true; botonMenu.setAttribute('aria-expanded', 'false'); });
  });

  var enlacesNav = $$('.nav__links a');
  if ('IntersectionObserver' in window) {
    var obsSeccion = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        enlacesNav.forEach(function (a) { a.classList.toggle('activo', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { obsSeccion.observe(s); });
  }

  /* ---------- Entrada del hero y aparición al bajar ---------- */
  requestAnimationFrame(function () { requestAnimationFrame(function () { document.body.classList.add('listo'); }); });

  var alVerse = [];
  function cuandoSeVea(el, fn, opciones) { alVerse.push({ el: el, fn: fn, opciones: opciones }); }

  function iniciarObservadores() {
    if (!('IntersectionObserver' in window)) {
      $$('.revelar').forEach(function (el) { el.classList.add('visible'); });
      alVerse.forEach(function (x) { x.fn(); });
      return;
    }
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.revelar').forEach(function (el) { obs.observe(el); });

    alVerse.forEach(function (x) {
      var o = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) { if (e.isIntersecting) { x.fn(); o.disconnect(); } });
      }, x.opciones || { threshold: 0.3 });
      o.observe(x.el);
    });
  }

  /* ---------- Contadores ---------- */
  function contar(el) {
    var fin = Number(el.dataset.contar);
    if (reducido || fin === 0) { el.textContent = nf.format(fin); return; }
    var dur = fin < 10 ? 900 : 1600, t0 = null;
    function paso(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = nf.format(Math.round(fin * e));
      if (p < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }
  $$('[data-contar]').forEach(function (el) {
    if (el.closest('.hero')) setTimeout(function () { contar(el); }, 700);
    else cuandoSeVea(el, function () { contar(el); }, { threshold: 0.6 });
  });

  /* ---------- Paralaje suave en el hero ---------- */
  var escena = $('[data-paralaje]');
  if (escena && !reducido && window.matchMedia('(hover: hover)').matches) {
    var capas = $$('[data-prof]', escena);
    setTimeout(function () { capas.forEach(function (c) { c.classList.add('movido'); }); }, 1700);
    var hero = $('.hero');
    hero.addEventListener('mousemove', function (ev) {
      var r = hero.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width - 0.5;
      var y = (ev.clientY - r.top) / r.height - 0.5;
      capas.forEach(function (c) {
        var p = Number(c.dataset.prof);
        c.style.setProperty('--px', (-x * p).toFixed(1) + 'px');
        c.style.setProperty('--py', (-y * p).toFixed(1) + 'px');
      });
    });
    hero.addEventListener('mouseleave', function () {
      capas.forEach(function (c) { c.style.setProperty('--px', '0px'); c.style.setProperty('--py', '0px'); });
    });
  }

  /* ---------- Rangos ---------- */
  var VENTANAS = ['Inicio', 'Asistente', 'Tableros', 'Campañas', 'Clientes', 'CRM', 'Documentos', 'Planillas', 'Equipo', 'Conectores', 'Sistemas'];
  var RANGOS = [
    { clave: 'admin', nombre: 'Admin', titulo: 'Configuración inicial',
      desc: 'Se asigna a un admin experto, que aplica los permisos iniciales de cada rango para que el equipo arranque bien configurado.',
      ventanas: null, tareas: null },
    { clave: 'chief', nombre: 'Chief', titulo: 'Lidera cuentas y clientes',
      desc: 'Responsable de un grupo de clientes. Ve todas sus campañas y coordina al equipo; no toca la parte de sistemas.',
      ventanas: ['Inicio', 'Asistente', 'Tableros', 'Campañas', 'Clientes', 'CRM', 'Documentos', 'Planillas', 'Equipo', 'Conectores'],
      tareas: ['Arma tableros y los comparte con cada cliente', 'Revisa la pista de todas las campañas a cargo', 'Reparte el trabajo en el chat del equipo', 'Aprueba informes antes de enviarlos'] },
    { clave: 'senior', nombre: 'Senior', titulo: 'Analiza y optimiza',
      desc: 'El que se mete en los números. Usa el asistente para calcular, proyectar y preparar los informes.',
      ventanas: ['Inicio', 'Asistente', 'Tableros', 'Campañas', 'Clientes', 'Documentos', 'Planillas', 'Equipo'],
      tareas: ['Consulta campañas y compara Meta, Google y LinkedIn', 'Pide proyecciones de cierre de mes al asistente', 'Redacta informes y diapositivas para clientes', 'Avisa al Chief cuando una campaña se desvía'] },
    { clave: 'junior', nombre: 'Junior', titulo: 'Acompaña y aprende',
      desc: 'Se suma al día a día con lo justo y necesario. Ve tableros y colabora sin tocar configuraciones sensibles.',
      ventanas: ['Inicio', 'Asistente', 'Tableros', 'Planillas', 'Equipo'],
      tareas: ['Consulta los tableros de los clientes asignados', 'Carga y ordena datos en planillas', 'Le pregunta al asistente dentro de lo que su rango ve', 'Participa en los canales del equipo'] }
  ];
  var niveles = $$('[data-rango]');
  var panel = $('[data-rango-panel]');
  function mostrarRango(i) {
    var r = RANGOS[i];
    niveles.forEach(function (n) {
      var on = Number(n.dataset.rango) === i;
      n.classList.toggle('activo', on);
      n.setAttribute('aria-selected', String(on));
      n.tabIndex = on ? 0 : -1;
    });
    var ins = $('[data-rango-insignia]', panel);
    ins.className = 'rango-insignia rango-insignia--' + r.clave;
    ins.textContent = r.nombre;
    $('[data-rango-titulo]', panel).textContent = r.titulo;
    $('[data-rango-desc]', panel).textContent = r.desc;
    $('[data-rango-detalle]', panel).hidden = !r.ventanas;
    if (!r.ventanas) { panel.classList.remove('cambia'); void panel.offsetWidth; panel.classList.add('cambia'); return; }
    $('[data-rango-ventanas]', panel).innerHTML = VENTANAS.map(function (v) {
      var si = r.ventanas.indexOf(v) !== -1;
      return '<span class="permiso-chip' + (si ? ' si' : '') + '"' + (si ? '' : ' aria-label="' + v + ': sin acceso"') + '>' + v + '</span>';
    }).join('');
    $('[data-rango-tareas]', panel).innerHTML = r.tareas.map(function (t) { return '<li>' + t + '</li>'; }).join('');
    panel.classList.remove('cambia'); void panel.offsetWidth; panel.classList.add('cambia');
  }
  niveles.forEach(function (n) {
    n.addEventListener('click', function () { mostrarRango(Number(n.dataset.rango)); });
    n.addEventListener('keydown', function (ev) {
      var i = Number(n.dataset.rango);
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') i = Math.min(3, i + 1);
      else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') i = Math.max(0, i - 1);
      else return;
      ev.preventDefault(); mostrarRango(i); niveles[i].focus();
    });
  });
  mostrarRango(0);

  /* ---------- Relato con teléfono ---------- */
  var pasos = $$('[data-paso]');
  var pantallas = $$('.pantalla');
  var puntos = $$('.relato__puntos i');
  var contPasos = $('.relato__pasos');
  var pasoActual = 0;
  var esMovil = function () { return window.matchMedia('(max-width: 860px)').matches; };
  function irAPaso(i, desdeScroll) {
    pasoActual = i;
    pasos.forEach(function (p, k) { p.classList.toggle('activo', k === i); });
    pantallas.forEach(function (p, k) { p.classList.toggle('activa', k === i); });
    puntos.forEach(function (p, k) { p.classList.toggle('activo', k === i); });
    if (esMovil() && !desdeScroll) {
      var b = pasos[i];
      contPasos.scrollTo({ left: b.offsetLeft - (contPasos.clientWidth - b.clientWidth) / 2, behavior: reducido ? 'auto' : 'smooth' });
    }
  }
  pasos.forEach(function (p, i) { p.addEventListener('click', function () { irAPaso(i); reiniciarAuto(); }); });
  if ('IntersectionObserver' in window) {
    var obsPasos = new IntersectionObserver(function (entradas) {
      if (esMovil()) return;
      entradas.forEach(function (e) { if (e.isIntersecting) irAPaso(pasos.indexOf(e.target), true); });
    }, { rootMargin: '-48% 0px -48% 0px' });
    pasos.forEach(function (p) { obsPasos.observe(p); });
  }
  // En móvil avanza solo mientras la sección está a la vista.
  var autoTimer = null, relatoVisible = false;
  function reiniciarAuto() {
    clearInterval(autoTimer);
    if (!esMovil() || reducido || !relatoVisible) return;
    autoTimer = setInterval(function () { irAPaso((pasoActual + 1) % pasos.length); }, 4200);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { relatoVisible = e[0].isIntersecting; reiniciarAuto(); }, { threshold: 0.4 }).observe($('.relato'));
  }
  window.addEventListener('resize', reiniciarAuto);

  /* ---------- IA: interruptor ---------- */
  var interruptor = $('.interruptor');
  var etiquetaModelo = $('[data-modelo]');
  $$('[data-ia]').forEach(function (b) {
    b.addEventListener('click', function () {
      var modo = b.dataset.ia;
      $$('[data-ia]').forEach(function (x) { var on = x === b; x.classList.toggle('activo', on); x.setAttribute('aria-checked', String(on)); });
      interruptor.classList.toggle('propia', modo === 'propia');
      $$('[data-ia-tarjeta]').forEach(function (t) { t.classList.toggle('activa', t.dataset.iaTarjeta === modo); });
      etiquetaModelo.textContent = modo === 'propia' ? 'Modelo: tu cuenta de IA de pago · conectada' : 'Modelo: IA de Tech&Grow · incluida';
      etiquetaModelo.classList.remove('cambia'); void etiquetaModelo.offsetWidth; etiquetaModelo.classList.add('cambia');
    });
  });

  /* ---------- IA: conversación de demostración ---------- */
  var CHARLAS = [
    { pregunta: '¿Cómo vienen las campañas de Distribuidora Sur este mes?',
      pasos: ['Consultando Meta Ads', 'Calculando ritmo de gasto', 'Proyectando cierre de mes'],
      tono: 'Bien',
      respuesta: 'Gastaste <b>$396.000 de $600.000</b> con el 68% del mes transcurrido: vas en ritmo. El CPA bajó <b>14%</b> y Remarketing explica casi todo el ahorro. Si seguís así, cerrás en <b>~$590.000</b>.' },
    { pregunta: '¿Qué campaña me conviene mover esta semana?',
      pasos: ['Comparando Meta, Google y LinkedIn', 'Revisando la pista de cada campaña'],
      tono: 'Atención',
      respuesta: '<b>Búsqueda de marca</b> ya usó el 86% del presupuesto y se queda sin saldo en ~5 días. Te sugiero pasar <b>$60.000</b> desde Lanzamiento otoño, que viene atrasada.' }
  ];
  var cuerpoChat = $('[data-chat]');
  var entradaChat = $('[data-chat-entrada]');
  var textoEntradaBase = entradaChat.textContent;
  var esperar = function (ms) { return new Promise(function (r) { setTimeout(r, reducido ? Math.min(ms, 60) : ms); }); };
  function agregar(html, clase) {
    var d = document.createElement('div');
    d.className = 'msj ' + clase;
    d.innerHTML = html;
    cuerpoChat.appendChild(d);
    return d;
  }
  async function tipear(texto) {
    entradaChat.innerHTML = '<span class="escrito"></span><span class="cursor"></span>';
    var destino = entradaChat.firstChild;
    for (var i = 1; i <= texto.length; i++) {
      destino.textContent = texto.slice(0, i);
      await esperar(28);
    }
    await esperar(350);
    entradaChat.textContent = textoEntradaBase;
  }
  async function correrCharla(c) {
    cuerpoChat.innerHTML = '';
    await tipear(c.pregunta);
    agregar(c.pregunta.replace(/</g, '&lt;'), 'msj--usuario');
    await esperar(400);
    for (var i = 0; i < c.pasos.length; i++) {
      var p = agregar('<span class="giro"></span>' + c.pasos[i] + '…', 'msj--paso');
      await esperar(800);
      p.classList.add('ok');
    }
    var escribiendo = agregar('<span class="escribiendo"><i></i><i></i><i></i></span>', '');
    await esperar(900);
    escribiendo.remove();
    var bien = c.tono === 'Bien';
    var v = agregar('<span class="vi">' + (bien ? '✓' : '!') + '</span><div><small>' + c.tono + '</small><p>' + c.respuesta + '</p></div>', 'msj--veredicto');
    if (!bien) {
      v.style.background = 'var(--alerta-claro)';
      v.style.borderColor = 'color-mix(in srgb, var(--alerta) 35%, transparent)';
      v.querySelector('.vi').style.background = 'var(--alerta)';
      v.querySelector('small').style.color = 'var(--alerta)';
    }
    await esperar(5200);
  }
  var chatCorriendo = false;
  cuandoSeVea($('.chat-demo'), async function () {
    if (chatCorriendo) return;
    chatCorriendo = true;
    var i = 0;
    while (true) { await correrCharla(CHARLAS[i % CHARLAS.length]); i++; }
  }, { threshold: 0.35 });

  /* ---------- Gráficos (SVG a mano) ---------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, padre) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(n);
    return n;
  }
  function plata(v) { return '$' + nf.format(Math.round(v / 1000)) + ' mil'; }

  // Datos del ejemplo: presupuesto $600.000, mes de 31 días, hoy = día 21.
  var PRESUPUESTO = 600000, DIAS = 31, HOY = 21;
  var diarios = [22, 23, 22, 21, 22, 21, 21, 16, 15, 16, 15, 16, 15, 15, 19, 20, 19, 20, 19, 20, 19].map(function (x) { return x * 1000; });
  var real = [], acum = 0;
  diarios.forEach(function (d, i) { acum += d; real.push({ dia: i + 1, v: acum }); });
  var ritmoReciente = diarios.slice(-7).reduce(function (a, b) { return a + b; }, 0) / 7;
  var proy = [];
  for (var dd = HOY; dd <= DIAS; dd++) proy.push({ dia: dd, v: acum + ritmoReciente * (dd - HOY) });
  var ideal = [];
  for (var di = 0; di <= DIAS; di++) ideal.push({ dia: di, v: PRESUPUESTO * di / DIAS });

  var hostLinea = $('[data-grafico-linea]');
  var hostBarras = $('[data-grafico-barras]');

  function graficoLinea() {
    var W = Math.max(300, hostLinea.clientWidth), H = W < 480 ? 250 : 300;
    var m = { t: 16, r: W < 480 ? 64 : 84, b: 30, l: 50 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var x = function (d) { return m.l + (d / DIAS) * iw; };
    var y = function (v) { return m.t + ih - (v / PRESUPUESTO) * ih; };
    hostLinea.innerHTML = '';
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Gasto acumulado real, ritmo ideal y proyección del mes' }, hostLinea);

    [0, 200000, 400000, 600000].forEach(function (t) {
      el('line', { x1: m.l, x2: m.l + iw, y1: y(t), y2: y(t), class: 'eje' }, svg);
      var tx = el('text', { x: m.l - 8, y: y(t) + 4, 'text-anchor': 'end' }, svg);
      tx.textContent = t === 0 ? '0' : '$' + (t / 1000) + 'K';
    });
    [1, 10, 20, 31].forEach(function (d) {
      var tx = el('text', { x: x(d), y: H - 8, 'text-anchor': 'middle' }, svg);
      tx.textContent = 'Día ' + d;
    });
    el('line', { x1: x(HOY), x2: x(HOY), y1: m.t, y2: m.t + ih, class: 'hoy' }, svg);
    var th = el('text', { x: x(HOY), y: m.t - 4, 'text-anchor': 'middle', class: 'aparecer' }, svg);
    th.textContent = 'Hoy';

    var camino = function (pts) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + x(p.dia).toFixed(1) + ' ' + y(p.v).toFixed(1); }).join(' '); };
    var realConCero = [{ dia: 0, v: 0 }].concat(real);
    el('path', { d: camino(realConCero) + ' L' + x(HOY) + ' ' + y(0) + ' L' + x(0) + ' ' + y(0) + ' Z', class: 'area-real aparecer' }, svg);
    var lIdeal = el('path', { d: camino(ideal), class: 'linea linea--ideal dibujar' }, svg);
    var lReal = el('path', { d: camino(realConCero), class: 'linea linea--real dibujar' }, svg);
    el('path', { d: camino(proy), class: 'linea linea--proy dibujar' }, svg);
    [lIdeal, lReal].forEach(function (p) { p.style.setProperty('--largo', Math.ceil(p.getTotalLength())); });

    var ultimo = proy[proy.length - 1];
    el('circle', { cx: x(HOY), cy: y(acum), r: 5, fill: 'var(--serie-naranja)', class: 'punto aparecer' }, svg);
    el('circle', { cx: x(DIAS), cy: y(ultimo.v), r: 5, fill: 'var(--serie-naranja)', class: 'punto aparecer' }, svg);
    var e1 = el('text', { x: x(DIAS) + 10, y: y(ultimo.v) + 4, class: 'etiqueta-valor aparecer' }, svg);
    e1.textContent = plata(ultimo.v);
    var e2 = el('text', { x: x(DIAS) + 10, y: y(PRESUPUESTO) - 6, class: 'aparecer' }, svg);
    e2.textContent = 'Tope $600K';

    // Capa de interacción: guía vertical + tooltip.
    var guia = el('line', { x1: 0, x2: 0, y1: m.t, y2: m.t + ih, class: 'guia' }, svg);
    var pIdeal = el('circle', { r: 4, fill: 'var(--serie-azul)', class: 'punto', opacity: 0 }, svg);
    var pReal = el('circle', { r: 4, fill: 'var(--serie-naranja)', class: 'punto', opacity: 0 }, svg);
    var zona = el('rect', { x: m.l, y: m.t, width: iw, height: ih, fill: 'transparent' }, svg);
    var tip = document.createElement('div');
    tip.className = 'tooltip';
    hostLinea.appendChild(tip);
    function mover(ev) {
      var r = svg.getBoundingClientRect();
      var escala = W / r.width;
      var px = (ev.clientX - r.left) * escala;
      var dia = Math.max(1, Math.min(DIAS, Math.round(((px - m.l) / iw) * DIAS)));
      var vIdeal = PRESUPUESTO * dia / DIAS;
      var esReal = dia <= HOY;
      var v = esReal ? real[dia - 1].v : proy[dia - HOY].v;
      guia.setAttribute('x1', x(dia)); guia.setAttribute('x2', x(dia)); guia.style.opacity = 1;
      pIdeal.setAttribute('cx', x(dia)); pIdeal.setAttribute('cy', y(vIdeal)); pIdeal.setAttribute('opacity', 1);
      pReal.setAttribute('cx', x(dia)); pReal.setAttribute('cy', y(v)); pReal.setAttribute('opacity', 1);
      tip.innerHTML = '<b>Día ' + dia + '</b>' +
        '<div><span><i style="background:var(--serie-naranja)"></i>' + (esReal ? 'Gasto real' : 'Proyección') + '</span><span>$' + nf.format(Math.round(v)) + '</span></div>' +
        '<div><span><i style="background:var(--serie-azul)"></i>Ritmo ideal</span><span>$' + nf.format(Math.round(vIdeal)) + '</span></div>';
      var left = x(dia) / escala + 14;
      if (left + 190 > r.width) left = x(dia) / escala - 190;
      tip.style.left = left + 'px';
      tip.style.top = Math.max(0, y(v) / escala - 30) + 'px';
      tip.classList.add('visible-t');
    }
    function salir() { guia.style.opacity = 0; pIdeal.setAttribute('opacity', 0); pReal.setAttribute('opacity', 0); tip.classList.remove('visible-t'); }
    zona.addEventListener('pointermove', mover);
    zona.addEventListener('pointerdown', mover);
    zona.addEventListener('pointerleave', salir);

    // Tabla accesible.
    var filas = [];
    for (var d = 1; d <= DIAS; d += (d < 21 ? 5 : 5)) filas.push(d);
    if (filas.indexOf(HOY) === -1) filas.push(HOY);
    if (filas.indexOf(DIAS) === -1) filas.push(DIAS);
    filas.sort(function (a, b) { return a - b; });
    $('[data-tabla-linea]').innerHTML = '<table><thead><tr><th>Día</th><th>Ritmo ideal</th><th>Gasto real / proyección</th></tr></thead><tbody>' +
      filas.map(function (d) {
        var v = d <= HOY ? real[d - 1].v : proy[d - HOY].v;
        return '<tr><td>' + d + '</td><td>$' + nf.format(Math.round(PRESUPUESTO * d / DIAS)) + '</td><td>$' + nf.format(Math.round(v)) + (d > HOY ? ' (proy.)' : '') + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  var HORAS = [
    { cat: 'Armar reportes para clientes', h: 4.5 },
    { cat: 'Bajar datos de cada plataforma', h: 3 },
    { cat: 'Calcular proyecciones', h: 2.5 },
    { cat: 'Explicar resultados', h: 2 },
    { cat: 'Coordinar con el equipo', h: 1.5 }
  ];
  function graficoBarras() {
    var W = Math.max(280, hostBarras.clientWidth);
    var fila = 52, m = { t: 4, r: 52, b: 4, l: 0 };
    var H = m.t + m.b + HORAS.length * fila;
    var max = 5, iw = W - m.l - m.r;
    hostBarras.innerHTML = '';
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Horas recuperadas por semana según la tarea' }, hostBarras);
    var tip = document.createElement('div');
    tip.className = 'tooltip';
    hostBarras.appendChild(tip);
    HORAS.forEach(function (d, i) {
      var y0 = m.t + i * fila;
      var t = el('text', { x: m.l, y: y0 + 16, class: 'etiqueta-cat' }, svg);
      t.textContent = d.cat;
      var w = (d.h / max) * iw, alto = 14, yb = y0 + 24, r = 4;
      // Extremo redondeado de 4px, base recta.
      var path = 'M' + m.l + ' ' + yb + ' H' + (m.l + w - r) + ' Q' + (m.l + w) + ' ' + yb + ' ' + (m.l + w) + ' ' + (yb + r) +
        ' V' + (yb + alto - r) + ' Q' + (m.l + w) + ' ' + (yb + alto) + ' ' + (m.l + w - r) + ' ' + (yb + alto) + ' H' + m.l + ' Z';
      var barra = el('path', { d: path, class: 'barra' }, svg);
      barra.style.transitionDelay = (0.1 + i * 0.08) + 's';
      var v = el('text', { x: m.l + w + 8, y: yb + 11.5, class: 'etiqueta-valor aparecer' }, svg);
      v.textContent = String(d.h).replace('.', ',') + ' h';
      var zona = el('rect', { x: 0, y: y0, width: W, height: fila, fill: 'transparent' }, svg);
      zona.addEventListener('pointerenter', function () {
        var r2 = svg.getBoundingClientRect(), esc = W / r2.width;
        tip.innerHTML = '<b>' + d.cat + '</b><div><span><i style="background:var(--serie-azul)"></i>Horas por semana</span><span>' + String(d.h).replace('.', ',') + ' h</span></div>';
        tip.style.left = Math.min(r2.width - 200, (m.l + w) / esc + 10) + 'px';
        tip.style.top = (y0 / esc - 6) + 'px';
        tip.classList.add('visible-t');
        barra.style.filter = 'brightness(1.12)';
      });
      zona.addEventListener('pointerleave', function () { tip.classList.remove('visible-t'); barra.style.filter = ''; });
    });
  }

  function dibujarGraficos() { graficoLinea(); graficoBarras(); }
  dibujarGraficos();
  var anchoPrevio = window.innerWidth, tRes;
  window.addEventListener('resize', function () {
    clearTimeout(tRes);
    tRes = setTimeout(function () { if (window.innerWidth !== anchoPrevio) { anchoPrevio = window.innerWidth; dibujarGraficos(); } }, 150);
  });

  /* ---------- Formulario → mail ---------- */
  var form = $('[data-formulario]');
  var ayuda = $('[data-formulario-ayuda]');
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var ok = true;
    ['nombre', 'empresa', 'email'].forEach(function (n) {
      var campo = form.elements[n];
      var valido = campo.value.trim() !== '' && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campo.value.trim()));
      campo.closest('.campo-form').classList.toggle('error', !valido);
      campo.setAttribute('aria-invalid', String(!valido));
      if (!valido && ok) { campo.focus(); ok = false; }
    });
    if (!ok) {
      ayuda.textContent = 'Revisá los campos marcados: nombre, empresa y un email válido.';
      ayuda.className = 'formulario__ayuda mal';
      return;
    }
    var f = form.elements;
    var cuerpo = 'Hola, quiero agendar una demo de Tech&Grow.\n\n' +
      'Nombre: ' + f.nombre.value.trim() + '\n' +
      'Empresa o agencia: ' + f.empresa.value.trim() + '\n' +
      'Email: ' + f.email.value.trim() + '\n' +
      'Tamaño del equipo: ' + f.equipo.value + '\n' +
      'Para cuándo lo necesito: ' + f.urgencia.value + '\n' +
      (f.mensaje.value.trim() ? '\nQué me gustaría resolver:\n' + f.mensaje.value.trim() + '\n' : '') +
      '\n¡Gracias!';
    window.location.href = mailto(cuerpo);
    ayuda.innerHTML = '¡Listo! Si no se abrió tu correo, escribinos a <a href="' + mailto(cuerpo) + '">' + CORREO + '</a>.';
    ayuda.className = 'formulario__ayuda ok';
  });
  $$('input', form).forEach(function (i) {
    i.addEventListener('input', function () { i.closest('.campo-form').classList.remove('error'); i.removeAttribute('aria-invalid'); });
  });

  $$('[data-copiar]').forEach(function (b) {
    b.addEventListener('click', function () {
      var listo = function () { b.textContent = '¡Copiado!'; setTimeout(function () { b.textContent = 'Copiar'; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copiar).then(listo, function () {});
      else listo();
    });
  });

  var anio = $('[data-anio]');
  if (anio) anio.textContent = new Date().getFullYear();

  iniciarObservadores();
})();
