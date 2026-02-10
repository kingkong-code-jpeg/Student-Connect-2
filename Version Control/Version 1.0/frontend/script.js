// Store user data
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

// ================================
// LUCIDE ICONS INITIALIZATION
// ================================
document.addEventListener('DOMContentLoaded', function () {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// ================================
// MODAL FUNCTIONS
// ================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function switchModal(fromModalId, toModalId) {
    closeModal(fromModalId);
    setTimeout(() => {
        openModal(toModalId);
    }, 200);
}

// Close modal on Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal.id);
        }
        // Also close mobile sidebar on Escape
        closeMobileSidebar();
    }
});

// ================================
// PAGE NAVIGATION
// ================================
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }

    // Re-initialize icons when switching pages
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 50);
}

// ================================
// SIDEBAR TOGGLE (Desktop Collapse)
// ================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.classList.toggle('collapsed');

    // Update toggle icon
    const toggleIcon = document.getElementById('sidebar-toggle-icon');
    if (toggleIcon) {
        if (sidebar.classList.contains('collapsed')) {
            toggleIcon.setAttribute('data-lucide', 'chevrons-right');
        } else {
            toggleIcon.setAttribute('data-lucide', 'chevrons-left');
        }
        // Re-render icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// ================================
// MOBILE SIDEBAR (Hamburger Menu)
// ================================
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (!sidebar) return;

    const isOpen = sidebar.classList.contains('mobile-open');

    if (isOpen) {
        closeMobileSidebar();
    } else {
        sidebar.classList.add('mobile-open');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (!sidebar) return;

    sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ================================
// AUTHENTICATION HANDLERS
// ================================
function handleLogin(event) {
    event.preventDefault();

    const name = document.getElementById('login-name').value;
    const studentId = document.getElementById('login-student-id').value;
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Store user data
    currentUser = {
        name: name,
        studentId: studentId,
        email: email
    };

    // Save to sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Close modal
    closeModal('login-modal');

    // Update dashboard user name
    const userNameEl = document.getElementById('user-name');
    const dashboardUserNameEl = document.getElementById('dashboard-user-name');
    if (userNameEl) userNameEl.textContent = name;
    if (dashboardUserNameEl) dashboardUserNameEl.textContent = name;

    // Show success and redirect to dashboard
    alert('Login successful! Welcome to ICCT HUB');
    showPage('dashboard-page');
}

function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('register-name').value;
    const studentId = document.getElementById('register-student-id').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const termsAccepted = document.getElementById('terms').checked;

    // Validation
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (!termsAccepted) {
        alert('Please agree to the terms of service and privacy policy');
        return;
    }

    // Store user data
    currentUser = {
        name: name,
        studentId: studentId,
        email: email
    };

    // Show success message
    alert('Registration successful! Please login to continue.');

    // Switch to login modal
    switchModal('register-modal', 'login-modal');
}

// ================================
// DASHBOARD SECTION NAVIGATION
// ================================
function showDashboardSection(sectionId) {
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));

    // Show selected section
    const selectedSection = document.getElementById(sectionId + '-section');
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Update active nav item
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    if (event && event.target) {
        event.target.closest('.nav-item').classList.add('active');
    }

    // Close mobile sidebar after navigation
    if (window.innerWidth <= 768) {
        closeMobileSidebar();
    }
}

// ================================
// EMAIL FUNCTIONS
// ================================
function openEmail(emailId) {
    const emailViewer = document.getElementById('email-viewer');
    emailViewer.style.display = 'block';

    const inboxContainer = document.querySelector('.inbox-container');
    inboxContainer.style.display = 'none';
}

function closeEmail() {
    const emailViewer = document.getElementById('email-viewer');
    emailViewer.style.display = 'none';

    const inboxContainer = document.querySelector('.inbox-container');
    inboxContainer.style.display = 'block';
}

// ================================
// LOST AND FOUND TAB SWITCHING
// ================================
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    if (event && event.target) {
        event.target.classList.add('active');
    }

    console.log('Switched to tab:', tabName);
}

// ================================
// LOGOUT FUNCTION
// ================================
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        sessionStorage.removeItem('currentUser');

        showPage('landing-page');
        alert('You have been logged out successfully');
    }
}

// ================================
// SEARCH FUNCTIONALITY
// ================================
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('Searching for:', searchTerm);
        });
    }

    // Add button functionality
    const addButton = document.querySelector('.btn-add');
    if (addButton) {
        addButton.addEventListener('click', function () {
            const activeSection = document.querySelector('.content-section.active');

            if (activeSection) {
                if (activeSection.id === 'inbox-section') {
                    alert('Compose new message');
                } else if (activeSection.id === 'lost-found-section') {
                    alert('Report lost or found item');
                } else if (activeSection.id === 'announcements-section') {
                    alert('Create new announcement (Admin only)');
                } else {
                    alert('Add new item');
                }
            }
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// ================================
// INITIALIZATION
// ================================
window.addEventListener('load', function () {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Only run on pages with landing-page
    const landingPage = document.getElementById('landing-page');
    if (!landingPage) return;

    // Check URL params for dashboard redirect
    const urlParams = new URLSearchParams(window.location.search);
    const showDashboard = urlParams.get('dashboard');

    // Check session storage
    currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    if (showDashboard === 'true' && currentUser) {
        const userNameEl = document.getElementById('user-name');
        const dashboardUserNameEl = document.getElementById('dashboard-user-name');
        if (userNameEl) userNameEl.textContent = currentUser.name;
        if (dashboardUserNameEl) dashboardUserNameEl.textContent = currentUser.name;

        showPage('dashboard-page');
    } else {
        showPage('landing-page');
    }
});

// Handle browser back button
window.addEventListener('popstate', function (event) {
    if (currentUser) {
        showPage('dashboard-page');
    } else {
        showPage('landing-page');
    }
});

// Handle window resize - reset mobile sidebar state
window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
        closeMobileSidebar();
    }
});