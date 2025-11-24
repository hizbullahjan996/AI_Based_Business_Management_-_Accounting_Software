// AI Business Management Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();

    // Setup chat functionality
    setupChat();

    // Animate confidence bars on load
    animateConfidenceBars();
});

function initializeDashboard() {
    console.log('AI Business Management Dashboard initialized');

    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add click effects to insight items
    const insightItems = document.querySelectorAll('.insight-item');
    insightItems.forEach(item => {
        item.addEventListener('click', function() {
            // Toggle expanded state
            this.classList.toggle('expanded');
        });
    });
}

function setupChat() {
    const chatInput = document.querySelector('.chat-input input');
    const chatButton = document.querySelector('.chat-input button');
    const chatMessages = document.querySelector('.chat-messages');

    if (!chatInput || !chatButton || !chatMessages) return;

    // Handle send button click
    chatButton.addEventListener('click', function() {
        sendMessage(chatInput, chatMessages);
    });

    // Handle Enter key press
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage(chatInput, chatMessages);
        }
    });
}

function sendMessage(input, messagesContainer) {
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    addMessage(messagesContainer, message, 'user');

    // Clear input
    input.value = '';

    // Simulate AI response
    setTimeout(() => {
        const aiResponse = generateAIResponse(message);
        addMessage(messagesContainer, aiResponse, 'ai');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addMessage(container, content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const sender = type === 'ai' ? 'AI Assistant' : 'You';
    messageDiv.innerHTML = `<strong>${sender}:</strong><br>${content}`;

    container.appendChild(messageDiv);
}

function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();

    // Business analysis responses
    if (message.includes('profit') || message.includes('margin')) {
        return "Your average profit margin is 25.3%. This is excellent! 📈 It's above the industry average of 18%. You're performing very well in terms of profitability.";
    }

    if (message.includes('sale') || message.includes('revenue') || message.includes('income')) {
        return "Your average monthly sales are Rs 119,412. Great performance! 🚀 This shows strong market demand for your products.";
    }

    if (message.includes('expense') || message.includes('cost') || message.includes('spend')) {
        return "Your average monthly expenses are Rs 56,644. Consider cost optimization. 💡 Your expense ratio is 47.4%, which is above the industry average of 35%.";
    }

    if (message.includes('customer') || message.includes('client')) {
        return "Your customer retention rate is 84.3%. Excellent retention! 🎯 This indicates strong customer satisfaction and loyalty.";
    }

    if (message.includes('inventory') || message.includes('stock') || message.includes('product')) {
        return "Your inventory turns 0.8 times per year. Consider faster turnover. 📦 Implementing ABC analysis could help optimize your inventory management.";
    }

    if (message.includes('payment') || message.includes('late') || message.includes('overdue')) {
        return "Based on payment pattern analysis, 3 customers have delayed payments beyond agreed terms. ABC Trading has the highest overdue amount (Rs 25,000). I recommend immediate follow-up for this account.";
    }

    if (message.includes('demand') || message.includes('forecast') || message.includes('predict')) {
        return "Based on AI analysis, Item A shows strong demand with 72% confidence. Expected 90-day demand: 1,085 units with 30% ROI potential. 📊";
    }

    if (message.includes('risk') || message.includes('credit')) {
        return "45% of your customers are high risk. Consider stricter credit terms. ⚠️ ABC Trading shows high risk with 60% on-time payment history.";
    }

    if (message.includes('improve') || message.includes('better') || message.includes('optimize')) {
        return "Key improvement areas: 1) Focus on high-margin items (25.3% margin), 2) Improve inventory turnover (currently 0.8x/year), 3) Enhance customer retention (84.3% is good but can be better), 4) Optimize expense ratio (currently 47.4%).";
    }

    // Default response
    return "I'm analyzing your question: \"" + userMessage + "\". In a real system, this would connect to the AI service for intelligent responses based on your actual business data. I can help you analyze sales, profits, expenses, customers, inventory, and payment patterns.";
}

function animateConfidenceBars() {
    // Animate confidence bars on page load
    setTimeout(() => {
        const fills = document.querySelectorAll('.confidence-fill');
        fills.forEach(fill => {
            const width = fill.style.width;
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.width = width;
            }, 500);
        });
    }, 1000);
}

// Utility functions for dashboard interactions
function updateMetric(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function addInsight(category, title, description, priority = 'medium') {
    const insightsContainer = document.querySelector('.card h3:contains("Business Insights")');
    if (!insightsContainer) return;

    const card = insightsContainer.closest('.card');
    const insightItem = document.createElement('div');
    insightItem.className = `insight-item ${priority}-priority`;

    insightItem.innerHTML = `
        <strong>${title}</strong><br>
        <span class="metric-label">${description}</span>
    `;

    card.appendChild(insightItem);
}

function updateRiskBadge(customerId, riskLevel) {
    const riskBadges = document.querySelectorAll('.risk-badge');
    riskBadges.forEach(badge => {
        if (badge.textContent.includes(customerId)) {
            badge.className = `risk-badge risk-${riskLevel.toLowerCase()}`;
            badge.textContent = riskLevel.toUpperCase() + ' RISK';
        }
    });
}

// Export functions for potential use by other scripts
window.DashboardUtils = {
    updateMetric,
    addInsight,
    updateRiskBadge,
    generateAIResponse
};