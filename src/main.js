import axios from "axios";
import { createPopper } from '@popperjs/core';

const seenAuthors = {};

async function getSubreddits(author, type) {
  const subreddits = {};
  let after;
  let object = "";

  if (type === "comments") {
    object = "comments";
  } else if (type === "posts") {
    object = "submitted";
  } else {
    throw Error(`Invalid type ${type} for function getSubreddits`);
  }

  do {
    const response = await axios.get(
      `/user/${author}/${object}.json?limit=100&after=${after}`
    );
    console.log(response);
    const comments = response.data.data.children;
    after = response.data.data.after;
    console.log(comments);
    comments.forEach((com) => {
      const sub = com.data.subreddit;
      if (subreddits[sub]) {
        subreddits[sub] += 1;
      } else {
        subreddits[sub] = 1;
      }
    });
  } while (after !== null);
  return subreddits;
}

async function handleHover(event) {
  const author = event.fromElement
    .getElementsByClassName("author")[0]
    .href.split("/")
    .pop();
  console.log(author);
  if (!seenAuthors[author]) {
    seenAuthors[author] = { postSubreddits: {}, commentSubreddits: {} };
    seenAuthors[author].commentSubreddits = await getSubreddits(
      author,
      "comments"
    );
    seenAuthors[author].postSubreddits = await getSubreddits(author, "posts");
  }

  const subreddits = seenAuthors[author].commentSubreddits;
  Object.keys(seenAuthors[author].postSubreddits).forEach(sub => {
    if(subreddits[sub]) subreddits[sub] += seenAuthors[author].postSubreddits[sub];
    else subreddits[sub] = seenAuthors[author].postSubreddits[sub];
  });
  const total = Object.values(subreddits).reduce((a, b) => a + b);

  console.log(seenAuthors);
  const topSubreddits = Object.keys(subreddits)
    .sort((a, b) => subreddits[b] - subreddits[a])
    .slice(0, 5);

  const topSubredditInfo = topSubreddits.map(sub => {
    return {name: sub, contributions: subreddits[sub], percent: subreddits[sub]/total}
  });
  let authorToolTipHead;
  const interval = setInterval(function () {
    const authorToolTipHeads = Array.from(
      document.getElementsByClassName("author-tooltip__head")
    );
    authorToolTipHead = authorToolTipHeads.find((a) => {
      if (a.innerText.includes(`u/${author}`)) return true;
      return false;
    });
    if (authorToolTipHead) {
      clearInterval(interval);
      authorToolTipHead.after(`Top Subreddits: ${topSubredditInfo.join(", ")}`);
    }
  }, 1000);
}

const authors = document.querySelectorAll(`a[href*="/user/"]`);
const searchIcon = chrome.runtime.getURL("search-icon.png");

authors.forEach((author, i) => {
  const inspectHTML = `
    <img class="userInspector-inspect-user" id="${i}" src="${searchIcon}" height="12">
    <div class="userInspector-tooltip" id="userInspector-tooltip${i}">
      <span >Tooltip text</span>
    </div>
  `;
  author.insertAdjacentHTML("afterend", inspectHTML);
  // author.addEventListener("mouseover", handleHover);
});

const inspectors = document.querySelectorAll(`.userInspector-inspect-user`);
inspectors.forEach((inspector) => {
  const tooltip = document.querySelector(`#userInspector-tooltip${inspector.id}`);
  // TODO make this more performant by only updating poppers that are on screen https://popper.js.org/docs/v2/tutorial/
  createPopper(inspector, tooltip);
});

document.addEventListener('click', function(e) {
  if(e.target.classList.contains("userInspector-inspect-user")){
    const tooltip = document.querySelector(`#userInspector-tooltip${e.target.id}`);
    if(tooltip.hasAttribute('data-show'))
      tooltip.removeAttribute('data-show');
    else 
      tooltip.setAttribute('data-show', '');
  }else{
    const activeTooltip = document.querySelector('.userInspector-tooltip[data-show]');
    if (activeTooltip && !activeTooltip.contains(e.target)){
      activeTooltip.removeAttribute('data-show');
    }
  }
}); 
