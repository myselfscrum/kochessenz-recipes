const { Octokit } = require("@octokit/core")
const { restEndpointMethods } = require("@octokit/plugin-rest-endpoint-methods");

export function connect() {
    var octokit 
    return new Promise(async (resolve, reject) => {

        try {
            const MyOctokit = Octokit.plugin(restEndpointMethods);
            octokit = new MyOctokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN });
            const { data: rateLimitInfo } = await octokit.request('GET /rate_limit', {})
            const remainingCalls = rateLimitInfo.resources.core.remaining;
            console.log(`GitHub API requests remaining: ${remainingCalls}`);

            if (remainingCalls === 0) {
                  throw new Error('Unable to fetch comments at this time. Check back later.')
            }
        } catch (error) {
            console.log(error);
            reject (error);
        } finally {
            const connectResponse = octokit
            console.log('bla')
            resolve(connectResponse)
        }
    })
};