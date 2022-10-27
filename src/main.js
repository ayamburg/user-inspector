import axios from "axios";
import { createPopper } from "@popperjs/core";

const seenAuthors = {};
const poppers = {};

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

async function getAnalysis(author) {
  if (!seenAuthors[author]) {
    seenAuthors[author] = { postSubreddits: {}, commentSubreddits: {} };
    seenAuthors[author].commentSubreddits = await getSubreddits(
      author,
      "comments"
    );
    seenAuthors[author].postSubreddits = await getSubreddits(author, "posts");
  }

  const subreddits = seenAuthors[author].commentSubreddits;
  Object.keys(seenAuthors[author].postSubreddits).forEach((sub) => {
    if (subreddits[sub])
      subreddits[sub] += seenAuthors[author].postSubreddits[sub];
    else subreddits[sub] = seenAuthors[author].postSubreddits[sub];
  });
  const total = Object.values(subreddits).reduce((a, b) => a + b);

  const topSubreddits = Object.keys(subreddits)
    .sort((a, b) => subreddits[b] - subreddits[a])
    .slice(0, 5);

  const topSubredditInfo = topSubreddits.map((sub) => {
    return {
      name: sub,
      contributions: subreddits[sub],
      percent: subreddits[sub] / total,
    };
  });
  return topSubredditInfo;
}

const authors = document.querySelectorAll(`a[href*="/user/"]`);
const searchIcon = chrome.runtime.getURL("search-icon.png");

authors.forEach((authorElement, i) => {
  const authorArray = authorElement.href.split("/");
  const userIndex = authorArray.indexOf("user");
  if (userIndex === -1) return;
  const author = authorArray[userIndex + 1];
  if (!author || author === "me") return;
  const inspectHTML = `
    <img class="userInspector-inspect-user" id="${i}" src="${searchIcon}" height="12" author="${author}">
    <div class="userInspector-tooltip" id="userInspector-tooltip${i}">
    </div>
  `;
  authorElement.insertAdjacentHTML("afterend", inspectHTML);
  // author.addEventListener("mouseover", handleHover);
});

const inspectors = document.querySelectorAll(`.userInspector-inspect-user`);
inspectors.forEach((inspector) => {
  const tooltip = document.querySelector(
    `#userInspector-tooltip${inspector.id}`
  );
  poppers[inspector.id] = createPopper(inspector, tooltip, {
    modifiers: [{ name: "eventListeners", enabled: false }],
  });
});

document.addEventListener("click", async function (e) {
  if (e.target.classList.contains("userInspector-inspect-user")) {
    const tooltip = document.querySelector(
      `#userInspector-tooltip${e.target.id}`
    );
    if (tooltip.hasAttribute("data-show")) {
      tooltip.removeAttribute("data-show");

      poppers[e.target.id].setOptions((options) => ({
        ...options,
        modifiers: [
          ...options.modifiers,
          { name: "eventListeners", enabled: false },
        ],
      }));
    } else {
      tooltip.innerHTML = "loading...";
      tooltip.setAttribute("data-show", "");

      poppers[e.target.id].setOptions((options) => ({
        ...options,
        modifiers: [
          ...options.modifiers,
          { name: "eventListeners", enabled: true },
        ],
      }));
      poppers[e.target.id].update();

      const analysis = await getAnalysis(e.target.getAttribute("author"));
      const rows = analysis.map((sub) => {
        return `
          <tr>
            <td>${sub.name}</td>
            <td>${Math.round(sub.percent * 100)}</td>
            <td>${sub.contributions}</td>
          </tr>
        `;
      });

      const analysisDisplay = `
        <table>
          <tr>
            <th>Subreddit</th>
            <th>Percent</th>
            <th>Contributions</th>
          </tr>
          ${rows.join("")}
        </table>
      `;
      tooltip.innerHTML = analysisDisplay;
    }
  } else {
    const activeTooltips = document.querySelectorAll(
      ".userInspector-tooltip[data-show]"
    );
    activeTooltips.forEach((activeTooltip) => {
      if (activeTooltip && !activeTooltip.contains(e.target)) {
        activeTooltip.removeAttribute("data-show");
      }
    });
  }
});
