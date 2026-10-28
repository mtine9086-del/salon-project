(() => {
  const cards = [...document.querySelectorAll(".style-card")];
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const searchInput = document.getElementById("style-search");
  const noResults = document.getElementById("no-results");
  const selectionTitle = document.getElementById("selection-title");
  const selectionDescription = document.getElementById("selection-description");
  const shareButton = document.getElementById("share-selection");
  const clearButton = document.getElementById("clear-selection");
  const toast = document.getElementById("toast");
  const selected = new Map();
  let activeFilter = "all";
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function updateCards() {
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const matchesCategory = activeFilter === "all" || card.dataset.category === activeFilter;
      const matchesSearch = card.dataset.name.toLowerCase().includes(query) ||
        card.querySelector(".style-info p").textContent.toLowerCase().includes(query);
      const show = matchesCategory && matchesSearch;
      card.hidden = !show;
      if (show) visible++;
    });
    document.querySelectorAll(".category-heading").forEach(heading => {
      const nextGrid = heading.nextElementSibling;
      if (nextGrid && nextGrid.classList.contains("style-grid")) {
        heading.hidden = ![...nextGrid.querySelectorAll(".style-card")].some(card => !card.hidden);
      }
    });
    noResults.hidden = visible > 0;
  }

  function updateSelection() {
    const names = [...selected.keys()];
    const count = names.length;
    selectionTitle.textContent = count ? names.join(" · ") : "Your chosen styles will appear here";
    selectionDescription.textContent = count
      ? count === 1 ? "1 style selected. Show this reference to your barber." : count + " styles selected. Show these references to your barber."
      : "Select one or more styles, then show your selection to your barber.";
    shareButton.disabled = count === 0;
    clearButton.hidden = count === 0;
    cards.forEach(card => {
      const button = card.querySelector(".select-style");
      const isSelected = selected.has(card.dataset.name);
      button.setAttribute("aria-pressed", String(isSelected));
      button.textContent = isSelected ? "✓ Selected" : "＋ Select";
      card.classList.toggle("is-selected", isSelected);
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      updateCards();
    });
  });

  searchInput.addEventListener("input", updateCards);

  cards.forEach(card => {
    card.querySelector(".select-style").addEventListener("click", () => {
      const name = card.dataset.name;
      if (selected.has(name)) selected.delete(name);
      else selected.set(name, card.dataset.category);
      updateSelection();
      if (selected.has(name)) showToast(name + " added to your selection");
      else showToast(name + " removed from your selection");
    });
  });

  clearButton.addEventListener("click", () => {
    selected.clear();
    updateSelection();
    showToast("Your selection has been cleared");
  });

  shareButton.addEventListener("click", async () => {
    const names = [...selected.keys()];
    if (!names.length) return;
    const message = "My salon style references: " + names.join(", ") + ". Please use these as inspiration for my haircut/beard style.";
    if (navigator.share) {
      try {
        await navigator.share({ title: "My salon style selection", text: message, url: window.location.href });
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }
    const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(message + " " + window.location.href);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });

  updateCards();
  updateSelection();
})();