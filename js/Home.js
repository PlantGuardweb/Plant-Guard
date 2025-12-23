document.addEventListener('DOMContentLoaded', function() {
    // Search bar functionality
    const search_bar = document.getElementById('search_bar');
    if (search_bar) {
        search_bar.addEventListener('input', function(event) {
            const query = event.target.value.toLowerCase();
            const items = document.querySelectorAll('.item');  
            items.forEach(function(item) {
                const itemName = item.textContent.toLowerCase();
                if (itemName.includes(query)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });

        // Add drop-shadow on focus and remove on blur
        search_bar.addEventListener('focus', function() {
            search_bar.style.boxShadow = '0 8px 24px rgba(57, 217, 70, 0.33), 0 2px 6px rgba(255,0,0,0.2)';
        });
        search_bar.addEventListener('blur', function() {
            search_bar.style.boxShadow = 'none';
        });
    }

    // Scroll right button
    const scroll_right_btn = document.getElementById('scroll-right');
    if (scroll_right_btn) {
        scroll_right_btn.addEventListener('click', function() {
            const container = document.querySelector('.recently-viewed');
            if (container) {
                container.scrollBy({ left: 1000, behavior: 'smooth' });
            }
        });
    }

    // Scroll left button
    const scroll_left_btn = document.getElementById('scroll-left');
    if (scroll_left_btn) {
        scroll_left_btn.addEventListener('click', function() {
            const container = document.querySelector('.recently-viewed');
            if (container) {
                container.scrollBy({ left: -1000, behavior: 'smooth' });
            }
        });
    }

    // Reminders functionality
    const remindersButtons = {
        daily: document.getElementById('daily-button'),
        weekly: document.getElementById('weekly-button'),
        monthly: document.getElementById('monthly-button'),
        seasonal: document.getElementById('seasonal-button')
    };

    const remindersContainers = {
        daily: document.getElementById('daily'),
        weekly: document.getElementById('weekly'),
        monthly: document.getElementById('monthly'),
        seasonal: document.getElementById('seasonal')
    };

    // Function to hide all reminder containers and deactivate buttons
    function hideAllReminders() {
        Object.values(remindersContainers).forEach(container => {
            if (container) {
                container.style.display = 'none';
            }
        });
        Object.values(remindersButtons).forEach(button => {
            if (button) {
                button.style.backgroundColor = '#02551c';
            }
        });
    }

    // Function to show specific reminder container and activate button
    function showReminder(type) {
        hideAllReminders();
        if (remindersContainers[type]) {
            remindersContainers[type].style.display = 'flex';
        }
        if (remindersButtons[type]) {
            remindersButtons[type].style.backgroundColor = '#4CAF50';
        }
    }

    // Add event listeners to reminder buttons
    Object.keys(remindersButtons).forEach(type => {
        if (remindersButtons[type]) {
            remindersButtons[type].addEventListener('click', function() {
                showReminder(type);
            });
        }
    });

    // Add checkbox functionality to reminder items
    const checkboxes = document.querySelectorAll('.reminder-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const reminderItem = this.closest('.reminder-item');
            const span = reminderItem.querySelector('span');
            if (this.checked) {
                span.style.textDecoration = 'line-through';
                span.style.opacity = '0.6';
            } else {
                span.style.textDecoration = 'none';
                span.style.opacity = '1';
            }
        });
    });
});


// AI Chat Button Functionality
document.addEventListener('DOMContentLoaded', function() {
    const aiChatButton = document.getElementById('ai-chat-button');
    if (aiChatButton) {
        aiChatButton.addEventListener('click', function() {
            // Open AI chat window or redirect to AI chat page
            window.location.href = 'Ai-chat.html';
        }
        );
    }
});

