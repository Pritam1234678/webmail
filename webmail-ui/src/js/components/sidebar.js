export function renderSidebar(state) {
  const folderItems = state.folders.map((folder) => {
    const isActive = folder.id === state.activeFolderId;
    return `
      <button class="nav-item ${isActive ? "active" : ""}" data-folder-id="${folder.id}">
        <span class="nav-icon">${folder.icon.toUpperCase()}</span>
        <span class="nav-text">${folder.label}</span>
        ${folder.count > 0 ? `<span class="badge" style="background: none; border: 1px solid var(--border); font-size: 10px">${folder.count}</span>` : ""}
      </button>
    `;
  }).join("");

  const mailboxItems = state.mailboxes.map((mailbox) => {
    const isActive = mailbox.id === state.activeMailboxId;
    return `
      <button class="nav-item ${isActive ? "active" : ""}" data-mailbox-id="${mailbox.id}">
        <span class="nav-icon">${mailbox.initials}</span>
        <span class="nav-text">${mailbox.name}</span>
      </button>
    `;
  }).join("");

  return `
    <section class="sidebar-section">
      <p class="eyebrow" style="padding: 0 16px 12px">Mailboxes</p>
      <div class="nav-list">${mailboxItems}</div>
    </section>
    <section class="sidebar-section" style="margin-top: 32px">
      <p class="eyebrow" style="padding: 0 16px 12px">Navigation</p>
      <div class="nav-list">${folderItems}</div>
    </section>
  `;
}
