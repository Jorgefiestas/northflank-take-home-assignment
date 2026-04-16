import { z } from "zod";
import { AppError } from "../../shared/error/app-error";
import { ERROR_CODES } from "../../shared/error/error-codes";

export const DeployFromGithubSchema = z.strictObject({
  owner: z.string().min(1),
  repo: z.string().min(1),
  branch: z.string().min(1),
  path: z.string().min(1),
});

export function parseDeployFromGithubRequest(data: unknown) {
  try {
    return DeployFromGithubSchema.parse(data);
  } catch (error: any) {
    throw new AppError(
      "invalid deploy from github request",
      400,
      ERROR_CODES.INVALID_INPUT,
    );
  }
}
