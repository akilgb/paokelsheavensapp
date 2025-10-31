const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'akilgb';
const GITHUB_REPO = process.env.GITHUB_REPO || 'paokelsheavensapp';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const githubConfig = {
  owner: GITHUB_OWNER,
  repo: GITHUB_REPO,
  branch: GITHUB_BRANCH,
};

async function getFileContent(path) {
  try {
    const { data } = await octokit.repos.getContent({
      owner: githubConfig.owner,
      repo: githubConfig.repo,
      path,
      ref: githubConfig.branch,
    });

    if (data.content) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return { content, sha: data.sha };
    }
    return null;
  } catch (error) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

async function createOrUpdateFile(path, content, message, sha) {
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

async function deleteFile(path, sha, message) {
  await octokit.repos.deleteFile({
    owner: githubConfig.owner,
    repo: githubConfig.repo,
    path,
    message,
    sha,
    branch: githubConfig.branch,
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = {
  octokit,
  githubConfig,
  getFileContent,
  createOrUpdateFile,
  deleteFile,
  slugify
};