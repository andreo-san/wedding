const primaryVideo = document.querySelector(".video--primary");
const backgroundVideo = document.querySelector(".video--background");
const interactionLayer = document.querySelector(".interaction-layer");
const sealCue = document.querySelector(".seal-cue");
const hint = document.querySelector(".hint");

let opened = false;

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

async function resumePlayback() {
  if (!opened) {
    return;
  }

  await Promise.all([playVideo(primaryVideo), playVideo(backgroundVideo)]);
  syncBackground();
}

async function openInvitation() {
  if (opened) {
    return;
  }

  opened = true;
  sealCue.classList.add("seal-cue--hidden");
  hint.classList.remove("hint--visible");
  interactionLayer.setAttribute("aria-label", "Convite aberto, vídeo em reprodução");

  primaryVideo.currentTime = 0;
  backgroundVideo.currentTime = 0;
  primaryVideo.muted = false;
  primaryVideo.volume = 1;

  const playbackStarted = await playVideo(primaryVideo);

  if (!playbackStarted) {
    primaryVideo.muted = true;
    primaryVideo.volume = 0;
    await playVideo(primaryVideo);
  }

  playVideo(backgroundVideo);
}

primaryVideo.addEventListener("play", () => {
  if (opened) {
    playVideo(backgroundVideo);
    syncBackground();
  }
});

primaryVideo.addEventListener("pause", () => {
  if (opened && !document.hidden) {
    playVideo(primaryVideo);
  }
});

primaryVideo.addEventListener("seeking", syncBackground);
primaryVideo.addEventListener("timeupdate", () => {
  if (opened) {
    syncBackground();
  }
});
backgroundVideo.addEventListener("loadedmetadata", syncBackground);

interactionLayer.addEventListener("click", openInvitation);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    resumePlayback();
  }
});

window.addEventListener("pageshow", resumePlayback);

// Dica discreta caso a pessoa fique parada na tela.
setTimeout(() => {
  if (!opened) {
    hint.classList.add("hint--visible");
  }
}, 6000);
