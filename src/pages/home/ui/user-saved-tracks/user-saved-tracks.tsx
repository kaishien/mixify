import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { useInjection } from "~/config";
import {
	type MixGenresService,
	$MixGenresService,
} from "../../service/mix-genres.service";

export const UserSavedTracks = observer(() => {
	const mixGenresService = useInjection<MixGenresService>($MixGenresService);

	return (
		<article>
			<h2>Your Saved Tracks</h2>
			<Link to="/login">View All Tracks</Link>
			<ul>
				{mixGenresService.favoritesTracks.map((track) => (
					<li key={track.id}>{track.name}</li>
				))}
			</ul>
		</article>
	);
});
