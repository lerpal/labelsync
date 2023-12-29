# GitHub LabelSync for JIRA
Developed by our team at [Lerpal](https://lerpal.com/), this extension is designed to streamline the development workflow for both our team and our clients.

With the recent introduction of Insights in JIRA, we noticed that a similar existing extension is no longer functional. To address this, we have created a solution that seamlessly integrates with the updated JIRA environment. Our extension allows for adding information from GitHub pull request (PR) labels directly into JIRA tickets in sprint view. This allows teams to easily track the progress of PRs, identify who needs to take action next, and identify bottlenecks, ensuring a smoother, more efficient project management experience.

## Installation Instructions
After installing the extension, follow these steps to integrate it with **GitHub**:

1. Go to https://github.com/settings/tokens
2. Click `Generate New Token` -> `Generate New Token (classic)` 
3. Re-enter your password
4. Give your token a description (e.g. LabelSync for JIRA)
5. Please tick the only `repo` checkbox in `Select scopes` panel
6. Click `Generate Token`
7. If you have Single sign-on (SSO), ensure to authorize the organization: click “Configure SSO” and choose the organization
8. Copy the generated token
9. In the extension panel click `Details` button and then click the `Extension options` item
10. Paste the token to the `GitHub Access Token` field 
11. Click `Save` and you are done! Your GitHub integration is now seamlessly configured

To integrate this extension with **GitLab** please follow this steps:

1. Open your GitLab User Settings page
2. Click `Access Tokens` link at the left menu
3. Set the `Token name` (e.g. LabelSync for JIRA)
4. Please tick the only `read_api` and `read_repository` in `Select scopes` panel
5. Click `Create personal access token`
6. Copy the generated token
7. In the extension panel click `Details` button and then click the `Extension options` item
8. Paste the token to the `GitLab Access Token` field
9. Insert the gitlab host name to the `GitLab Host Name`. If URL for your GitLab is `https://gitlab.example.com`, please insert `gitlab.example.com` as the field value
10. Fill the `Project Name` field from the JIRA board url. If URL for your board is https://[example].atlassian.net/jira/software/c/projects/PROJECT_NAME/boards/[number], please insert `PROJECT_NAME` as the field value
11. Click `Save` and you are done! Your GitLab integration is configured

_Note: Keep your generated token secure and do not share it with unauthorized individuals._

By default, the extension will attempt to use GitHub as the default data provider. The board with a name matching the `Project Name` field will use corresponding GitLab credentials to retrieve data for the cards.

## Contribution
Your contributions are welcome! If you have any improvements or new features to propose, feel free to submit a pull request. We appreciate your help in making this extension better.

## License
MIT © [Lerpal](https://lerpal.com/)
