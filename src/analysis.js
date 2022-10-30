export async function getAnalysis(authorData) {
    const subreddits = authorData.commentSubreddits;
    Object.keys(authorData.postSubreddits).forEach((sub) => {
      if (subreddits[sub])
        subreddits[sub] += authorData.postSubreddits[sub];
      else subreddits[sub] = authorData.postSubreddits[sub];
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