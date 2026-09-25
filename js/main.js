const GAME_URL =
  "https://files.twoplayergames.org/files/games/g1/flip-duel-v1b/index.html";

const shell = document.getElementById("gameShell");
const frame = document.getElementById("gameFrame");
const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const likeCount = document.getElementById("likeCount");
const dislikeCount = document.getElementById("dislikeCount");
const controlsBtn = document.getElementById("controlsBtn");
const shareBtn = document.getElementById("shareBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const hideBarBtn = document.getElementById("hideBarBtn");
const controlsModal = document.getElementById("controlsModal");
const playScreen = document.getElementById("playScreen");
const playBtn = document.getElementById("playBtn");
const playStatus = document.getElementById("playStatus");

const voteKey = "flipduel-vote";

function parseCount(value) {
  const raw = String(value || "").trim().toUpperCase().replace(/,/g, "");
  if (!raw) return 0;
  if (raw.endsWith("K")) return Math.round(parseFloat(raw) * 1000) || 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function formatCount(n) {
  if (n >= 1000) {
    const k = n / 1000;
    const text = k >= 10 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, "");
    return text + "K";
  }
  return String(n);
}

function baseCounts() {
  return {
    likes: parseCount(likeCount.dataset.count || likeCount.textContent),
    dislikes: parseCount(dislikeCount.dataset.count || dislikeCount.textContent),
  };
}

function renderVotes() {
  const base = baseCounts();
  const vote = localStorage.getItem(voteKey);
  likeCount.textContent = formatCount(base.likes + (vote === "like" ? 1 : 0));
  dislikeCount.textContent = formatCount(base.dislikes + (vote === "dislike" ? 1 : 0));
  likeBtn.classList.toggle("active-like", vote === "like");
  dislikeBtn.classList.toggle("active-dislike", vote === "dislike");
}

function setVote(next) {
  const current = localStorage.getItem(voteKey);
  if (current === next) {
    localStorage.removeItem(voteKey);
  } else {
    localStorage.setItem(voteKey, next);
  }
  renderVotes();
}

function openModal(modal) {
  modal.hidden = false;
  modal.classList.add("show");
}

function closeModal(modal) {
  modal.classList.remove("show");
  modal.hidden = true;
}

function focusGame() {
  frame.focus();
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await shell.requestFullscreen();
    return;
  }
  await document.exitFullscreen();
}

async function sharePage() {
  const siteUrl = (window.FLIPDUEL_CONFIG && window.FLIPDUEL_CONFIG.siteUrl) || window.location.origin;
  const payload = {
    title: "Flip Duel",
    text: "Play Flip Duel in your browser.",
    url: siteUrl.replace(/\/$/, "") + "/",
  };

  if (navigator.share) {
    try {
      await navigator.share(payload);
      return;
    } catch {
      /* user cancelled or share failed */
    }
  }

  try {
    await navigator.clipboard.writeText(payload.url);
    shareBtn.dataset.tooltip = "Copied";
    setTimeout(() => {
      shareBtn.dataset.tooltip = "Share";
    }, 1400);
  } catch {
    window.prompt("Copy this link", payload.url);
  }
}

likeBtn.addEventListener("click", () => setVote("like"));
dislikeBtn.addEventListener("click", () => setVote("dislike"));
controlsBtn.addEventListener("click", () => openModal(controlsModal));
shareBtn.addEventListener("click", () => {
  sharePage().catch(() => {});
});
fullscreenBtn.addEventListener("click", () => {
  toggleFullscreen().catch(() => {});
});
hideBarBtn.addEventListener("click", () => {
  shell.classList.toggle("bar-hidden");
});

controlsModal.addEventListener("click", (event) => {
  if (event.target === controlsModal || event.target.closest("[data-close-modal]")) {
    closeModal(controlsModal);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && controlsModal.classList.contains("show")) {
    closeModal(controlsModal);
  }
});

document.addEventListener("fullscreenchange", () => {
  const active = Boolean(document.fullscreenElement);
  shell.classList.toggle("fs-active", active);
  if (!active) shell.classList.remove("bar-hidden");
});

let gameStarted = false;

frame.addEventListener("load", () => {
  if (!gameStarted || !frame.src) return;
  playScreen.classList.add("is-hidden");
  focusGame();
});

document.querySelector(".game-frame-wrap").addEventListener("pointerdown", () => {
  if (gameStarted) focusGame();
});

function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  playBtn.disabled = true;
  playStatus.hidden = false;
  frame.src = GAME_URL;
  if (typeof window.gtag === "function") {
    window.gtag("event", "play_game", {
      event_category: "game",
      event_label: "Flip Duel",
    });
  }
}

playBtn.addEventListener("click", startGame);

const popularGames = document.getElementById("popularGames");
if (popularGames) {
  const mobilePopular = window.matchMedia("(max-width: 900px)");

  function syncPopularMenu() {
    popularGames.open = !mobilePopular.matches;
  }

  syncPopularMenu();
  mobilePopular.addEventListener("change", syncPopularMenu);

  popularGames.querySelector(".popular-toggle")?.addEventListener("click", (event) => {
    if (!mobilePopular.matches) event.preventDefault();
  });

  document.addEventListener("click", (event) => {
    if (!mobilePopular.matches || !popularGames.open) return;
    if (popularGames.contains(event.target)) return;
    popularGames.removeAttribute("open");
  });
}

renderVotes();

if (window.lucide) {
  window.lucide.createIcons({
    attrs: {
      "stroke-width": 2,
    },
  });
}
