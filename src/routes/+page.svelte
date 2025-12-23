<script lang="ts">
  import ChatWidget from '../lib/components/ChatWidget.svelte';
</script>

<div class="container">
  <header>
    <h1>SpurStore - AI Support Chat</h1>
    <p>Ask me anything about our store, shipping, returns, or support!</p>
  </header>
  
  <main>
    <ChatWidget />
  </main>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
  }

  header {
    text-align: center;
    margin-bottom: 3rem;
  }

  h1 {
    font-size: 2.5rem;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    font-size: 1.1rem;
  }

  main {
    display: flex;
    justify-content: center;
  }
</style>

