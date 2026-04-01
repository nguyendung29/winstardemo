// Shared interactions for Winstar pages (home + news)
(function () {
  function setupCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  }

  function reveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    reveals.forEach((el) => {
      const windowHeight = window.innerHeight;
      const elementTop = el.getBoundingClientRect().top;
      if (elementTop < windowHeight - 100) {
        el.classList.add('active');
      }
    });
  }

  function applyNavbarShadow(scrollValue) {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    if (scrollValue > 50) {
      nav.style.boxShadow = '0 15px 30px -10px rgba(0,0,0,0.08)';
      nav.style.padding = '1rem 3rem';
    } else {
      nav.style.boxShadow = 'none';
      nav.style.padding = '1.5rem 3rem';
    }
  }

  function applyParallax(scrollValue) {
    const parallaxImg = document.getElementById('parallax-img');
    if (!parallaxImg) return;
    if (window.innerWidth > 1024) {
      parallaxImg.style.transform = `translateY(${scrollValue * 0.35}px)`;
    } else {
      parallaxImg.style.transform = '';
    }
  }

  function setupGlobalScrollEffects() {
    window.addEventListener('scroll', () => {
      const scrollValue = window.scrollY;
      applyParallax(scrollValue);
      applyNavbarShadow(scrollValue);
      reveal();
    });
  }

  function setupCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target;
          const countTo = Number(target.getAttribute('data-target'));
          if (!Number.isFinite(countTo)) {
            observer.unobserve(target);
            return;
          }

          let count = 0;
          const increment = countTo / 100;

          const updateCount = () => {
            if (count < countTo) {
              count += increment;
              target.innerText = String(Math.ceil(count));
              setTimeout(updateCount, 20);
            } else {
              target.innerText = `${countTo}+`;
            }
          };

          updateCount();
          observer.unobserve(target);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  function setupJobsFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const jobCards = document.querySelectorAll('.job-card');
    if (!filterBtns.length || !jobCards.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Update active state
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        jobCards.forEach((card) => {
          const category = card.getAttribute('data-category');
          const show = filterValue === 'all' || category === filterValue;
          if (show) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
            }, 10);
          } else {
            card.style.opacity = '0';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  function setupNewsSummaries() {
    const summaryEls = document.querySelectorAll('.news-summary');
    if (!summaryEls.length) return;

    function normalizeWhitespace(text) {
      return (text || '').trim().replace(/\s+/g, ' ');
    }

    function truncate(text, maxLen) {
      if (!text) return '';
      if (text.length <= maxLen) return text;
      return text.slice(0, maxLen).replace(/\s+\S*$/, '').trim() + '…';
    }

    summaryEls.forEach((summaryEl) => {
      if (!summaryEl) return;
      if (normalizeWhitespace(summaryEl.textContent).length) return;

      const article = summaryEl.closest('article[data-news]');
      if (!article) return;

      const tpl = article.querySelector('template.news-full');
      if (!tpl || !tpl.content) return;

      const firstP = tpl.content.querySelector('p');
      const firstText = normalizeWhitespace(firstP ? firstP.textContent : '');
      if (firstText) {
        summaryEl.textContent = truncate(firstText, 160);
        return;
      }

      const tempDiv = document.createElement('div');
      tempDiv.appendChild(tpl.content.cloneNode(true));
      const allText = normalizeWhitespace(tempDiv.innerText || tempDiv.textContent || '');
      summaryEl.textContent = truncate(allText, 160);
    });
  }

  function setupNewsModal() {
    const modal = document.getElementById('news-modal');
    if (!modal) return;

    const modalPanel = modal.querySelector('.modal-panel');
    const modalTitle = document.getElementById('news-modal-title');
    const modalMeta = document.getElementById('news-modal-meta');
    const modalImg = document.getElementById('news-modal-img');
    const modalContent = document.getElementById('news-modal-content');
    const closeBtn = document.getElementById('close-news');
    let lastFocusedEl = null;

    function openModalFromArticle(article) {
      const titleEl = article.querySelector('h3');
      const imgEl = article.querySelector('img');
      const tagEl = article.querySelector('span');
      const yearEl = article.querySelector('span.text-zinc-400');
      const tpl = article.querySelector('template.news-full');

      if (!modalTitle || !modalImg || !modalContent) return;

      lastFocusedEl = document.activeElement;
      modalTitle.textContent = titleEl ? titleEl.textContent.trim() : 'Article';

      const tag = tagEl ? tagEl.textContent.trim() : '';
      const year = yearEl ? yearEl.textContent.trim() : '';
      if (modalMeta) modalMeta.textContent = [tag, year].filter(Boolean).join(' • ');

      if (imgEl) {
        modalImg.src = imgEl.getAttribute('src') || '';
        modalImg.alt = imgEl.getAttribute('alt') || '';
      } else {
        modalImg.src = '';
        modalImg.alt = '';
      }

      modalContent.innerHTML = '';
      if (tpl && tpl.content) {
        modalContent.appendChild(tpl.content.cloneNode(true));
      }

      document.body.style.overflow = 'hidden';
      modal.classList.add('open');
      setTimeout(() => modalPanel && modalPanel.focus(), 0);
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
    }

    document.addEventListener('click', (e) => {
      const target = e.target;
      const btn = target && target.closest ? target.closest('.open-news') : null;
      if (btn) {
        e.preventDefault();
        const article = btn.closest('article[data-news]');
        if (article) openModalFromArticle(article);
        return;
      }
      if (e.target === modal) closeModal();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupCursor();
    setupGlobalScrollEffects();
    setupCounters();
    setupJobsFilter();
    setupNewsSummaries();
    setupNewsModal();

    // Initial paint
    applyNavbarShadow(window.scrollY);
    applyParallax(window.scrollY);
    reveal();
  });

  window.addEventListener('load', reveal);
})();

