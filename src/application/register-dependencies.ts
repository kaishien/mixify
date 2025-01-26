import { Container } from "inversify";
import { HttpClient, HttpClientToken, config } from "~/config";
import { RouterService } from "~/config/router/router-service";
import { MixGenresService, $MixGenresService } from "~/pages/home/service/mix-genres.service";
import { MixedPlaylistService, $MixedPlaylistService } from "~/pages/home/service/mixed-playlist.service";
import { AuthService, $AuthService, } from "~/services/auth";
import { type INotificationService, NotificationService, $NotificationService } from "~/services/notification";
import { UserService, $UserService } from "~/services/user";
import { Api, ApiFacade, ArtistApi, AuthApi, PlayerApi, PlaylistsApi, RecommendationsApi, SearchApi, TracksApi, UserApi } from "~/shared/api";
import { ApplicationService } from "./application.service";
import { WebPlayerService } from "~/pages/home/service/web-player.service";
import { $WebPlayerService } from "~/pages/home/service/web-player.service";

const container = new Container();

container.bind(ApplicationService).to(ApplicationService).inSingletonScope();
container.bind(RouterService).to(RouterService).inSingletonScope();

container
	.bind<HttpClient>(HttpClientToken.SpotifyBase)
	.toDynamicValue(() => new HttpClient(config.spotifyBaseApiUrl))
	.inSingletonScope();

container
	.bind<HttpClient>(HttpClientToken.SpotifyAccount)
	.toDynamicValue(() => new HttpClient(config.spotifyAccountApiUrl))
	.inSingletonScope();

container.bind<HttpClient>(HttpClientToken.LastFmBase)
	.toDynamicValue(() => new HttpClient(config.lastFmBaseApiUrl))
	.inSingletonScope();

container.bind<INotificationService>($NotificationService).to(NotificationService).inSingletonScope();

const registryServices = () => {
	container.bind($AuthService).to(AuthService).inSingletonScope();
	container.bind($UserService).to(UserService).inSingletonScope();
	container.bind($MixGenresService).to(MixGenresService).inSingletonScope();
	container
		.bind<MixedPlaylistService>($MixedPlaylistService)
		.toDynamicValue(() => {
			return new MixedPlaylistService(
				container.get(Api),
				container.get($UserService),
				container.get($NotificationService),
				container.get($WebPlayerService),
			);
		})
		.inSingletonScope();
	container.bind($WebPlayerService).to(WebPlayerService).inSingletonScope();
};

const registyApi = () => {
	container.bind(Api).to(ApiFacade).inSingletonScope();

	container.bind(AuthApi).to(AuthApi).inSingletonScope();
	container.bind(UserApi).to(UserApi).inSingletonScope();
	container.bind(PlaylistsApi).to(PlaylistsApi).inSingletonScope();
	container.bind(TracksApi).to(TracksApi).inSingletonScope();
	container.bind(ArtistApi).to(ArtistApi).inSingletonScope();
	container.bind(RecommendationsApi).to(RecommendationsApi).inSingletonScope();
	container.bind(SearchApi).to(SearchApi).inSingletonScope();
	container.bind(PlayerApi).to(PlayerApi).inSingletonScope();
};

registyApi();
registryServices();

export { container };
