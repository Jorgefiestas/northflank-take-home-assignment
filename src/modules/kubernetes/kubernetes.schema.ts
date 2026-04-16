import { z } from "zod";
import { AppError } from "../../shared/error/app-error";
import { ERROR_CODES } from "../../shared/error/error-codes";

const DeploymentSchema = z.strictObject({
  name: z.string().min(1),
  namespace: z.string().min(1),
  replicas: z.number().min(1).optional(),
});

export function parseDeploymentRequest(request: any) {
  try {
    return DeploymentSchema.parse(request);
  } catch (error: any) {
    throw new AppError(
      "Invalid deployment request",
      400,
      ERROR_CODES.INVALID_INPUT,
    );
  }
}

export const DeleteDeploymentSchema = z.strictObject({
  name: z.string().min(1),
  namespace: z.string().min(1),
});

export function parseDeleteDeploymentRequest(request: any) {
  try {
    return DeleteDeploymentSchema.parse(request);
  } catch (error: any) {
    throw new AppError(
      "Invalid delete deployment request",
      400,
      ERROR_CODES.INVALID_INPUT,
    );
  }
}
