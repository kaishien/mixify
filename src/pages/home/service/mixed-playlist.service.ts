import { inject, injectable } from "inversify";
import { makeAutoObservable } from "mobx";
import type { Track } from "spotify-types";
import type { INotificationService } from "~/services/notification";
import { NotificationServiceToken } from "~/services/notification";
import type { UserService } from "~/services/user/user.service";
import { UserServiceContainerToken } from "~/services/user/user.service";
import { Api } from "~/shared/api";
import { LoaderProcessor } from "~/shared/lib/loader-processor";
import { WebPlayerService } from "./web-player.service";

export const MixedPlaylistServiceContainerToken = Symbol.for("MixedPlaylistService");

@injectable()
export class MixedPlaylistService {
  mixedPlaylist: Track[] = [];
  playerService = new WebPlayerService();
  addingToLibraryLoader = new LoaderProcessor();

  constructor(
    @inject(Api) private readonly api: Api,
    @inject(UserServiceContainerToken.UserService) private userService: UserService,
    @inject(NotificationServiceToken) private readonly notificationService: INotificationService,
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  updateMixedPlaylist(tracks: Track[]) {
    this.mixedPlaylist = tracks;
  }

  updateDeviceId(deviceId: string) {
    this.playerService.deviceId = deviceId;
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
