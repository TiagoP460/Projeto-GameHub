const elements = {
  loadingSpinner: document.getElementById("loading-spinner"),
  loginPage: document.getElementById("login-page"),
  signupPage: document.getElementById("signup-page"),
  mainContent: document.getElementById("main-content"),
  mainContainer: document.querySelector("#main-content main"),
};

export function showPage(pageId) {
  console.log("Mostrando página:", pageId);
  elements.loadingSpinner.style.display = "none";
  elements.loginPage.style.display = "none";
  elements.signupPage.style.display = "none";
  elements.mainContent.style.display = "none";

  const pageToShow = document.getElementById(pageId);
  if (pageToShow) {
    if (pageId === "login-page" || pageId === "signup-page") {
      pageToShow.style.display = "flex";
    } else {
      pageToShow.style.display = "block";
    }
  }
}

export function renderCatalog(gamesData) {
  let content = `<h1>Catálogo de Jogos</h1>`;
  content += `<div class="game-grid">`;
  gamesData.forEach((game) => {
    content += `
      <div data-game-id="${game.id}" class="game-card">
        <img src="${game.imageUrl}" alt="${game.title}" onerror="this.src='https://placehold.co/400x300/1f2937/f9fafb?text=Not+Found';">
        <div class="game-card-title">${game.title}</div>
      </div>
    `;
  });
  content += `</div>`;
  elements.mainContainer.innerHTML = content;
}

export function renderGameDetails(game, reviews, currentUser) {
  const reviewsHTML =
    reviews.length > 0
      ? reviews
          .map((review) =>
            createReviewCard(review, currentUser, { showGameTitle: false })
          )
          .join("")
      : '<p class="empty-state-text">Nenhuma avaliação para este jogo ainda. Seja o primeiro!</p>';

  const content = `
    <div class="page-header">
      <button id="back-to-catalog" class="btn-secondary">&larr; Voltar ao Catálogo</button>
    </div>
    <div class="game-details-container">
      <div class="game-details-header">
        <img src="${game.imageUrl}" alt="Capa de ${game.title}" class="game-cover-large">
        <div class="game-info">
          <h2>${game.title}</h2>
          <p>Deixe sua avaliação para este jogo.</p>
          <form id="review-form" data-game-id="${game.id}" class="review-form">
            <div class="star-rating">
              <input type="radio" id="5-stars" name="rating" value="5" /><label for="5-stars">★</label>
              <input type="radio" id="4-stars" name="rating" value="4" /><label for="4-stars">★</label>
              <input type="radio" id="3-stars" name="rating" value="3" /><label for="3-stars">★</label>
              <input type="radio" id="2-stars" name="rating" value="2" /><label for="2-stars">★</label>
              <input type="radio" id="1-star" name="rating" value="1" required/><label for="1-star">★</label>
            </div>
            <textarea id="review-text" rows="4" placeholder="Sua análise (opcional)"></textarea>
            <button type="submit" class="btn btn-primary">Enviar Avaliação</button>
            <div id="review-success" class="success-message"></div>
          </form>
        </div>
      </div>
      <div class="reviews-section">
        <h3>Avaliações da Comunidade</h3>
        <div class="reviews-list">${reviewsHTML}</div>
      </div>
    </div>
  `;
  elements.mainContainer.innerHTML = content;
}

export function renderAllReviews(reviews, currentUser) {
  const reviewsHTML =
    reviews.length > 0
      ? reviews
          .map((review) =>
            createReviewCard(review, currentUser, { showGameTitle: true })
          )
          .join("")
      : '<div class="empty-state-card">Ainda não há nenhuma avaliação na comunidade.</div>';

  const content = `
      <h1>Avaliações da Comunidade</h1>
      <div class="reviews-list">${reviewsHTML}</div>
  `;
  elements.mainContainer.innerHTML = content;
}

export function renderProfilePage(profile, reviews, stats, currentUser) {
  const defaultPic = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZHRoPSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjYWQ0ZTYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2EtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjUiLz48cGF0aCBkPSJNMjAgMjFhOCA4IDAgMCAwLTE2IDAiLz48L3N2Zz4=`;

  const reviewsHTML =
    reviews.length > 0
      ? reviews
          .map((review) =>
            createReviewCard(review, currentUser, { showGameTitle: true })
          )
          .join("")
      : `<div class="empty-state-card">Você ainda não fez nenhuma avaliação.</div>`;

  const content = `
    <div class="profile-page">
      <div class="profile-header">
        <label for="profile-pic-upload" class="profile-picture-wrapper">
            <img id="profile-pic" src="${
              profile.photoURL || defaultPic
            }" alt="Foto de Perfil" class="profile-picture">
            <div class="profile-picture-overlay"><span>Trocar Foto</span></div>
        </label>
        <input type="file" id="profile-pic-upload" class="hidden-file-input" accept="image/*">

        <div class="profile-info">
          <h2>${profile.displayName || "Usuário"}</h2>
          <p>${profile.email}</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-label">Total de Avaliações</p>
          <p class="stat-value">${stats.totalReviews}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Média de Notas</p>
          <p class="stat-value">${stats.averageRating.toFixed(1)}</p>
        </div>
      </div>

      <div class="reviews-section">
        <h3>Minhas Avaliações</h3>
        <div class="reviews-list">${reviewsHTML}</div>
      </div>
    </div>
  `;
  elements.mainContainer.innerHTML = content;
}
function createReviewCard(review, currentUser, { showGameTitle = false } = {}) {
  let stars = Array.from(
    { length: 5 },
    (_, i) =>
      `<span class="star ${i < review.rating ? "filled" : ""} ">★</span>`
  ).join("");

  const deleteButtonHTML =
    currentUser && review.userId === currentUser.uid
      ? `<button data-review-id="${review.id}" class="btn-delete-review">Excluir</button>`
      : "";

  const gameTitleHTML = showGameTitle
    ? `<h4 class="review-game-title">${review.gameTitle}</h4>`
    : "";

  return `
    <div class="review-card">
      <div class="review-card-header">
        ${gameTitleHTML}
        <div class="review-stars">${stars}</div>
      </div>
      <p class="review-text">"${
        review.text || "Nenhum comentário escrito."
      }"</p>
      <div class="review-card-footer">
        <p class="review-author">Avaliado por: ${review.userEmail}</p>
        ${deleteButtonHTML}
      </div>
    </div>
  `;
}
