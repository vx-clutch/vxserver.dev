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
  const recentReleaseElem = document.getElementById("recent-release");
  if (!recentReleaseElem) return;

  recentReleaseElem.textContent = "Loading…";

  // Helper to set error message
  const setError = (msg) => {
    recentReleaseElem.textContent = `Error loading recent release. ${msg}`;
  };

  try {
    // Always fetch from /public/recent-release.json (absolute path)
    let res = await fetch("/public/recent-release.json");
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
