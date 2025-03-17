<!--
  ChatSessionsPanel.svelte
  This component displays all chat sessions and allows switching between them.
-->
<script lang="ts">
  import { chatStore, type ChatSession } from '$lib/stores/chatStore';
  import { imageStore } from '$lib/stores/imageStore';
  import { uiStore } from '$lib/stores/uiStore';
  import { toast } from '$lib/stores/toastStore';
  
  export let showPanel = false;
  
  let sessions: ChatSession[] = [];
  let activeSessionId: string | null = null;
  let editingSessionId: string | null = null;
  let newSessionName = '';
  let searchQuery = '';
  
  // Subscribe to chat store
  $: sessions = $chatStore.sessions;
  $: activeSessionId = $chatStore.activeSessionId;
  
  function handleSessionClick(sessionId: string) {
    // Set active session
    chatStore.setActiveSession(sessionId);
    
    // Load associated image if it exists
    const session = sessions.find(s => s.id === sessionId);
    if (session?.imageId && $imageStore.currentImage?.id !== session.imageId) {
      // TODO: Load image from storage if needed
    }
    
    // Hide panel after selection on mobile
    if (window.innerWidth < 768) {
      showPanel = false;
    }
  }
  
  function startEditingSession(sessionId: string, event: MouseEvent) {
    event.stopPropagation();
    editingSessionId = sessionId;
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      newSessionName = session.name;
    }
  }
  
  function saveSessionName() {
    if (editingSessionId && newSessionName.trim()) {
      chatStore.renameSession(editingSessionId, newSessionName.trim());
      toast.success('Session renamed');
    }
    editingSessionId = null;
    newSessionName = '';
  }
  
  function cancelEditing() {
    editingSessionId = null;
    newSessionName = '';
  }
  
  function createNewSession() {
    const timestamp = new Date();
    const newSession = chatStore.createSession(`Session ${timestamp.toLocaleString()}`, $imageStore.currentImage?.id);
    
    // Add a welcome message to the new session
    chatStore.addMessage({
      type: 'system',
      text: 'New session started. Enter a prompt to get started.',
      timestamp: new Date()
    });
  }
  
  function deleteSession(sessionId: string, event: MouseEvent) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this session?')) {
      chatStore.deleteSession(sessionId);
      toast.success('Session deleted');
    }
  }
  
  // Filter sessions by search query
  $: filteredSessions = searchQuery
    ? sessions.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : sessions;
  
  // Sort sessions by update date (newest first)
  $: sortedSessions = [...filteredSessions].sort((a, b) => 
    b.updatedAt.getTime() - a.updatedAt.getTime()
  );
</script>

{#if showPanel}
  <div class="chat-sessions-panel">
    <div class="panel-header">
      <h3 class="panel-title">Chat Sessions</h3>
      <div class="flex gap-2">
        <button 
          class="new-session-btn"
          on:click={createNewSession}
          title="Create new session"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </button>
        <button 
          class="close-btn"
          on:click={() => showPanel = false}
          title="Close panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="search-container">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search sessions..."
        class="search-input"
      />
    </div>
    
    <div class="sessions-list">
      {#if sortedSessions.length === 0}
        <div class="no-sessions">
          <p>No sessions found</p>
          <button on:click={createNewSession} class="create-session-btn">
            Create New Session
          </button>
        </div>
      {:else}
        {#each sortedSessions as session (session.id)}
          <div 
            class="session-item {session.id === activeSessionId ? 'active' : ''}"
            on:click={() => handleSessionClick(session.id)}
          >
            <div class="session-info">
              {#if editingSessionId === session.id}
                <div class="edit-form">
                  <input 
                    bind:value={newSessionName} 
                    class="rename-input"
                    on:keydown={e => e.key === 'Enter' && saveSessionName()}
                    on:keydown={e => e.key === 'Escape' && cancelEditing()}
                    on:blur={saveSessionName}
                    autofocus
                  />
                </div>
              {:else}
                <div class="session-name">
                  {session.name}
                </div>
                <div class="session-meta">
                  <span class="message-count">{session.messages.length} messages</span>
                  <span class="timestamp">{new Date(session.updatedAt).toLocaleString()}</span>
                </div>
              {/if}
            </div>
            
            <div class="session-actions">
              <button 
                on:click={e => startEditingSession(session.id, e)}
                class="action-btn"
                title="Rename session"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button 
                on:click={e => deleteSession(session.id, e)}
                class="action-btn delete-btn"
                title="Delete session"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
{/if}

<style>
  .chat-sessions-panel {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--ps-secondary);
    z-index: 20;
    display: flex;
    flex-direction: column;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--ps-border);
  }
  
  .panel-title {
    font-size: 0.9rem;
    font-weight: 500;
    margin: 0;
  }
  
  .new-session-btn, .close-btn {
    background: transparent;
    border: none;
    border-radius: 4px;
    padding: 4px;
    cursor: pointer;
    color: var(--ps-text);
    opacity: 0.7;
    transition: all 0.2s;
  }
  
  .new-session-btn:hover, .close-btn:hover {
    opacity: 1;
    background-color: var(--ps-panel);
  }
  
  .search-container {
    padding: 8px 16px;
    border-bottom: 1px solid var(--ps-border);
  }
  
  .search-input {
    width: 100%;
    padding: 8px 12px;
    background-color: var(--ps-panel);
    border: 1px solid var(--ps-border);
    border-radius: 4px;
    color: var(--ps-text);
    font-size: 0.85rem;
  }
  
  .search-input:focus {
    outline: none;
    border-color: var(--ps-accent);
    box-shadow: 0 0 0 1px var(--ps-accent);
  }
  
  .sessions-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
  
  .session-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-bottom: 4px;
  }
  
  .session-item:hover {
    background-color: var(--ps-panel);
  }
  
  .session-item.active {
    background-color: var(--ps-panel);
    border-left: 3px solid var(--ps-accent);
  }
  
  .session-info {
    flex: 1;
    overflow: hidden;
  }
  
  .session-name {
    font-weight: 500;
    font-size: 0.85rem;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .session-meta {
    display: flex;
    font-size: 0.75rem;
    opacity: 0.7;
    gap: 8px;
  }
  
  .session-actions {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  .session-item:hover .session-actions {
    opacity: 1;
  }
  
  .action-btn {
    background: transparent;
    border: none;
    border-radius: 4px;
    padding: 4px;
    cursor: pointer;
    color: var(--ps-text);
    opacity: 0.7;
  }
  
  .action-btn:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1);
  }
  
  .delete-btn:hover {
    color: #ef4444;
  }
  
  .edit-form {
    padding: 2px 0;
  }
  
  .rename-input {
    width: 100%;
    padding: 4px 8px;
    background-color: var(--ps-secondary);
    border: 1px solid var(--ps-accent);
    border-radius: 4px;
    color: var(--ps-text);
    font-size: 0.85rem;
  }
  
  .no-sessions {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    text-align: center;
    opacity: 0.7;
  }
  
  .create-session-btn {
    margin-top: 12px;
    background-color: var(--ps-accent);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .create-session-btn:hover {
    background-color: color-mix(in srgb, var(--ps-accent) 85%, black);
  }
</style> 