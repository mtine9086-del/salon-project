(() => {
  const cards = [...document.querySelectorAll(".style-card")];
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const searchInput = document.getElementById("style-search");
  const noResults = document.getElementById("no-results");
  const viewer = document.getElementById("image-viewer");
  const viewerImage = document.getElementById("viewer-image");
  const viewerCaption = document.getElementById("viewer-caption");
  const closeButton = document.getElementById("viewer-close");
  const prevButton = document.getElementById("viewer-prev");
  const nextButton = document.getElementById("viewer-next");
  let activeFilter = "all";
  let currentCardIndex = 0;

  function updateCards() {
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const description = card.querySelector(".style-info p").textContent.toLowerCase();
      const matchesCategory = activeFilter === "all" || card.dataset.category === activeFilter;
      const matchesSearch = card.dataset.name.toLowerCase().includes(query) || description.includes(query);
      card.hidden = !(matchesCategory && matchesSearch);
      if (!card.hidden) visible++;
    });
    document.querySelectorAll(".category-heading").forEach(heading => {
      const grid = heading.nextElementSibling;
      if (grid && grid.classList.contains("style-grid")) {
        heading.hidden = ![...grid.querySelectorAll(".style-card")].some(card => !card.hidden);
      }
    });
    noResults.hidden = visible > 0;
  }

  function photoUrl(card) {
    const image = card.querySelector(".style-image");
    const background = getComputedStyle(image).backgroundImage;
    const match = background.match(/url\(["']?(.*?)["']?\)/);
    return match ? match[1] : "";
  }

  function visibleCards() {
    return cards.filter(card => !card.hidden);
  }

  function showCard(card) {
    if (!card) return;
    currentCardIndex = cards.indexOf(card);
    const url = photoUrl(card);
    viewerImage.removeAttribute("src");
    viewerImage.alt = card.dataset.name + " hairstyle reference photo";
    if (url) viewerImage.src = url;
    viewerCaption.textContent = card.dataset.name + " · " + (card.dataset.category === "hair" ? "Haircut" : "Beard style");
    if (!viewer.open) viewer.showModal();
  }

  viewerImage.addEventListener("error", () => {
    viewerCaption.textContent = "Photo unavailable — please close and try another style.";
    viewerImage.alt = "This style photo could not be loaded.";
  });

  function movePhoto(direction) {
    const visible = visibleCards();
    if (!visible.length) return;
    let index = visible.indexOf(cards[currentCardIndex]);
    if (index < 0) index = 0;
    index = (index + direction + visible.length) % visible.length;
    showCard(visible[index]);
  }

  cards.forEach(card => {
    const image = card.querySelector(".style-image");
    image.setAttribute("role", "button");
    image.setAttribute("tabindex", "0");
    image.setAttribute("aria-label", "View " + card.dataset.name + " photo full screen");
    image.addEventListener("click", () => showCard(card));
    image.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showCard(card);
      }
    });
  });

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
  closeButton.addEventListener("click", () => viewer.close());
  prevButton.addEventListener("click", () => movePhoto(-1));
  nextButton.addEventListener("click", () => movePhoto(1));
  viewer.addEventListener("click", event => {
    if (event.target === viewer) viewer.close();
  });
  document.addEventListener("keydown", event => {
    if (!viewer.open) return;
    if (event.key === "ArrowLeft") movePhoto(-1);
    if (event.key === "ArrowRight") movePhoto(1);
  });
  updateCards();
})();