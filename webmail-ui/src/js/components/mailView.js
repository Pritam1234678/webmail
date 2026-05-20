function formatLongTime(timestamp) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

export function renderMailView(message, loading) {
  if (loading) {
    return `
      <div class="mail-view-card">
        <div class="skeleton skeleton-line medium"></div>
        <div class="sender-card">
          <div class="skeleton skeleton-line short"></div>
        </div>
        <div class="skeleton skeleton-line long"></div>
        <div class="skeleton skeleton-line long"></div>
        <div class="skeleton skeleton-line medium"></div>
      </div>
    `;
  }

  if (!message) {
    return `
      <div class="mail-view-empty">
        <div class="empty-state-card">
          <strong>Select a conversation</strong>
          <p>Thread preview, reply actions, attachments, and message metadata are ready here for backend integration.</p>
        </div>
      </div>
    `;
  }

  const attachments = message.attachments.length
    ? `
      <section>
        <p class="eyebrow">Attachments</p>
        <div class="attachment-grid">
          ${message.attachments.map((attachment) => `
            <article class="attachment-card">
              <strong>${attachment.name}</strong>
              <span>${attachment.type} · ${attachment.size}</span>
            </article>
          `).join("")}
        </div>
      </section>
    `
    : "";

  const thread = message.thread.length
    ? `
      <section>
        <div class="thread-actions">
          <button class="ghost-button">Reply</button>
          <button class="ghost-button">Forward</button>
          <button class="ghost-button">Open thread</button>
        </div>
        <div class="thread-list">
          ${message.thread.map((item) => `
            <article class="thread-card">
              <strong>${item.author}</strong>
              <p class="thread-meta">${item.time}</p>
              <p>${item.summary}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `
    : "";

  return `
    <article class="mail-view-card">
      <header class="mail-view-header">
        <div>
          <p class="eyebrow">${message.folder}</p>
          <h2 class="mail-view-subject">${message.subject}</h2>
        </div>
        <div class="mail-actions">
          <button class="ghost-button" data-action="star">${message.starred ? "Unstar" : "Star"}</button>
          <button class="ghost-button" data-action="spam">Spam</button>
          <button class="ghost-button" data-action="delete">Delete</button>
        </div>
      </header>

      <section class="sender-card">
        <div class="sender-line">
          <div class="sender-avatar">${message.senderName.slice(0, 2).toUpperCase()}</div>
          <div class="sender-copy">
            <strong>${message.senderName} &lt;${message.senderEmail}&gt;</strong>
            <span>To ${message.recipients.join(", ")} · ${formatLongTime(message.timestamp)}</span>
          </div>
        </div>
      </section>

      <section class="mail-body">${message.body}</section>
      ${attachments}
      ${thread}
    </article>
  `;
}
