const { Octokit } = require("@octokit/core")
const { restEndpointMethods } = require("@octokit/plugin-rest-endpoint-methods");
const MyOctokit = Octokit.plugin(restEndpointMethods);

const octokit = new MyOctokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN });

const rateLimitInfo = async() => {
    await octokit.request('GET /rate_limit', {})
    const remainingCalls = rateLimitInfo.resources.core.remaining;
    console.log(`GitHub API requests remaining: ${remainingCalls}`);

    if (remainingCalls === 0) {
        throw new Error('Unable to fetch comments at this time. Check back later.')
    }
}

module.exports = octokit