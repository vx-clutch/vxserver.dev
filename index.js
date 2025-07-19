const programs = [
  "yait",
];

function getProgramOfTheDay(arr) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash * 31 + today.charCodeAt(i)) % arr.length;
  }
  return arr[hash];
}

const programOfTheDay = getProgramOfTheDay(programs);
const potd = document.getElementById("potd")
potd.textContent = programOfTheDay;
potd.href = `https://github.com/vx-clutch/${programOfTheDay}`

async function updateRecentRelease() {
  const user = "vx-clutch";
  const recentReleaseElem = document.getElementById("recent-release");
  if (!recentReleaseElem) return;
  recentReleaseElem.textContent = "Loading…";

  // Use CORS proxy for local dev
  const corsProxy = location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "https://corsproxy.io/?"
    : "";

  try {
    // Fetch all public repos, exclude forks
    const reposRes = await fetch(`${corsProxy}https://api.github.com/users/${user}/repos?per_page=100`);
    if (!reposRes.ok) throw new Error(`GitHub API error: ${reposRes.status}`);
    let repos = await reposRes.json();
    if (!Array.isArray(repos)) {
      recentReleaseElem.textContent = repos.message || "No repositories found.";
      return;
    }
    repos = repos.filter(repo => !repo.fork); // Exclude forks

    if (repos.length === 0) {
      recentReleaseElem.textContent = "No repositories found.";
      return;
    }

    // For each repo, fetch the latest commit
    const repoCommits = await Promise.all(repos.map(async repo => {
      try {
        const commitsRes = await fetch(`${corsProxy}https://api.github.com/repos/${user}/${repo.name}/commits?per_page=1`);
        if (!commitsRes.ok) return null;
        const commits = await commitsRes.json();
        if (!Array.isArray(commits) || commits.length === 0) return null;
        const latestCommit = commits[0];
        return {
          name: repo.name,
          url: repo.html_url,
          commitDate: latestCommit.commit.author.date,
          commitUrl: latestCommit.html_url
        };
      } catch {
        return null;
      }
    }));

    // Find the repo with the most recent commit
    const latest = repoCommits
      .filter(r => r && r.commitDate)
      .sort((a, b) => new Date(b.commitDate) - new Date(a.commitDate))[0];

    if (latest) {
      const date = new Date(latest.commitDate).toLocaleString();
      recentReleaseElem.innerHTML = `<a href="${latest.url}" target="_blank">${latest.name}</a> - <a href="${latest.commitUrl}" target="_blank">latest commit</a> (${date})`;
    } else {
      recentReleaseElem.textContent = "No recent commits found.";
    }
  } catch (e) {
    recentReleaseElem.textContent = `Error loading recent release. ${e.message ? e.message : ''}`;
  }
}

updateRecentRelease();
