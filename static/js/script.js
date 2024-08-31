const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".send-btn");
const chatbox = document.querySelector(".chatbox");
const chatbotToggler = document.querySelector(".chatbot-toggler");
const chatbotCloseBtn = document.querySelector(".close-btn");
const agentButtons = document.querySelectorAll(".agent-button");

let userMessage;
let selectedAgent = "";

// Handle agent selection
agentButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedAgent = button.getAttribute("data-agent");
        document.querySelector(".agent-selection").style.display = "none"; // Hide agent selection after choosing
        chatbox.style.display = "block"; // Display chatbox
        chatInput.parentElement.style.display = "flex"; // Display input area
    });
});

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    chatLi.innerHTML = `<p>${message}</p>`;
    return chatLi;
}

const generateResponse = (incomingChatLi) => {
    const messageElement = incomingChatLi.querySelector("p");

    // Make a POST request to the Flask backend
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: userMessage,
            agent_type: selectedAgent
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.response) {
            // Handle formatting such as headings, bold text, and bullet points
            let formattedResponse = data.response
                .replace(/##\s*(.*?)\s*##/g, "<h2>$1</h2>")   // Convert ## Heading ## to <h2>Heading</h2>
                .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")       // Convert **text** to <b>text</b>
                .replace(/^\*\s+(.*)/gm, "<li>$1</li>")       // Convert * Bullet point to <li>Bullet point</li>
                .replace(/^\d+\.\s+(.*)/gm, "<li>$1</li>");   // Convert numbered list to <li> element

            // Wrap list items in <ul> or <ol> tags based on the presence of bullet points or numbers
            if (formattedResponse.includes("<li>")) {
                formattedResponse = formattedResponse.replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>");
            }

            messageElement.innerHTML = formattedResponse;
        } else {
            messageElement.classList.add("error");
            messageElement.textContent = "Oops! Something went wrong. Please try again.";
        }
    })
    .catch(() => {
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong. Please try again.";
    })
    .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;
    chatInput.value = "";

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
chatbotCloseBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
