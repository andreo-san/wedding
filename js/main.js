const VIDEO_ID = "zRSSl1pgFxU";
const invitationScreen = document.querySelector(".invitation-screen");
const openInvitationButton = document.querySelector(".hotspot--open");
const videoStage = document.querySelector(".video-stage");
const soundFallback = document.querySelector(".sound-fallback");

let primaryPlayer;
let backgroundPlayer;
let primaryReady = false;
let backgroundReady = false;
let invitationOpened = false;
let soundEnabled = false;

function buildEmbedUrl() {
  const parameters = new URLSearchParams({
    autoplay: "0",
    mute: "1",
    loop: "1",
    playlist: VIDEO_ID,
    controls: "0",
    playsinline: "1",
    rel: "0",
    disablekb: "1",
    iv_load_policy: "3",
    enablejsapi: "1",
  });

  if (window.location.origin && window.location.origin !== "null") {
    parameters.set("origin", window.location.origin);
  }

  return `https://www.youtube.com/embed/${VIDEO_ID}?${parameters.toString()}`;
}

function prepareFrames() {
  const embedUrl = buildEmbedUrl();

  document.querySelectorAll("[data-video-id]").forEach((frame) => {
    frame.src = embedUrl;
  });
}

function safelyRun(player, action) {
  try {
    action(player);
  } catch {
    // O player ainda pode estar finalizando sua inicialização interna.
  }
}

function preparePlayer(player) {
  safelyRun(player, (instance) => {
    instance.mute();
    instance.setVolume(0);
    instance.seekTo(0, true);
  });
}

function showSoundFallback() {
  if (invitationOpened && !soundEnabled) {
    soundFallback.hidden = false;
  }
}

function startInvitationVideo() {
  if (!primaryReady) {
    window.setTimeout(showSoundFallback, 700);
    return;
  }

  safelyRun(primaryPlayer, (instance) => {
    instance.seekTo(0, true);
    instance.unMute();
    instance.setVolume(100);
    instance.playVideo();
  });

  soundEnabled = true;
  soundFallback.hidden = true;

  if (backgroundReady) {
    safelyRun(backgroundPlayer, (instance) => {
      instance.seekTo(0, true);
      instance.mute();
      instance.setVolume(0);
      instance.playVideo();
    });
  }

  window.setTimeout(() => {
    if (primaryPlayer?.isMuted?.()) {
      soundEnabled = false;
      showSoundFallback();
    }
  }, 650);
}

function openInvitation() {
  if (invitationOpened) {
    return;
  }

  invitationOpened = true;
  videoStage.hidden = false;

  window.requestAnimationFrame(() => {
    videoStage.classList.add("is-active");
    invitationScreen.classList.add("is-closing");
  });

  startInvitationVideo();

  window.setTimeout(() => {
    invitationScreen.hidden = true;
  }, 350);
}

function syncBackground() {
  if (!invitationOpened || !primaryReady || !backgroundReady) {
    return;
  }

  safelyRun(backgroundPlayer, (instance) => {
    const primaryTime = primaryPlayer.getCurrentTime();
    const difference = Math.abs(instance.getCurrentTime() - primaryTime);

    if (difference > 0.35) {
      instance.seekTo(primaryTime, true);
    }
  });
}

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  primaryPlayer = new YT.Player("youtube-primary", {
    events: {
      onReady(event) {
        primaryReady = true;
        preparePlayer(event.target);

        if (invitationOpened) {
          showSoundFallback();
        }
      },
      onStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING && backgroundReady) {
          safelyRun(backgroundPlayer, (instance) => instance.playVideo());
          syncBackground();
        }
      },
    },
  });

  backgroundPlayer = new YT.Player("youtube-background", {
    events: {
      onReady(event) {
        backgroundReady = true;
        preparePlayer(event.target);

        if (invitationOpened) {
          safelyRun(event.target, (instance) => instance.playVideo());
          syncBackground();
        }
      },
    },
  });

  window.setInterval(syncBackground, 500);
};

function loadYouTubeApi() {
  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  script.async = true;
  document.head.append(script);
}

openInvitationButton.addEventListener("click", openInvitation);
soundFallback.addEventListener("click", startInvitationVideo);

prepareFrames();
loadYouTubeApi();
