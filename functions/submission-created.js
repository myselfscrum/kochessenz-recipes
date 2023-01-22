var _ = require("lodash");
const { Octokit } = require("@octokit/core")
const { restEndpointMethods } = require("@octokit/plugin-rest-endpoint-methods");
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

exports.handler = async (event, context, callback) => {
  const payload = JSON.parse(event.body).payload
  console.log(event)
  console.log(context)
  console.log(payload.data)
  const { form, name, email, message, referrer, title, language } = payload.data

  // ignore other forms than new-comment
  if (form !== 'new-comment')
      return {
        statusCode: 406,
        body: 'Not Acceptable',
      };
  
  /*
  solution strategy: 

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
    const thisIssue = _.filter(issues.data, {"title" : language + "." + title } );
    console.log(thisIssue);

    // error if more than one issue exists with the title name
    const issueKeys = Object.keys(thisIssue)
    if (issueKeys.length > 1) {
      console.error('\'' + title + '\' got more than one issue entries: ' + issueKeys.length)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Invalid comment entry.' }),
      }  
    }

    // create comment data
    const commentPayload = { 
      created: dayjs().format('DD MMM YYYY'),
      name: name, 
      email: email, 
      message: message
    };

    // just add the comment if issue exists otherwise create new issue with comment text
    if (issueKeys.length === 0)
      {
        const newIssue = await octokit.request('POST /repos/{owner}/{repo}/issues', {
          owner: process.env.COMMENTOWNER,
          repo: process.env.COMMENTREPO,
          title: language + "." + title,
          body: JSON.stringify(commentPayload)
        })
      }
    else {
      const comment = await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
        owner: process.env.COMMENTOWNER,
        repo: process.env.COMMENTREPO,
        issue_number: thisIssue[0].number,
        body: JSON.stringify(commentPayload)
      })
    }

    return {
      statusCode: 201,
      body: 'Created',
    };
      
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to fetch comments for this post.' }),
    }
  }
}