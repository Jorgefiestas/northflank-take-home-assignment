import { mapKubernetesError } from "./kubernetes-error.mapper";
import { k8sAppsApi, k8sCoreApi } from "./kubernetes.client";
import { AppError } from "../../shared/error/app-error";
import { DeployParameters } from "./kubernetes.types";
import {
  applyConfigMap,
  applyDeployment,
  applyService,
  ensureNamespace,
} from "./kubernetes.apply";
import {
  buildConfigMap,
  buildDeployment,
  buildService,
} from "./kubernetes.manifests";

export async function deployNginx(params: DeployParameters) {
  const { namespace, content } = params;

  try {
    await ensureNamespace(namespace);

    if (content) {
      const configMap = buildConfigMap(params);
      await applyConfigMap(namespace, configMap);
    }

    const deployment = buildDeployment(params);
    await applyDeployment(namespace, deployment);

    const service = buildService(params);
    await applyService(namespace, service);

    return {
      name: params.name,
      namespace,
      replicas: params.replicas ?? 1,
      annotations: params.annotations ?? {},
      hasCustomContent: content !== undefined,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw mapKubernetesError(error);
  }
}

export async function deleteNginx({
  name,
  namespace,
}: {
  name: string;
  namespace: string;
}) {
  try {
    await k8sCoreApi.deleteNamespacedService({
      name,
      namespace,
    });
  } catch (error: any) {
    if (error.response?.statusCode !== 404) {
      throw mapKubernetesError(error);
    }
  }

  try {
    await k8sAppsApi.deleteNamespacedDeployment({
      name,
      namespace,
    });
  } catch (error: any) {
    if (error.response?.statusCode !== 404) {
      throw mapKubernetesError(error);
    }
  }

  return {
    message: "Deployment and Service deleted (if existed)",
    name,
    namespace,
  };
}
