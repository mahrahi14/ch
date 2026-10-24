(() => {
  const page = document.body.dataset.page || 'home';
  const nav = document.getElementById('nav');
  const progress = document.getElementById('progress-bar');
  const menuButton = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + '%';
    if (nav) nav.classList.toggle('scrolled', scrollY > 16);
  };
  addEventListener('scroll', updateScroll, { passive: true }); updateScroll();
  if (menuButton && mobileMenu) {
    const closeMenu = () => { mobileMenu.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Open navigation menu'); };
    menuButton.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }
  document.querySelectorAll('a[data-page]').forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
    else a.classList.remove('active');
  });
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
    }), { threshold: .08 });
    reveals.forEach(el => revealObserver.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));

  const backTop = document.getElementById('back-top');
  if (backTop) {
    const updateBackTop = () => backTop.classList.toggle('visible', scrollY > 450);
    addEventListener('scroll', updateBackTop, { passive: true }); updateBackTop();
    backTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  }

  document.querySelectorAll('[data-count]').forEach(el => {
    const target = Number(el.dataset.count); if (!Number.isFinite(target)) return;
    const run = () => { const start = performance.now(), duration = 1400; const tick = now => {
      const ratio = Math.min((now-start)/duration,1); el.textContent = Math.floor(target*ratio) + (target >= 98 ? '%' : '+');
      if (ratio < 1) requestAnimationFrame(tick);
    }; requestAnimationFrame(tick); };
    if ('IntersectionObserver' in window) { const obs = new IntersectionObserver(entries => { if(entries[0].isIntersecting){ run(); obs.disconnect(); } }, { threshold:.35 }); obs.observe(el); } else run();
  });
  document.querySelectorAll('.skill-fill[data-width]').forEach(el => {
    const run = () => { el.style.width = Math.min(100, Number(el.dataset.width)||0) + '%'; };
    if ('IntersectionObserver' in window) { const obs = new IntersectionObserver(entries => { if(entries[0].isIntersecting){ run(); obs.disconnect(); } }, { threshold:.2 }); obs.observe(el); } else run();
  });

  document.querySelectorAll('.faq-question').forEach(button => button.addEventListener('click', () => {
    const item = button.closest('.faq-item'); const answer = item && item.querySelector('.faq-answer');
    const open = item && item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(other => { other.classList.remove('open'); const a=other.querySelector('.faq-answer'); if(a)a.style.maxHeight='0'; const b=other.querySelector('.faq-question'); if(b)b.setAttribute('aria-expanded','false'); });
    if(item && answer && !open){ item.classList.add('open'); answer.style.maxHeight=answer.scrollHeight+'px'; button.setAttribute('aria-expanded','true'); }
  }));
  document.querySelectorAll('.tab-btn').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b===button));
    const filter=button.dataset.filter;
    document.querySelectorAll('.portfolio-item').forEach(item => { item.style.display = (filter==='all'||item.dataset.category===filter) ? '' : 'none'; });
  }));

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lb-img');
  const galleryItems = [...document.querySelectorAll('.masonry-item')];
  let galleryIndex = 0;
  window.openLightbox = index => {
    if(!lightbox||!lightboxImage||!galleryItems.length) return;
    galleryIndex = (index + galleryItems.length) % galleryItems.length;
    const image = galleryItems[galleryIndex].querySelector('img'); if(!image) return;
    lightboxImage.src = image.currentSrc || image.src; lightboxImage.alt = image.alt || 'Gallery image';
    lightbox.classList.add('active'); document.body.style.overflow='hidden';
  };
  window.closeLightbox = event => {
    if(event && event.target !== lightbox && !event.target.closest('.lb-close') && !event.target.closest('.lb-nav')) return;
    if(lightbox){ lightbox.classList.remove('active'); document.body.style.overflow=''; }
  };
  window.changeLb = delta => window.openLightbox(galleryIndex + delta);
  galleryItems.forEach((item,index) => {
    item.addEventListener('click', () => window.openLightbox(index));
    item.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();window.openLightbox(index);} });
  });
  document.addEventListener('keydown', e => {
    if(!lightbox||!lightbox.classList.contains('active')) return;
    if(e.key==='Escape') window.closeLightbox();
    if(e.key==='ArrowLeft') window.changeLb(-1);
    if(e.key==='ArrowRight') window.changeLb(1);
  });

  const track=document.getElementById('testimonialTrack');
  if(track){
    const slides=[...track.querySelectorAll('.testimonial-slide')]; const dots=document.getElementById('sliderDots'); let current=0; let timer;
    const goTo=i=>{ if(!slides.length)return; current=(i+slides.length)%slides.length; track.style.transform=`translateX(-${current*100}%)`; if(dots) dots.querySelectorAll('.dot').forEach((d,j)=>d.classList.toggle('active',j===current)); };
    if(dots && slides.length){ slides.forEach((_,i)=>{const d=document.createElement('button');d.className='dot'+(i===0?' active':'');d.type='button';d.setAttribute('aria-label','Go to testimonial '+(i+1));d.addEventListener('click',()=>goTo(i));dots.appendChild(d);}); timer=setInterval(()=>goTo(current+1),6000); track.addEventListener('mouseenter',()=>clearInterval(timer)); track.addEventListener('mouseleave',()=>{clearInterval(timer);timer=setInterval(()=>goTo(current+1),6000);}); }
  }

  const contactForm=document.getElementById('contactForm');
  if(contactForm) contactForm.addEventListener('submit', event=>{
    event.preventDefault();
    const name=document.getElementById('name')?.value.trim()||'';
    const email=document.getElementById('email')?.value.trim()||'';
    const subject=document.getElementById('subject')?.value.trim()||'Portfolio enquiry';
    const message=document.getElementById('message')?.value.trim()||'';
    const phone=document.getElementById('phone')?.value.trim()||'';
    const service=document.getElementById('service')?.value||'';
    if(!name||!email||!subject||!message) return;
    const body=`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\n\n${message}`;
    const status=document.getElementById('formMessage');
    if(status){status.style.display='block';status.textContent='Opening your email app so you can send this message to Rahi.';}
    location.href=`mailto:mahrahi774@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
