import { observer } from "mobx-react-lite";
import { container } from "~/application/register-dependencies";
import { type MixGenresService, MixGenresServiceContainerToken } from "../../service/mix-genres.service";

export const UserGenres = observer(() => {
  const mixGenresService = container.get<MixGenresService>(MixGenresServiceContainerToken.MixGenresService);

  return <div>
    <h2>UserGenres</h2>
    <ul>
      {Object.entries(mixGenresService.countListenGenres).map(([genre, count], i) => (
        <li key={i}>{genre} - {count}</li>
      ))}
    </ul>
  </div>;
});