var _ = require("lodash");
const { Octokit } = require("@octokit/core")
const { restEndpointMethods } = require("@octokit/plugin-rest-endpoint-methods");
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

exports.handler = async (event, context, callback) => {
  const payload = JSON.parse(event.body).payload
  console.log(payload.data)
  const { firstname, lastname, email, message, referrer, title, url } = payload.data

  //  see "https://www.lindsaykwardell.com/blog/git-comment-system"

  /*
  get all issues ot the owner/repo
  find issue with referrer as title
  if not available
    create issue with referrer as title
  add comment to issue
  */

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
        owner: process.env.COMMENTOWNER,
        repo: process.env.COMMENTREPO
      });

    // filter the right issue by post title
    const thisIssue = _.filter(issues.data, {"title" : title } );
    console.log(thisIssue);

    const issueKeys = Object.keys(thisIssue)
    if (issueKeys.length > 1) {
      console.log('\'' + title + '\' got more than one entries: ' + issueKeys.Length)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Invalid comment entry.' }),
      }  
    }
      
    
    if (issueKeys.length === 0)
      {
        // create issue
      }

    console.log('Using issue id: ' + thisIssue[0].id )
    // create comment

    return {
      statusCode: 200,
      body: 'OK',
    };
      
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to fetch comments for this post.' }),
    }
  }
}