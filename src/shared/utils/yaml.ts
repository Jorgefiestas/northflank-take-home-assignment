import YAML from "yaml";
import { AppError } from "../error/app-error";
import { ERROR_CODES } from "../error/error-codes";

export function parseYaml(content: string) {
  try {
    return YAML.parse(content);
  } catch {
    throw new AppError("Invalid YAML format", 400, ERROR_CODES.YAML_INVALID);
  }
}
