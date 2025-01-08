import { useRoutes } from "react-router-dom";
import { Toaster } from "sonner";
import { IocProvider, withContainer } from "../config";
import { BrowserRouter } from "../config/router/browser-router.tsx";
import { history } from "../config/router/history.ts";
import { routes } from "../pages/routes.tsx";
import { ApplicationService } from "./application.service";
import { container } from "./register-dependencies.ts";

export const AppRoutes = () => useRoutes(routes);

const ApplicationProvider = () => {
	return (
		<IocProvider container={container}>
			<BrowserRouter window={window} history={history} basename="/">
				<AppRoutes />
			</BrowserRouter>
			<Toaster expand />
		</IocProvider>
	);
};

export const Application = withContainer(ApplicationProvider, [
	ApplicationService,
]);
