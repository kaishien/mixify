import { type ComponentType, useEffect, useMemo } from "react";
import { container } from "~/application/register-dependencies";
import type { IService } from "../service.interface";

type Dependencies<T> = {
	[K in keyof T]: symbol | string;
};

function hasInitialize(instance: unknown): instance is IService {
	return typeof instance === "object" && instance !== null && "initialize" in instance;
}

function hasCleanup(instance: unknown): instance is IService {
	return typeof instance === "object" && instance !== null && "cleanup" in instance;
}

function DependencyProvider<TDeps extends Record<string, unknown>>({
	dependencies,
	children,
}: {
	dependencies: Dependencies<TDeps>;
	children: React.ReactNode;
}) {
	const resolvedDependencies = useMemo(() => {
		return Object.entries(dependencies).reduce((acc, [key, dependencyToken]) => {
			acc[key as keyof TDeps] = container.get(dependencyToken);
			return acc;
		}, {} as TDeps);
	}, [dependencies]);

	useEffect(() => {
		const initializeServices = async () => {
			try {
				await Promise.all(
					Object.values(resolvedDependencies).map(async (instance) => {
						if (hasInitialize(instance)) {
							await instance.initialize?.();
						}
					}),
				);
			} catch (err) {
				console.error(err);
			}
		};

		initializeServices();

		return () => {
			for (const instance of Object.values(resolvedDependencies)) {
				if (hasCleanup(instance)) {
					instance.cleanup?.();
				}
			}
		};
	}, [resolvedDependencies]);

	return <>{children}</>;
}

export function withContainer<TProps extends object, TDeps extends Record<string, unknown>>(
	WrappedComponent: ComponentType<TProps>,
	dependencies: Dependencies<TDeps>,
) {
	function EnhancedComponent(props: TProps) {
		return (
			<DependencyProvider dependencies={dependencies}>
				<WrappedComponent {...props} />
			</DependencyProvider>
		);
	}

	EnhancedComponent.displayName = `WithContainer(${WrappedComponent.displayName || WrappedComponent.name})`;

	return EnhancedComponent;
}
