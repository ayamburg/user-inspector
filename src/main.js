import { createPopper } from "@popperjs/core";
import { getSubreddits } from "./data";
import { getAnalysis } from "./analysis";

const searchIcon = chrome.runtime.getURL("search-icon.png");

const seenAuthors = {};
const poppers = {};

async function onClick(e) {
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

      const author = e.target.getAttribute("author");
      if (!seenAuthors[author]) {
        seenAuthors[author] = { postSubreddits: {}, commentSubreddits: {} };
        seenAuthors[author].commentSubreddits = await getSubreddits(
          author,
          "comments"
        );
        seenAuthors[author].postSubreddits = await getSubreddits(author, "posts");
      }
      const analysis = await getAnalysis(seenAuthors[author]);
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
}

function getAuthorFromElement(element) {
  const authorArray = element.href.split("/");
    const userIndex = authorArray.indexOf("user");
    if (userIndex === -1) return;
    return authorArray[userIndex + 1];
}

function addInspectors(authors) {
  authors.forEach((authorElement, i) => {
    if(authorElement.getAttribute("data-testid")?.includes("icon")) return;
    const author = getAuthorFromElement(authorElement);
    if (!author || author === "me") return;
    const uuid = crypto.randomUUID()
    const inspectHTML = `
      <img class="userInspector-inspect-user" id="${uuid}" src="${searchIcon}" height="12" author="${author}">
      <div class="userInspector-tooltip" id="userInspector-tooltip${uuid}">
      </div>
    `;
    authorElement.insertAdjacentHTML("afterend", inspectHTML);
  });
  
  const inspectors = document.querySelectorAll(`.userInspector-inspect-user`);
  inspectors.forEach((inspector) => {
    const tooltip = document.querySelector(
      `#userInspector-tooltip${inspector.id}`
    );
    if(!poppers[inspector.id]) {
      poppers[inspector.id] = createPopper(inspector, tooltip, {
        modifiers: [{ name: "eventListeners", enabled: false }],
      });
    }
  });
  
}

let pageAuthors = Array.from(document.querySelectorAll(`a[href*="/user/"]`));

addInspectors(pageAuthors);

document.addEventListener("click", onClick);

setInterval(function () {
  const authors = Array.from(document.querySelectorAll(`a[href*="/user/"]`));
  if(authors.length !== pageAuthors.length) {
    const newAuthors = authors.filter(author => !pageAuthors.includes(author));
    addInspectors(newAuthors);
    pageAuthors = authors;
  }
}, 3000);
