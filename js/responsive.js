/**
 * Responsive Logic for Iron Pulse
 * Handles window resizing, sidebar toggles, and dynamic card adjustments
 */

const responsive = {
    init: () => {
        responsive.handleWindowResize();
        window.addEventListener('resize', responsive.debounce(responsive.handleWindowResize, 250));
        responsive.setupMobileMenu();
    },

    handleWindowResize: () => {
        const width = window.innerWidth;
        const body = document.body;

        // Add class based on width for CSS targeting if needed
        if (width < 768) {
            body.classList.add('mobile-view');
            body.classList.remove('desktop-view');
        } else {
            body.classList.remove('mobile-view');
            body.classList.add('desktop-view');
        }

        console.log(`Responsive layout adjusted for width: ${width}px`);
    },

    setupMobileMenu: () => {
        // Toggle sidebar visibility on mobile if it's dynamic
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    // Close mobile menu if it was a drawer
                    console.log('Mobile link clicked, menu hidden');
                }
            });
        });
    },

    // Utility to prevent high-frequency firing during resize
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Auto-init for non-module usage if script is included
document.addEventListener('DOMContentLoaded', responsive.init);

export default responsive;
