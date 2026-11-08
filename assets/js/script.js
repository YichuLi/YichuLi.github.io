/**
 * Andy Li — Personal Space & Markdown Blog
 * Pure static architecture with direct Markdown (.md) rendering
 */

(function () {
  'use strict';

  let allPosts = [];
  let activeCategory = 'all';

  // DOM Elements
  const sections = {
    about: document.getElementById('section-about'),
    blog: document.getElementById('section-blog'),
    post: document.getElementById('section-post')
  };
  const navButtons = document.querySelectorAll('[data-nav-target]');
  const categoryTabs = document.querySelectorAll('.cat-tab');
  const recentPostsList = document.getElementById('recent-posts-list');
  const blogPostsContainer = document.getElementById('blog-posts-container');
  const readerCategory = document.getElementById('reader-category');
  const readerDate = document.getElementById('reader-date');
  const readerReadTime = document.getElementById('reader-readtime');
  const readerContent = document.getElementById('reader-content');
  const themeToggleBtn = document.getElementById('theme-toggle');

  // 1. Theme Initialization & Toggle
  function initTheme() {
    const savedTheme = localStorage.getItem('andy-site-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('andy-site-theme', next);
      });
    }
  }

  // 2. Load Posts Index (posts/index.json)
  async function loadPostsIndex() {
    try {
      const response = await fetch('./posts/index.json');
      if (!response.ok) throw new Error('Failed to fetch posts/index.json');
      allPosts = await response.json();
    } catch (err) {
      allPosts = [];
    }

    // Sort newest first
    allPosts.sort((a, b) => (a.date < b.date ? 1 : -1));
    renderRecentPosts();
    renderBlogArchive();
  }

  // 3. Create Post Card HTML
  function createPostCard(post) {
    const btn = document.createElement('button');
    btn.className = 'post-card';
    btn.type = 'button';
    const catClass = `cat-${post.category || 'journal'}`;

    btn.innerHTML = `
      <div class="post-card-meta">
        <span class="post-tag ${catClass}">${escapeHtml(post.categoryLabel || post.category || 'Journal')}</span>
        <span class="post-date">${escapeHtml(post.date)}</span>
        <span>·</span>
        <span>${escapeHtml(post.readTime || '2 min read')}</span>
      </div>
      <h3 class="post-card-title">${escapeHtml(post.title)}</h3>
      <p class="post-card-summary">${escapeHtml(post.summary || '')}</p>
    `;

    btn.addEventListener('click', () => {
      window.location.hash = `#post/${post.slug}`;
    });

    return btn;
  }

  // 4. Render Home Page Recent Notes (up to 3 posts)
  function renderRecentPosts() {
    if (!recentPostsList) return;
    recentPostsList.innerHTML = '';

    if (allPosts.length === 0) {
      recentPostsList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.92rem;">No posts yet — stay tuned!</p>`;
      return;
    }

    const recent = allPosts.slice(0, 3);
    recent.forEach(post => {
      recentPostsList.appendChild(createPostCard(post));
    });
  }

  // 5. Render Standalone Blog Section List
  function renderBlogArchive() {
    if (!blogPostsContainer) return;
    blogPostsContainer.innerHTML = '';

    const filtered = activeCategory === 'all'
      ? allPosts
      : allPosts.filter(p => p.category === activeCategory);

    if (filtered.length === 0) {
      blogPostsContainer.innerHTML = `<p style="color: var(--text-muted); padding: 1rem 0;">No posts yet — stay tuned!</p>`;
      return;
    }

    filtered.forEach(post => {
      blogPostsContainer.appendChild(createPostCard(post));
    });
  }

  // 6. Strip Optional YAML Frontmatter & Render Markdown
  function parseMarkdown(rawMd) {
    const stripped = rawMd.replace(/^---[\s\S]*?---\s*/, '');
    if (window.marked && typeof window.marked.parse === 'function') {
      return window.marked.parse(stripped);
    }
    return stripped
      .split('\n\n')
      .map(block => `<p>${escapeHtml(block)}</p>`)
      .join('');
  }

  // 7. Open & Render Individual Markdown Post
  async function openPost(slug) {
    const post = allPosts.find(p => p.slug === slug);
    if (!post) {
      switchSection('blog');
      return;
    }

    switchSection('post');

    readerCategory.textContent = post.categoryLabel || post.category || 'Journal';
    readerCategory.className = `post-tag cat-${post.category || 'journal'}`;
    readerDate.textContent = post.date;
    readerReadTime.textContent = post.readTime || '2 min read';
    readerContent.innerHTML = `<p style="color: var(--text-muted);">Loading note...</p>`;

    try {
      const res = await fetch(`./${post.file}`);
      if (!res.ok) throw new Error('Fetch failed');
      const rawMarkdown = await res.text();
      readerContent.innerHTML = parseMarkdown(rawMarkdown);
    } catch (e) {
      readerContent.innerHTML = `<p style="color: var(--text-muted);">Could not load markdown file.</p>`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 8. Switch Active Section & Nav Highlight
  function switchSection(sectionName) {
    Object.keys(sections).forEach(key => {
      if (sections[key]) {
        sections[key].classList.toggle('active', key === sectionName);
      }
    });

    const activeNavKey = sectionName === 'post' ? 'blog' : sectionName;
    navButtons.forEach(btn => {
      if (btn.classList.contains('nav-link')) {
        btn.classList.toggle('active', btn.getAttribute('data-nav-target') === activeNavKey);
      }
    });
  }

  // 9. Handle Hash Routing (#about, #blog, #post/<slug>)
  function handleRoute() {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash.startsWith('post/')) {
      const slug = hash.slice(5);
      openPost(slug);
    } else if (hash === 'blog') {
      switchSection('blog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      switchSection('about');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 10. Event Listeners
  function bindEvents() {
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-nav-target');
        window.location.hash = `#${target}`;
      });
    });

    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCategory = tab.getAttribute('data-category') || 'all';
        renderBlogArchive();
      });
    });

    const backTop = document.getElementById('back-to-blog-btn');
    const backBottom = document.getElementById('back-to-blog-bottom-btn');
    [backTop, backBottom].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          window.location.hash = '#blog';
        });
      }
    });

    window.addEventListener('hashchange', handleRoute);

    const yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  // Initialize
  initTheme();
  bindEvents();
  loadPostsIndex().then(() => {
    handleRoute();
  });

})();
