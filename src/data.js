import axios from "axios";

export async function getSubreddits(author, type) {
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
        `https://www.reddit.com/user/${author}/${object}.json?limit=100&after=${after}`
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