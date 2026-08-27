const primaryVideo = document.querySelector(".video--primary");
const interactionLayer = document.querySelector(".interaction-layer");
const sealCue = document.querySelector(".seal-cue");
const hint = document.querySelector(".hint");

let opened = false;

primaryVideo.muted = true;
primaryVideo.defaultMuted = true;
primaryVideo.volume = 0;

async function playVideo(video) {
  try {
    await video.play();
    return true;
  } catch {
    return false;
  }
}

async function resumePlayback() {
  if (opened) {
    await playVideo(primaryVideo);
  }
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
  primaryVideo.muted = false;
  primaryVideo.volume = 1;

  const playbackStarted = await playVideo(primaryVideo);

  if (!playbackStarted) {
    primaryVideo.muted = true;
    primaryVideo.volume = 0;
    await playVideo(primaryVideo);
  }
}

primaryVideo.addEventListener("pause", () => {
  if (opened && !document.hidden) {
    playVideo(primaryVideo);
  }
});

interactionLayer.addEventListener("click", openInvitation);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    resumePlayback();
  }
});

window.addEventListener("pageshow", resumePlayback);

hint.classList.add("hint--visible");
