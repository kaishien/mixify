import { Container } from "inversify";
import { HttpClient, HttpClientToken, config } from "~/config";
import { RouterService } from "~/config/router/router-service";
import { MixGenresService, MixGenresServiceContainerToken } from "~/pages/home/service/mix-genres.service";
import { AuthService, AuthServiceContainerToken } from "~/services/auth";
import { UserService, UserServiceContainerToken } from "~/services/user";
import { ArtistApi, AuthApi, PlaylistsApi, RecommendationsApi, SearchApi, TracksApi, UserApi } from "~/shared/api";
import { LoaderProcessor, LoaderProcessorDIToken } from "~/shared/lib/loader-processor";
import { ApplicationService } from "./application.service";

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

container.bind<LoaderProcessor>(LoaderProcessorDIToken).to(LoaderProcessor).inSingletonScope();

const registryServices = () => {
	container.bind(AuthServiceContainerToken.AuthService).to(AuthService).inSingletonScope();
	container.bind(UserServiceContainerToken.UserService).to(UserService).inSingletonScope();
	container.bind(MixGenresServiceContainerToken.MixGenresService).to(MixGenresService).inSingletonScope();
};

const registyApi = () => {
	container.bind(AuthApi).to(AuthApi).inSingletonScope();
	container.bind(UserApi).to(UserApi).inSingletonScope();
	container.bind(PlaylistsApi).to(PlaylistsApi).inSingletonScope();
	container.bind(TracksApi).to(TracksApi).inSingletonScope();
	container.bind(ArtistApi).to(ArtistApi).inSingletonScope();
	container.bind(RecommendationsApi).to(RecommendationsApi).inSingletonScope();
	container.bind(SearchApi).to(SearchApi).inSingletonScope();
};

registyApi();
registryServices();

export { container };
