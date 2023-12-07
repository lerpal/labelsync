/* global chrome */

byId('save').addEventListener('click', () => {
  chrome.storage.sync.set({
    github_access_token: byId('github_access_token').value,
    hide_labels_on_closed_prs: byId('hide_labels_on_closed_prs').checked,
    hide_closed_prs: byId('hide_closed_prs').checked,
    pr_columns: byId('pr_columns').value,
    ff_code_reviewers: byId('ff_code_reviewers').checked,
    ff_short_name: byId('ff_short_name').checked,
  }, () => {
    // Update status to let user know options were saved.
    const status = byId('status');
    status.textContent = 'Options saved';
    setTimeout(() => {
      status.textContent = '';
    }, 5000);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get({
    github_access_token: '',
    hide_labels_on_closed_prs: true,
    hide_closed_prs: false,
    pr_columns: 'In Review, Github Review',
    ff_code_reviewers: false,
    ff_short_name: true,
  }, (items) => {
    byId('github_access_token').value = items.github_access_token;
    byId('hide_labels_on_closed_prs').checked = items.hide_labels_on_closed_prs;
    byId('hide_closed_prs').checked = items.hide_closed_prs;
    byId('pr_columns').value = items.pr_columns;
    byId('ff_code_reviewers').checked = items.ff_code_reviewers;
    byId('ff_short_name').checked = items.ff_short_name;
  });
});

function byId(id) {
  return document.getElementById(id);
}
