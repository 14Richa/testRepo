// const { execSync } = require("child_process");
// const yaml = require("yaml");
// const fs = require("fs");

// const prAuthor = process.argv[2];

// // Check if the PR is made by an async-bot
// if (prAuthor.includes("[async-bot]")) {
//   console.log("Changes made by an async-bot. Verification not necessary.");
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

// // Check if any new maintainer objects are added
// const beforeSet = new Set(
//   maintainersBefore.map((maintainer) => maintainer.name)
// );
// const afterSet = new Set(maintainersAfter.map((maintainer) => maintainer.name));

// for (const maintainer of maintainersAfter) {
//   if (!beforeSet.has(maintainer.name)) {
//     console.error(
//       `::error::Critical changes have been made to Maintainers.yaml by ${prAuthor}. A new maintainer object has been added. Please review.`
//     );
//     process.exit(1);
//   }
// }

// // Check if any maintainer objects are removed
// for (const maintainer of maintainersBefore) {
//   if (!afterSet.has(maintainer.name)) {
//     console.error(
//       `::error::Critical changes have been made to Maintainers.yaml by ${prAuthor}. A maintainer object has been removed. Please review.`
//     );
//     process.exit(1);
//   }
// }

// // Check for critical attribute changes
// for (let i = 0; i < maintainersAfter.length; i++) {
//   const maintainerBefore = maintainersBefore.find(
//     (m) => m.name === maintainersAfter[i].name
//   );
//   const maintainerAfter = maintainersAfter[i];

//   if (
//     maintainerBefore &&
//     (maintainerBefore.github !== maintainerAfter.github ||
//       !arraysAreEqual(maintainerBefore.repos, maintainerAfter.repos))
//   ) {
//     console.error(
//       `::error::Critical changes have been made to Maintainers.yaml by ${prAuthor}. Changes to critical attributes detected. Please review.`
//     );
//     process.exit(1);
//   }
// }

// console.log("No critical changes detected.");

// // Helper function to check if two arrays are equal
// function arraysAreEqual(arr1, arr2) {
//   if (arr1.length !== arr2.length) {
//     return false;
//   }

//   for (let i = 0; i < arr1.length; i++) {
//     if (arr1[i] !== arr2[i]) {
//       return false;
//     }
//   }

//   return true;
// }


const { execSync } = require("child_process");
const yaml = require("yaml");
const fs = require("fs");
const https = require('https');

const prAuthor = process.argv[2];

let isCriticalChangeDetected = false;

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
    isCriticalChangeDetected = true;
    break;
  }
}

// Check if any maintainer objects are removed
for (const maintainer of maintainersBefore) {
  if (!afterSet.has(maintainer.name)) {
    console.error(
      `::error::Critical changes have been made to Maintainers.yaml by ${prAuthor}. A maintainer object has been removed. Please review.`
    );
    isCriticalChangeDetected = true;
    break;
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
    isCriticalChangeDetected = true;
    break;
  }
}

// If critical changes are detected, close the PR and comment
if (isCriticalChangeDetected) {
  const token = process.env.BOT_TOKEN;
  const prNumber = process.env.PULL_REQUEST_NUMBER;

  const closePrPayload = JSON.stringify({
    state: "closed"
  });

  const commentPayload = JSON.stringify({
    body: "Critical changes have been made. This PR needs to be reviewed."
  });

  const requestOptions = {
    hostname: 'api.github.com',
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'GitHub-Action',
      'Content-Type': 'application/json'
    }
  };

  // Close the PR
  requestOptions['path'] = `/repos/14Richa/testRepo/pulls/${prNumber}`;
  requestOptions['method'] = 'PATCH';

  const closeReq = https.request(requestOptions, (res) => {
    res.on('data', () => { /* Do nothing */ });
  });

  closeReq.on('error', (error) => {
    console.error(error);
  });

  closeReq.write(closePrPayload);
  closeReq.end();

  // Comment on the PR
  requestOptions['path'] = `/repos/14Richa/testRepo/issues/${prNumber}/comments`;
  requestOptions['method'] = 'POST';

  const commentReq = https.request(requestOptions, (res) => {
    res.on('data', () => { /* Do nothing */ });
  });

  commentReq.on('error', (error) => {
    console.error(error);
  });

  commentReq.write(commentPayload);
  commentReq.end();
}

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
