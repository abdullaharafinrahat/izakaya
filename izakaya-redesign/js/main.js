(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const API = 'https://erp.izakaya.com.bd/others/izakaya/api';

  $('#year').textContent = new Date().getFullYear();

  /* ---------------- header ---------------- */
  const header = $('#siteHeader');
  const burger = $('#burger');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = open => {
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!header.classList.contains('menu-open')));
  $$('#nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------------- hero: noren intro ---------------- */
  const hero = $('.hero');
  const noren = $('#noren');
  const fmt = n => '৳ ' + Number(n).toLocaleString('en-US');

  /* ---------------- hero: one dish at a time ---------------- */
  // w = width in vw on desktop, mw = width in vw on mobile, top = vertical centre (%)
   const dishes = [
     { src: 'images/cutouts/sushi-box.png', name: 'Sushi Platter Box', w: 25, mw: 64, top: 52 },
     { src: 'images/cutouts/purple-lady.png', name: 'Purple Lady', w: 9, mw: 26, top: 52 },
     { src: 'images/cutouts/firecracker.png', name: 'Firecracker Maki Roll', w: 30, mw: 74, top: 50, price: 700 },
     { src: 'images/cutouts/poke-bowl.png', name: 'Spicy Salmon Poke Bowl', w: 19, mw: 52, top: 52, price: 1250 },
     { src: 'images/cutouts/sunset.png', name: 'Sunset Maki Roll', w: 30, mw: 74, top: 50 },
     { src: 'images/cutouts/margarita.png', name: 'Margarita', w: 10, mw: 28, top: 52 },
     { src: 'images/cutouts/mentai.png', name: 'Avocado Salmon Mentai Sushi', w: 18, mw: 50, top: 50, price: 600 },
     { src: 'images/cutouts/nori-tacos.png', name: 'Fried Nori Beef Tacos', w: 30, mw: 74, top: 50 },
     { src: 'images/cutouts/salmon-maki.png', name: 'Spicy Salmon Maki Roll', w: 30, mw: 74, top: 50, price: 880 },
     { src: 'images/cutouts/sushi-platter.png', name: 'Nigiri Sushi Platter', w: 32, mw: 76, top: 50 }
   ];
  const flyer = $('#flyer');
  const flyerImg = $('#flyerImg');
  const flyerCap = $('#flyerCap');
  dishes.forEach(d => { const i = new Image(); i.src = d.src; });   // preload

  let idx = 0;
  const setDish = d => {
    flyer.style.setProperty('--w', d.w);
    flyer.style.setProperty('--mw', d.mw);
    flyer.style.setProperty('--top', d.top + '%');
    flyerImg.src = d.src;
    flyerImg.alt = d.name;
    flyerCap.textContent = d.name + (d.price ? '  ·  ' + fmt(d.price) : '');
  };
  const fly = async () => {
    const d = dishes[idx % dishes.length];
    idx++;
    setDish(d);
    try { await flyerImg.decode(); } catch (_) { }
    flyer.classList.remove('fly');
    void flyer.offsetWidth;                 // restart the animation
    flyer.classList.add('fly');
  };
  flyer.addEventListener('animationend', e => {
    if (e.animationName === 'fly') setTimeout(fly, 400);
  });

  if (reduceMotion) {
    noren.classList.add('done');
    hero.classList.add('ready');
    setDish(dishes[0]);
    flyer.classList.add('static');
  } else {
    // 1) curtain sways, 2) once the sway has settled all three panels rise away, 3) first dish enters
    const lastPanel = $('.p3', noren);
    let opened = false;
    const openCurtain = () => {
      if (opened) return;
      opened = true;
      noren.classList.remove('swing');                       // settle first, so the rise can transition
      requestAnimationFrame(() => requestAnimationFrame(() => {
        noren.classList.add('open');
        setTimeout(() => hero.classList.add('ready'), 650);
        setTimeout(fly, 1100);
        setTimeout(() => noren.classList.add('done'), 2600);  // after the rise has finished
      }));
    };
    requestAnimationFrame(() => noren.classList.add('swing'));
    lastPanel.addEventListener('animationend', openCurtain);
    setTimeout(openCurtain, 2200);                           // safety net
  }

  /* ---------------- menu hover preview ---------------- */
  const menuList = $('#menuList');
  const preview = $('#menuPreview');
  const pImg = $('img', preview);
  if (finePointer) {
    let mx = 0, my = 0, px = 0, py = 0, running = false;
    const follow = () => {
      px += (mx - px) * 0.18;
      py += (my - py) * 0.18;
      preview.style.transform = `translate3d(${px + 28}px,${py - preview.offsetHeight / 2}px,0) scale(1)`;
      running = preview.classList.contains('show') || Math.abs(mx - px) > 0.5;
      if (running) requestAnimationFrame(follow);
    };
    menuList.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
    $$('a', menuList).forEach(a => {
      a.addEventListener('pointerenter', e => {
        mx = px = e.clientX; my = py = e.clientY;
        pImg.src = a.dataset.img;
        preview.classList.add('show');
        menuList.classList.add('hovering');
        if (!running) { running = true; requestAnimationFrame(follow); }
      });
      a.addEventListener('focus', () => { pImg.src = a.dataset.img; menuList.classList.add('hovering'); });
      a.addEventListener('blur', () => menuList.classList.remove('hovering'));
    });
    menuList.addEventListener('pointerleave', () => {
      preview.classList.remove('show');
      menuList.classList.remove('hovering');
    });
  }

  /* ---------------- order slip ---------------- */
  const rows = $$('.slip-row');
  const totalEl = $('#slipTotal');
  const hanko = $('#hanko');
  const slipGo = $('#slipGo');

  const recalc = () => {
    let total = 0, count = 0;
    rows.forEach(r => {
      const on = $('input', r).checked;
      const q = parseInt($('output', r).textContent, 10);
      r.classList.toggle('on', on);
      $('.minus', r).disabled = !on || q <= 1;
      $('.plus', r).disabled = !on || q >= 20;
      if (on) { total += Number(r.dataset.price) * q; count += q; }
    });
    totalEl.textContent = fmt(total);
    hanko.classList.toggle('stamped', count > 0);
    slipGo.textContent = count > 0 ? 'Order these online' : 'Browse the full menu';
  };
  rows.forEach(r => {
    const out = $('output', r);
    $('input', r).addEventListener('change', () => {
      if (!$('input', r).checked) out.textContent = '1';
      recalc();
    });
    $('.minus', r).addEventListener('click', () => { out.textContent = Math.max(1, +out.textContent - 1); recalc(); });
    $('.plus', r).addEventListener('click', () => { out.textContent = Math.min(20, +out.textContent + 1); recalc(); });
  });
  recalc();

  /* ---------------- most loved arrows ---------------- */
  const track = $('#lovedTrack');
  const step = () => {
    const d = $('.dish', track);
    return d ? d.getBoundingClientRect().width + 22 : 300;
  };
  $('#lovedPrev').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
  $('#lovedNext').addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------------- reservation ---------------- */
  const form = $('#reserveForm');
  const msg = $('#formMsg');
  const dateEl = $('#rDate');
  const slotInputs = $$('#slots input');
  const btn = $('#reserveBtn');

  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = iso(new Date());
  dateEl.min = today;
  dateEl.value = today;

  const say = (text, kind) => { msg.textContent = text; msg.className = 'form-msg' + (kind ? ' ' + kind : ''); };

  const loadSlots = async date => {
    slotInputs.forEach(i => { i.disabled = false; });
    try {
      const res = await fetch(`${API}/available-table/?reserve_date=${encodeURIComponent(date)}`);
      const json = await res.json();
      (json.data || []).forEach(v => {
        const el = slotInputs.find(i => i.value === v);
        if (el) { el.disabled = true; if (el.checked) el.checked = false; }
      });
    } catch (_) { /* availability is optional; leave all slots open */ }
  };
  dateEl.addEventListener('change', () => loadSlots(dateEl.value));
  loadSlots(today);

  $('#rName').addEventListener('input', e => { e.target.value = e.target.value.replace(/[^a-z .]/gi, ''); });
  $('#rPhone').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11); });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#rName').value.trim();
    const email = $('#rEmail').value.trim();
    const phone = $('#rPhone').value.trim();
    const guests = $('#rGuests').value;
    const loc = ($('input[name="location"]:checked', form) || {}).value;
    const time = ($('input[name="time"]:checked', form) || {}).value;
    const date = dateEl.value;

    if (!name) return say('Please enter your full name.', 'err');
    if (!/^01[3-9]\d{8}$/.test(phone)) return say('Enter an 11-digit mobile number starting with 01.', 'err');
    if (!/^\S+@\S+\.\S+$/.test(email)) return say('Enter a valid email address.', 'err');
    if (!guests) return say('Choose how many guests.', 'err');
    if (!loc) return say('Choose a restaurant.', 'err');
    if (!date) return say('Choose a date.', 'err');
    if (!time) return say('Choose a time.', 'err');

    const fd = new FormData();
    fd.append('customer_name', name);
    fd.append('customer_email', email);
    fd.append('phone_number', phone);
    fd.append('number_of_people', guests);
    fd.append('reserve_date', date);
    fd.append('reserve_time', time);
    fd.append('location', loc);

    btn.disabled = true;
    say('Sending your request…');
    try {
      const res = await fetch(`${API}/reserve-table/`, { method: 'POST', body: fd });
      const json = await res.json();
      if (json.success) {
        say(json.message || 'Request sent. We will confirm your table by phone.', 'ok');
        form.reset();
        dateEl.value = today;
        loadSlots(today);
      } else {
        say(json.message || 'We could not book that slot. Try another time.', 'err');
      }
    } catch (_) {
      say('We could not send your request. Please call the restaurant instead.', 'err');
    } finally {
      btn.disabled = false;
    }
  });
})();