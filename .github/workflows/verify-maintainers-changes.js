const { execSync } = require("child_process");
const yaml = require("js-yaml");
const fs = require("fs");

const prAuthor = process.argv[2];

// Check if the PR is made by a async-bot
if (prAuthor.includes("[async-bot]")) {
  console.log("Changes made by a async-bot. Verification not necessary.");
  process.exit(0);
}

// Fetch the Maintainers.yaml file before changes
execSync("git fetch origin main");
execSync("git checkout FETCH_HEAD -- Maintainers.yaml");
const maintainersBefore = yaml.load(
  fs.readFileSync("Maintainers.yaml", "utf8")
);

// Reset to the current state
execSync("git checkout HEAD Maintainers.yaml");
const maintainersAfter = yaml.load(fs.readFileSync("Maintainers.yaml", "utf8"));

// Compare repos arrays for each maintainer
const beforeRepos = maintainersBefore.map(
  (maintainer) => maintainer.repos || []
);
const afterRepos = maintainersAfter.map((maintainer) => maintainer.repos || []);

for (let i = 0; i < beforeRepos.length; i++) {
  const beforeSet = new Set(beforeRepos[i]);
  const afterSet = new Set(afterRepos[i] || []);

  for (const repo of beforeRepos[i]) {
    if (!afterSet.has(repo)) {
      console.error(
        `::error::Critical changes have been made to Maintainers.yaml by ${prAuthor}. A repo has been removed. Please review.`
      );
      process.exit(1);
    }
  }

  for (const repo of afterRepos[i] || []) {
    if (!beforeSet.has(repo)) {
      console.error(
        `::error::Critical changes have been made to Maintainers.yaml by ${prAuthor}. A repo has been added. Please review.`
      );
      process.exit(1);
    }
  }
}

console.log("No critical changes detected.");
