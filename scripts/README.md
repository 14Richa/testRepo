### Automate paper work around project governance

 This project aims to automate maintaining the Maintainers.yaml file which contains the list of maintainers and TSC members of AsyncAPI. The tasks involve implementing workflows to automatically update the member's list based on changes in other files, inviting new maintainers and TSC members, updating the Emeritus.yaml file when someone is removed, and aggregating helpful information in the Maintainers.yaml file. These automation and improvements will make it easier to manage the maintainers and TSC members of AsyncAPI.


The flowchart describes three subgraphs related to the maintenance of Maintainers.yaml, onboarding of new maintainers, and updates to Emeritus.yaml file.

The first subgraph outlines the steps to automate the updating of Maintainers.yaml. This involves migrating to YAML, updating the website code to handle the new format, automating the updating of Maintainers.yaml, creating a validation workflow to block pull requests if records are added/removed by humans, creating a CODEOWNERS update workflow, allowing humans to update social info and TSC member property, and creating an aggregation workflow to provide information on the number of TSC members, per company information, and the number of members that can be added by each company.


```mermaid
graph LR;
 subgraph Automate the updation of Maintainers.yaml

    A[Migrate to YAML] --> B[Update website code];
    B --> C[Automate Maintainers.yaml updation];
    C --> D[Create validation workflow];
    C --> E[Create CODEOWNERS update workflow];
    C --> F[Allow humans to update social info and TSC member property];
    C --> G[Create aggregation workflow];
    D --> H[Block PR if record added/removed by human];
    E --> I[Update Maintainers.yaml];
    G --> I;
    end;
```


The second subgraph outlines the steps for onboarding new maintainers. This involves creating an invitation workflow, creating a TSC member change workflow, and creating a notification workflow to inform existing members about the new addition.

```mermaid
graph LR;
    J[New Maintainer Onboarding] --> K[Create invitation workflow];
    J --> L[Create TSC member change workflow];
    K --> M[Create notification workflow];
    L --> M;    
```

The third subgraph outlines the steps for updating the Emeritus.yaml file. This involves creating a removal workflow to remove members from the organization/team, and creating a pull request review workflow to ensure that changes are reviewed by a human before merging.

```mermaid 
graph LR;
    N[Updates to Emeritus.yaml file] --> O[Create removal workflow];
    O --> P[Remove from organization/team];
    O --> Q[Create PR review workflow];
```


Overall, these subgraphs represent a comprehensive approach to maintaining and updating the YAML files related to maintainers and TSC members, ensuring that new maintainers are onboarded effectively, and keeping the Emeritus.yaml file up to date. This approach involves a range of workflows and automated processes to streamline these tasks and ensure they are completed efficiently andaccurately. By implementing this approach, the team can manage these tasks more effectively and focus on other important aspects of software development and website maintenance.


### Workflows 

### validate-maintainers.yaml

This workflow listens for changes to the Maintainers.yaml file and validates whether the changes were made by the bot or a human. If a human made the changes, the workflow blocks the pull request and notifies the user with a proper message.

```mermaid
graph LR;
A[New record added to Maintainers.yaml?] --> |Yes| B[Validate record and block if added by human];
B --> C[Notify user with proper message];
C --> D[End];
A --> |No| D[End];
```

### update-maintainers.yaml

This workflow listens for changes to the CODEOWNERS file and updates the Maintainers.yaml file accordingly. It also picks up the GitHub username, Twitter handle, and the name of the maintained repository from the API and notifies the affected users.

```mermaid
graph TD;
A[Changes made to CODEOWNERS file?] --> |Yes| B[Update Maintainers.yaml];
B --> C[Pick up GitHub username, Twitter handle, and repository name from API];
C --> D[Notify affected users];
D --> E[End];
A --> |No| E[End];
```

### allow-updates.yaml

This workflow allows humans to update social info or the tsc_member property in the Maintainers.yaml file.

```mermaid
graph TD;
A[User updates social info or tsc_member value?] --> |Yes| B[Allow update];
B --> C[End];
A --> |No| D[Block update and notify user];
D --> E[End];
```

### invite-maintainers.yaml

This workflow is triggered when a new maintainer is added. It calls the GitHub API to invite the maintainer to the AsyncAPI organization and creates a new team for the maintainers. The workflow also adds the newmaintainer to the Maintainers GitHub team.

```mermaid
graph TD;
A[New maintainer added?] --> |Yes| B[Call GitHub API to invite maintainer];
B --> C[Create new team and add maintainer to it];
C --> D[Update Maintainers.yaml];
D --> E[End];
A --> |No| E[End];
```

### update-tsc-team.yaml

This workflow is triggered when there is a change to the tsc_member property. It adds or removes the member from the TSC team based on the value of the property.

```mermaid
graph TD;
A[tsc_member value change?] --> |Yes| B[Add or remove member from tsc team];
B --> C[Notify affected users];
C --> D[End];
A --> |No| D[End];
```

### notify-tsc-members.yaml

This workflow is triggered when a new member is added to the TSC. It notifies the new member about ways to get notified when TSC members are called out and notifies other TSC members by mentioning the GitHub team.

```mermaid
graph TD;
A[PR modifies tsc_member to true?] --> |Yes| B[Notify new member about ways to get notified];
B --> C[Notify TSC members about new member];
C --> D[End];
A --> |No| D[End];
```

### update-emeritus.yaml

This workflow is triggered when someone is removed from the Maintainers.yaml file because they no longer maintain any repository. It updates the Emeritus.yaml file with the list of people that left the project.

```mermaid
graph TD;
A[Someone removed from Maintainers.yaml?] --> |Yes| B[Update Emeritus.yaml];
B --> C[End];
A --> |No| C[End];
```

### remove-from-organization.yaml

This workflow is triggered when someone is removed from the Maintainers.yaml file. It removes the person from the AsyncAPI organization and the proper teams.

```mermaid
graph TD;
A[Someone removed from Maintainers.yaml?] --> |Yes| B[Remove person from organization and teams];
B --> C[End];
A --> |No| C[End];
```

#### review-emeritus-pr.yaml

This workflow is triggered when a PR modifies the `Emeritus.yamlfile. It reviews and merges the PR only after it has been reviewed by a human.

```mermaid 
graph TD;
A[PR modifies Emeritus.yaml file?] --> |Yes| B[Review and merge PR];
B --> C[End];
A --> |No| C[End];
```