import type { interfaces } from "inversify";
import type React from "react";
import { type ComponentType, useEffect, useState } from "react";
import { container } from "~/application/register-dependencies";
import type { IService } from "../service.interface";

type ServiceIdentifier<T = unknown> = interfaces.ServiceIdentifier<T>;

function hasInitialize(instance: unknown): instance is IService {
	return typeof instance === "object" && instance !== null && "initialize" in instance;
}

function hasCleanup(instance: unknown): instance is IService {
	return typeof instance === "object" && instance !== null && "cleanup" in instance;
}

function DependencyProvider({
	dependencies,
	children,
}: {
	dependencies: ServiceIdentifier[];
	children: React.ReactNode;
}) {
	const [resolvedDependencies] = useState(() => {
		return dependencies.map((dependencyToken) => container.get(dependencyToken));
	});

	useEffect(() => {
		const initializeServices = async () => {
			try {
				await Promise.all(
					resolvedDependencies.map(async (instance) => {
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
			for (const instance of resolvedDependencies) {
				if (hasCleanup(instance)) {
					instance.cleanup?.();
				}
			}
		};
	}, [resolvedDependencies]);

	return <>{children}</>;
}

function ContainerHOC<TProps extends object>(
	WrappedComponent: ComponentType<TProps>,
	dependencies: ServiceIdentifier[],
) {
	function WithContainer(props: TProps) {
		return (
			<DependencyProvider dependencies={dependencies}>
				<WrappedComponent {...props} />
			</DependencyProvider>
		);
	}

	WithContainer.displayName = `WithContainer(${
		WrappedComponent.displayName || WrappedComponent.name || "Component"
	})`;

	return WithContainer;
}

export const withContainer = ContainerHOC;
