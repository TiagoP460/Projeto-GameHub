import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import * as ui from "./ui.js";
import * as api from "./api.js";
let currentUser = null;
let gamesData = [];
function showCatalogPage() {
  ui.renderCatalog(gamesData);
}
function showGameDetails(gameId) {
  const game = gamesData.find((g) => g.id === gameId);
  if (!game) return;

  api.onGameReviewsSnapshot(game.id, (reviews) => {
    ui.renderGameDetails(game, reviews, currentUser);
  });
}
async function showProfilePage() {
  if (!currentUser) return;
  const userProfile = await api.getUserProfile(currentUser.uid);
  if (userProfile) {
    api.onUserReviewsSnapshot(currentUser.uid, gamesData, (reviews) => {
      const totalReviews = reviews.length;
      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
      const stats = { totalReviews, averageRating };
      ui.renderProfilePage(userProfile, reviews, stats, currentUser);
    });
  }
}
function showCommunityReviews() {
  api.onAllReviewsSnapshot(gamesData, (reviews) => {
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    const stats = { totalReviews, averageRating };
    ui.renderAllReviews(reviews, stats, currentUser);
  });
}
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorDiv = document.getElementById("login-error");
  errorDiv.textContent = "";
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    errorDiv.textContent = "Email ou senha inválidos.";
  }
}
async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const errorDiv = document.getElementById("signup-error");
  errorDiv.textContent = "";
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await api.createUserProfile(userCredential.user, name);
  } catch (err) {
    errorDiv.textContent = "Erro ao criar conta. Verifique os dados.";
  }
}
async function handleReviewSubmit(e) {
  if (e.target.id !== "review-form") return;
  e.preventDefault();
  if (!currentUser) return;
  const gameId = e.target.dataset.gameId;
  const ratingInput = e.target.querySelector('input[name="rating"]:checked');
  const text = e.target.querySelector("#review-text").value;
  const successDiv = e.target.querySelector("#review-success");
  if (!ratingInput) {
    successDiv.textContent = "Por favor, selecione uma nota.";
    setTimeout(() => (successDiv.textContent = ""), 3000);
    return;
  }
  try {
    await api.submitReview(gameId, ratingInput.value, text, currentUser);
    successDiv.textContent = "Avaliação enviada com sucesso!";
    e.target.reset();
  } catch (error) {
    successDiv.textContent = "Ocorreu um erro ao enviar sua avaliação.";
  } finally {
    setTimeout(() => (successDiv.textContent = ""), 3000);
  }
}
async function handleMainContentClick(e) {
  const target = e.target;
  const gameCard = target.closest(".game-card");
  if (gameCard) {
    showGameDetails(gameCard.dataset.gameId);
    return;
  }
  if (target.closest("#back-to-catalog")) {
    showCatalogPage();
    return;
  }
  const deleteBtn = target.closest(".btn-delete-review");
  if (deleteBtn) {
    const reviewId = deleteBtn.dataset.reviewId;
    if (confirm("Tem certeza que deseja excluir esta avaliação?")) {
      await api.deleteReview(reviewId);
    }
    return;
  }
}
async function handleProfilePicUpload(event) {
  const file = event.target.files[0];
  if (!file || !currentUser) return;
  try {
    await api.uploadProfilePicture(currentUser.uid, file);
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    alert("Não foi possível atualizar a foto de perfil.");
  }
}
function setupEventListeners() {
  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document
    .getElementById("signup-form")
    .addEventListener("submit", handleSignup);
  document
    .getElementById("go-to-signup")
    .addEventListener("click", () => ui.showPage("signup-page"));
  document
    .getElementById("go-to-login")
    .addEventListener("click", () => ui.showPage("login-page"));
  document
    .getElementById("logout-button")
    .addEventListener("click", () => signOut(auth));
  document.getElementById("nav-logo").addEventListener("click", (e) => {
    e.preventDefault();
    if (currentUser) showCatalogPage();
  });
  document
    .getElementById("nav-catalog")
    .addEventListener("click", showCatalogPage);
  document
    .getElementById("nav-community")
    .addEventListener("click", showCommunityReviews);
  document
    .getElementById("nav-profile")
    .addEventListener("click", showProfilePage);
  document
    .getElementById("main-content")
    .addEventListener("click", handleMainContentClick);
  document
    .getElementById("main-content")
    .addEventListener("submit", handleReviewSubmit);
  document.getElementById("main-content").addEventListener("change", (e) => {
    if (e.target.id === "profile-pic-upload") handleProfilePicUpload(e);
  });
}
function initializeApp() {
  setupEventListeners();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      document.getElementById("loading-spinner").style.display = "flex";
      await api.seedDatabase();
      gamesData = await api.fetchGames();
      ui.showPage("main-content");
      showCatalogPage();
    } else {
      currentUser = null;
      gamesData = [];
      ui.showPage("login-page");
    }
  });
}
initializeApp();
