const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const { date, tasks } = JSON.parse(event.body);
  const path = `days/${date}.json`;

  try {
    // Try to get the file if it exists to get its 'sha' (ID)
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner: 'Vogez-Git',
        repo: 'Repo1',
        path
      });
      sha = data.sha;
    } catch (e) { /* File doesn't exist yet, that's fine */ }

    await octokit.repos.createOrUpdateFileContents({
      owner: 'Vogez-Git',
      repo: 'Repo1',
      path,
      message: `Update routine for ${date}`,
      content: Buffer.from(JSON.stringify(tasks)).toString('base64'),
      sha
    });

    return { statusCode: 200, body: "Saved!" };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};