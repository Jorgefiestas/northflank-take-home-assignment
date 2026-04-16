import YAML from "yaml";

import { AppError } from "../../shared/error/app-error";
import { ERROR_CODES } from "../../shared/error/error-codes";
import { mapGithubError } from "./github-error.mapper";
import { githubClient } from "./github.client";
import { parseYaml } from "../../shared/utils/yaml";
import { DeploymentConfig, DeploymentConfigWithExtras } from "./github.types";
import { validateRepoParams, validateYamlParams } from "./github.validation";
import { parseDeploymentYaml } from "./github.schema";

export async function listRepos() {
  try {
    const response = await githubClient.repos.listForAuthenticatedUser();

    return response.data.map((repo) => ({
      name: repo.name,
      private: repo.private,
      url: repo.html_url,
    }));
  } catch (error: any) {
    throw mapGithubError(error);
  }
}

export async function listBranches(owner: string, repo: string) {
  validateRepoParams(owner, repo);

  try {
    const response = await githubClient.repos.listBranches({
      owner,
      repo,
    });

    return response.data.map((branch) => ({
      name: branch.name,
      protected: branch.protected,
    }));
  } catch (error: any) {
    throw mapGithubError(error);
  }
}

export async function readYamlFile(
  owner: string,
  repo: string,
  path: string,
  branch: string,
) {
  validateRepoParams(owner, repo);
  validateYamlParams(path, branch);

  try {
    const response = await githubClient.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (!("content" in response.data)) {
      throw new AppError("Invalid file type", 400, ERROR_CODES.YAML_INVALID);
    }
    const decoded = Buffer.from(response.data.content, "base64").toString(
      "utf-8",
    );

    return parseDeploymentYaml(parseYaml(decoded));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw mapGithubError(error);
  }
}

export async function updateYamlFile(
  owner: string,
  repo: string,
  path: string,
  branch: string,
  updates: Partial<DeploymentConfig>,
) {
  validateRepoParams(owner, repo);
  validateYamlParams(path, branch);

  try {
    const response = await githubClient.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (!("content" in response.data)) {
      throw new AppError("Invalid file type", 400, ERROR_CODES.YAML_INVALID);
    }

    const sha = response.data.sha;

    const decoded = Buffer.from(response.data.content, "base64").toString(
      "utf-8",
    );

    const yaml = parseYaml(decoded);
    const current = parseDeploymentYaml(yaml);

    const updated: DeploymentConfigWithExtras = {
      ...current,
      ...updates,
    };

    const newYaml = YAML.stringify(updated);
    const encoded = Buffer.from(newYaml).toString("base64");

    const result = await githubClient.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: "Update deployment.yaml via API",
      content: encoded,
      sha,
      branch,
    });

    return {
      commitSha: result.data.commit.sha,
      fileSha: result.data.content?.sha,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw mapGithubError(error);
  }
}
