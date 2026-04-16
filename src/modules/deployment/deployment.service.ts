import { readYamlFile } from "../github/github.service";
import { deployNginx } from "../kubernetes/kubernetes.service";
import { buildNamespace } from "./deployment.utils";

export async function deployFromGithub(
  owner: string,
  repo: string,
  branch: string,
  path: string,
) {
  const yaml = await readYamlFile(owner, repo, path, branch);
  const namespace = buildNamespace(repo, branch);

  return await deployNginx({
    name: yaml.name,
    namespace,
    replicas: yaml.replicas,
    annotations: yaml.annotations,
    content: yaml.content,
  });
}
