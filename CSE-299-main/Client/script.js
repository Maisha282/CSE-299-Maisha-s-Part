const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const typingIndicator = document.getElementById('typing-indicator');
const scrollTopBtn = document.getElementById('scroll-top-btn');// HTML Element References

// Event listeners for sending, clearing chat, and Enter key
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
clearBtn.addEventListener('click', clearChat);
scrollTopBtn.addEventListener('click', scrollToTop);

// Add time-based greeting
window.addEventListener('load', displayGreeting);

// Send message function
async function sendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText === '') return;

    addMessage(messageText, 'user');
    chatInput.value = ''; // Clear input after sending
    typingIndicator.style.display = 'block'; // Show typing indicator

    try {
        // Fetch assistant response
        const response = await fetch('http://127.0.0.1:8000/message/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ msg: messageText }),
        });

        typingIndicator.style.display = 'none'; // Hide typing indicator

        if (response.ok) {
            const jsonResponse = await response.json();
            if (jsonResponse.message) {
                addMessage(jsonResponse.message, 'assistant');
            } else {
                console.error("Response JSON does not contain 'message' key:", jsonResponse);
                addMessage("I'm sorry, I didn't understand that response.", 'assistant');
            }
        } else {
            console.error("Error in response:", response.statusText);
            addMessage("There was an issue connecting to the server.", 'assistant');
        }
    } catch (error) {
        console.error("Error fetching message:", error);
        addMessage("Unable to connect to the server. Please try again later.", 'assistant');
    }

    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
}


// Add message to chat
function addMessage(text, sender) {
    const message = document.createElement('div');
    message.classList.add(sender === 'user' ? 'user-message' : 'assistant-message');
    const timestamp = new Date().toLocaleTimeString();
    message.innerHTML = `<span>${text}</span> <span class="timestamp">(${timestamp})</span>`;
    chatBox.appendChild(message);
}

// Clear chat function
function clearChat() {
    chatBox.innerHTML = ''; // Remove all messages
}

// Scroll-to-top function
function scrollToTop() {
    chatBox.scrollTo({ top: 0, behavior: 'smooth' });
}

// Display greeting based on the time of day
function displayGreeting() {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning!" : hour < 18 ? "Good afternoon!" : "Good evening!";
    addMessage(greeting + " How can I assist you?", 'assistant');
}

// Show/hide scroll button on scroll
chatBox.addEventListener('scroll', function () {
    scrollTopBtn.style.display = chatBox.scrollTop > 100 ? 'block' : 'none';
});

// Add a reference to the new download button
const downloadBtn = document.getElementById('download-btn');

// Event listener for the download button
downloadBtn.addEventListener('click', downloadChat);

// Function to download the chat history as a .txt file in Q&A format
function downloadChat() {
    let chatHistory = '';

    // Get all user and assistant messages in the chat box
    const userMessages = chatBox.getElementsByClassName('user-message');
    const assistantMessages = chatBox.getElementsByClassName('assistant-message');

    // Keep track of the current assistant response index to pair with each user message
    let assistantIndex = 0;

    for (let i = 0; i < userMessages.length; i++) {
        const userMessageText = userMessages[i].querySelector('span').innerText;
        const userTimestamp = userMessages[i].querySelector('.timestamp').innerText;

        // Append user message with timestamp
        chatHistory += `User: ${userMessageText} (${userTimestamp})\n\n`;

        // Find the next valid assistant message that isn’t a greeting or redundant
        while (assistantIndex < assistantMessages.length) {
            const assistantMessageText = assistantMessages[assistantIndex].querySelector('span').innerText;
            const assistantTimestamp = assistantMessages[assistantIndex].querySelector('.timestamp').innerText;

            // Skip greeting or redundant assistant responses
            if (!assistantMessageText.toLowerCase().includes('how can i assist you') &&
                !assistantMessageText.toLowerCase().includes('good evening')) {

                // Append assistant message with timestamp and break to pair with the current user message
                chatHistory += `Assistant: ${assistantMessageText} (${assistantTimestamp})\n\n`;
                assistantIndex++;
                break;
            }
            assistantIndex++; // Skip and continue to the next assistant message
        }
    }

    // Create a blob and download link
    const blob = new Blob([chatHistory], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_history.txt';
    a.click();
    window.URL.revokeObjectURL(url);
}
