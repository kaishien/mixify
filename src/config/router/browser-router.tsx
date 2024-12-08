import {
	useRef,
	useState,
	useCallback,
	useLayoutEffect,
	startTransition as startTransitionImpl,
} from "react";
import { createBrowserHistory, type History, type Action, type Location } from "history";
import { Router } from "react-router-dom";

interface BrowserRouterProps {
	basename: string;
	children?: React.ReactNode;
	future?: {
		v7_startTransition?: boolean;
	};
	window: Window;
	history: History;
}

export const BrowserRouter = ({
	basename,
	children,
	future,
	window,
	history: customHistory,
}: BrowserRouterProps) => {
	const historyRef = useRef<History>();

	if (historyRef.current == null) {
		historyRef.current = customHistory
			? customHistory
			: createBrowserHistory({
					window,
				});
	}

	const history = historyRef.current;

	const [state, setStateImpl] = useState<{
		action: Action;
		location: Location;
	}>({
		action: history.action,
		location: history.location,
	});

	const { v7_startTransition } = future || {};

	const setState = useCallback(
		(newState: { action: Action; location: Location }) => {
			if (v7_startTransition && startTransitionImpl) {
				startTransitionImpl(() => setStateImpl(newState));
			} else {
				setStateImpl(newState);
			}
		},
		[setStateImpl, v7_startTransition],
	);

	useLayoutEffect(() => {
		const unlisten = history.listen(setState);
		return unlisten;
	}, [history, setState]);

	return (
		<Router
			basename={basename}
			location={state.location}
			navigationType={state.action}
			navigator={history}
		>
			{children}
		</Router>
	);
};
