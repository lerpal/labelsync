/* global chrome, $ */
let ACCESS_TOKEN = '';
let HIDE_CLOSED_PRS = false;
let HIDE_LABELS_ON_CLOSED_PRS = true;
let FF_CODE_REVIEWERS = false;
let FF_SHORT_NAME = true;
const JIRA_HOSTNAME = window.location.hostname;
let PR_COLUMNS = [];
let CODE_REVIEWERS_LABELS = [];

// eslint-disable-next-line max-len
const REFRESH_SVG = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.99999 11.3333C4.5111 11.3333 3.24999 10.8167 2.21666 9.78334C1.18332 8.75001 0.666656 7.48889 0.666656 6.00001C0.666656 4.51112 1.18332 3.25001 2.21666 2.21667C3.24999 1.18334 4.5111 0.666672 5.99999 0.666672C6.76666 0.666672 7.49999 0.825005 8.19999 1.14167C8.89999 1.45834 9.49999 1.91112 9.99999 2.50001V0.666672H11.3333V5.33334H6.66666V4.00001H9.46666C9.1111 3.37778 8.62499 2.88889 8.00832 2.53334C7.39166 2.17778 6.72221 2.00001 5.99999 2.00001C4.88888 2.00001 3.94443 2.38889 3.16666 3.16667C2.38888 3.94445 1.99999 4.88889 1.99999 6.00001C1.99999 7.11112 2.38888 8.05556 3.16666 8.83334C3.94443 9.61112 4.88888 10 5.99999 10C6.85555 10 7.62777 9.75556 8.31666 9.26667C9.00555 8.77778 9.48888 8.13334 9.76666 7.33334H11.1667C10.8555 8.51112 10.2222 9.47223 9.26666 10.2167C8.3111 10.9611 7.22221 11.3333 5.99999 11.3333Z"/></svg>';
// eslint-disable-next-line max-len
const ARROW_SVG = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.6 8.5L4 3.9L5.4 2.5L11.4 8.5L5.4 14.5L4 13.1L8.6 8.5Z" /></svg>';

const CACHED_LABELS = {};
let COLUMNS_SELECTOR = '';
let IS_LIGHT_THEME = false;

const SELECTORS = {
  board: '[data-test-id="software-board.board-area"]',
  column: '[data-component-selector="platform-board-kit.ui.column.draggable-column"]',
  columnHeader: '[data-component-selector="platform-board-kit.ui.column-title"]',
  card: '[data-component-selector="platform-board-kit.ui.card-container"]',
  labelsContainer: 'div[class*="_content"] > div:last-child',
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

  $card.find(SELECTORS.labelsContainer).before(CACHED_LABELS[idAttr]);
}

function getColumnsSelector() {
  const selectors = [];
  $(SELECTORS.columnHeader).each((index, header) => {
    const columnTitle = $(header).attr('aria-label');
    if (!columnTitle) {
      throw new Error('Can\'t find column headers');
    }
    if (PR_COLUMNS.indexOf(columnTitle) !== -1) {
      selectors.push(`${SELECTORS.column}:nth-child(${index + 1})`);
    }
  });
  return selectors.join(',');
}

function $getLabelsHeader(idAttr, pullRequests) {
  return $('<div class="jle_header" />')
    .addClass(pullRequests.length ? 'jle_header--with-pr' : 'jle_header--no-pr')
    .append('<div class="jle_header__label">Pull Requests</div>')
    .append(
      $('<button class="jle_header__refresh" />')
        .append(REFRESH_SVG)
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
        .append(ARROW_SVG)
        .append(`<span class="jle_pr_details__pr">${id}</span>`),
    )
    .append($getBadge(status, statusColor).addClass('jle_pr_details__status'));
}

function $getBadge(text, color) {
  const $badge = $(`<span class="jle_badge">${text}</span>`);
  const labelStyle = $badge.get(0).style;
  const colors = getLabelColors(color);

  labelStyle.setProperty('--color', colors.color);
  labelStyle.setProperty('--bg-color', colors.backgroundColor);

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
        .append(`<div class="jle_pr_reviewers__icon">${ARROW_SVG}</div>`)
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

function watchCards(mutations) {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      let $card = $(node).find(SELECTORS.card);
      const $cont = $(node).find(SELECTORS.labelsContainer);
      if (!$card.length && $cont.length) {
        // Need to extract the ticket name. A bit hacky, but it works.
        $card = $(node).data('id', `card-${$cont.parent().next().text()}`);
      }
      // Check card and parent column.
      if ($card.length && $card.parents(COLUMNS_SELECTOR).length) {
        populateIssueCard($card);
      }
    });
  });
}

function setThemeFlag() {
  const styles = window.getComputedStyle(document.body);
  IS_LIGHT_THEME = getRGBComponents(styles.getPropertyValue('background-color'))[0] > 200;

  if (IS_LIGHT_THEME) {
    document.body.classList.add('jle_white_theme');
  }
}

function addPRLabels() {
  setThemeFlag();

  COLUMNS_SELECTOR = getColumnsSelector();

  if (!COLUMNS_SELECTOR) {
    throw new Error('Empty columns selector');
  }

  const observer = new MutationObserver(watchCards);
  observer.observe($(SELECTORS.board).get(0), {
    childList: true,
    subtree: true,
  });

  $(COLUMNS_SELECTOR).toArray().forEach((column) => {
    $(column).find(SELECTORS.card).each((index, card) => {
      populateIssueCard(card);
    });
  });
}

/** **********************
 **  Helper Functions  **
 *********************** */
function buildArray(str) {
  return str.split(',').map((element) => element.trim()).filter(Boolean);
}

const LABEL_COLOR_CACHE = {};
function getLabelColors(color) {
  if (!LABEL_COLOR_CACHE[color]) {
    let rgb = getRGBComponents(color);

    if (IS_LIGHT_THEME) {
      const min = 178;
      do {
        // Make labels darker, c < 0.
        const c = Math.min(...rgb.map((i) => (i > min ? -0.3 : 1)));
        if (c < 0) {
          rgb = getRGBComponents(pSBC(c, `rgb(${rgb.join(', ')})`));
        }
      } while (rgb.filter((i) => i > min).length);
    }
    LABEL_COLOR_CACHE[color] = {
      color: `rgb(${rgb.join(', ')})`,
      backgroundColor: `rgba(${rgb.join(', ')}, 0.16)`,
    };
  }
  return LABEL_COLOR_CACHE[color];
}

function getRGBComponents(color) {
  return color.startsWith('rgb')
    ? color.split('(').at(-1).split(',').map((p) => parseInt(p.trim(), 10))
    : [1, 3, 5].map((i) => parseInt(color.substring(i, i + 2), 16));
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

/* eslint-disable */
// Color darken/lighten helper
// https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors#13542669
function pSBC(p,c0,c1,l) {
  let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)==="string";
  if(typeof(p)!=="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!=='r'&&c0[0]!=='#')||(c1&&!a))return null;
  if(!this.pSBCr)this.pSBCr=(d)=>{
    let n=d.length,x={};
    if(n>9){
      [r,g,b,a]=d=d.split(","),n=d.length;
      if(n<3||n>4)return null;
      x.r=i(r[3]==="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
    }else{
      if(n===8||n===6||n<4)return null;
      if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
      d=i(d.slice(1),16);
      if(n===9||n===5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
      else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
    }return x};
  h=c0.length>9,h=a?c1.length>9?true:c1==="c"?!h:false:h,f=this.pSBCr(c0),P=p<0,t=c1&&c1!=="c"?this.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
  if(!f||!t)return null;
  if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
  else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
  a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
  if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
  else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}
/* eslint-enable */
