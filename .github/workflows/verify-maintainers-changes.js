const { execSync } = require("child_process");

const prAuthor = process.argv[2];

// Get the differences in Maintainers.yaml
const diffOutput = execSync(
  "git diff origin/main --unified=0 -- Maintainers.yaml"
).toString();

// Check if the PR is made by a async-bot
if (prAuthor.includes("[async-bot]")) {
  console.log("Changes made by a async-bot. Verification not necessary.");
  process.exit(0);
}

// Check if there are critical changes
const criticalChanges = ["github:", "repos:"];

for (const criticalChange of criticalChanges) {
  if (diffOutput.includes(criticalChange)) {
    console.error(
      `::error::Critical changes have been made to Maintainers.yaml by ${prAuthor}. Please review.`
    );
    process.exit(1);
  }
}

console.log("No critical changes detected.");
