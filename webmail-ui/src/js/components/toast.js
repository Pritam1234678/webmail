let toastId = 0;
const activeToasts = [];

export function pushToast(root, title, description) {
  const id = ++toastId;
  activeToasts.push({ id, title, description });
  renderToasts(root);

  window.setTimeout(() => {
    const index = activeToasts.findIndex((toast) => toast.id === id);
    if (index >= 0) {
      activeToasts.splice(index, 1);
      renderToasts(root);
    }
  }, 2800);
}

function renderToasts(root) {
  root.innerHTML = activeToasts.map((toast) => `
    <article class="toast">
      <strong>${toast.title}</strong>
      <span>${toast.description}</span>
    </article>
  `).join("");
}
