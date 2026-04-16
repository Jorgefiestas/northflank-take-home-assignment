export type DeployParameters = {
    name: string;
    namespace: string;
    replicas?: number;
    annotations?: Record<string, string>;
    content?: string;
};
