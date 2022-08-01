import axios from "axios";

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
  console.log(seenAuthors);
  const topSubreddits = Object.keys(subreddits)
    .sort((a, b) => subreddits[b] - subreddits[a])
    .slice(0, 5);
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
      authorToolTipHead.after(`Top Subreddits: ${topSubreddits.join(", ")}`);
    }
  }, 1000);
}

const authors = document.querySelectorAll(`a[href*="/user/"]`);

authors.forEach((author) => {
  author.addEventListener("mouseover", handleHover);
});
