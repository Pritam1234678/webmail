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
      <article class="mail-row">
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line long"></div>
      </article>
    `).join("");
  }

  if (!messages.length) {
    return `
      <div class="mail-view-empty">
        <p class="eyebrow">Zero Messages</p>
      </div>
    `;
  }

  return messages.map((message) => `
    <article class="mail-row ${message.id === selectedId ? "active" : ""} ${message.unread ? "unread" : ""}" data-message-id="${message.id}">
      <div class="mail-row-top">
        <span class="mail-row-sender">${message.senderName}</span>
        <span class="mail-row-time">${formatTime(message.timestamp)}</span>
      </div>
      <div class="mail-row-subject">${message.subject}</div>
    </article>
  `).join("");
}
