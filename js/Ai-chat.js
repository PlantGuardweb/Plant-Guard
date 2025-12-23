document.addEventListener('DOMContentLoaded', function() {
    // ==================== GEMINI API SETUP ====================
    // Using API key directly (for development)
    const API_KEY = 'AIzaSyA5Fh50b6bkqavKcqf_6sd_0O6M09360x4';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    console.log('🤖 Plant-Guard-AI initialized. API Key loaded:', API_KEY.substring(0, 10) + '...');

    // ==================== DOM ELEMENTS ====================
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatWindow = document.querySelector('.chat-window');
    const chatTitle = document.getElementById('chat-title');
    const previousChats = document.querySelectorAll('.previous-chat');
    const newChatBtn = document.querySelector('.new-chat button');
    const backBtn = document.querySelector('.back button');

    // ==================== LOCAL STORAGE ====================
    let currentChatId = 'chat_' + Date.now();
    let allChats = JSON.parse(localStorage.getItem('plantGuardChats')) || {};
    let isLoading = false;
    
    // Initialize current chat
    if (!allChats[currentChatId]) {
        allChats[currentChatId] = {
            id: currentChatId,
            title: 'New Chat',
            messages: []
        };
    }

    // ==================== SYSTEM PROMPT ====================
    const systemPrompt = `You are Plant-Guard-AI, a helpful and knowledgeable assistant specialized in plant care and health. 
You provide expert advice on:
- Watering schedules and techniques
- Light requirements for different plants
- Pest and disease identification and treatment
- Fertilizing and nutrient management
- Plant propagation and growth
- Common plant problems and solutions

Keep responses concise (2-3 sentences), friendly, and practical. Always ask clarifying questions if needed about the plant type or specific conditions.`;

    // ==================== CALL GEMINI API VIA BACKEND ====================
    async function getGeminiResponse(userMessage) {
        try {
            console.log('📤 Sending message to backend:', userMessage);
            sendButton.disabled = true;
            addMessage('🤖 Thinking...', 'bot');

            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage })
            });

            console.log('📬 Response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ API Error:', errorData);
                throw new Error(`API Error ${response.status}: ${errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('✅ API Response:', data);
            
            const botResponse = data.response || 'I encountered an issue processing your request. Please try again.';
            console.log('💬 Bot response:', botResponse);

            // Remove the thinking message and add actual response
            const thinkingMessage = chatWindow.lastChild;
            if (thinkingMessage && thinkingMessage.textContent.includes('🤖 Thinking')) {
                thinkingMessage.remove();
            }

            addMessage(botResponse, 'bot');
            
            // Store in messages
            allChats[currentChatId].messages.push({
                type: 'bot',
                text: botResponse,
                timestamp: new Date().toLocaleTimeString()
            });

            localStorage.setItem('plantGuardChats', JSON.stringify(allChats));

        } catch (error) {
            console.error('🚨 Error calling backend:', error);
            
            // Remove thinking message
            const thinkingMessage = chatWindow.lastChild;
            if (thinkingMessage && thinkingMessage.textContent.includes('🤖 Thinking')) {
                thinkingMessage.remove();
            }

            const errorMsg = `Sorry, I couldn't process your request. Make sure the backend server is running on port 3001. Error: ${error.message}`;
            addMessage(errorMsg, 'bot');
            
            allChats[currentChatId].messages.push({
                type: 'bot',
                text: errorMsg,
                timestamp: new Date().toLocaleTimeString()
            });

            localStorage.setItem('plantGuardChats', JSON.stringify(allChats));
        } finally {
            sendButton.disabled = false;
            userInput.focus();
        }
    }

    // ==================== SEND MESSAGE ====================
    async function sendMessage() {
        const messageText = userInput.value.trim();
        
        if (messageText === '' || isLoading) return;

        isLoading = true;

        // Add user message to chat
        addMessage(messageText, 'user');
        
        // Clear input
        userInput.value = '';

        // Store user message
        allChats[currentChatId].messages.push({
            type: 'user',
            text: messageText,
            timestamp: new Date().toLocaleTimeString()
        });

        // Update chat title based on first message
        if (allChats[currentChatId].messages.length === 1) {
            const title = messageText.substring(0, 30) + (messageText.length > 30 ? '...' : '');
            allChats[currentChatId].title = title;
            chatTitle.textContent = title;
        }

        localStorage.setItem('plantGuardChats', JSON.stringify(allChats));

        // Get AI response
        await getGeminiResponse(messageText);

        isLoading = false;
        updateChatHistory();
    }

    // ==================== ADD MESSAGE TO UI ====================
    function addMessage(messageText, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const messagePara = document.createElement('p');
        messagePara.textContent = messageText;
        
        messageDiv.appendChild(messagePara);
        chatWindow.appendChild(messageDiv);
        
        // Scroll to bottom
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // ==================== SEND MESSAGE EVENT LISTENERS ====================
    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && !isLoading) {
            sendMessage();
        }
    });

    // ==================== NEW CHAT ====================
    newChatBtn.addEventListener('click', function() {
        currentChatId = 'chat_' + Date.now();
        allChats[currentChatId] = {
            id: currentChatId,
            title: 'New Chat',
            messages: []
        };
        
        // Clear chat window
        chatWindow.innerHTML = '<div class="message bot-message"><p>Hello! I\'m Plant-Guard-AI, your virtual assistant for plant health. How can I help you today?</p></div>';
        chatTitle.textContent = 'New Chat';
        userInput.value = '';
        userInput.focus();

        localStorage.setItem('plantGuardChats', JSON.stringify(allChats));
        updateChatHistory();
    });

    // ==================== PREVIOUS CHAT SELECTION ====================
    function attachChatListeners() {
        const allPreviousChats = document.querySelectorAll('.previous-chat');
        allPreviousChats.forEach(chatItem => {
            chatItem.addEventListener('click', function() {
                const chatText = chatItem.textContent;
                
                // Find chat by title
                let foundChat = null;
                for (let id in allChats) {
                    if (allChats[id].title === chatText) {
                        foundChat = allChats[id];
                        currentChatId = id;
                        break;
                    }
                }

                if (foundChat) {
                    // Load chat messages
                    chatWindow.innerHTML = '';
                    foundChat.messages.forEach(msg => {
                        addMessage(msg.text, msg.type);
                    });
                    chatTitle.textContent = foundChat.title;
                }

                userInput.value = '';
                userInput.focus();
            });
        });
    }

    // ==================== BACK BUTTON ====================
    backBtn.addEventListener('click', function() {
        window.location.href = '../Pages/Home.html';
    });

    // ==================== UPDATE CHAT HISTORY UI ====================
    function updateChatHistory() {
        const chatHistory = document.querySelector('.chat-history');
        chatHistory.innerHTML = '';
        
        // Add recent chats to history (max 10)
        const chatIds = Object.keys(allChats).reverse().slice(0, 10);
        chatIds.forEach(id => {
            const chatItem = document.createElement('div');
            chatItem.className = 'previous-chat';
            chatItem.textContent = allChats[id].title;
            
            chatItem.addEventListener('click', function() {
                currentChatId = id;
                const chat = allChats[id];
                chatWindow.innerHTML = '';
                
                if (chat.messages.length > 0) {
                    chat.messages.forEach(msg => {
                        addMessage(msg.text, msg.type);
                    });
                } else {
                    chatWindow.innerHTML = '<div class="message bot-message"><p>Start a new conversation!</p></div>';
                }
                
                chatTitle.textContent = chat.title;
                userInput.value = '';
                userInput.focus();
            });
            
            chatHistory.appendChild(chatItem);
        });
    }

    // ==================== INITIALIZE ====================
    // Load current chat if it has messages
    if (allChats[currentChatId].messages.length > 0) {
        allChats[currentChatId].messages.forEach(msg => {
            addMessage(msg.text, msg.type);
        });
        chatTitle.textContent = allChats[currentChatId].title;
    }

    updateChatHistory();
    userInput.focus();
});

