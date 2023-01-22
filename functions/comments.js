/*
const { Octokit } = require("@octokit/core");
const { createTokenAuth } = require('@octokit/auth-token');
*/
const dayjs = require('dayjs')
var relativeTime = require('dayjs/plugin/relativeTime')

var md = require('markdown-it')()
const sanitizeHtml = require('sanitize-html')

const { Octokit } = require("@octokit/core")
const {
  restEndpointMethods,
} = require("@octokit/plugin-rest-endpoint-methods");

exports.handler = async (event) => {
  const issueNumber = event.queryStringParameters.id;

  try {
    const MyOctokit = Octokit.plugin(restEndpointMethods);
    const octokit = new MyOctokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN });
    const { data: rateLimitInfo } = await octokit.request('GET /rate_limit', {})
    const remainingCalls = rateLimitInfo.resources.core.remaining;
    console.log(`GitHub API requests remaining: ${remainingCalls}`);

    if (remainingCalls === 0) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Unable to fetch comments at this time. Check back later.' }),
      };
    }

    const issues = await octokit.request('GET /repos/{owner}/{repo}/issues', 
      {      
        owner: `selfscrum`,
        repo: `kochessenz-ai`
      });

    const response = await octokit.rest.issues.listComments({
      owner: `selfscrum`,
      repo: `kochessenz-ai`,
      issue_number: issueNumber,
    });    
    
    console.log(issues);

    const comments = response.data
  // Show comments in chronological order (oldest comments first)
  .sort((comment1, comment2) => comment1.created_at.localeCompare(comment2.created_at))
  // Restructure the data so the client-side JS doesn't have to do this
  .map((comment) => {
    return {
      user: {
        avatarUrl: comment.user.avatar_url,
        name: sanitizeHtml(comment.user.login),
      },
      datePosted: dayjs(comment.created_at).format('DD MMM YYYY'),
      isEdited: comment.created_at !== comment.updated_at,
      isAuthor: comment.author_association === 'OWNER',
      body: sanitizeHtml(md.render(comment.body)),
    };
  });

return {
  statusCode: response.status,
  body: JSON.stringify({ data: comments }),
};


  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to fetch comments for this post.' }),
    }
  }
}