// const { execSync } = require("child_process");
// const yaml = require("yaml");
// const fs = require("fs");

// const prAuthor = process.argv[2];

// // Check if the PR is made by a async-bot
// if (prAuthor.includes("[async-bot]")) {
//   console.log("Changes made by a async-bot. Verification not necessary.");
//   process.exit(0);
// }

// // Fetch the Maintainers.yaml file before changes
// execSync("git fetch origin main");
// execSync("git checkout FETCH_HEAD -- Maintainers.yaml");
// const maintainersBefore = yaml.parse(
//   fs.readFileSync("Maintainers.yaml", "utf8")
// );

// // Reset to the current state
// execSync("git checkout HEAD Maintainers.yaml");
// const maintainersAfter = yaml.parse(
//   fs.readFileSync("Maintainers.yaml", "utf8")
// );

// // Compare repos arrays for each maintainer
// const beforeRepos = maintainersBefore.map(
//   (maintainer) => maintainer.repos || []
// );
// const afterRepos = maintainersAfter.map((maintainer) => maintainer.repos || []);

// for (let i = 0; i < beforeRepos.length; i++) {
//   const beforeSet = new Set(beforeRepos[i]);
//   const afterSet = new Set(afterRepos[i] || []);

//   for (const repo of beforeRepos[i]) {
//     if (!afterSet.has(repo)) {
//       console.error(
//         `::error::Critical changes have been made to Maintainers.yaml by ${prAuthor}. A repo has been removed. Please review.`
//       );
//       process.exit(1);
//     }
//   }

//   for (const repo of afterRepos[i] || []) {
//     if (!beforeSet.has(repo)) {
//       console.error(
//         `::error::Critical changes have been made to Maintainers.yaml by ${prAuthor}. A repo has been added. Please review.`
//       );
//       process.exit(1);
//     }
//   }
// }

// console.log("No critical changes detected.");

const { execSync } = require("child_process");
const yaml = require("yaml");
const fs = require("fs");

const prAuthor = process.argv[2];

// Check if the PR is made by an async-bot
if (prAuthor.includes("[async-bot]")) {
  console.log("Changes made by an async-bot. Verification not necessary.");
  process.exit(0);
}

// Fetch the Maintainers.yaml file before changes
execSync("git fetch origin main");
execSync("git checkout FETCH_HEAD -- Maintainers.yaml");
const maintainersBefore = yaml.parse(
  fs.readFileSync("Maintainers.yaml", "utf8")
);

// Reset to the current state
execSync("git checkout HEAD Maintainers.yaml");
const maintainersAfter = yaml.parse(
  fs.readFileSync("Maintainers.yaml", "utf8")
);

// Check if any new maintainer objects are added
const beforeSet = new Set(
  maintainersBefore.map((maintainer) => maintainer.name)
);
const afterSet = new Set(maintainersAfter.map((maintainer) => maintainer.name));

for (const maintainer of maintainersAfter) {
  if (!beforeSet.has(maintainer.name)) {
    console.error(
      `::error::Critical changes have been made to Maintainers.yaml by ${prAuthor}. A new maintainer object has been added. Please review.`
    );
    process.exit(1);
  }
}

// Check if any maintainer objects are removed
for (const maintainer of maintainersBefore) {
  if (!afterSet.has(maintainer.name)) {
    console.error(
      `::error::Critical changes have been made to Maintainers.yaml by ${prAuthor}. A maintainer object has been removed. Please review.`
    );
    process.exit(1);
  }
}

// Check for critical attribute changes
for (let i = 0; i < maintainersAfter.length; i++) {
  const maintainerBefore = maintainersBefore.find(
    (m) => m.name === maintainersAfter[i].name
  );
  const maintainerAfter = maintainersAfter[i];

  if (
    maintainerBefore &&
    (maintainerBefore.github !== maintainerAfter.github ||
      !arraysAreEqual(maintainerBefore.repos, maintainerAfter.repos))
  ) {
    console.error(
      `::error::Critical changes have been made to Maintainers.yaml by ${prAuthor}. Changes to critical attributes detected. Please review.`
    );
    process.exit(1);
  }
}

console.log("No critical changes detected.");

// Helper function to check if two arrays are equal
function arraysAreEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}
