const primaryVideo = document.querySelector(".video--primary");
const backgroundVideo = document.querySelector(".video--background");

for (const video of [primaryVideo, backgroundVideo]) {
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
}

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

document.addEventListener("pointerdown", updatePlaybackMode, { once: true });
window.addEventListener("pageshow", updatePlaybackMode);

updatePlaybackMode();
