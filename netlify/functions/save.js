const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const { tasks } = JSON.parse(event.body);
  const date = new Date().toISOString().split('T')[0];
  const path = `days/${date}.json`;

  try {
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner: 'Vogez-Git', // CHANGE THIS
        repo: 'Repo1',
        path
      });
      sha = data.sha;
    } catch (e) {}

    await octokit.repos.createOrUpdateFileContents({
      owner: 'Vogez-Git', // CHANGE THIS
      repo: 'Repo1',
      path,
      message: `Update ${date}`,
      content: Buffer.from(JSON.stringify(tasks)).toString('base64'),
      sha
    });
    return { statusCode: 200, body: "OK" };
  } catch (err) { return { statusCode: 500, body: err.toString() }; }
};