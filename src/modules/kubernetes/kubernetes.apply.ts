import k8s from "@kubernetes/client-node";

import { k8sAppsApi, k8sCoreApi } from "./kubernetes.client";
import { buildNamespace } from "./kubernetes.manifests";

function getK8sErrorCode(error: any): number | undefined {
  return (
    error?.code ||
    error?.response?.statusCode ||
    error?.statusCode ||
    error?.body?.code
  );
}

export async function ensureNamespace(namespace: string) {
  try {
    await k8sCoreApi.readNamespace({ name: namespace });
    return;
  } catch (error: any) {
    const code = getK8sErrorCode(error);
    if (code !== 404) {
      throw error;
    }
  }

  await k8sCoreApi.createNamespace({
    body: buildNamespace(namespace),
  });
}

export async function applyConfigMap(
  namespace: string,
  configMap: k8s.V1ConfigMap,
) {
  try {
    await k8sCoreApi.createNamespacedConfigMap({
      namespace,
      body: configMap,
    });
  } catch (error: any) {
    const code = getK8sErrorCode(error);
    if (code === 409) {
      await k8sCoreApi.replaceNamespacedConfigMap({
        name: configMap.metadata!.name!,
        namespace,
        body: configMap,
      });
    } else {
      throw error;
    }
  }
}

export async function applyDeployment(
  namespace: string,
  deployment: k8s.V1Deployment,
) {
  try {
    await k8sAppsApi.createNamespacedDeployment({
      namespace,
      body: deployment,
    });
  } catch (error: any) {
    const code = getK8sErrorCode(error);
    if (code === 409) {
      await k8sAppsApi.replaceNamespacedDeployment({
        name: deployment.metadata!.name!,
        namespace,
        body: deployment,
      });
    } else {
      throw error;
    }
  }
}

export async function applyService(namespace: string, service: k8s.V1Service) {
  try {
    await k8sCoreApi.createNamespacedService({
      namespace,
      body: service,
    });
  } catch (error: any) {
    const code = getK8sErrorCode(error);
    if (code === 409) {
      await k8sCoreApi.replaceNamespacedService({
        name: service.metadata!.name!,
        namespace,
        body: service,
      });
    } else {
      throw error;
    }
  }
}
