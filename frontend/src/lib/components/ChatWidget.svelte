<script lang="ts">
  import { onMount } from 'svelte';
  import { chatService } from '../services/chatService';

  interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
  }

  let messages: Message[] = [];
  let inputText = '';
  let isLoading = false;
  let sessionId: string | null = null;
  let error: string | null = null;
  let messagesEnd: HTMLDivElement;

  // Use SvelteKit API routes (works in both dev and production)
  const API_BASE = '/api';

  onMount(() => {
    // Load session from localStorage if exists
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      sessionId = savedSessionId;
    }
  });

  async function sendMessage() {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    inputText = '';
    error = null;

    // Add user message to UI immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    messages = [...messages, userMsg];
    scrollToBottom();

    isLoading = true;

    try {
      const response = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      
      // Update session ID
      if (data.sessionId) {
        sessionId = data.sessionId;
        localStorage.setItem('chatSessionId', sessionId);
      }

      // Add AI response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply,
        timestamp: new Date()
      };
      messages = [...messages, aiMsg];
      scrollToBottom();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error sending message:', err);
    } finally {
      isLoading = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function scrollToBottom() {
    setTimeout(() => {
      messagesEnd?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function clearChat() {
    messages = [];
    sessionId = null;
    localStorage.removeItem('chatSessionId');
    error = null;
  }
</script>

<div class="chat-widget">
  <div class="chat-header">
    <div class="header-content">
      <h2>💬 Support Chat</h2>
      <button class="clear-btn" on:click={clearChat} title="Clear chat">Clear</button>
    </div>
  </div>

  <div class="chat-messages">
    {#if messages.length === 0}
      <div class="welcome-message">
        <p>👋 Hi! I'm your AI support agent. How can I help you today?</p>
        <div class="example-questions">
          <p class="examples-title">Try asking:</p>
          <button 
            class="example-btn"
            on:click={() => { inputText = 'What is your return policy?'; sendMessage(); }}
          >
            What is your return policy?
          </button>
          <button 
            class="example-btn"
            on:click={() => { inputText = 'Do you ship to USA?'; sendMessage(); }}
          >
            Do you ship to USA?
          </button>
          <button 
            class="example-btn"
            on:click={() => { inputText = 'What are your support hours?'; sendMessage(); }}
          >
            What are your support hours?
          </button>
        </div>
      </div>
    {/if}

    {#each messages as message (message.id)}
      <div class="message message-{message.sender}">
        <div class="message-content">
          <div class="message-text">{message.text}</div>
          <div class="message-time">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    {/each}

    {#if isLoading}
      <div class="message message-ai">
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    {/if}

    <div bind:this={messagesEnd}></div>
  </div>

  {#if error}
    <div class="error-message">
      ⚠️ {error}
    </div>
  {/if}

  <div class="chat-input-container">
    <textarea
      class="chat-input"
      bind:value={inputText}
      on:keydown={handleKeyPress}
      placeholder="Type your message... (Press Enter to send)"
      rows="1"
      disabled={isLoading}
      maxlength="5000"
    ></textarea>
    <button
      class="send-button"
      on:click={sendMessage}
      disabled={!inputText.trim() || isLoading}
      title="Send message"
    >
      {isLoading ? '⏳' : '➤'}
    </button>
  </div>
</div>

<style>
  .chat-widget {
    width: 100%;
    max-width: 600px;
    height: 700px;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .chat-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 1.5rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chat-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .clear-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.2s;
  }

  .clear-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: #f8f9fa;
  }

  .welcome-message {
    text-align: center;
    padding: 2rem 1rem;
    color: #666;
  }

  .welcome-message p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }

  .example-questions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }

  .examples-title {
    font-size: 0.9rem;
    color: #999;
    margin-bottom: 0.5rem;
  }

  .example-btn {
    background: white;
    border: 1px solid #e0e0e0;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    color: #667eea;
    transition: all 0.2s;
    max-width: 300px;
  }

  .example-btn:hover {
    background: #f0f0f0;
    border-color: #667eea;
  }

  .message {
    display: flex;
    margin-bottom: 0.5rem;
  }

  .message-user {
    justify-content: flex-end;
  }

  .message-ai {
    justify-content: flex-start;
  }

  .message-content {
    max-width: 75%;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    word-wrap: break-word;
  }

  .message-user .message-content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .message-ai .message-content {
    background: white;
    color: #333;
    border: 1px solid #e0e0e0;
    border-bottom-left-radius: 4px;
  }

  .message-text {
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .message-time {
    font-size: 0.7rem;
    opacity: 0.7;
    margin-top: 0.25rem;
  }

  .typing-indicator {
    display: flex;
    gap: 0.3rem;
    padding: 0.5rem 0;
  }

  .typing-indicator span {
    width: 8px;
    height: 8px;
    background: #999;
    border-radius: 50%;
    animation: typing 1.4s infinite;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.7;
    }
    30% {
      transform: translateY(-10px);
      opacity: 1;
    }
  }

  .error-message {
    background: #fee;
    color: #c33;
    padding: 0.75rem 1rem;
    margin: 0 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    border: 1px solid #fcc;
  }

  .chat-input-container {
    display: flex;
    padding: 1rem;
    background: white;
    border-top: 1px solid #e0e0e0;
    gap: 0.5rem;
    align-items: flex-end;
  }

  .chat-input {
    flex: 1;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 0.75rem;
    font-size: 0.95rem;
    font-family: inherit;
    resize: none;
    max-height: 120px;
    min-height: 44px;
  }

  .chat-input:focus {
    outline: none;
    border-color: #667eea;
  }

  .chat-input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  .send-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
    cursor: pointer;
    font-size: 1.2rem;
    transition: opacity 0.2s;
    min-width: 50px;
    height: 44px;
  }

  .send-button:hover:not(:disabled) {
    opacity: 0.9;
  }

  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Scrollbar styling */
  .chat-messages::-webkit-scrollbar {
    width: 6px;
  }

  .chat-messages::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .chat-messages::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }

  .chat-messages::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
</style>

