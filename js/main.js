const primaryVideo = document.querySelector(".video--primary");
const backgroundVideo = document.querySelector(".video--background");
const interactionLayer = document.querySelector(".interaction-layer");

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
    return true;
  } catch {
    return false;
  }
}

function syncBackground() {
  if (backgroundVideo.readyState < HTMLMediaElement.HAVE_METADATA) {
    return;
  }

  const difference = Math.abs(backgroundVideo.currentTime - primaryVideo.currentTime);

  if (difference > 0.2) {
    backgroundVideo.currentTime = primaryVideo.currentTime;
  }
}

async function updatePlayback() {
  await Promise.all([playVideo(primaryVideo), playVideo(backgroundVideo)]);
  syncBackground();
}

async function enableSound() {
  if (soundEnabled) {
    return;
  }

  primaryVideo.muted = false;
  primaryVideo.volume = 1;

  const playbackStarted = await playVideo(primaryVideo);

  if (playbackStarted) {
    soundEnabled = true;
    interactionLayer.setAttribute("aria-label", "Vídeo em reprodução com som");
    return;
  }

  primaryVideo.muted = true;
  primaryVideo.volume = 0;
  await playVideo(primaryVideo);
}

primaryVideo.addEventListener("play", () => {
  playVideo(backgroundVideo);
  syncBackground();
});

primaryVideo.addEventListener("pause", () => {
  if (!document.hidden) {
    playVideo(primaryVideo);
  }
});

primaryVideo.addEventListener("seeking", syncBackground);
primaryVideo.addEventListener("timeupdate", syncBackground);
backgroundVideo.addEventListener("loadedmetadata", syncBackground);

interactionLayer.addEventListener("click", enableSound);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    updatePlayback();
  }
});

window.addEventListener("pageshow", updatePlayback);

updatePlayback();
