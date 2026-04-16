import k8s from "@kubernetes/client-node";
import { DeployParameters } from "./kubernetes.types";

export function buildNamespace(namespace: string): k8s.V1Namespace {
  return {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: { name: namespace },
  };
}

export function buildConfigMap(params: DeployParameters): k8s.V1ConfigMap {
  return {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: { name: `${params.name}-content` },
    data: {
      "index.html": params.content!,
    },
  };
}

export function buildDeployment(params: DeployParameters): k8s.V1Deployment {
  const { name, replicas = 1, annotations = {}, content } = params;
  const labels = { app: name };
  const configMapName = `${name}-content`;

  return {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: { name },
    spec: {
      replicas,
      selector: { matchLabels: labels },
      template: {
        metadata: { labels, annotations },
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
                    configMap: { name: configMapName },
                  },
                ],
              }
            : {}),
        },
      },
    },
  };
}

export function buildService(params: DeployParameters): k8s.V1Service {
  const labels = { app: params.name };

  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: { name: params.name },
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
}
