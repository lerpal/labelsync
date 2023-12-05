/* global chrome, $ */
let ACCESS_TOKEN = '';
let HIDE_CLOSED_PRS = false;
let HIDE_LABELS_ON_CLOSED_PRS = true;
let FF_CODE_REVIEWERS = false;
let FF_SHORT_NAME = true;
const JIRA_HOSTNAME = window.location.hostname;
let PR_COLUMNS = [];
let CODE_REVIEWERS_LABELS = [];

const CACHED_LABELS = {};

const SELECTORS = {
  column: '[data-component-selector="platform-board-kit.ui.column.draggable-column"]',
  columnHeader: '[data-component-selector="platform-board-kit.ui.column-title"]',
  card: '[data-component-selector="platform-board-kit.ui.card-container"]',
  labelsContainer: '[data-testid="platform-card.common.ui.custom-fields.custom-card-field-list"]',
};

const STATUS_COLOR = {
  OPEN: '#0052cc',
  MERGED: '#79ddb4',
  DECLINED: '#da3633',
  DEFAULT: '#555555',
};

chrome.storage.sync.get({
  github_access_token: '',
  hide_labels_on_closed_prs: true,
  hide_closed_prs: false,
  pr_columns: 'In Review, Github Review',
  code_reviewers_labels: 'In Code Review, Ready for Code Review',
  ff_code_reviewers: false,
  ff_short_name: true,
}, (items) => {
  ACCESS_TOKEN = items.github_access_token;
  HIDE_CLOSED_PRS = items.hide_closed_prs;
  HIDE_LABELS_ON_CLOSED_PRS = items.hide_labels_on_closed_prs;
  FF_CODE_REVIEWERS = items.ff_code_reviewers;
  FF_SHORT_NAME = items.ff_short_name;

  CODE_REVIEWERS_LABELS = buildArray(items.code_reviewers_labels);
  PR_COLUMNS = buildArray(items.pr_columns);

  if (ACCESS_TOKEN !== '') {
    setTimeout(addPRLabels, 1500);
  } else {
    // eslint-disable-next-line no-console
    console.warn('GITHUB ACCESS TOKEN IS NOT SET');
  }
});

async function populateIssueCard(card) {
  const $card = $(card);
  const idAttr = $card.attr('id') || $card.data('id');
  if (!CACHED_LABELS[idAttr]) {
    const $labels = $('<div class="jle_container" />').on('click', (e) => {
      e.stopPropagation();
    });
    CACHED_LABELS[idAttr] = $labels;

    const cardKey = idAttr.replace('card-', '');
    const cardId = await getCardId(cardKey);
    const pullRequests = await getPullRequests(cardId);

    $labels.append($getLabelsHeader(idAttr, pullRequests));

    await Promise.all(pullRequests.map(async (pullRequest) => {
      const $pr = [];
      const isClosedPR = pullRequest.status === 'DECLINED';
      if (isClosedPR && HIDE_CLOSED_PRS) {
        return;
      }

      $pr.push($getPullRequestDetails(pullRequest));

      if (!isClosedPR || !HIDE_LABELS_ON_CLOSED_PRS) {
        const { id, repositoryName } = pullRequest;
        const pullRequestId = id.replace('#', '');
        const ghDetails = await getGithubDetails(cardId, repositoryName, pullRequestId);

        $pr.push($getPullRequestLabels(ghDetails));
        if (isShowReviewers(ghDetails)) {
          const reviews = await getGithubReviews(cardId, repositoryName, pullRequestId);
          $pr.push($getCodeReviewers(
            ghDetails.user.login,
            ghDetails.requested_reviewers,
            reviews,
          ));
        }
      }

      $labels.append($pr);
    }));
  }

  $card.find(SELECTORS.labelsContainer).append(CACHED_LABELS[idAttr]);
}

function getColumns() {
  const columns = [];
  $(SELECTORS.column).each((index, column) => {
    const columnTitle = $(column).find(SELECTORS.columnHeader).attr('aria-label');
    if (!columnTitle) {
      throw new Error('Can\'t find column headers');
    }
    if (PR_COLUMNS.indexOf(columnTitle) !== -1) {
      columns.push(column);
    }
  });

  return columns;
}

function $getLabelsHeader(idAttr, pullRequests) {
  return $('<div class="jle_header" />')
    .addClass(pullRequests.length ? 'jle_header--with-pr' : 'jle_header--no-pr')
    .append('<div class="jle_header__label">Pull Requests</div>')
    .append(
      $('<button class="jle_header__refresh" />')
        .attr('title', `${pullRequests.length} pull request(s)`)
        .on('click', () => {
          const $card = $(`#${idAttr}`);
          delete CACHED_LABELS[idAttr];
          $card.find('.jle_container').remove();
          populateIssueCard($card);
        }),
    );
}

function $getPullRequestDetails(pullRequest) {
  const {
    id, repositoryName, url, status,
  } = pullRequest;

  const repo = FF_SHORT_NAME ? repositoryName.split('/').at(-1) : repositoryName;
  const statusColor = STATUS_COLOR[status] || STATUS_COLOR.DEFAULT;

  return $(`<a class="jle_pr_details" href="${url}" target="_blank" />`)
    .append(
      $('<span class="jle_pr_details__info" />')
        .append(`<span class="jle_pr_details__repo">${repo}</span>`)
        .append(`<span class="jle_pr_details__pr">${id}</span>`),
    )
    .append($getBadge(status, statusColor).addClass('jle_pr_details__status'));
}

function $getBadge(text, color) {
  const $badge = $(`<span class="jle_badge">${text}</span>`);
  const labelStyle = $badge.get(0).style;
  labelStyle.setProperty('--color', color);
  labelStyle.setProperty('--bg-color', getLabelBackgroundColor(color));

  return $badge;
}

function $getPullRequestLabels({ labels }) {
  return $('<div class="jle_pr_labels" />')
    .append(labels.map(
      (label) => $getBadge(label.name, `#${label.color}`).addClass('jle_pr_labels--label'),
    ));
}

function isShowReviewers({ labels }) {
  return FF_CODE_REVIEWERS && labels.filter(({ name }) => CODE_REVIEWERS_LABELS.includes(name)).length > 0;
}

function $getReviewer({ login, avatar_url: avatarUrl, state }) {
  return $('<div class="jle_pr_reviewer" />')
    .append(
      $('<div class="jle_pr_reviewer__info" />')
        .append(`<img class="jle_pr_reviewer__image" width="24" height="24" src="${avatarUrl}" alt="${login}" />`)
        .append(`<span class="jle_pr_reviewer__name">${login}</span>`),
    )
    .append(`<div class="jle_pr_reviewer__status jle_pr_reviewer__status--${state.toLowerCase()}" />`);
}

function $getCodeReviewers(author, pendingReviewers, reviews) {
  const reviewers = Object.values({
    ...pendingReviewers.reduce((prev, user) => ({ ...prev, [user.login]: { state: 'PENDING', ...user } }), {}),
    ...reviews.reduce((prev, { user, state }) => ({ ...prev, [user.login]: { state, ...user } }), {}),
  }).filter((reviewer) => reviewer.login !== author);

  return $('<div class="jle_pr_reviewers" />')
    .append(
      $('<button class="jle_pr_reviewers__label">Reviewers</button>')
        .append('<div class="jle_pr_reviewers__icon" />')
        .on('click', (e) => {
          $(e.target).parents('.jle_pr_reviewers').toggleClass('jle_pr_reviewers--opened');
        }),
    )
    .append(
      $('<div class="jle_pr_reviewers__list" />').append(
        reviewers.map((reviewer) => $getReviewer(reviewer)),
      ),
    );
}

function watchColumn(mutations) {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      let $card = $(node).find(SELECTORS.card);
      const $cont = $(node).find(SELECTORS.labelsContainer);
      if (!$card.length && $cont.length) {
        // Need to extract the ticket name. A bit hacky, but it works.
        $card = $(node).data('id', `card-${$cont.parent().next().text()}`);
      }
      if ($card.length) {
        populateIssueCard($card);
      }
    });
  });
}

function addPRLabels() {
  const observer = new MutationObserver(watchColumn);

  getColumns().forEach((column) => {
    $(column).find(SELECTORS.card).each((index, card) => {
      populateIssueCard(card);
    });

    observer.observe(column, {
      childList: true,
      subtree: true,
    });
  });
}

/** **********************
 **  Helper Functions  **
 *********************** */
function buildArray(str) {
  return str.split(',').map((element) => element.trim()).filter(Boolean);
}

function getLabelBackgroundColor(color) {
  const rgb = getRGBComponents(color);

  return `rgba(${rgb.R}, ${rgb.G}, ${rgb.B}, 0.16)`;
}

function getRGBComponents(color) {
  return {
    R: parseInt(color.substring(1, 3), 16),
    G: parseInt(color.substring(3, 5), 16),
    B: parseInt(color.substring(5, 7), 16),
  };
}

/** **********************
 **   Data Functions   **
 *********************** */
function getJSON(url, params = {}) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url,
      type: 'GET',
      dataType: 'json',
      ...params,
    }).done((data) => {
      resolve(data);
    }).fail(() => {
      reject(new Error('Failed to get JSON'));
    });
  });
}

async function getCardId(cardKey) {
  const data = await getJSON(
    `https://${JIRA_HOSTNAME}/rest/api/3/issue/${cardKey}?fields=id`,
  );

  return `${data?.id}`;
}

async function getPullRequests(cardId) {
  const search = `issueId=${cardId}&applicationType=GitHub&dataType=pullrequest`;
  const data = await getJSON(
    `https://${JIRA_HOSTNAME}/rest/dev-status/latest/issue/detail?${search}`,
  );

  return data.detail?.[0]?.pullRequests || [];
}

function setGitHubAccessHeader(xhr) {
  xhr.setRequestHeader('Authorization', `token ${ACCESS_TOKEN}`);
}

async function getGithubDetails(cardId, repositoryName, pullRequestId) {
  return getJSON(
    `https://api.github.com/repos/${repositoryName}/pulls/${pullRequestId}`,
    {
      beforeSend: setGitHubAccessHeader,
    },
  );
}

async function getGithubReviews(cardId, repositoryName, pullRequestId) {
  return getJSON(
    `https://api.github.com/repos/${repositoryName}/pulls/${pullRequestId}/reviews?per_page=100`,
    {
      beforeSend: setGitHubAccessHeader,
    },
  );
}
