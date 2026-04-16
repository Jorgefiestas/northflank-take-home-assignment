import k8s from "@kubernetes/client-node";

import { mapKubernetesError } from "./kubernetes-error.mapper";
import { k8sAppsApi, k8sCoreApi } from "./kubernetes.client";
import { AppError } from "../../shared/error/app-error";

export async function deployNginx({
  name,
  namespace,
  replicas = 1,
  annotations = {},
  content,
}: {
  name: string;
  namespace: string;
  replicas?: number;
  annotations?: Record<string, string>;
  content?: string;
}) {
  const labels = { app: name };
  const configMapName = `${name}-content`;

  const namespaceManifest: k8s.V1Namespace = {
    metadata: { name: namespace },
  };

  const deployment: k8s.V1Deployment = {
    metadata: { name },
    spec: {
      replicas,
      selector: { matchLabels: labels },
      template: {
        metadata: {
          labels,
          annotations,
        },
        spec: {
          containers: [
            {
              name: "nginx",
              image: "nginx:latest",
              ports: [{ containerPort: 80 }],
              ...(content
                ? {
                    volumeMounts: [
                      {
                        name: "content-volume",
                        mountPath: "/usr/share/nginx/html/index.html",
                        subPath: "index.html",
                      },
                    ],
                  }
                : {}),
            },
          ],
          ...(content
            ? {
                volumes: [
                  {
                    name: "content-volume",
                    configMap: {
                      name: configMapName,
                    },
                  },
                ],
              }
            : {}),
        },
      },
    },
  };

  const service: k8s.V1Service = {
    metadata: { name },
    spec: {
      selector: labels,
      ports: [
        {
          port: 80,
          targetPort: 80,
        },
      ],
      type: "ClusterIP",
    },
  };

  try {
    try {
      await k8sCoreApi.createNamespace({
        body: namespaceManifest,
      });
    } catch (error: any) {
      if (error?.response?.statusCode !== 409) {
        throw error;
      }
    }

    if (content !== undefined) {
      const configMap: k8s.V1ConfigMap = {
        metadata: { name: configMapName },
        data: {
          "index.html": content,
        },
      };

      try {
        await k8sCoreApi.createNamespacedConfigMap({
          namespace,
          body: configMap,
        });
      } catch (error: any) {
        if (error?.response?.statusCode === 409) {
          await k8sCoreApi.replaceNamespacedConfigMap({
            name: configMapName,
            namespace,
            body: configMap,
          });
        } else {
          throw error;
        }
      }
    }

    try {
      await k8sAppsApi.createNamespacedDeployment({
        namespace,
        body: deployment,
      });
    } catch (error: any) {
      if (error?.response?.statusCode === 409) {
        await k8sAppsApi.replaceNamespacedDeployment({
          name,
          namespace,
          body: deployment,
        });
      } else {
        throw error;
      }
    }

    try {
      await k8sCoreApi.createNamespacedService({
        namespace,
        body: service,
      });
    } catch (error: any) {
      if (error?.response?.statusCode === 409) {
        await k8sCoreApi.replaceNamespacedService({
          name,
          namespace,
          body: service,
        });
      } else {
        throw error;
      }
    }

    return {
      name,
      namespace,
      replicas,
      annotations,
      hasCustomContent: content !== undefined,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
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
