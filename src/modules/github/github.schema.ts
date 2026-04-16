import { z } from "zod";
import { DeploymentConfig, DeploymentConfigWithExtras } from "./github.types";
import { AppError } from "../../shared/error/app-error";
import { ERROR_CODES } from "../../shared/error/error-codes";

const RepoParamsSchema = z.strictObject({
  owner: z.string(),
  repo: z.string(),
});

export function parseRepoParams(params: any) {
  try {
    return RepoParamsSchema.parse(params);
  } catch (error: any) {
    throw new AppError(
      "Invalid request parameters",
      400,
      ERROR_CODES.INVALID_INPUT,
    );
  }
}

const FileQuerySchema = z.strictObject({
  path: z.string(),
  branch: z.string(),
});

export function parseFileQuery(params: any) {
  try {
    return FileQuerySchema.parse(params);
  } catch (error: any) {
    throw new AppError("Invalid request query", 400, ERROR_CODES.INVALID_INPUT);
  }
}

const DeploymentUpdateSchema = z
  .strictObject({
    name: z.string().optional(),
    replicas: z.number().optional(),
    annotations: z.record(z.string(), z.string()).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.replicas !== undefined ||
      data.annotations !== undefined,
    {
      message: "At least one field must be provided",
    },
  );

export function parseDeploymentUpdateRequest(
  request: any,
): Partial<DeploymentConfig> {
  try {
    return DeploymentUpdateSchema.parse(request);
  } catch (error: any) {
    throw new AppError(
      "Invalid update parameters",
      400,
      ERROR_CODES.INVALID_INPUT,
    );
  }
}

export const DeploymentYamlSchema = z.looseObject({
  name: z.string(),
  replicas: z.number(),
  annotations: z.record(z.string(), z.string()),
  content: z.string().optional(),
});

export function parseDeploymentYaml(yaml: any): DeploymentConfigWithExtras {
  try {
    return DeploymentYamlSchema.parse(yaml);
  } catch (error: any) {
    throw new AppError("Invalid YAML structrue", 400, ERROR_CODES.YAML_INVALID);
  }
}
