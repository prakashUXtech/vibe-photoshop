<!--
  SessionsPanel.svelte
  This component displays all chat sessions and allows switching between them.
  It shows image thumbnails and provides session management.
-->
<script lang="ts">
  import { chatStore, type ChatSession } from '$lib/stores/chatStore';
  import { imageStore } from '$lib/stores/imageStore';
  import { uiStore } from '$lib/stores/uiStore';
  import { toast } from '$lib/stores/toastStore';
  
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
      
      // For now, switch to the Vibe tab to start editing with this session
      uiStore.setActiveTab('vibe');
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
    
    // Switch to the Vibe tab
    uiStore.setActiveTab('vibe');
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
  
  // Function to find an image thumbnail for a session
  function getSessionImageUrl(session: ChatSession): string | null {
    // First check if there's an associated image
    if (session.imageId) {
      const currentImage = $imageStore.currentImage;
      if (currentImage && currentImage.id === session.imageId) {
        return currentImage.thumbnail;
      }
      // TODO: Retrieve from storage when implemented
    }
    
    // If no direct image ID, look for images in messages
    for (const message of session.messages) {
      if (message.images && message.images.length > 0) {
        return `data:image/jpeg;base64,${message.images[0]}`;
      }
    }
    
    return null;
  }
  
  // Get a summary of a session (first few words of user prompt)
  function getSessionSummary(session: ChatSession): string {
    // Look for the first user message with substantive content
    const userMessage = session.messages.find(m => 
      m.type === 'user' && m.text.trim().length > 0
    );
    
    if (userMessage) {
      const words = userMessage.text.split(' ');
      return words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '');
    }
    
    return 'No content';
  }
</script>

<div class="sessions-panel">
  <div class="panel-header">
    <h3 class="panel-title">Chat Sessions</h3>
    <div class="header-actions">
      <button 
        class="new-session-btn"
        on:click={createNewSession}
        title="Create new session"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        New Session
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
          <!-- Session thumbnail -->
          <div class="session-thumbnail">
            {#if getSessionImageUrl(session)}
              <img src={getSessionImageUrl(session)} alt="Session thumbnail" class="thumbnail-img" />
            {:else}
              <div class="thumbnail-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            {/if}
          </div>
          
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
              <div class="session-summary">
                {getSessionSummary(session)}
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

<style>
  .sessions-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
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
  
  .header-actions {
    display: flex;
    gap: 8px;
  }
  
  .new-session-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: var(--ps-accent);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .new-session-btn:hover {
    background-color: color-mix(in srgb, var(--ps-accent) 85%, black);
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
    padding: 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-bottom: 8px;
    border: 1px solid var(--ps-border);
    gap: 12px;
  }
  
  .session-item:hover {
    background-color: var(--ps-panel);
  }
  
  .session-item.active {
    background-color: var(--ps-panel);
    border-color: var(--ps-accent);
  }
  
  .session-thumbnail {
    width: 64px;
    height: 64px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    background-color: rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .thumbnail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .thumbnail-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ps-text);
    opacity: 0.5;
  }
  
  .session-info {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .session-name {
    font-weight: 500;
    font-size: 0.9rem;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .session-summary {
    font-size: 0.8rem;
    opacity: 0.8;
    margin-bottom: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  .session-meta {
    display: flex;
    font-size: 0.75rem;
    opacity: 0.7;
    gap: 8px;
    justify-content: space-between;
  }
  
  .session-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
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
    padding: 6px 8px;
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