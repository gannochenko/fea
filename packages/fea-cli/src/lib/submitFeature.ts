import debug from 'debug';
import { getRemoteOrFail } from './utils';
import { RC } from './RC';
import { GitHub } from './GitHub';
import { getTemplate } from './template';
import { Git, GitBranchType } from './Git';

const d = debug('submitFeature');

export const submitFeature = async (git: Git, branch: GitBranchType) => {
    const remoteInfo = await getRemoteOrFail(git);
    const config = await RC.getConfig();

    const gitHub = new GitHub();
    let body = await getTemplate(gitHub, branch.description!);
    const options = {
        head: branch.name,
        ...remoteInfo,
        title: GitHub.composePRName(branch.description!),
        base: config.developmentBranch || undefined,
        draft: true, // todo: could be an option
        body,
    };

    d('POST /repos/{owner}/{repo}/pulls', options);

    const result = await gitHub.createPR(options);
    if (result.data.id) {
        d('Result', result.data);

        if (body.indexOf('#PR_NUMBER#') >= 0) {
            const prNumber = result.data.number;
            body = body.replace(/#PR_NUMBER#/g, prNumber.toString());
            // update the description
            await gitHub.updatePR(prNumber, {
                ...remoteInfo,
                body,
            });
        }

        // eslint-disable-next-line no-console
        console.log(`PR was created. Check out: ${result.data.html_url}`);
    }
};
