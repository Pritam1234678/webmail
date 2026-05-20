export function renderSearchBar(query) {
  return `
    <label class="search-bar" for="mailSearch">
      <span aria-hidden="true">⌕</span>
      <input id="mailSearch" type="search" placeholder="Search mail, people, attachments, threads" value="${query}">
    </label>
  `;
}
