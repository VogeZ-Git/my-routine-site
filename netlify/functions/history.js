const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = 'YOUR_GITHUB_USERNAME'; // CHANGE THIS
  const repo = 'my-routine-data';

  try {
    // 1. Get list of all files in /days folder
    const { data: files } = await octokit.repos.getContent({ owner, repo, path: 'days' });
    
    let historyMap = {};
    let allTaskNames = new Set();

    // 2. Read each file (limit to last 30 to stay fast)
    const recentFiles = files.filter(f => f.name.endsWith('.json')).slice(-30);
    
    for (const file of recentFiles) {
      const { data: contentBlob } = await octokit.repos.getContent({ owner, repo, path: file.path });
      const content = JSON.parse(Buffer.from(contentBlob.content, 'base64').toString());
      const dateStr = file.name.replace('.json', '');

      historyMap[dateStr] = {};

      // Flatten daily, weekly, and monthly into one view for history
      ['daily', 'weekly', 'monthly'].forEach(cat => {
        if (content[cat]) {
          Object.entries(content[cat]).forEach(([task, status]) => {
            allTaskNames.add(task);
            historyMap[dateStr][task] = status;
          });
        }
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        tasks: Array.from(allTaskNames),
        history: historyMap,
        dates: Object.keys(historyMap).sort()
      })
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
