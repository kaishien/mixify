import { inject, injectable } from "inversify";
import { ArtistApi } from "./modules/artist";
import { AuthApi } from "./modules/auth";
import { PlayerApi } from "./modules/player";
import { PlaylistsApi } from "./modules/playlists";
import { RecommendationsApi } from "./modules/recommendations";
import { SearchApi } from "./modules/search";
import { TracksApi } from "./modules/tracks";
import { UserApi } from "./modules/user";


export abstract class Api {
  abstract artist: ArtistApi;
  abstract auth: AuthApi;
  abstract playlists: PlaylistsApi;
  abstract tracks: TracksApi;
  abstract user: UserApi;
  abstract player: PlayerApi;
  abstract recommendations: RecommendationsApi;
  abstract search: SearchApi;
}

@injectable()
export class ApiFacade implements Api {
  artist: ArtistApi;
  auth: AuthApi;
  playlists: PlaylistsApi;
  tracks: TracksApi;
  user: UserApi;
  player: PlayerApi;
  recommendations: RecommendationsApi;
  search: SearchApi;

  constructor(
    @inject(ArtistApi) artistApi: ArtistApi,
    @inject(AuthApi) authApi: AuthApi,
    @inject(PlaylistsApi) playlistsApi: PlaylistsApi,
    @inject(TracksApi) tracksApi: TracksApi,
    @inject(UserApi) userApi: UserApi,
    @inject(PlayerApi) playerApi: PlayerApi,
    @inject(RecommendationsApi) recommendationsApi: RecommendationsApi,
    @inject(SearchApi) searchApi: SearchApi,
  ) {
    this.artist = artistApi;
    this.auth = authApi;
    this.playlists = playlistsApi;
    this.tracks = tracksApi;
    this.user = userApi;
    this.player = playerApi;
    this.recommendations = recommendationsApi;
    this.search = searchApi;
  }
}