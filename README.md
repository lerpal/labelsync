# GitHub LabelSync for JIRA
Developed by our team at [Lerpal](https://lerpal.com/), this extension is designed to streamline the development workflow for both our team and our clients.

With the recent introduction of Insights in JIRA, we noticed that a similar existing extension is no longer functional. To address this, we have created a solution that seamlessly integrates with the updated JIRA environment. Our extension allows for adding information from GitHub pull request (PR) labels directly into JIRA tickets in sprint view. This allows teams to easily track the progress of PRs, identify who needs to take action next, and identify bottlenecks, ensuring a smoother, more efficient project management experience.

## Installation Instructions
After installing the extension, follow these steps to integrate it with GitHub:

1. Go to https://github.com/settings/tokens
2. Click `Generate New Token` -> `Generate New Token (classic)` 
3. Re-enter your password
4. Give your token a description (e.g. LabelSync for JIRA)
5. Please tick the only `repo` checkbox in `Select scopes` panel
6. Click `Generate Token`
7. If you have Single sign-on (SSO), ensure to authorize the organization
8. Copy the generated token
9. In the extension panel click `Details` button and then click the `Extension options` item
10. Paste the token to the `Github Access Token` field 
11. Click `Save` and you are done! Your GitHub integration is now seamlessly configured

## Contribution
Your contributions are welcome! If you have any improvements or new features to propose, feel free to submit a pull request. We appreciate your help in making this extension better.

## License
MIT © [Lerpal](https://lerpal.com/)
