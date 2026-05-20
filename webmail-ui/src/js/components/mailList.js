function formatTime(timestamp) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

export function renderMailList(messages, selectedId, loading) {
  if (loading) {
    return Array.from({ length: 7 }).map(() => `
      <article class="skeleton-mail-row">
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line long"></div>
        <div class="skeleton skeleton-line medium"></div>
      </article>
    `).join("");
  }

  if (!messages.length) {
    return `
      <div class="mail-empty-state">
        <div class="empty-state-card">
          <strong>No messages found</strong>
          <p>Search, folder filters, infinite scroll, and real API data can plug into this state without changing the layout.</p>
        </div>
      </div>
    `;
  }

  return messages.map((message) => `
    <article class="mail-row ${message.id === selectedId ? "active" : ""} ${message.unread ? "unread" : ""}" data-message-id="${message.id}">
      <div class="mail-row-star" aria-hidden="true">${message.starred ? "★" : "☆"}</div>
      <div class="mail-row-main">
        <div class="mail-row-top">
          <strong class="mail-row-sender">${message.senderName}</strong>
          <span class="mail-row-time">${formatTime(message.timestamp)}</span>
        </div>
        <div class="mail-row-bottom">
          <div>
            <strong class="mail-row-subject">${message.subject}</strong>
            <p class="mail-row-snippet">${message.snippet}</p>
          </div>
        </div>
      </div>
      <div class="mail-row-meta">
        ${message.tags[0] ? `<span class="mail-row-tag">${message.tags[0]}</span>` : ""}
        ${message.attachments.length ? `<span class="mail-row-tag">${message.attachments.length} files</span>` : ""}
      </div>
    </article>
  `).join("");
}
