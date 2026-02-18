// script.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Elements ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const loginModal = document.getElementById('login-modal');
    const loginBtn = document.getElementById('login-btn');            // Desktop Button
    const mobileLoginBtn = document.getElementById('mobile-login-btn'); // Mobile Button
    const closeLoginBtn = document.getElementById('close-login-btn'); // X Button
    const modalBackdrop = document.getElementById('modal-backdrop');  // Dark Background

    // --- Mobile Menu Logic ---
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Login Modal Functions ---
    const openLogin = () => {
        if (loginModal) {
            loginModal.classList.remove('hidden');
            // Close mobile menu if it's open
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        }
    };

    const closeLogin = () => {
        if (loginModal) {
            loginModal.classList.add('hidden');
        }
    };

    // --- Event Listeners ---
    
    // Open Modal
    if (loginBtn) loginBtn.addEventListener('click', openLogin);
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', openLogin);

    // Close Modal (Clicking X or Backdrop)
    if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeLogin);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeLogin);

    // Close on 'Escape' key press
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape" && loginModal && !loginModal.classList.contains('hidden')) {
            closeLogin();
        }
    });

});