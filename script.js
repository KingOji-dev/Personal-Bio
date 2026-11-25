// ==========================================
// 1. BIO LINKS DATA & INTERACTION
// ==========================================
const bioItems = [
  { label: "DISCORD", value: "! 𝑜̄𝒿𝒾", copyText: "super_macy" },
  { label: "INSTAGRAM", value: "𝑜̄𝒿𝒾", url: "https://www.instagram.com/super._oji/" },
  { label: "GITHUB", value: "𝑜̄𝒿𝒾", url: "https://github.com/KingOji-dev" },
  { label: "ROBLOX", value: "𝑜̄𝒿𝒾", url: "https://www.roblox.com/users/156270618/profile" },
  { label: "TWITTER", value: "@𝑜̄𝒿𝒾", url: "https://x.com/oj1great" },
  { label: "COMMUNITY", value: "The Founding GPO", copyText: "In Progress" }
];

const bioListEl = document.getElementById("bio-links");
const toastEl = document.getElementById("toast-msg");
let toastTimeout = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove("opacity-0");
  toastEl.classList.add("opacity-100");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove("opacity-100");
    toastEl.classList.add("opacity-0");
  }, 2500);
}

function fallbackCopy(text) {
  const tempInput = document.createElement("textarea");
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  try {
    document.execCommand("copy");
    showToast(`COPIED: ${text}`);
  } catch (err) {
    showToast("COPY FAILED");
  }
  document.body.removeChild(tempInput);
}

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(`COPIED: ${text}`))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

bioItems.forEach((item) => {
  const li = document.createElement("li");
  li.className = "bio-row";

  if (item.url) {
    li.innerHTML = `
      <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between py-3.5 px-1">
        <span class="row-label font-mono-code text-[10px] tracking-[0.16em] text-neutral-400 uppercase">${item.label}</span>
        <span class="row-value font-serif-display text-[17px] text-white">${item.value}</span>
      </a>
    `;
  } else {
    li.innerHTML = `
      <button type="button" class="w-full flex items-center justify-between py-3.5 px-1 text-left cursor-pointer">
        <span class="row-label font-mono-code text-[10px] tracking-[0.16em] text-neutral-400 uppercase">${item.label}</span>
        <span class="row-value font-serif-display text-[17px] text-white">${item.value}</span>
      </button>
    `;
    li.querySelector("button").addEventListener("click", () => {
      copyToClipboard(item.copyText || item.value);
    });
  }
  bioListEl.appendChild(li);
});

// Subtle Mouse Parallax on Arcane Sigil
const sigilContainer = document.getElementById("sigil-container");
document.addEventListener("mousemove", (e) => {
  const xRatio = (e.clientX / window.innerWidth - 0.5) * 14;
  const yRatio = (e.clientY / window.innerHeight - 0.5) * 14;
  sigilContainer.style.transform = `translate3d(${xRatio}px, ${yRatio}px, 0)`;
});

function triggerSigilPulse() {
  sigilContainer.classList.add("active-beat");
  setTimeout(() => sigilContainer.classList.remove("active-beat"), 350);
}

// ==========================================
// 2. YOUTUBE DIRECT AUDIO PLAYER (3 TRACKS)
// ==========================================
const playlist = [
  {
    title: "King Von - Armed & Dangerous",
    artist: "King Von",
    videoId: "tBKYI3-3lMg",
    startSeconds: 0
  },
  {
    title: "King Von - No Flaws",
    artist: "King Von",
    videoId: "S2bXCpA0BfY",
    startSeconds: 0
  },
  {
    title: "Hope",
    artist: "XXXTENTACION",
    videoId: "KyAcMpQUY5s",
    startSeconds: 0
  }
];

let currentTrackIdx = 0;
let isPlaying = false;
let isMuted = false;
let currentVolume = 65;
let ytPlayer = null;
let isYtReady = false;
let progressTimer = null;

// UI Elements
const playPauseBtn = document.getElementById("play-pause-btn");
const iconPlay = document.getElementById("icon-play");
const iconPause = document.getElementById("icon-pause");
const trackTitleEl = document.getElementById("track-title");
const trackArtistEl = document.getElementById("track-artist");
const timeDisplayEl = document.getElementById("time-display");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const soundBtn = document.getElementById("sound-btn");
const volumeSlider = document.getElementById("volume-slider");
const progressBar = document.getElementById("progress-bar");
const progressContainer = document.getElementById("progress-container");

function formatSeconds(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updatePlayerUI() {
  const track = playlist[currentTrackIdx];
  trackTitleEl.textContent = track.title;
  trackArtistEl.textContent = track.artist;

  let current = 0;
  let total = 0;
  if (ytPlayer && isYtReady && typeof ytPlayer.getCurrentTime === "function") {
    current = ytPlayer.getCurrentTime() || 0;
    total = ytPlayer.getDuration() || 0;
  }

  timeDisplayEl.textContent = `${formatSeconds(current)} / ${formatSeconds(total)}`;
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  progressBar.style.width = `${pct}%`;

  if (isPlaying) {
    iconPlay.classList.add("hidden");
    iconPause.classList.remove("hidden");
  } else {
    iconPlay.classList.remove("hidden");
    iconPause.classList.add("hidden");
  }

  soundBtn.textContent = isMuted || currentVolume === 0 ? "MUTED" : "SOUND";
}

function startProgressLoop() {
  clearInterval(progressTimer);
  progressTimer = setInterval(updatePlayerUI, 500);
}

// Load YouTube IFrame API
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

window.onYouTubeIframeAPIReady = function () {
  const firstTrack = playlist[0];
  ytPlayer = new YT.Player("yt-player", {
    height: "200",
    width: "200",
    videoId: firstTrack.videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      rel: 0,
      start: firstTrack.startSeconds || 0,
      origin: window.location.origin
    },
    events: {
      onReady: (event) => {
        isYtReady = true;
        event.target.setVolume(currentVolume);
        updatePlayerUI();
        startProgressLoop();
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.PLAYING) {
          isPlaying = true;
          updatePlayerUI();
        } else if (event.data === YT.PlayerState.PAUSED) {
          isPlaying = false;
          updatePlayerUI();
        } else if (event.data === YT.PlayerState.ENDED) {
          switchTrack(1, true);
        }
      },
      onError: () => {
        isPlaying = false;
        updatePlayerUI();
        showToast("YOUTUBE BLOCKED EMBED — SKIPPING...");
        setTimeout(() => switchTrack(1, true), 1200);
      }
    }
  });
};

function switchTrack(direction, forceAutoplay = null) {
  const shouldPlay = forceAutoplay !== null ? forceAutoplay : isPlaying;
  currentTrackIdx = (currentTrackIdx + direction + playlist.length) % playlist.length;
  const track = playlist[currentTrackIdx];
  updatePlayerUI();

  if (ytPlayer && isYtReady) {
    if (shouldPlay) {
      triggerSigilPulse();
      ytPlayer.loadVideoById({
        videoId: track.videoId,
        startSeconds: track.startSeconds || 0
      });
    } else {
      ytPlayer.cueVideoById({
        videoId: track.videoId,
        startSeconds: track.startSeconds || 0
      });
    }
  }
}

playPauseBtn.addEventListener("click", () => {
  if (!ytPlayer || !isYtReady) {
    showToast("LOADING YOUTUBE PLAYER...");
    return;
  }
  triggerSigilPulse();
  if (isPlaying) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
});

prevBtn.addEventListener("click", () => switchTrack(-1));
nextBtn.addEventListener("click", () => switchTrack(1));

soundBtn.addEventListener("click", () => {
  if (!ytPlayer || !isYtReady) return;
  isMuted = !isMuted;
  if (isMuted) ytPlayer.mute();
  else ytPlayer.unMute();
  updatePlayerUI();
});

volumeSlider.addEventListener("input", (e) => {
  currentVolume = Math.round(parseFloat(e.target.value) * 100);
  if (ytPlayer && isYtReady) {
    ytPlayer.setVolume(currentVolume);
    if (currentVolume > 0 && isMuted) {
      isMuted = false;
      ytPlayer.unMute();
    }
  }
  updatePlayerUI();
});

progressContainer.addEventListener("click", (e) => {
  if (!ytPlayer || !isYtReady) return;
  const rect = progressContainer.getBoundingClientRect();
  const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const duration = ytPlayer.getDuration();
  if (duration) {
    ytPlayer.seekTo(clickRatio * duration, true);
    updatePlayerUI();
  }
});

// Initialize UI
updatePlayerUI();