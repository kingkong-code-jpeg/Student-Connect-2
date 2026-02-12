/* =========================================
   ICCT HUB — script.js
   Supports both embedded dashboard (index.html)
   and separate HTML pages
   ========================================= */

const API_BASE = 'http://localhost:5000/api';

let authToken = sessionStorage.getItem('authToken') || null;
let currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
let currentInboxTab = 'inbox';
let currentLFTab = 'lost';
let calendarDate = new Date();
let calendarEvents = [];

// ───────────── Utility ─────────────
function initIcons() { if (window.lucide) lucide.createIcons(); }

function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function showToast(msg, type = 'info') {
    let c = document.getElementById('toast-container');
    if (!c) {
        c = document.createElement('div');
        c.id = 'toast-container';
        document.body.appendChild(c);
    }
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

// ───────────── API Helper ─────────────
async function api(endpoint, options = {}) {
    const config = { headers: { 'Content-Type': 'application/json' }, ...options };
    if (authToken) config.headers['Authorization'] = `Bearer ${authToken}`;
    if (options.body instanceof FormData) delete config.headers['Content-Type'];

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, config);
        if (res.status === 401) { handleLogout(true); throw new Error('Session expired'); }
        if (res.headers.get('Content-Type')?.includes('application/pdf')) return res.blob();
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Request failed');
        return data;
    } catch (err) { throw err; }
}

// ───────────── Modal ─────────────
function openModal(id) { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }
function switchModal(a, b) { closeModal(a); setTimeout(() => openModal(b), 200); }

// ───────────── Sidebar ─────────────
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed');
}
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('mobile-open');
}
function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');
}

// ───────────── Auth ─────────────
async function handleLogin(e) {
    e.preventDefault();
    const name = document.getElementById('login-name').value;
    const studentId = document.getElementById('login-student-id').value;
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        const data = await api('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ name, studentId, email, password }),
        });
        authToken = data.token;
        currentUser = data.user;
        sessionStorage.setItem('authToken', authToken);
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        closeModal('login-modal');
        // Redirect to dashboard page
        window.location.href = 'dashboard.html';
    } catch (err) {
        showToast(err.message || 'Login failed', 'error');
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('admin-login-email').value;
    const password = document.getElementById('admin-login-password').value;
    try {
        const data = await api('/auth/admin-login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        authToken = data.token;
        currentUser = data.user;
        sessionStorage.setItem('authToken', authToken);
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        closeModal('admin-login-modal');
        // Redirect to admin dashboard
        window.location.href = 'dashboard.html';
    } catch (err) {
        showToast(err.message || 'Admin login failed', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const pw = document.getElementById('register-password').value;
    const cpw = document.getElementById('register-confirm-password').value;
    if (pw !== cpw) { showToast('Passwords do not match', 'error'); return; }
    if (!document.getElementById('terms').checked) { showToast('Please accept terms', 'error'); return; }

    try {
        await api('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name: document.getElementById('register-name').value,
                studentId: document.getElementById('register-student-id').value,
                email: document.getElementById('register-email').value,
                password: pw,
            }),
        });
        showToast('Account created! Please login.', 'success');
        switchModal('register-modal', 'login-modal');
    } catch (err) {
        showToast(err.message || 'Registration failed', 'error');
    }
}

function handleLogout(expired) {
    authToken = null;
    currentUser = null;
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUser');
    if (expired) showToast('Session expired', 'error');
    // If on a separate page, redirect to index.html
    const page = document.body.dataset.page;
    if (page) {
        window.location.href = 'index.html';
    } else {
        showPage('landing-page');
    }
}

// ───────────── Page Switching (index.html) ─────────────
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');
    window.scrollTo(0, 0);
}

function showDashboardSection(sectionId) {
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    // Show selected section
    const section = document.getElementById(sectionId + '-section');
    if (section) section.classList.add('active');
    // Update active nav item
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));
    event?.target?.closest('.nav-item')?.classList.add('active');
    // Close mobile sidebar
    closeMobileSidebar();
    initIcons();
}

function enterDashboard() {
    if (!currentUser) return;
    const nameEl = document.getElementById('user-name');
    const dashNameEl = document.getElementById('dashboard-user-name');
    if (nameEl) nameEl.textContent = currentUser.name;
    if (dashNameEl) dashNameEl.textContent = currentUser.name;

    // Dark mode
    if (currentUser.darkMode) {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    } else {
        localStorage.setItem('darkMode', 'false');
    }

    initIcons();
}

// ───────────── Email Functions (embedded inbox) ─────────────
function openEmail(id) {
    document.querySelector('.inbox-container').style.display = 'none';
    document.getElementById('email-viewer').style.display = 'block';
}

function closeEmail() {
    document.getElementById('email-viewer').style.display = 'none';
    document.querySelector('.inbox-container').style.display = 'block';
}

// ───────────── Tab Functions (embedded lost & found) ─────────────
function switchTab(tab) {
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    event?.target?.classList.add('active');
}

// ───────────── Separate Page Setup ─────────────
function setupSeparatePage() {
    // Set user info in top bar
    const nameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('top-bar-avatar');
    if (nameEl && currentUser) nameEl.textContent = currentUser.name;
    if (avatarEl && currentUser?.profilePicture) {
        avatarEl.src = currentUser.profilePicture;
    } else if (avatarEl) {
        avatarEl.style.display = 'none';
    }

    // Show admin nav
    const adminNav = document.getElementById('admin-nav');
    if (adminNav && currentUser?.role === 'admin') {
        adminNav.style.display = 'block';
    }

    // Apply dark mode
    if (currentUser?.darkMode) {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
        const toggle = document.getElementById('dark-mode-toggle');
        if (toggle) toggle.checked = true;
    } else {
        document.documentElement.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
    }
}

// ───────────── Page-Specific Data Loaders ─────────────

// Calendar Functions
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYearLabel = document.getElementById('calendar-month-year');
    if (!grid || !monthYearLabel) return;

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    monthYearLabel.textContent = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    
    // Get event dates for this month
    const eventDates = new Set();
    calendarEvents.forEach(event => {
        const eventDate = new Date(event.eventDate);
        if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
            eventDates.add(eventDate.getDate());
        }
    });
    
    let html = '';
    
    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = isCurrentMonth && day === today.getDate();
        const hasEvent = eventDates.has(day);
        const classes = ['calendar-day'];
        if (isToday) classes.push('today');
        if (hasEvent) classes.push('has-event');
        
        html += `<div class="${classes.join(' ')}" onclick="showDayEvents(${year}, ${month}, ${day})">${day}</div>`;
    }
    
    // Next month days
    const totalCells = startDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
        html += `<div class="calendar-day other-month">${i}</div>`;
    }
    
    grid.innerHTML = html;
}

function changeCalendarMonth(delta) {
    calendarDate.setMonth(calendarDate.getMonth() + delta);
    renderCalendar();
}

function showDayEvents(year, month, day) {
    const dateStr = new Date(year, month, day).toDateString();
    const dayEvents = calendarEvents.filter(e => new Date(e.eventDate).toDateString() === dateStr);
    
    if (dayEvents.length === 0) {
        showToast('No events on this day', 'info');
        return;
    }
    
    const eventTitles = dayEvents.map(e => `• ${e.title}`).join('\n');
    showToast(`Events on ${new Date(year, month, day).toLocaleDateString()}:\n${eventTitles}`, 'info');
}

// Separate Dashboard Page
async function loadDashboard() {
    const dashboardName = document.getElementById('dashboard-user-name');
    if (dashboardName && currentUser) dashboardName.textContent = currentUser.name;

    try {
        let [events, messages, lost, found] = await Promise.all([
            api('/events').catch(() => []),
            api('/messages').catch(() => []),
            api('/lost-items').catch(() => []),
            api('/found-items').catch(() => []),
        ]);

        // Filter events by user's course/year/section (non-admin only)
        if (currentUser && currentUser.role !== 'admin') {
            events = events.filter(e => {
                if (e.targetAudience === 'All' || !e.targetAudience) return true;
                const courses = e.targetCourses || [];
                const years = e.targetYears || [];
                const sections = e.targetSections || [];
                const matchCourse = courses.length === 0 || !currentUser.course || courses.includes(currentUser.course);
                const matchYear = years.length === 0 || !currentUser.yearLevel || years.includes(currentUser.yearLevel);
                const matchSection = sections.length === 0 || !currentUser.section || sections.includes(currentUser.section);
                return matchCourse && matchYear && matchSection;
            });
        }

        // Store filtered events for calendar
        calendarEvents = events;
        renderCalendar();
        
        // Filter upcoming events for stats and list
        const upcomingEvents = events.filter(e => e.status === 'Upcoming');

        const se = document.getElementById('stat-events');
        const sm = document.getElementById('stat-messages');
        const sl = document.getElementById('stat-lost');
        const sf = document.getElementById('stat-found');
        if (se) se.textContent = upcomingEvents.length || 0;
        if (sm) sm.textContent = messages.filter(m => !m.read).length || 0;
        if (sl) sl.textContent = lost.length || 0;
        if (sf) sf.textContent = found.length || 0;

        const eventsList = document.getElementById('dashboard-events-list');
        if (eventsList && upcomingEvents.length) {
            eventsList.innerHTML = upcomingEvents.slice(0, 5).map(e => `
                <div onclick="viewEventDetail('${e._id}')" style="display:flex;gap:12px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;">
                    <div class="event-date-block">
                        <div class="month">${new Date(e.eventDate).toLocaleString('en', { month: 'short' })}</div>
                        <div class="day">${new Date(e.eventDate).getDate()}</div>
                    </div>
                    <div><strong>${e.title}</strong><br><span class="text-muted">${e.location || ''}</span></div>
                </div>`).join('');
        }

        const foundList = document.getElementById('dashboard-found-list');
        if (foundList && found.length) {
            foundList.innerHTML = found.slice(0, 5).map(f => `
                <div style="display:flex;gap:12px;padding:8px 0;border-bottom:1px solid var(--border);">
                    <div><strong>${f.description?.substring(0, 40)}</strong><br>
                    <span class="text-muted">${f.category} · ${formatDate(f.dateFound)}</span></div>
                </div>`).join('');
        }
    } catch (err) { console.error('Dashboard load error:', err); }
    initIcons();
}

// Separate Inbox Page
async function loadInbox() {
    try {
        const endpoint = currentInboxTab === 'sent' ? '/messages/sent' : '/messages';
        const messages = await api(endpoint);
        renderMessages(messages);
    } catch (err) { 
        console.error('Inbox error:', err); 
        showToast('Failed to load messages: ' + (err.message || 'Unknown error'), 'error');
        const list = document.getElementById('message-list');
        if (list) list.innerHTML = '<div class="empty-state"><i data-lucide="alert-circle"></i><p>Failed to load messages</p></div>';
        initIcons();
    }
}

function renderMessages(messages) {
    const list = document.getElementById('message-list');
    if (!list) return;
    if (!Array.isArray(messages) || messages.length === 0) {
        list.innerHTML = '<div class="empty-state"><i data-lucide="inbox"></i><p>No messages</p></div>';
        initIcons(); return;
    }
    list.innerHTML = messages.map(m => {
        const other = currentInboxTab === 'sent' ? m.to : m.from;
        const name = other?.name || 'Unknown';
        const initial = name.charAt(0).toUpperCase();
        const labels = (m.labels || []).map(l => `<span class="label-tag">${l}</span>`).join('');
        return `
            <div class="message-item ${!m.read && currentInboxTab === 'inbox' ? 'unread' : ''}" onclick="viewMessage('${m._id}')">
                <div class="message-avatar">${initial}</div>
                <div class="message-info">
                    <div class="message-top">
                        <span class="message-sender">${name}</span>
                        <span class="message-date">${formatDate(m.createdAt)}</span>
                    </div>
                    <div class="message-subject">${m.subject || '(No Subject)'}</div>
                    <div class="message-preview">${m.body?.substring(0, 80) || ''}</div>
                    ${labels ? `<div class="message-labels">${labels}</div>` : ''}
                </div>
            </div>`;
    }).join('');
    initIcons();
}

function switchInboxTab(tab, btn) {
    currentInboxTab = tab;
    document.querySelectorAll('#inbox-filter-bar .tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    loadInbox();
}

function filterInbox() {
    const search = document.getElementById('inbox-search')?.value.toLowerCase() || '';
    const label = document.getElementById('inbox-label-filter')?.value || '';
    document.querySelectorAll('.message-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        const matchSearch = !search || text.includes(search);
        const matchLabel = !label || item.innerHTML.includes(label);
        item.style.display = matchSearch && matchLabel ? '' : 'none';
    });
}

async function viewMessage(id) {
    try {
        const m = await api(`/messages/${id}`);
        const viewer = document.getElementById('message-viewer');
        const list = document.getElementById('message-list');
        const filterBar = document.getElementById('inbox-filter-bar');
        const detail = document.getElementById('message-detail');
        if (viewer) viewer.style.display = 'block';
        if (list) list.style.display = 'none';
        if (filterBar) filterBar.style.display = 'none';
        if (detail) {
            detail.innerHTML = `
                <h3>${m.subject || '(No Subject)'}</h3>
                <div class="meta">From: ${m.from?.name || 'Unknown'} · ${formatDate(m.createdAt)}</div>
                <p>${m.body || ''}</p>`;
        }
    } catch (err) { showToast('Could not load message', 'error'); }
}

function closeMessageViewer() {
    const viewer = document.getElementById('message-viewer');
    const list = document.getElementById('message-list');
    const filterBar = document.getElementById('inbox-filter-bar');
    if (viewer) viewer.style.display = 'none';
    if (list) list.style.display = 'flex';
    if (filterBar) filterBar.style.display = 'flex';
}

async function sendMessage(e) {
    e.preventDefault();
    const labelsSelect = document.getElementById('compose-labels');
    const labels = Array.from(labelsSelect?.selectedOptions || []).map(o => o.value);
    try {
        await api('/messages', {
            method: 'POST',
            body: JSON.stringify({
                to: document.getElementById('compose-to').value,
                subject: document.getElementById('compose-subject').value,
                body: document.getElementById('compose-body').value,
                labels,
            }),
        });
        closeModal('compose-modal');
        showToast('Message sent!', 'success');
        loadInbox();
    } catch (err) { showToast(err.message || 'Send failed', 'error'); }
}

// Check for prefilled message data (e.g., from lost-found page)
function checkPrefillMessage() {
    const prefillData = sessionStorage.getItem('prefillMessage');
    if (prefillData) {
        try {
            const { to, subject, body } = JSON.parse(prefillData);
            document.getElementById('compose-to').value = to || '';
            document.getElementById('compose-subject').value = subject || '';
            document.getElementById('compose-body').value = body || '';
            sessionStorage.removeItem('prefillMessage');
            openModal('compose-modal');
        } catch (err) {
            console.error('Failed to parse prefill message data');
        }
    }
}

// Separate Lost & Found Page
async function loadLostFound() {
    const endpoint = currentLFTab === 'lost' ? '/lost-items' : '/found-items';
    try {
        const items = await api(endpoint);
        renderLostFoundItems(items);
    } catch (err) { 
        console.error('LF error:', err); 
        showToast('Failed to load items: ' + (err.message || 'Unknown error'), 'error');
        const grid = document.getElementById('lost-found-grid');
        if (grid) grid.innerHTML = '<div class="empty-state"><i data-lucide="alert-circle"></i><p>Failed to load items</p></div>';
        initIcons();
    }
}

function renderLostFoundItems(items) {
    const grid = document.getElementById('lost-found-grid');
    if (!grid) return;
    if (!items.length) {
        grid.innerHTML = '<div class="empty-state"><i data-lucide="search-x"></i><p>No items to display</p></div>';
        initIcons(); return;
    }
    grid.innerHTML = items.map(item => {
        const img = item.images?.[0] || '';
        const desc = item.description?.substring(0, 50) || 'No description';
        const dateField = currentLFTab === 'lost' ? item.dateLost : item.dateFound;
        return `
            <div class="item-card" onclick="viewItem('${item._id}', '${currentLFTab}')">
                ${img ? `<img src="${img}" class="item-card-img" alt="">` : '<div class="item-card-img" style="display:flex;align-items:center;justify-content:center;color:var(--text-muted);"><i data-lucide="image-off"></i></div>'}
                <div class="item-card-body">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span class="category-badge">${item.category || 'Other'}</span>
                        <span class="status-badge status-${item.status || currentLFTab}">${item.status || currentLFTab}</span>
                    </div>
                    <h4>${desc}</h4>
                    <p>${formatDate(dateField)}</p>
                </div>
            </div>`;
    }).join('');
    initIcons();
}

function switchLostFoundTab(tab, btn) {
    currentLFTab = tab;
    document.querySelectorAll('.filter-bar .tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    loadLostFound();
}

function filterLostFound() {
    const cat = document.getElementById('lf-category-filter')?.value || '';
    const status = document.getElementById('lf-status-filter')?.value || '';
    document.querySelectorAll('.item-card').forEach(card => {
        const text = card.textContent;
        const matchCat = !cat || text.includes(cat);
        const matchStatus = !status || text.includes(status);
        card.style.display = matchCat && matchStatus ? '' : 'none';
    });
}

function openLostFoundModal() {
    const type = currentLFTab;
    document.getElementById('lf-item-type').value = type;
    document.getElementById('lf-item-id').value = ''; // Clear for new item
    document.getElementById('lf-modal-title').innerHTML = `<i data-lucide="search" class="modal-title-icon"></i> Report ${type === 'lost' ? 'Lost' : 'Found'} Item`;
    document.getElementById('lf-date-label').textContent = type === 'lost' ? 'Date Lost' : 'Date Found';
    document.getElementById('lf-location-label').textContent = type === 'lost' ? 'Location Lost' : 'Location Found';
    document.getElementById('lf-name-label').textContent = type === 'lost' ? 'Owner Name' : 'Finder Name';
    // Clear form fields for new item
    document.getElementById('lf-description').value = '';
    document.getElementById('lf-category').value = 'Electronics';
    document.getElementById('lf-date').value = '';
    document.getElementById('lf-location').value = '';
    document.getElementById('lf-contact-name').value = '';
    document.getElementById('lf-contact-info').value = '';
    document.getElementById('lf-images').value = '';
    openModal('lf-form-modal');
    initIcons();
}

async function submitLostFoundItem(e) {
    e.preventDefault();
    const type = document.getElementById('lf-item-type').value;
    const itemId = document.getElementById('lf-item-id').value;
    const isEdit = !!itemId;
    const endpoint = type === 'lost' 
        ? (isEdit ? `/lost-items/${itemId}` : '/lost-items') 
        : (isEdit ? `/found-items/${itemId}` : '/found-items');
    
    const formData = new FormData();
    formData.append('description', document.getElementById('lf-description').value);
    formData.append('category', document.getElementById('lf-category').value);
    formData.append(type === 'lost' ? 'dateLost' : 'dateFound', document.getElementById('lf-date').value);
    formData.append(type === 'lost' ? 'locationLost' : 'locationFound', document.getElementById('lf-location').value);
    formData.append(type === 'lost' ? 'ownerName' : 'finderName', document.getElementById('lf-contact-name').value);
    formData.append(type === 'lost' ? 'ownerContact' : 'finderContact', document.getElementById('lf-contact-info').value);
    const files = document.getElementById('lf-images').files;
    for (let i = 0; i < files.length; i++) formData.append('images', files[i]);

    try {
        await api(endpoint, { method: isEdit ? 'PATCH' : 'POST', body: formData });
        closeModal('lf-form-modal');
        showToast(isEdit ? 'Item updated successfully!' : 'Item reported successfully!', 'success');
        loadLostFound();
    } catch (err) { showToast(err.message || 'Failed to submit', 'error'); }
}

async function viewItem(id, type) {
    const endpoint = type === 'lost' ? `/lost-items/${id}` : `/found-items/${id}`;
    try {
        const item = await api(endpoint);
        const content = document.getElementById('item-detail-content');
        if (content) {
            const itemImages = item.images || [];
            let imageGallery = '';
            
            if (itemImages.length > 0) {
                const mainImage = `<div class="item-main-image">
                    <img id="item-gallery-main" src="${itemImages[0]}" alt="Item image" onclick="openImageLightbox('${itemImages[0]}')">
                </div>`;
                
                const thumbnails = itemImages.length > 1 ? `
                    <div class="item-thumbnails">
                        ${itemImages.map((src, idx) => `
                            <img src="${src}" alt="Thumbnail ${idx + 1}" 
                                class="item-thumbnail ${idx === 0 ? 'active' : ''}"
                                onclick="changeMainImage('${src}', this)">
                        `).join('')}
                    </div>` : '';
                
                imageGallery = `<div class="item-gallery">${mainImage}${thumbnails}</div>`;
            } else {
                imageGallery = `<div class="item-no-image">
                    <i data-lucide="image-off"></i>
                    <span>No images available</span>
                </div>`;
            }
            
            const isOwner = currentUser && item.postedBy && item.postedBy._id === currentUser._id;
            const posterEmail = item.postedBy?.email || '';
            const posterName = item.postedBy?.name || 'User';
            
            let actionButtons = '';
            if (isOwner) {
                actionButtons = `
                    <div class="item-detail-actions">
                        <button class="btn-secondary" onclick="openEditItemModal('${id}', '${type}')">
                            <i data-lucide="edit"></i> Edit
                        </button>
                        <button class="btn-danger" onclick="deleteItem('${id}', '${type}')">
                            <i data-lucide="trash-2"></i> Delete
                        </button>
                    </div>`;
            } else if (posterEmail) {
                actionButtons = `
                    <div class="item-detail-actions">
                        <button class="btn-primary btn-full" onclick="messageItemPoster('${posterEmail}', '${posterName}', '${type}', '${item.description?.substring(0, 30) || 'Item'}')">
                            <i data-lucide="mail"></i> Message ${type === 'lost' ? 'Owner' : 'Finder'}
                        </button>
                    </div>`;
            }
            
            const statusClass = item.status === 'Lost' ? 'status-lost' : 
                               item.status === 'Found' ? 'status-found' : 'status-returned';
            const typeIcon = type === 'lost' ? 'search' : 'package-check';
            const typeLabel = type === 'lost' ? 'Lost Item' : 'Found Item';
            
            content.innerHTML = `
                <div class="item-detail-header">
                    <span class="item-type-badge ${type}">
                        <i data-lucide="${typeIcon}"></i> ${typeLabel}
                    </span>
                    <span class="status-badge ${statusClass}">${item.status}</span>
                </div>
                
                ${imageGallery}
                
                <div class="item-detail-body">
                    <h2 class="item-detail-title">${item.description || 'No description'}</h2>
                    
                    <div class="item-detail-grid">
                        <div class="item-detail-row">
                            <div class="item-detail-icon">
                                <i data-lucide="tag"></i>
                            </div>
                            <div class="item-detail-info">
                                <span class="item-detail-label">Category</span>
                                <span class="item-detail-value">${item.category}</span>
                            </div>
                        </div>
                        
                        <div class="item-detail-row">
                            <div class="item-detail-icon">
                                <i data-lucide="calendar"></i>
                            </div>
                            <div class="item-detail-info">
                                <span class="item-detail-label">${type === 'lost' ? 'Date Lost' : 'Date Found'}</span>
                                <span class="item-detail-value">${formatDate(type === 'lost' ? item.dateLost : item.dateFound)}</span>
                            </div>
                        </div>
                        
                        <div class="item-detail-row">
                            <div class="item-detail-icon">
                                <i data-lucide="map-pin"></i>
                            </div>
                            <div class="item-detail-info">
                                <span class="item-detail-label">Location</span>
                                <span class="item-detail-value">${(type === 'lost' ? item.locationLost : item.locationFound) || 'Not specified'}</span>
                            </div>
                        </div>
                        
                        <div class="item-detail-row">
                            <div class="item-detail-icon">
                                <i data-lucide="user"></i>
                            </div>
                            <div class="item-detail-info">
                                <span class="item-detail-label">${type === 'lost' ? 'Owner' : 'Finder'}</span>
                                <span class="item-detail-value">${(type === 'lost' ? item.ownerName : item.finderName) || 'Not specified'}</span>
                            </div>
                        </div>
                        
                        <div class="item-detail-row">
                            <div class="item-detail-icon">
                                <i data-lucide="mail"></i>
                            </div>
                            <div class="item-detail-info">
                                <span class="item-detail-label">Contact</span>
                                <span class="item-detail-value">${(type === 'lost' ? item.ownerContact : item.finderContact) || 'Not specified'}</span>
                            </div>
                        </div>
                        
                        <div class="item-detail-row">
                            <div class="item-detail-icon">
                                <i data-lucide="user-circle"></i>
                            </div>
                            <div class="item-detail-info">
                                <span class="item-detail-label">Posted by</span>
                                <span class="item-detail-value">${posterName}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${actionButtons}
                </div>`;
            initIcons();
        }
        openModal('item-detail-modal');
    } catch (err) { showToast('Could not load item', 'error'); }
}

// Image gallery functions
function changeMainImage(src, thumbnail) {
    const mainImg = document.getElementById('item-gallery-main');
    if (mainImg) {
        mainImg.src = src;
        mainImg.onclick = () => openImageLightbox(src);
    }
    document.querySelectorAll('.item-thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}

function openImageLightbox(src) {
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-overlay" onclick="this.parentElement.remove()"></div>
        <div class="lightbox-content">
            <button class="lightbox-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            <img src="${src}" alt="Full size image">
        </div>`;
    document.body.appendChild(lightbox);
}

// Edit item modal
async function openEditItemModal(id, type) {
    const endpoint = type === 'lost' ? `/lost-items/${id}` : `/found-items/${id}`;
    try {
        const item = await api(endpoint);
        closeModal('item-detail-modal');
        
        document.getElementById('lf-item-id').value = id;
        document.getElementById('lf-item-type').value = type;
        document.getElementById('lf-modal-title').innerHTML = `<i data-lucide="edit" class="modal-title-icon"></i> Edit ${type === 'lost' ? 'Lost' : 'Found'} Item`;
        document.getElementById('lf-date-label').textContent = type === 'lost' ? 'Date Lost' : 'Date Found';
        document.getElementById('lf-location-label').textContent = type === 'lost' ? 'Location Lost' : 'Location Found';
        document.getElementById('lf-name-label').textContent = type === 'lost' ? 'Owner Name' : 'Finder Name';
        
        // Pre-fill form with existing data
        document.getElementById('lf-description').value = item.description || '';
        document.getElementById('lf-category').value = item.category || 'Other';
        const dateValue = type === 'lost' ? item.dateLost : item.dateFound;
        if (dateValue) {
            document.getElementById('lf-date').value = new Date(dateValue).toISOString().slice(0, 16);
        }
        document.getElementById('lf-location').value = (type === 'lost' ? item.locationLost : item.locationFound) || '';
        document.getElementById('lf-contact-name').value = (type === 'lost' ? item.ownerName : item.finderName) || '';
        document.getElementById('lf-contact-info').value = (type === 'lost' ? item.ownerContact : item.finderContact) || '';
        
        openModal('lf-form-modal');
        initIcons();
    } catch (err) { showToast('Could not load item for editing', 'error'); }
}

// Delete item
async function deleteItem(id, type) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const endpoint = type === 'lost' ? `/lost-items/${id}` : `/found-items/${id}`;
    try {
        await api(endpoint, { method: 'DELETE' });
        closeModal('item-detail-modal');
        showToast('Item deleted successfully!', 'success');
        loadLostFound();
    } catch (err) { showToast(err.message || 'Failed to delete item', 'error'); }
}

// Message item poster
function messageItemPoster(email, name, type, itemDesc) {
    closeModal('item-detail-modal');
    
    // Navigate to inbox if not already there
    if (document.body.dataset.page !== 'inbox') {
        // Store message info for pre-filling
        sessionStorage.setItem('prefillMessage', JSON.stringify({
            to: email,
            subject: `Regarding your ${type} item: ${itemDesc}`,
            body: `Hi ${name},\n\nI'm reaching out about your ${type} item listing.\n\n`
        }));
        window.location.href = 'inbox.html';
        return;
    }
    
    // Pre-fill compose modal
    document.getElementById('compose-to').value = email;
    document.getElementById('compose-subject').value = `Regarding your ${type} item: ${itemDesc}`;
    document.getElementById('compose-body').value = `Hi ${name},\n\nI'm reaching out about your ${type} item listing.\n\n`;
    openModal('compose-modal');
}

// Separate Announcements / Events Page
async function loadEvents() {
    try {
        let events = await api('/events');
        // Filter events by user's course/year/section (non-admin only)
        if (currentUser && currentUser.role !== 'admin') {
            events = events.filter(e => {
                if (e.targetAudience === 'All' || !e.targetAudience) return true;
                const courses = e.targetCourses || [];
                const years = e.targetYears || [];
                const sections = e.targetSections || [];
                const matchCourse = courses.length === 0 || !currentUser.course || courses.includes(currentUser.course);
                const matchYear = years.length === 0 || !currentUser.yearLevel || years.includes(currentUser.yearLevel);
                const matchSection = sections.length === 0 || !currentUser.section || sections.includes(currentUser.section);
                return matchCourse && matchYear && matchSection;
            });
        }
        renderEventsList(events);
    } catch (err) { console.error('Events error:', err); }
}

function renderEventsList(events) {
    const container = document.getElementById('events-list');
    if (!container) return;
    if (!events.length) {
        container.innerHTML = '<div class="empty-state"><i data-lucide="calendar-x"></i><p>No announcements</p></div>';
        initIcons(); return;
    }
    container.innerHTML = events.map(e => {
        const d = new Date(e.eventDate);
        const audience = e.targetAudience === 'All' ? 'All Students' : 
            [...(e.targetCourses || []), ...(e.targetYears || []), ...(e.targetSections || []).map(s => 'Section ' + s)].join(', ') || 'All Students';
        return `
            <div class="event-list-item" onclick="viewEventDetail('${e._id}')" data-id="${e._id}" data-courses="${(e.targetCourses || []).join(',')}" data-years="${(e.targetYears || []).join(',')}" data-sections="${(e.targetSections || []).join(',')}">
                <div class="event-date-block">
                    <div class="month">${d.toLocaleString('en', { month: 'short' })}</div>
                    <div class="day">${d.getDate()}</div>
                </div>
                <div class="event-list-info">
                    <h4>${e.title}</h4>
                    <p>${e.content?.substring(0, 100) || ''}</p>
                    <div style="margin-top:6px;">
                        <span class="category-badge">${audience.length > 50 ? audience.substring(0, 50) + '...' : audience}</span>
                        <span class="status-badge status-${e.status}">${e.status}</span>
                    </div>
                </div>
            </div>`;
    }).join('');
    initIcons();
}

async function viewEventDetail(id) {
    try {
        const events = await api('/events');
        const e = events.find(ev => ev._id === id);
        if (!e) { showToast('Event not found', 'error'); return; }
        const d = new Date(e.eventDate);
        const audience = e.targetAudience === 'All' ? 'All Students' : 
            [...(e.targetCourses || []), ...(e.targetYears || []), ...(e.targetSections || []).map(s => 'Section ' + s)].join(', ') || 'All Students';
        
        const modal = document.getElementById('item-detail-modal') || document.getElementById('event-detail-modal');
        const content = document.getElementById('item-detail-content') || document.getElementById('event-detail-content');
        
        if (content) {
            content.innerHTML = `
                <div class="item-detail-header">
                    <span class="item-type-badge found">
                        <i data-lucide="calendar"></i> Event
                    </span>
                    <span class="status-badge status-${e.status}">${e.status}</span>
                </div>
                <div class="item-detail-body">
                    <h2 class="item-detail-title">${e.title}</h2>
                    <p style="margin-bottom:16px;color:var(--text-muted);font-size:.9rem;line-height:1.6;">${e.content || 'No description'}</p>
                    <div class="item-detail-grid">
                        <div class="item-detail-row">
                            <div class="item-detail-icon"><i data-lucide="calendar"></i></div>
                            <div class="item-detail-info">
                                <span class="item-detail-label">Date & Time</span>
                                <span class="item-detail-value">${d.toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                        <div class="item-detail-row">
                            <div class="item-detail-icon"><i data-lucide="map-pin"></i></div>
                            <div class="item-detail-info">
                                <span class="item-detail-label">Location</span>
                                <span class="item-detail-value">${e.location || 'TBA'}</span>
                            </div>
                        </div>
                        <div class="item-detail-row">
                            <div class="item-detail-icon"><i data-lucide="users"></i></div>
                            <div class="item-detail-info">
                                <span class="item-detail-label">Target Audience</span>
                                <span class="item-detail-value">${audience}</span>
                            </div>
                        </div>
                    </div>
                </div>`;
            initIcons();
        }
        if (modal) openModal(modal.id);
    } catch (err) { showToast('Could not load event', 'error'); }
}

function filterEvents() {
    const course = document.getElementById('event-course-filter')?.value || '';
    const year = document.getElementById('event-year-filter')?.value || '';
    const section = document.getElementById('event-section-filter')?.value || '';
    const status = document.getElementById('event-status-filter')?.value || '';
    document.querySelectorAll('.event-list-item').forEach(item => {
        const courses = item.dataset.courses || '';
        const years = item.dataset.years || '';
        const sections = item.dataset.sections || '';
        const text = item.textContent;
        const matchCourse = !course || courses.includes(course) || courses === '';
        const matchYear = !year || years.includes(year) || years === '';
        const matchSection = !section || sections.includes(section) || sections === '';
        const matchStatus = !status || text.includes(status);
        item.style.display = matchCourse && matchYear && matchSection && matchStatus ? '' : 'none';
    });
}

// Separate Profile Page
function loadProfile() {
    if (!currentUser) return;
    const el = (id) => document.getElementById(id);
    if (el('profile-name')) el('profile-name').textContent = currentUser.name;
    if (el('profile-email')) el('profile-email').textContent = currentUser.email;
    if (el('profile-student-id')) el('profile-student-id').textContent = currentUser.studentId || '';
    if (el('profile-avatar') && currentUser.profilePicture) el('profile-avatar').src = currentUser.profilePicture;
    if (el('profile-course')) el('profile-course').value = currentUser.course || '';
    if (el('profile-year')) el('profile-year').value = currentUser.yearLevel || '';
    if (el('profile-section')) el('profile-section').value = currentUser.section || '';
}

async function updateAcademicInfo(e) {
    e.preventDefault();
    try {
        const user = await api('/profile', {
            method: 'PATCH',
            body: JSON.stringify({
                course: document.getElementById('profile-course').value,
                yearLevel: document.getElementById('profile-year').value,
                section: document.getElementById('profile-section').value,
            }),
        });
        currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        showToast('Academic info updated!', 'success');
    } catch (err) { showToast(err.message || 'Update failed', 'error'); }
}

async function changePassword(e) {
    e.preventDefault();
    const newPw = document.getElementById('new-password').value;
    const confirmPw = document.getElementById('confirm-new-password').value;
    if (newPw !== confirmPw) { showToast('Passwords do not match', 'error'); return; }
    try {
        await api('/profile/password', {
            method: 'PATCH',
            body: JSON.stringify({
                currentPassword: document.getElementById('current-password').value,
                newPassword: newPw,
            }),
        });
        showToast('Password updated!', 'success');
        document.getElementById('change-password-form').reset();
    } catch (err) { showToast(err.message || 'Update failed', 'error'); }
}

async function changeProfilePicture() {
    const file = document.getElementById('profile-pic-input').files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePicture', file);
    try {
        const user = await api('/profile/picture', { method: 'POST', body: formData });
        currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        const avatar = document.getElementById('profile-avatar');
        const topAvatar = document.getElementById('top-bar-avatar');
        if (avatar) avatar.src = user.profilePicture;
        if (topAvatar) { topAvatar.src = user.profilePicture; topAvatar.style.display = 'block'; }
        showToast('Profile picture updated!', 'success');
    } catch (err) { showToast(err.message || 'Upload failed', 'error'); }
}

// Separate Settings Page
async function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    try { 
        const result = await api('/settings/darkmode', { method: 'PATCH' });
        // Update local user state
        if (currentUser) {
            currentUser.darkMode = result.darkMode;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    } catch (err) { 
        console.error(err); 
        showToast('Failed to save theme preference', 'error');
    }
}

async function loadFAQs() {
    try {
        const faqs = await api('/settings/faqs');
        const container = document.getElementById('faq-list');
        if (!container) return;
        if (!faqs.length) { container.innerHTML = '<div class="empty-state"><p>No FAQs available</p></div>'; return; }
        container.innerHTML = faqs.map(f => `
            <div class="faq-item" onclick="this.classList.toggle('open')">
                <div class="faq-question"><span>${f.question}</span><i data-lucide="chevron-down"></i></div>
                <div class="faq-answer">${f.answer}</div>
            </div>`).join('');
        initIcons();
    } catch (err) { console.error('FAQ error:', err); }
}

// ───────────── Admin Functions ─────────────

async function loadAdminEvents() {
    const status = document.getElementById('admin-event-status')?.value || '';
    const url = '/events' + (status ? `?status=${status}` : '');
    try {
        const events = await api(url);
        const tbody = document.getElementById('admin-events-tbody');
        if (!tbody) return;
        tbody.innerHTML = events.map(e => {
            const audience = e.targetAudience === 'All' ? 'All Students' : 
                [...(e.targetCourses || []).map(c => c.split(' ').pop()), ...(e.targetYears || []), ...(e.targetSections || []).map(s => 'Sec ' + s)].slice(0, 3).join(', ') || 'All';
            return `
            <tr>
                <td>${e.title}</td>
                <td><span class="category-badge">${audience.length > 30 ? audience.substring(0, 30) + '...' : audience}</span></td>
                <td>${formatDate(e.eventDate)}</td>
                <td>${e.location || 'N/A'}</td>
                <td><span class="status-badge status-${e.status}">${e.status}</span></td>
                <td class="table-actions">
                    <button class="btn-icon" onclick="editEvent('${e._id}')" title="Edit"><i data-lucide="pencil"></i></button>
                    <button class="btn-icon danger" onclick="archiveEvent('${e._id}')" title="Archive"><i data-lucide="archive"></i></button>
                </td>
            </tr>`}).join('');
        initIcons();
    } catch (err) { console.error(err); }
}

async function editEvent(id) {
    try {
        const e = await api(`/events/${id}`);
        document.getElementById('event-id').value = e._id;
        document.getElementById('event-title').value = e.title;
        document.getElementById('event-content').value = e.content || '';
        document.getElementById('event-audience').value = e.targetAudience || 'All';
        document.getElementById('event-status').value = e.status;
        document.getElementById('event-date').value = e.eventDate ? new Date(e.eventDate).toISOString().slice(0, 16) : '';
        document.getElementById('event-location').value = e.location || '';
        
        // Set multi-selects
        const coursesSelect = document.getElementById('event-courses');
        const yearsSelect = document.getElementById('event-years');
        const sectionsSelect = document.getElementById('event-sections');
        
        if (coursesSelect) {
            Array.from(coursesSelect.options).forEach(opt => opt.selected = (e.targetCourses || []).includes(opt.value));
        }
        if (yearsSelect) {
            Array.from(yearsSelect.options).forEach(opt => opt.selected = (e.targetYears || []).includes(opt.value));
        }
        if (sectionsSelect) {
            Array.from(sectionsSelect.options).forEach(opt => opt.selected = (e.targetSections || []).includes(opt.value));
        }
        
        toggleTargetFields();
        document.getElementById('event-modal-title').innerHTML = '<i data-lucide="pencil" class="modal-title-icon"></i> Edit Event';
        openModal('event-form-modal');
        initIcons();
    } catch (err) { showToast('Could not load event', 'error'); }
}

async function submitEvent(e) {
    e.preventDefault();
    const id = document.getElementById('event-id').value;
    const audience = document.getElementById('event-audience').value;
    
    const coursesSelect = document.getElementById('event-courses');
    const yearsSelect = document.getElementById('event-years');
    const sectionsSelect = document.getElementById('event-sections');
    
    const targetCourses = Array.from(coursesSelect?.selectedOptions || []).map(o => o.value);
    const targetYears = Array.from(yearsSelect?.selectedOptions || []).map(o => o.value);
    const targetSections = Array.from(sectionsSelect?.selectedOptions || []).map(o => o.value);
    
    const formData = new FormData();
    formData.append('title', document.getElementById('event-title').value);
    formData.append('content', document.getElementById('event-content').value);
    formData.append('targetAudience', audience);
    formData.append('targetCourses', JSON.stringify(targetCourses));
    formData.append('targetYears', JSON.stringify(targetYears));
    formData.append('targetSections', JSON.stringify(targetSections));
    formData.append('status', document.getElementById('event-status').value);
    formData.append('eventDate', document.getElementById('event-date').value);
    formData.append('location', document.getElementById('event-location').value);
    const files = document.getElementById('event-images').files;
    for (let i = 0; i < files.length; i++) formData.append('images', files[i]);

    try {
        if (id) {
            await api(`/events/${id}`, { method: 'PUT', body: formData });
        } else {
            await api('/events', { method: 'POST', body: formData });
        }
        closeModal('event-form-modal');
        showToast(id ? 'Event updated!' : 'Event created!', 'success');
        document.getElementById('event-id').value = '';
        loadAdminEvents();
    } catch (err) { showToast(err.message || 'Save failed', 'error'); }
}

function toggleTargetFields() {
    const audience = document.getElementById('event-audience')?.value;
    const targetFields = document.getElementById('target-fields');
    if (targetFields) {
        targetFields.style.display = audience === 'Specific' ? 'block' : 'none';
    }
}

async function archiveEvent(id) {
    if (!confirm('Archive this event?')) return;
    try {
        await api(`/events/${id}`, { method: 'DELETE' });
        showToast('Event archived', 'success');
        loadAdminEvents();
    } catch (err) { showToast(err.message, 'error'); }
}

async function loadAdminLost() {
    try {
        const items = await api('/lost-items');
        const tbody = document.getElementById('admin-lost-tbody');
        if (!tbody) return;
        tbody.innerHTML = items.map(i => `
            <tr>
                <td>${i.description?.substring(0, 40) || ''}</td>
                <td><span class="category-badge">${i.category}</span></td>
                <td>${formatDate(i.dateLost)}</td>
                <td>${i.locationLost || 'N/A'}</td>
                <td>${i.ownerName || 'N/A'}</td>
                <td><span class="status-badge status-${i.status || 'Lost'}">${i.status || 'Lost'}</span></td>
                <td class="table-actions">
                    <button class="btn-icon danger" onclick="archiveItem('${i._id}','lost')" title="Archive"><i data-lucide="archive"></i></button>
                </td>
            </tr>`).join('');
        initIcons();
    } catch (err) { console.error(err); }
}

async function loadAdminFound() {
    try {
        const items = await api('/found-items');
        const tbody = document.getElementById('admin-found-tbody');
        if (!tbody) return;
        tbody.innerHTML = items.map(i => `
            <tr>
                <td>${i.description?.substring(0, 40) || ''}</td>
                <td><span class="category-badge">${i.category}</span></td>
                <td>${formatDate(i.dateFound)}</td>
                <td>${i.locationFound || 'N/A'}</td>
                <td>${i.finderName || 'N/A'}</td>
                <td><span class="status-badge status-${i.status || 'Found'}">${i.status || 'Found'}</span></td>
                <td class="table-actions">
                    <button class="btn-icon danger" onclick="archiveItem('${i._id}','found')" title="Archive"><i data-lucide="archive"></i></button>
                </td>
            </tr>`).join('');
        initIcons();
    } catch (err) { console.error(err); }
}

async function archiveItem(id, type) {
    if (!confirm('Archive this item?')) return;
    const endpoint = type === 'lost' ? `/lost-items/${id}` : `/found-items/${id}`;
    try {
        await api(endpoint, { method: 'DELETE' });
        showToast('Item archived', 'success');
        if (type === 'lost') loadAdminLost(); else loadAdminFound();
    } catch (err) { showToast(err.message, 'error'); }
}

async function loadAdminUsers() {
    try {
        const users = await api('/users');
        const tbody = document.getElementById('admin-users-tbody');
        if (!tbody) return;
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.name}</td>
                <td>${u.studentId || 'N/A'}</td>
                <td>${u.email}</td>
                <td><span class="category-badge">${u.role}</span></td>
                <td><span class="status-badge status-${u.isDeleted ? 'archived' : 'active'}">${u.isDeleted ? 'Archived' : 'Active'}</span></td>
                <td class="table-actions">
                    <button class="btn-icon" onclick="editUser('${u._id}')" title="Edit"><i data-lucide="pencil"></i></button>
                    <button class="btn-icon danger" onclick="archiveUser('${u._id}')" title="Archive"><i data-lucide="archive"></i></button>
                </td>
            </tr>`).join('');
        initIcons();
    } catch (err) { console.error(err); }
}

async function editUser(id) {
    try {
        const u = await api(`/users/${id}`);
        document.getElementById('user-form-id').value = u._id;
        document.getElementById('user-form-name').value = u.name;
        document.getElementById('user-form-student-id').value = u.studentId || '';
        document.getElementById('user-form-email').value = u.email;
        document.getElementById('user-form-role').value = u.role;
        document.getElementById('user-modal-title').innerHTML = '<i data-lucide="pencil" class="modal-title-icon"></i> Edit User';
        const pwGroup = document.getElementById('user-password-group');
        if (pwGroup) pwGroup.style.display = 'none';
        openModal('user-form-modal');
        initIcons();
    } catch (err) { showToast('Could not load user', 'error'); }
}

async function submitUser(e) {
    e.preventDefault();
    const id = document.getElementById('user-form-id').value;
    const body = {
        name: document.getElementById('user-form-name').value,
        studentId: document.getElementById('user-form-student-id').value,
        email: document.getElementById('user-form-email').value,
        role: document.getElementById('user-form-role').value,
    };
    const pw = document.getElementById('user-form-password').value;
    if (pw) body.password = pw;

    try {
        if (id) {
            await api(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            if (!pw) { showToast('Password required for new user', 'error'); return; }
            await api('/users', { method: 'POST', body: JSON.stringify(body) });
        }
        closeModal('user-form-modal');
        showToast(id ? 'User updated!' : 'User created!', 'success');
        document.getElementById('user-form-id').value = '';
        const pwGroup = document.getElementById('user-password-group');
        if (pwGroup) pwGroup.style.display = 'block';
        loadAdminUsers();
    } catch (err) { showToast(err.message || 'Save failed', 'error'); }
}

async function archiveUser(id) {
    if (!confirm('Archive this user?')) return;
    try {
        await api(`/users/${id}`, { method: 'DELETE' });
        showToast('User archived', 'success');
        loadAdminUsers();
    } catch (err) { showToast(err.message, 'error'); }
}

async function downloadReport(type) {
    try {
        const blob = await api(`/reports/${type}`);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-report.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Report downloaded!', 'success');
    } catch (err) { showToast(err.message || 'Report failed', 'error'); }
}

// ───────────── Landing Page Events ─────────────
let landingEventsData = [];

async function loadLandingEvents() {
    const grid = document.getElementById('landing-events-grid');
    if (!grid) return;
    try {
        const res = await fetch(`${API_BASE}/events/public`);
        const events = await res.json();
        if (!res.ok) throw new Error('Failed to fetch events');
        landingEventsData = events;
        if (!events.length) {
            grid.innerHTML = '<div class="empty-state"><i data-lucide="calendar-off"></i><p>No upcoming events</p></div>';
            initIcons();
            return;
        }
        grid.innerHTML = events.map((e, i) => {
            const d = new Date(e.eventDate);
            const day = d.getDate();
            const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
            const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            const img = e.images && e.images.length
                ? `<img src="${e.images[0]}" alt="${e.title}" style="width:100%;height:100%;object-fit:cover;opacity:1">`
                : `<img src="Assets/Logo.png" alt="Event">`;
            return `<div class="event-card" style="cursor:pointer" onclick="viewLandingEvent(${i})">
                <div class="event-image">${img}</div>
                <div class="event-content">
                    <div class="event-date"><span class="day">${day}</span><span class="month">${month}</span></div>
                    <div class="event-details">
                        <h3>${e.title}</h3>
                        <p>${e.content ? e.content.substring(0, 80) + (e.content.length > 80 ? '...' : '') : ''}</p>
                        <div class="event-time"><i data-lucide="map-pin" style="width:14px;height:14px"></i> ${e.location || 'TBA'}</div>
                        <button class="btn-event" onclick="event.stopPropagation();viewLandingEvent(${i})">View Details</button>
                    </div>
                </div>
            </div>`;
        }).join('');
        initIcons();
    } catch (err) {
        console.error('Landing events error:', err);
        grid.innerHTML = '<div class="empty-state"><i data-lucide="alert-circle"></i><p>Could not load events</p></div>';
        initIcons();
    }
}

function viewLandingEvent(index) {
    const e = landingEventsData[index];
    if (!e) return;
    const d = new Date(e.eventDate);
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const gallery = e.images && e.images.length
        ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:20px">
            ${e.images.map(img => `<img src="${img}" alt="${e.title}" style="width:100%;border-radius:8px;cursor:pointer;max-height:220px;object-fit:cover" onclick="window.open('${img}','_blank')">`).join('')}
           </div>` : '';
    const detail = document.getElementById('landing-event-detail');
    detail.innerHTML = `
        <div class="modal-header"><h2>${e.title}</h2></div>
        <div class="modal-body" style="padding:20px">
            ${gallery}
            <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px">
                <span class="badge badge-blue" style="font-size:.85rem;padding:6px 14px"><i data-lucide="calendar" style="width:14px;height:14px;margin-right:4px"></i>${dateStr}</span>
                <span class="badge badge-purple" style="font-size:.85rem;padding:6px 14px"><i data-lucide="clock" style="width:14px;height:14px;margin-right:4px"></i>${timeStr}</span>
                <span class="badge badge-green" style="font-size:.85rem;padding:6px 14px"><i data-lucide="map-pin" style="width:14px;height:14px;margin-right:4px"></i>${e.location || 'TBA'}</span>
                <span class="badge badge-${e.status === 'Ongoing' ? 'yellow' : 'blue'}" style="font-size:.85rem;padding:6px 14px">${e.status}</span>
            </div>
            <div style="color:var(--text);line-height:1.7;white-space:pre-wrap">${e.content || ''}</div>
        </div>`;
    initIcons();
    openModal('landing-event-modal');
}

// ───────────── DOMContentLoaded ─────────────
document.addEventListener('DOMContentLoaded', async () => {
    initIcons();

    const page = document.body.dataset.page;

    // ── Separate page (dashboard.html, inbox.html, etc.) ──
    if (page) {
        // Require auth
        if (!authToken || !currentUser) {
            window.location.href = 'index.html';
            return;
        }
        
        // Verify token is still valid before loading page
        try {
            const user = await api('/auth/me');
            currentUser = user;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        } catch (err) {
            console.error('Auth verification failed:', err);
            // Token invalid, redirect to login
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('currentUser');
            window.location.href = 'index.html';
            return;
        }
        
        setupSeparatePage();
        switch (page) {
            case 'dashboard': loadDashboard(); break;
            case 'inbox': 
                loadInbox(); 
                checkPrefillMessage();
                break;
            case 'lost-found': loadLostFound(); break;
            case 'announcements': loadEvents(); break;
            case 'profile': loadProfile(); break;
            case 'settings': loadFAQs(); break;
            case 'admin-events': loadAdminEvents(); break;
            case 'admin-lost': loadAdminLost(); break;
            case 'admin-found': loadAdminFound(); break;
            case 'admin-users': loadAdminUsers(); break;
        }
        return;
    }

    // ── index.html — landing page with embedded dashboard ──
    if (authToken && currentUser) {
        // Already logged in — redirect to dashboard page
        window.location.href = 'dashboard.html';
        return;
    }
    // Otherwise, landing page is already visible
    loadLandingEvents();
});