async function getPrograms() {
  const res = await fetch('https://api.github.com/users/vx-clutch/repos?per_page=100');
  if (!res.ok) return ["yait", "dotfiles", "vxserver.dev"];
  const repos = await res.json();
  if (!Array.isArray(repos)) return ["yait", "dotfiles", "vxserver.dev"];
  return repos.map(repo => repo.name);
}

function getProgramOfTheDay(arr) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash * 31 + today.charCodeAt(i)) % arr.length;
  }
  return arr[hash];
}

async function setProgramOfTheDay() {
  const programs = await getPrograms();
  const programOfTheDay = getProgramOfTheDay(programs);
  const potd = document.getElementById("potd");
  potd.textContent = programOfTheDay;
  potd.href = `https://github.com/vx-clutch/${programOfTheDay}`;
}

setProgramOfTheDay();

async function updateRecentRelease() {
  const recentReleaseElem = document.getElementById("recent-release");
  if (!recentReleaseElem) return;

  recentReleaseElem.textContent = "Loading…";

  // Helper to set error message
  const setError = (msg) => {
    recentReleaseElem.textContent = `Error loading recent release. ${msg}`;
  };

  try {
    // Use absolute path for GitHub Pages project site
    let res = await fetch("public/recent-release.json");
    if (!res.ok) {
      setError("No recent release data found.");
      return;
    }

    const data = await res.json();
    if (data.error) {
      setError(data.error);
      return;
    }

    const { name, commitDate, commitUrl, url } = data;
    if (name && commitDate && commitUrl && url) {
      const dateStr = new Date(commitDate).toLocaleString();
      recentReleaseElem.innerHTML = `
        <a href="${url}" target="_blank">${name}</a> - 
        <a href="${commitUrl}" target="_blank">latest commit</a> 
        (${dateStr})`;
    } else {
      setError("No recent commits found.");
    }
  } catch (e) {
    setError(e && e.message ? e.message : "Unknown error.");
  }
}

updateRecentRelease();