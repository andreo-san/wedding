const VIDEO_ID = "zRSSl1pgFxU";

let primaryPlayer;
let backgroundPlayer;
let primaryReady = false;
let backgroundReady = false;
let soundEnabled = false;

function buildEmbedUrl() {
  const parameters = new URLSearchParams({
    autoplay: "1",
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

function startMuted(player) {
  safelyRun(player, (instance) => {
    instance.mute();
    instance.setVolume(0);
    instance.playVideo();
  });
}

function enableSound() {
  if (!primaryReady || soundEnabled) {
    return;
  }

  soundEnabled = true;
  safelyRun(primaryPlayer, (instance) => {
    instance.unMute();
    instance.setVolume(100);
    instance.playVideo();
  });

  document.removeEventListener("pointerdown", enableSound);
  document.removeEventListener("keydown", enableSound);
}

function syncBackground() {
  if (!primaryReady || !backgroundReady) {
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
        startMuted(event.target);
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
        startMuted(event.target);
        syncBackground();
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

document.addEventListener("pointerdown", enableSound);
document.addEventListener("keydown", enableSound);

prepareFrames();
loadYouTubeApi();
