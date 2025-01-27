import { inject, injectable } from "inversify";
import { makeAutoObservable } from "mobx";
import type { Track } from "spotify-types";
import type { INotificationService } from "~/services/notification";
import { $NotificationService } from "~/services/notification";
import type { UserService } from "~/services/user/user.service";
import { $UserService } from "~/services/user/user.service";
import { Api } from "~/shared/api";
import { LAST_MIXED_PLAYLIST_KEY } from "~/shared/constants/index";
import { type CacheStrategy, LocalStorageCache } from "~/shared/factories/async-operation";
import { LoaderProcessor } from "~/shared/lib/loader-processor";
import { $WebPlayerService, type WebPlayerService } from "./web-player.service";

export const $MixedPlaylistService = Symbol.for("MixedPlaylistService");

@injectable()
export class MixedPlaylistService {
  mixedPlaylist: Track[] = [];
  addingToLibraryLoader = new LoaderProcessor();
  private storage: CacheStrategy;

  constructor(
    @inject(Api) private readonly api: Api,
    @inject($UserService) private userService: UserService,
    @inject($NotificationService) private readonly notificationService: INotificationService,
    @inject($WebPlayerService) private readonly playerService: WebPlayerService,
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
    this.storage = new LocalStorageCache();
    
    const savedPlaylist = this.storage.get<Track[]>(LAST_MIXED_PLAYLIST_KEY);
    if (savedPlaylist) {
      this.mixedPlaylist = savedPlaylist;
    }
  }

  updateMixedPlaylist(tracks: Track[]) {
    this.mixedPlaylist = tracks;
    if (tracks.length > 0) {
      this.storage.set(LAST_MIXED_PLAYLIST_KEY, tracks, 1000 * 60 * 60 * 24);
    } else {
      this.storage.remove(LAST_MIXED_PLAYLIST_KEY);
    }
  }

  clearMixedPlaylist() {
    this.mixedPlaylist = [];
    this.storage.remove(LAST_MIXED_PLAYLIST_KEY);
  }

  get mixedTracksUris() {
    return this.mixedPlaylist.map((track) => track.uri);
  }

  async playMixedPlaylist() {
    if (!this.playerService.deviceId) return;

    await this.api.player.playTrack(this.mixedTracksUris, this.playerService.deviceId);
  }

  async playTrack(trackId: string) {
    if (!this.playerService.deviceId) return;

    await this.api.player.playTrack([trackId], this.playerService.deviceId);
  }

  async addMixedPlaylistToUserLibrary(
    playlistConfig: {
      name: string;
      description: string;
    },
  ) {
    this.addingToLibraryLoader.setIsLoading(true);

    try {
      const userId = this.userService.user?.id;
      if (!userId) return;

      const createdPlaylist = await this.api.playlists.createPlaylist(
        userId,
        playlistConfig.name,
        playlistConfig.description,
        true,
      );

      await this.api.playlists.addTracksToPlaylist(createdPlaylist.id, this.mixedTracksUris);

      this.notificationService.showSuccess("Playlist added to library");
    } catch (error) {
      this.notificationService.showError("Failed to add playlist to library");
    } finally {
      this.addingToLibraryLoader.setIsLoading(false);
    }
  }
}
