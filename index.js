const fallbackPrograms = ["yait", "dotfiles", "vxserver.dev"];

async function getPrograms() {
  try {
    const res = await fetch('https://api.github.com/users/vx-clutch/repos?per_page=100');
    if (!res.ok) return fallbackPrograms;
    const repos = await res.json();
    if (!Array.isArray(repos) || repos.length === 0) return fallbackPrograms;
    return repos.map(repo => repo.name);
  } catch (_) {
    return fallbackPrograms;
  }
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
  const potd = document.getElementById("potd");
  if (!potd) return;

  const programs = await getPrograms();
  const programOfTheDay = getProgramOfTheDay(programs);
  potd.textContent = programOfTheDay;
  potd.href = `https://github.com/vx-clutch/${programOfTheDay}`;
}

setProgramOfTheDay();

async function updateRecentRelease() {
  const recentReleaseElem = document.getElementById("recent-release");
  if (!recentReleaseElem) return;

  recentReleaseElem.textContent = "Loading…";

  const setError = (msg) => {
    recentReleaseElem.textContent = `Error loading recent release. ${msg}`;
  };

  try {
    const res = await fetch("public/recent-release.json");
    if (!res.ok) {
      setError("No recent release data found.");
      return;
    }

    const data = await res.json();
    const { name, commitDate, commitUrl, url, error } = data;

    if (error) {
      setError(error);
      return;
    }

    if (name && commitDate && commitUrl && url) {
      const dateStr = new Date(commitDate).toLocaleString();
      recentReleaseElem.innerHTML = `
        <a href="${url}" target="_blank">${name}</a> – 
        <a href="${commitUrl}" target="_blank">latest commit</a> 
        (${dateStr})`;
    } else {
      setError("No recent commits found.");
    }
  } catch (e) {
    setError(e?.message || "Unknown error.");
  }
}

updateRecentRelease();
