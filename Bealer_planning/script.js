// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Interactive checklist - toggle checked state
document.addEventListener('DOMContentLoaded', function() {
    const checklistItems = document.querySelectorAll('.checklist li');

    checklistItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('checked');

            // Update checkbox icon
            if (this.classList.contains('checked')) {
                this.style.setProperty('--checkbox', '"☑"');
            } else {
                this.style.setProperty('--checkbox', '"☐"');
            }
        });
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all project cards and timeline phases
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll(
        '.project-card, .timeline-phase, .summary-card, .benefit-card, .step'
    );

    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

// Add CSS for fade-in animation
const style = document.createElement('style');
style.textContent = `
    .project-card,
    .timeline-phase,
    .summary-card,
    .benefit-card,
    .step {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .fade-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }

    .checklist li.checked {
        background: #ECFDF5;
        color: #047857;
        text-decoration: line-through;
    }

    .checklist li.checked::before {
        content: '☑' !important;
        color: #10B981;
    }
`;
document.head.appendChild(style);

// Timeline progress tracking
function updateTimelineProgress() {
    const phases = document.querySelectorAll('.timeline-phase');
    const today = new Date();

    phases.forEach((phase, index) => {
        const phaseNumber = index + 1;
        // This is a placeholder - you would calculate based on actual project start date
        // For demo purposes, marking phases based on current week
        if (phaseNumber === 1) {
            phase.classList.add('current-phase');
        }
    });
}

// Call on load
document.addEventListener('DOMContentLoaded', updateTimelineProgress);

// Add print functionality
const printButton = document.querySelector('.btn-secondary');
if (printButton) {
    printButton.addEventListener('click', function() {
        window.print();
    });
}

// Add schedule meeting functionality (placeholder)
const meetingButton = document.querySelector('.btn-primary');
if (meetingButton) {
    meetingButton.addEventListener('click', function() {
        // In a real implementation, this would integrate with a calendar system
        alert('This would open a calendar scheduling tool.\n\nFor now, please contact Adrian to schedule your kick-off meeting.');
    });
}

// Progress tracking for project phases
function calculateProjectProgress() {
    const today = new Date();
    const projectStart = new Date('2025-11-15'); // Adjust this to actual start date
    const daysSinceStart = Math.floor((today - projectStart) / (1000 * 60 * 60 * 24));
    const weeksSinceStart = Math.floor(daysSinceStart / 7);

    return {
        currentWeek: weeksSinceStart + 1,
        currentPhase: Math.min(Math.floor(weeksSinceStart / 3) + 1, 4)
    };
}

// Highlight current phase based on timeline
document.addEventListener('DOMContentLoaded', function() {
    const progress = calculateProjectProgress();
    const phases = document.querySelectorAll('.timeline-phase');

    phases.forEach((phase, index) => {
        if (index + 1 === progress.currentPhase) {
            phase.style.borderLeft = '4px solid #10B981';
            const phaseHeader = phase.querySelector('.phase-header');
            if (phaseHeader) {
                phaseHeader.style.borderColor = '#10B981';
            }
        } else if (index + 1 < progress.currentPhase) {
            phase.style.opacity = '0.7';
        }
    });
});

// Add tooltips for project numbers
document.addEventListener('DOMContentLoaded', function() {
    const projectNumbers = document.querySelectorAll('.project-number');
    const projectNames = ['Lead Acquisition', 'Invoice Mailing', 'Cancellation Watchtower', 'AI Concierge', 'Social Media Marketing'];

    projectNumbers.forEach((num, index) => {
        num.setAttribute('title', `Project ${num.textContent}: ${projectNames[index]}`);
    });
});

// Add data export functionality for checklist
function exportChecklistData() {
    const categories = document.querySelectorAll('.data-category');
    const data = {};

    categories.forEach(category => {
        const categoryName = category.querySelector('h3').textContent;
        const items = Array.from(category.querySelectorAll('.checklist li')).map(li => ({
            item: li.textContent,
            checked: li.classList.contains('checked')
        }));
        data[categoryName] = items;
    });

    return data;
}

// Add sticky header on scroll
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    // Press 'P' to print
    if (e.key === 'p' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        window.print();
    }

    // Press 'C' to toggle all checklist items
    if (e.key === 'c' && e.altKey) {
        e.preventDefault();
        const checklistItems = document.querySelectorAll('.checklist li');
        checklistItems.forEach(item => item.classList.toggle('checked'));
    }
});

// Add progress indicator
function createProgressIndicator() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 4px;
        background: linear-gradient(90deg, #003087 0%, #0073E6 100%);
        z-index: 9999;
        transition: width 0.2s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

document.addEventListener('DOMContentLoaded', createProgressIndicator);

// Console message for developers
console.log('%c🤖 AI Growth System Blueprint ', 'background: #003087; color: #fff; padding: 10px 20px; font-size: 16px; font-weight: bold;');
console.log('%cPrepared for Derrick Bealer, Allstate Agent - Santa Barbara & Goleta', 'color: #0073E6; font-size: 12px;');
console.log('%cKeyboard shortcuts:\n- Cmd/Ctrl + P: Print\n- Alt + C: Toggle all checklist items', 'color: #64748B; font-size: 11px; margin-top: 10px;');
