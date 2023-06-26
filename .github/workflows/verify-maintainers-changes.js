const yaml = require("js-yaml");
const fs = require("fs");

try {
  // Read the Maintainers.yaml file
  const maintainersData = yaml.load(
    fs.readFileSync("Maintainers.yaml", "utf8")
  );

  // Check if changes were made by a bot
  if (maintainersData.updated_by_bot) {
    console.log("Changes made by a bot. Skipping verification.");
    process.exit(0); // Exit with success status code
  }

  // Check for critical attribute modifications
  const modifiedMaintainers = maintainersData.maintainers.filter(
    (maintainer) => maintainer.updated
  );
  const hasCriticalAttributeModifications = modifiedMaintainers.some(
    (maintainer) => maintainer.github || maintainer.repo || maintainer.removed
  );

  if (hasCriticalAttributeModifications) {
    console.error("Invalid changes detected in the Maintainers.yaml file.");
    console.error(
      "Please ensure that critical attributes are not modified manually."
    );
    process.exit(1); // Exit with failure status code
  }

  // If no issues were found, exit with success status code
  process.exit(0);
} catch (error) {
  console.error("An error occurred during verification:", error);
  process.exit(1); // Exit with failure status code
}
