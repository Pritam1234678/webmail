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
      <div style="padding: 40px">
        <div class="skeleton skeleton-line long" style="height: 32px; margin-bottom: 40px"></div>
        <div class="skeleton skeleton-line medium" style="margin-bottom: 24px"></div>
        <div class="skeleton skeleton-line long"></div>
      </div>
    `;
  }

  if (!message) {
    return `
      <div class="mail-view-empty">
        <p class="eyebrow">Select a conversation</p>
      </div>
    `;
  }

  return `
    <article class="mail-view-container">
      <h2 class="mail-view-subject">${message.subject}</h2>

      <div class="sender-card">
        <div class="sender-avatar">${message.senderName.slice(0, 1).toUpperCase()}</div>
        <div class="sender-copy">
          <strong>${message.senderName}</strong>
          <span>${message.senderEmail} · ${formatLongTime(message.timestamp)}</span>
        </div>
      </div>

      <div class="mail-body">${message.body}</div>
    </article>
  `;
}
