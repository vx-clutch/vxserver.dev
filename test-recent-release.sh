#!/bin/bash

# Exit on error
set -e

# Prompt for GitHub token if not set
if [ -z "$GITHUB_TOKEN" ]; then
  read -sp "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
  echo
fi

curl -s -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/users/vx-clutch/repos?per_page=100" > repos_raw.json

if jq -e 'type == "array"' repos_raw.json > /dev/null; then
  jq '[.[] | select(.fork==false)] | map({name: .name, url: .html_url})' repos_raw.json > repos.json
else
  echo "Error: GitHub API did not return an array. Here is the response:" >&2
  cat repos_raw.json >&2
  echo '{"error":"GitHub API did not return an array. Check token/permissions/rate limits."}' > recent-release.json
  exit 1
fi

rm -f commits.jsonl
jq -c '.[]' repos.json | while read repo; do
  name=$(echo $repo | jq -r '.name')
  url=$(echo $repo | jq -r '.url')
  commit=$(curl -s -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    "https://api.github.com/repos/vx-clutch/$name/commits?per_page=1" | jq 'if type=="array" then .[0] else empty end')
  if [ "$commit" != "null" ]; then
    date=$(echo $commit | jq -r '.commit.author.date')
    commit_url=$(echo $commit | jq -r '.html_url')
    echo "{\"name\":\"$name\",\"url\":\"$url\",\"commitDate\":\"$date\",\"commitUrl\":\"$commit_url\"}" >> commits.jsonl
  fi
done

if [ -f commits.jsonl ]; then
  jq -s 'sort_by(.commitDate) | reverse | .[0]' commits.jsonl > recent-release.json
else
  echo '{"error":"No recent commits found."}' > recent-release.json
fi

mkdir -p public
mv recent-release.json public/recent-release.json

echo "Done! See public/recent-release.json"
cat public/recent-release.json 