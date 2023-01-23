var _ = require("lodash");
const { Octokit } = require("@octokit/core");
const { restEndpointMethods } = require("@octokit/plugin-rest-endpoint-methods");
const dayjs = require('dayjs');
var relativeTime = require('dayjs/plugin/relativeTime');

var md = require('markdown-it')();
const sanitizeHtml = require('sanitize-html');

exports.handler = async (event) => {
  const { lang, title } = event.queryStringParameters;


  try {
    const MyOctokit = Octokit.plugin(restEndpointMethods);
    const octokit = new MyOctokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN });
    const { data: rateLimitInfo } = await octokit.request('GET /rate_limit', {})
    const remainingCalls = rateLimitInfo.resources.core.remaining;
    console.log(`GitHub API requests remaining: ${remainingCalls}`);

    if (remainingCalls < 5) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Unable to fetch comments at this time. Check back later.' }),
      };
    }

    // get the issues of this repo
    const issues = await octokit.request('GET /repos/{owner}/{repo}/issues', 
      {      
        owner: process.env.COMMENTOWNER,
        repo: process.env.COMMENTREPO
      });

    // filter the right issue by post title
    const thisIssue = _.filter(issues.data, {"title" : lang + "." + title } );

    // error if more than one issue exists with the title name
    const issueKeys = Object.keys(thisIssue)

    if (issueKeys.length > 1) {
      console.error('\'' + title + '\' got more than one issue entries: ' + issueKeys.length)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Invalid issue entry.' }),
      }  
    }

    if (issueKeys.length === 0) {
      console.log ('returning:' + JSON.stringify({ error: 'Unable to fetch comments for this post.' }));
      return {
        statusCode: 204,
        body: JSON.stringify({ error: 'Unable to fetch comments for this post.' }),
      }  
    }

    const response = await octokit.rest.issues.listComments({
    owner: process.env.COMMENTOWNER,
    repo: process.env.COMMENTREPO,
    issue_number: thisIssue[0].number,
    });
    
    const comments = response.data
    // Show comments in chronological order (oldest comments first)
    .sort((comment1, comment2) => comment1.created_at.localeCompare(comment2.created_at))
    // Restructure the data so the client-side JS doesn't have to do this
    .map((comment) => {
        var payload = JSON.parse(comment.body)
        return {
          user: sanitizeHtml(payload.name),
          isAuthor: payload.name === process.env.COMMENTOWNER,
          datePosted: payload.created,
          body: sanitizeHtml(payload.message)
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