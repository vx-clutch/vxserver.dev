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

  try {
    // Fetch all public repos
    const reposRes = await fetch(`https://api.github.com/users/${user}/repos?per_page=100`);
    const repos = await reposRes.json();

    if (!Array.isArray(repos) || repos.length === 0) {
      recentReleaseElem.textContent = "No repositories found.";
      return;
    }

    // For each repo, fetch the latest commit
    const repoCommits = await Promise.all(repos.map(async repo => {
      const commitsRes = await fetch(`https://api.github.com/repos/${user}/${repo.name}/commits?per_page=1`);
      const commits = await commitsRes.json();
      const latestCommit = Array.isArray(commits) && commits.length > 0 ? commits[0] : null;
      return {
        name: repo.name,
        url: repo.html_url,
        commitDate: latestCommit ? latestCommit.commit.author.date : null,
        commitUrl: latestCommit ? latestCommit.html_url : null
      };
    }));

    // Find the repo with the most recent commit
    const latest = repoCommits
      .filter(r => r.commitDate)
      .sort((a, b) => new Date(b.commitDate) - new Date(a.commitDate))[0];

    if (latest) {
      const date = new Date(latest.commitDate).toLocaleString();
      recentReleaseElem.innerHTML = `<a href="${latest.url}" target="_blank">${latest.name}</a> - <a href="${latest.commitUrl}" target="_blank">latest commit</a> (${date})`;
    } else {
      recentReleaseElem.textContent = "No recent commits found.";
    }
  } catch (e) {
    recentReleaseElem.textContent = "Error loading recent release.";
  }
}

updateRecentRelease();
