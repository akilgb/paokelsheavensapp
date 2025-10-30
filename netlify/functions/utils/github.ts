import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_OWNER = process.env.GITHUB_OWNER || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'paokelsheavens-repo';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main-branch';

export const octokit = new Octokit({ auth: GITHUB_TOKEN });

export const githubConfig = {
  owner: GITHUB_OWNER,
  repo: GITHUB_REPO,
  branch: GITHUB_BRANCH,
};

export async function getFileContent(path: string): Promise<any> {
  try {
    const { data } = await octokit.repos.getContent({
      owner: githubConfig.owner,
      repo: githubConfig.repo,
      path,
      ref: githubConfig.branch,
    });

    if ('content' in data) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return { content, sha: data.sha };
    }
    return null;
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createOrUpdateFile(
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  await octokit.repos.createOrUpdateFileContents({
    owner: githubConfig.owner,
    repo: githubConfig.repo,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    branch: githubConfig.branch,
    sha,
  });
}

export async function deleteFile(path: string, sha: string, message: string): Promise<void> {
  await octokit.repos.deleteFile({
    owner: githubConfig.owner,
    repo: githubConfig.repo,
    path,
    message,
    sha,
    branch: githubConfig.branch,
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
