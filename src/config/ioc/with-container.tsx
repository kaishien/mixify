import { ComponentType, useEffect, useMemo } from "react";
import { container } from "./ioc.config";
import { IService } from "../service.interface";

type Dependencies<T> = {
  [K in keyof T]: symbol | string;
};

function isService(instance: unknown): instance is IService {
  return (
    typeof instance === "object" &&
    instance !== null &&
    'initialize' in instance &&
    'cleanup' in instance
  );
}

export function withContainer<TProps extends object, TDeps extends Record<string, unknown>>(
  WrappedComponent: ComponentType<TProps>,
  dependencies: Dependencies<TDeps>
) {
  return function EnhancedComponent(props: TProps) {
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
              if (isService(instance)) {
                await instance.initialize();
              }
            })
          );
          console.log('services initialized');
        } catch (err) {
          console.error(err);
        }
      };

      initializeServices();

      return () => {
        Object.values(resolvedDependencies).forEach((instance) => {
          if (isService(instance)) {
            instance.cleanup();
          }
        });
      };
    }, [resolvedDependencies]);


    const combinedProps = { ...props };
    return <WrappedComponent {...combinedProps} />;
  };
}
