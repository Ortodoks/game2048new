// Toolbar Navigation Handler
// Works on all pages with toolbar

document.addEventListener('DOMContentLoaded', function() {
    console.log('Toolbar navigation initializing...');
    
    const toolbarIcons = document.querySelectorAll('.toolbar__icon');
    const smile = document.querySelector('.icon--smile svg');
    
    if (toolbarIcons.length === 0) {
        console.warn('No toolbar icons found');
        return;
    }
    
    console.log('Found', toolbarIcons.length, 'toolbar icons');
    
    toolbarIcons.forEach(function(icon) {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Toolbar icon clicked:', icon.getAttribute('data-page'));
            
            // Add audio feedback if available
            if (window.audioManager) {
                window.audioManager.playSound('click');
            }
            
            // Add haptic feedback if available
            if (window.vibrationManager) {
                window.vibrationManager.onButtonClick();
            }
            
            // Remove active class from all icons
            toolbarIcons.forEach(function(i) {
                i.classList.remove('is-active');
                if (smile) {
                    smile.classList.remove('maj-left', 'maj-right', 'min-left', 'min-right');
                }
            });
            
            // Add active class to clicked icon
            icon.classList.add('is-active');
            
            // Animate smile based on position (legacy code for old design)
            if (icon.classList.contains('icon--home')) {
                if (smile) smile.classList.add('maj-left');
            } else if (icon.classList.contains('icon--chart')) {
                if (smile) smile.classList.add('min-left');
            } else if (icon.classList.contains('icon--podium')) {
                // Leaderboard - center position
            } else if (icon.classList.contains('icon--shop')) {
                if (smile) smile.classList.add('min-right');
            } else if (icon.classList.contains('icon--search')) {
                if (smile) smile.classList.add('maj-right');
            }
            
            // Get page from data attribute
            const page = icon.getAttribute('data-page');
            
            // Navigate to page
            if (page) {
                switch(page) {
                    case 'home':
                        if (window.location.pathname !== '/index.html' && 
                            window.location.pathname !== '/' &&
                            !window.location.pathname.endsWith('index.html')) {
                            window.location.href = 'index.html';
                        }
                        break;
                    case 'tasks':
                        if (!window.location.pathname.endsWith('tasks.html')) {
                            window.location.href = 'tasks.html';
                        }
                        break;
                    case 'leaderboard':
                        if (!window.location.pathname.endsWith('leaderboard.html')) {
                            window.location.href = 'leaderboard.html';
                        }
                        break;
                    case 'shop':
                        if (!window.location.pathname.endsWith('shop.html')) {
                            window.location.href = 'shop.html';
                        }
                        break;
                    case 'profile':
                        if (!window.location.pathname.endsWith('profile.html')) {
                            window.location.href = 'profile.html';
                        }
                        break;
                }
            }
        });
    });
    
    console.log('Toolbar navigation initialized successfully');
});
