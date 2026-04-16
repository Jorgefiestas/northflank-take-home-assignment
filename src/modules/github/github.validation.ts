import { AppError } from "../../shared/error/app-error";
import { ERROR_CODES } from "../../shared/error/error-codes";

export function validateRepoParams(owner: string, repo: string) {
  if (!owner || !repo) {
    throw new AppError("Missing parameters", 400, ERROR_CODES.INVALID_INPUT);
  }
}

export function validateYamlParams(path: string, branch: string) {
  if (!path || !branch) {
    throw new AppError(
      "Missing query parameters",
      400,
      ERROR_CODES.INVALID_INPUT,
    );
  }

  if (!path.endsWith(".yaml") && !path.endsWith(".yml")) {
    throw new AppError(
      "File must be a YAML file",
      400,
      ERROR_CODES.INVALID_INPUT,
    );
  }
}
