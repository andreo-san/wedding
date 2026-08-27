const primaryVideo = document.querySelector(".video--primary");
const backgroundVideo = document.querySelector(".video--background");
let soundEnabled = false;

primaryVideo.muted = true;
primaryVideo.defaultMuted = true;
primaryVideo.volume = 0;
backgroundVideo.muted = true;
backgroundVideo.defaultMuted = true;
backgroundVideo.volume = 0;

async function playVideo(video) {
  try {
    await video.play();
  } catch {
    // Alguns navegadores adiam o autoplay até a primeira interação.
  }
}

function syncBackground() {
  if (
    backgroundVideo.readyState < HTMLMediaElement.HAVE_METADATA
  ) {
    return;
  }

  const difference = Math.abs(backgroundVideo.currentTime - primaryVideo.currentTime);

  if (difference > 0.2) {
    backgroundVideo.currentTime = primaryVideo.currentTime;
  }
}

function updatePlaybackMode() {
  playVideo(primaryVideo);
  playVideo(backgroundVideo);
  syncBackground();
}

function enableSound() {
  if (soundEnabled) {
    return;
  }

  soundEnabled = true;
  primaryVideo.muted = false;
  primaryVideo.volume = 1;
  playVideo(primaryVideo);
}

primaryVideo.addEventListener("play", () => {
  playVideo(backgroundVideo);
  syncBackground();
});

primaryVideo.addEventListener("pause", () => backgroundVideo.pause());
primaryVideo.addEventListener("seeking", syncBackground);
primaryVideo.addEventListener("timeupdate", syncBackground);
backgroundVideo.addEventListener("loadedmetadata", syncBackground);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    updatePlaybackMode();
  }
});

document.addEventListener(
  "pointerdown",
  () => {
    enableSound();
  },
  { once: true },
);

document.addEventListener(
  "keydown",
  () => {
    enableSound();
  },
  { once: true },
);
window.addEventListener("pageshow", updatePlaybackMode);

updatePlaybackMode();
