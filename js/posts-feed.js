/* ═══════════════════════════════════════════════════════════════════════════
   WORLD TRAINER FORUM — DYNAMIC POSTS FEED (News, Events & Blogs)
   Handles fetching, skeleton loaders, rendering, and full content modals.
═══════════════════════════════════════════════════════════════════════════ */
'use strict';

// GitHub Pages is a static host — all API calls must use the full backend URL.
const POSTS_BACKEND_API = 'https://trainerforum.onrender.com/api/posts';

let cachedPosts = [];

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initPostsFeed();
  });
}

async function initPostsFeed() {
  const newsContainer = document.getElementById('dynamic-news-feed');
  const eventsContainer = document.getElementById('dynamic-events-feed');
  const blogContainer = document.getElementById('dynamic-blog-feed');

  if (!newsContainer && !eventsContainer && !blogContainer) return;

  // Render Skeleton Loaders initially
  if (newsContainer) renderSkeletonLoaders(newsContainer, 2);
  if (eventsContainer) renderSkeletonLoaders(eventsContainer, 3);
  if (blogContainer) renderSkeletonLoaders(blogContainer, 3);

  try {
    const res = await fetch(POSTS_BACKEND_API);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedPosts = data;
      }
    }
  } catch (err) {
    console.warn('[PostsFeed] Failed to fetch posts API, using fallback:', err.message);
  }

  // Render categories
  if (newsContainer) renderCategoryFeed(newsContainer, 'News');
  if (eventsContainer) renderCategoryFeed(eventsContainer, 'Event');
  if (blogContainer) renderCategoryFeed(blogContainer, 'Blog');
}

// ── SKELETON LOADERS ──────────────────────────────────────────────────────────
function renderSkeletonLoaders(container, count = 3) {
  let skeletonsHtml = '';
  for (let i = 0; i < count; i++) {
    skeletonsHtml += `
      <div class="feed-skeleton-card" style="background:#fff; border-radius:18px; padding:24px; box-shadow:0 10px 30px rgba(0,0,0,0.06); animation: pulse 1.5s infinite ease-in-out;">
        <div style="height:180px; background:rgba(0,0,0,0.06); border-radius:12px; margin-bottom:16px;"></div>
        <div style="height:14px; width:40%; background:rgba(0,0,0,0.08); border-radius:4px; margin-bottom:12px;"></div>
        <div style="height:22px; width:85%; background:rgba(0,0,0,0.1); border-radius:4px; margin-bottom:12px;"></div>
        <div style="height:14px; width:100%; background:rgba(0,0,0,0.06); border-radius:4px; margin-bottom:8px;"></div>
        <div style="height:14px; width:70%; background:rgba(0,0,0,0.06); border-radius:4px;"></div>
      </div>
    `;
  }
  container.innerHTML = skeletonsHtml;
}

// ── RENDER CATEGORY FEED ──────────────────────────────────────────────────────
function renderCategoryFeed(container, category) {
  const targetCat = (category || '').toLowerCase();
  
  const filtered = cachedPosts.filter(p => {
    const pCat = (p.category || '').toLowerCase();
    if (targetCat === 'news' || targetCat.includes('news')) {
      return pCat === 'news' || pCat === 'news & announcements' || pCat.includes('news') || pCat.includes('announcement');
    }
    if (targetCat === 'event' || targetCat.includes('event')) {
      return pCat === 'event' || pCat === 'events' || pCat.includes('event');
    }
    if (targetCat === 'blog' || targetCat.includes('blog')) {
      return pCat === 'blog' || pCat === 'blogs' || pCat.includes('blog');
    }
    return pCat === targetCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; background: rgba(255,255,255,0.7); border-radius: 18px; border: 1px dashed rgba(11,27,50,0.15);">
        <div style="font-size: 2.2rem; margin-bottom: 10px;">📰</div>
        <h4 style="font-size: 1.1rem; color: #101826; font-weight: 700; margin-bottom: 6px;">No ${category} posts yet</h4>
        <p style="color: #667085; font-size: 0.9rem;">Check back soon for the latest ${category.toLowerCase()} updates from World Trainer Forum.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(post => {
    const title = escHtml(post.title || '');
    const desc = escHtml(post.description || '');
    const img = post.imageUrl || getCategoryFallbackImage(category);
    const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    const id = post.id || post._id;

    const pCat = (post.category || '').toLowerCase();

    if (pCat === 'event' || pCat.includes('event') || targetCat.includes('event')) {
      const eventDate = post.createdAt ? new Date(post.createdAt) : new Date();
      const day = eventDate.getDate();
      const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();

      return `
        <div class="event-card in-view" style="display:flex; flex-direction:column; background:#fff; border-radius:18px; box-shadow:0 15px 35px rgba(11,27,50,0.08); overflow:hidden; transition:transform 0.3s ease;">
          <div style="height:180px; overflow:hidden; position:relative; background:#122644;">
            <img src="${img}" alt="${title}" style="width:100%; height:100%; object-fit:cover; opacity:0.9;" onerror="this.src='bglogo.png';">
            <div style="position:absolute; top:14px; left:14px; background:#0B1B32; color:#FAF6EC; padding:8px 14px; border-radius:10px; text-align:center; font-family:'Fraunces',serif;">
              <div style="font-size:1.4rem; font-weight:700; line-height:1;">${day}</div>
              <div style="font-size:0.65rem; color:#E7C878; font-weight:700; letter-spacing:1px;">${month}</div>
            </div>
          </div>
          <div style="padding:22px; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="font-size:0.75rem; font-weight:700; color:#C9A24B; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px;">📅 Upcoming Event</div>
              <h3 style="font-size:1.15rem; font-weight:700; color:#101826; margin-bottom:10px; line-height:1.3; font-family:'Fraunces',serif;">${title}</h3>
              <p style="font-size:0.9rem; color:#4a5568; line-height:1.5; margin-bottom:18px;">${desc}</p>
            </div>
            <button onclick="openPostModal('${id}')" style="background:#0B1B32; color:#FAF6EC; border:none; padding:10px 18px; border-radius:99px; font-size:0.85rem; font-weight:700; cursor:pointer; transition:background 0.2s ease; align-self:flex-start;">
              View Event Details →
            </button>
          </div>
        </div>
      `;
    }

    if (pCat === 'blog' || pCat.includes('blog') || targetCat.includes('blog')) {
      return `
        <article class="blog-card" style="background:#fff; border-radius:18px; overflow:hidden; box-shadow:0 15px 35px rgba(11,27,50,0.08); display:flex; flex-direction:column; justify-content:space-between; transition:transform 0.3s ease;">
          <div>
            <div style="height:200px; overflow:hidden; background:#0B1B32; position:relative;">
              <img src="${img}" alt="${title}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='bglogo.png';">
              <span style="position:absolute; top:14px; left:14px; background:rgba(11,27,50,0.85); backdrop-filter:blur(6px); color:#E7C878; font-size:0.72rem; font-weight:700; padding:4px 12px; border-radius:99px; text-transform:uppercase; letter-spacing:0.08em;">
                📝 Blog
              </span>
            </div>
            <div style="padding:24px;">
              <div style="font-size:0.78rem; color:#8899a6; margin-bottom:10px; font-weight:600;">${dateStr}</div>
              <h3 style="font-size:1.25rem; font-weight:700; color:#101826; margin-bottom:12px; line-height:1.35; font-family:'Fraunces',serif;">${title}</h3>
              <p style="font-size:0.92rem; color:#4a5568; line-height:1.6; margin-bottom:16px;">${desc}</p>
            </div>
          </div>
          <div style="padding:0 24px 24px;">
            <button onclick="openPostModal('${id}')" style="color:#2455C9; font-weight:700; font-size:0.9rem; background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:6px;">
              Read Full Article <span style="font-size:1.1rem;">→</span>
            </button>
          </div>
        </article>
      `;
    }

    // Default: News Card
    return `
      <div class="news-card" style="background:#fff; border-radius:18px; padding:26px; box-shadow:0 15px 35px rgba(11,27,50,0.08); display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <span style="background:rgba(36,85,201,0.1); color:#2455C9; font-size:0.75rem; font-weight:700; padding:4px 12px; border-radius:99px; text-transform:uppercase; letter-spacing:0.06em;">📰 News & Announcements</span>
            <span style="font-size:0.78rem; color:#8899a6; font-weight:600;">${dateStr}</span>
          </div>
          <h3 style="font-size:1.2rem; font-weight:700; color:#101826; margin-bottom:10px; line-height:1.35; font-family:'Fraunces',serif;">${title}</h3>
          <p style="font-size:0.92rem; color:#4a5568; line-height:1.6; margin-bottom:18px;">${desc}</p>
        </div>
        <button onclick="openPostModal('${id}')" style="background:none; border:none; color:#C9A24B; font-weight:700; font-size:0.9rem; cursor:pointer; text-align:left; padding:0;">
          Read Announcement →
        </button>
      </div>
    `;
  }).join('');
}

// Helper: Fallback Images
function getCategoryFallbackImage(category) {
  if (category === 'Blog') return 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
  if (category === 'Event') return 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80';
  return 'bglogo.png';
}

// ── POST DETAIL MODAL ─────────────────────────────────────────────────────────
// ── POST DETAIL MODAL ─────────────────────────────────────────────────────────
window.openPostModal = function(id) {
  const post = cachedPosts.find(p => p.id === id || p._id === id);
  if (!post) return;

  let modal = document.getElementById('post-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'post-detail-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(11,27,50,0.85); backdrop-filter:blur(8px); z-index:9999; display:flex; align-items:flex-start; justify-content:center; padding:20px; overflow-y:auto; box-sizing:border-box;';
    document.body.appendChild(modal);
  }

  // Backdrop click handler
  modal.onclick = function(e) {
    if (e.target === modal) {
      closePostModal();
    }
  };

  const category = escHtml(post.category || 'Post');
  const title = escHtml(post.title || '');
  const content = escHtml(post.content || post.description || '').replace(/\n/g, '<br>');
  const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const imgHtml = post.imageUrl ? `<div style="max-height:320px; overflow:hidden; border-radius:14px; margin-bottom:20px;"><img src="${post.imageUrl}" alt="${title}" style="width:100%; height:100%; object-fit:cover;"></div>` : '';

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const marginTopVal = isDesktop ? '80px' : '30px';

  modal.innerHTML = `
    <div class="modal-content-box" style="background:#fff; border-radius:24px; max-width:720px; width:100%; max-height:calc(90vh - 60px); overflow-y:auto; padding:36px 32px 32px 32px; position:relative; box-shadow:0 25px 60px rgba(0,0,0,0.4); margin-top:${marginTopVal}; margin-bottom:30px; animation: modalFadeIn 0.3s ease;">
      <button class="modal-close close-btn" onclick="closePostModal(); event.stopPropagation();" aria-label="Close modal" style="position:absolute; top:16px; right:16px; z-index:10000; width:38px; height:38px; border-radius:50%; background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; font-size:1.4rem; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s ease; box-shadow:0 2px 8px rgba(0,0,0,0.1);" onmouseover="this.style.background='#e2e8f0'; this.style.transform='scale(1.08)';" onmouseout="this.style.background='#f1f5f9'; this.style.transform='scale(1)';">&times;</button>
      
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; padding-right:45px;">
        <span style="background:rgba(201,162,75,0.15); color:#C9A24B; font-size:0.75rem; font-weight:700; padding:4px 14px; border-radius:99px; text-transform:uppercase; letter-spacing:0.08em;">${category}</span>
        <span style="font-size:0.82rem; color:#8899a6; font-weight:600;">${dateStr}</span>
      </div>

      <h2 style="font-family:'Fraunces',serif; font-size:1.8rem; font-weight:700; color:#101826; margin-bottom:20px; line-height:1.3; padding-right:30px;">${title}</h2>
      
      ${imgHtml}

      <div style="font-size:1rem; color:#2d3748; line-height:1.75; white-space:pre-line;">
        ${content}
      </div>

      <div style="margin-top:30px; padding-top:20px; border-top:1px solid rgba(0,0,0,0.08); display:flex; justify-content:flex-end;">
        <button onclick="closePostModal()" style="background:#0B1B32; color:#FAF6EC; border:none; padding:10px 24px; border-radius:99px; font-weight:700; font-size:0.9rem; cursor:pointer;">Close Article</button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closePostModal = function() {
  const modal = document.getElementById('post-detail-modal');
  if (modal) {
    modal.style.display = 'none';
  }
  document.body.style.overflow = '';
};

// Keyboard Accessibility: Close modal on Escape key
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      const modal = document.getElementById('post-detail-modal');
      if (modal && modal.style.display !== 'none') {
        closePostModal();
      }
    }
  });
}

function escHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
