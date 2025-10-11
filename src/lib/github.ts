// GitHub API integration for Seth Command Center
// Fetches commit data for project tracking
// SECURITY: All API keys loaded from environment variables only

interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  repo: string;
}

interface GitHubRepo {
  name: string;
  owner: string;
  fullName: string;
}

// Repository mappings for Seth's projects
// NO API KEYS HERE - only public repo info
export const PROJECT_REPOS: Record<string, GitHubRepo[]> = {
  'Abraham': [
    { name: 'abraham-media', owner: 'brightseth', fullName: 'brightseth/abraham-media' }
  ],
  'MIYOMI': [
    { name: 'miyomi-vercel', owner: 'brightseth', fullName: 'brightseth/miyomi-vercel' }
  ],
  'Eden Academy': [
    { name: 'eden-academy', owner: 'edenartlab', fullName: 'edenartlab/eden-academy' }
  ],
  'Eden Registry': [
    { name: 'eden-genesis-registry', owner: 'edenartlab', fullName: 'edenartlab/eden-genesis-registry' }
  ],
  'Paris Photo': [
    { name: 'paris-photo-voting', owner: 'edenprojects', fullName: 'edenprojects/paris-photo-voting' }
  ],
  'NODE Artist Relations': [
    { name: 'node-artist-relations', owner: 'brightseth', fullName: 'brightseth/node-artist-relations' }
  ]
};

/**
 * Fetch recent commits for a repository
 * SECURITY: Token loaded from process.env.GITHUB_TOKEN only
 */
export async function fetchRepoCommits(
  repo: GitHubRepo,
  since?: Date
): Promise<GitHubCommit[]> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.warn('GitHub token not configured - skipping commit fetch');
    return [];
  }

  const url = new URL(`https://api.github.com/repos/${repo.fullName}/commits`);
  if (since) {
    url.searchParams.set('since', since.toISOString());
  }
  url.searchParams.set('per_page', '10');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Seth-Command-Center'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Repository ${repo.fullName} not found or not accessible`);
        return [];
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const commits = await response.json();

    return commits.map((commit: any) => ({
      sha: commit.sha.substring(0, 7),
      message: commit.commit.message.split('\n')[0], // First line only
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      repo: repo.name
    }));

  } catch (error) {
    console.error(`Error fetching commits for ${repo.fullName}:`, error);
    return [];
  }
}

/**
 * Fetch commits for all repos associated with a project
 * SECURITY: No API keys in parameters, all loaded from env
 */
export async function fetchProjectCommits(
  projectName: string,
  since?: Date
): Promise<GitHubCommit[]> {
  const repos = PROJECT_REPOS[projectName];

  if (!repos || repos.length === 0) {
    return [];
  }

  const allCommits = await Promise.all(
    repos.map(repo => fetchRepoCommits(repo, since))
  );

  return allCommits
    .flat()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get commit summary for a project
 */
export async function getProjectCommitSummary(
  projectName: string,
  days: number = 7
): Promise<{
  count: number;
  lastCommit: GitHubCommit | null;
  commits: GitHubCommit[];
}> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const commits = await fetchProjectCommits(projectName, since);

  return {
    count: commits.length,
    lastCommit: commits[0] || null,
    commits
  };
}
