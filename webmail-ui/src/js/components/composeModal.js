export function renderComposeModal(state) {
  return `
    <div class="compose-backdrop ${state.composeOpen ? "open" : ""}">
      <section class="compose-modal">
        <header class="compose-header">
          <p class="eyebrow">New Message</p>
          <button class="icon-button" id="closeCompose">
            <span></span><span></span><span></span>
          </button>
        </header>
        <div class="compose-fields">
          <input class="compose-input" id="composeTo" placeholder="Recipient" value="${state.composeDraft.to}">
          <input class="compose-input" id="composeSubject" placeholder="Subject" value="${state.composeDraft.subject}">
          <textarea class="compose-textarea" id="composeBody" placeholder="Message content...">${state.composeDraft.body}</textarea>
        </div>
        <footer class="compose-footer">
          <button class="ghost-button" id="saveDraftButton" style="margin-right: 12px">Save</button>
          <button class="primary-button" id="sendButton">Dispatch</button>
        </footer>
      </section>
    </div>
  `;
}
