export type DeploymentConfig = {
  name: string;
  replicas: number;
  annotations: Record<string, string>;
  content?: string;
};

export type DeploymentConfigWithExtras = DeploymentConfig &
  Record<string, unknown>;
