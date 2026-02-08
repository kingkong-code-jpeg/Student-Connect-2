// Store user data
let currentUser = null;

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const name = document.getElementById('login-name').value;
    const studentId = document.getElementById('login-student-id').value;
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Store user data (in real app, validate against database)
    currentUser = {
        name: name,
        studentId: studentId,
        email: email
    };
    
    // Update user name in dashboard
    document.getElementById('user-name').textContent = name;
    document.getElementById('dashboard-user-name').textContent = name;
    
    // Show dashboard
    showPage('dashboard-page');
    
    // Show success message
    alert('Login successful! Welcome to ICCT HUB');
}

// Handle Registration
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
    
    // Store user data (in real app, send to database)
    currentUser = {
        name: name,
        studentId: studentId,
        email: email
    };
    
    // Show success message
    alert('Registration successful! Please login to continue.');
    
    // Redirect to login page
    showPage('login-page');
}

// Dashboard Section Navigation
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
    
    event.target.classList.add('active');
}

// Email Functions
function openEmail(emailId) {
    const emailViewer = document.getElementById('email-viewer');
    emailViewer.style.display = 'block';
    
    // Hide inbox container
    const inboxContainer = document.querySelector('.inbox-container');
    inboxContainer.style.display = 'none';
}

function closeEmail() {
    const emailViewer = document.getElementById('email-viewer');
    emailViewer.style.display = 'none';
    
    // Show inbox container
    const inboxContainer = document.querySelector('.inbox-container');
    inboxContainer.style.display = 'block';
}

// Lost and Found Tab Switching
function switchTab(tabName) {
    // Update active tab
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    event.target.classList.add('active');
    
    // Filter items based on tab (in real app, filter data)
    console.log('Switched to tab:', tabName);
}

// Logout Function
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        
        // Clear form fields
        document.getElementById('login-name').value = '';
        document.getElementById('login-student-id').value = '';
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        
        // Go back to landing page
        showPage('landing-page');
        
        alert('You have been logged out successfully');
    }
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('Searching for:', searchTerm);
            // In real app, implement search functionality
        });
    }
    
    // Add click event to nav items
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
        });
    });
});

// Add button functionality
document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.querySelector('.btn-add');
    if (addButton) {
        addButton.addEventListener('click', function() {
            // Check which section is active
            const activeSection = document.querySelector('.content-section.active');
            
            if (activeSection.id === 'inbox-section') {
                alert('Compose new message');
            } else if (activeSection.id === 'lost-found-section') {
                alert('Report lost or found item');
            } else if (activeSection.id === 'announcements-section') {
                alert('Create new announcement (Admin only)');
            } else {
                alert('Add new item');
            }
        });
    }
});

// Initialize - Show landing page by default
window.addEventListener('load', function() {
    showPage('landing-page');
});

// Handle browser back button
window.addEventListener('popstate', function(event) {
    if (currentUser) {
        showPage('dashboard-page');
    } else {
        showPage('landing-page');
    }
});