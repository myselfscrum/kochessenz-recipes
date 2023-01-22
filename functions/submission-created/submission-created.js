const github = require('./utils/githubconnect')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

exports.handler = (event, context, callback) => {
  const payload = JSON.parse(event.body).payload
  console.log(payload.data)
  const { firstname, lastname, email, message, referrer, title, url } = payload.data
  console.log (firstname)
  console.log (lastname)
  console.log (email)
  console.log (message)
  console.log (referrer)
  console.log (title)
  console.log (url)


  //  see "https://www.lindsaykwardell.com/blog/git-comment-system"

  /*
  get all issues ot the owner/repo
  find issue with referrer as title
  if not available
    create issue with referrer as title
  add comment to issue
  */

  try {
    gh = await github.connect();

    const issues = await gh.request('GET /repos/{owner}/{repo}/issues', 
      {      
        owner: `selfscrum`,
        repo: `kochessenz-ai`
      });

      console.log(issues);

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