import { makeAutoObservable } from "mobx";
import { StateToggler } from "~/shared/lib/state-toggler";

export class WebPlayerService {
  playerInstance: Spotify.Player | null = null;
  currentTrack: Spotify.Track | null = null;
  isPaused = false;
  isPlayerReady = new StateToggler();
  deviceId = "";

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setCurrentTrack(track: Spotify.Track) {
    this.currentTrack = track;
  }

  setIsPaused(isPaused: boolean) {
    this.isPaused = isPaused;
  }

  setPlayerInstance(player: Spotify.Player) {
    this.playerInstance = player;
  }

  handlePlayPause() {
    this.playerInstance?.togglePlay();
  }

  handlePrevTrack() {
    this.playerInstance?.previousTrack();
  }

  handleNextTrack() {
    this.playerInstance?.nextTrack();
  }
}
