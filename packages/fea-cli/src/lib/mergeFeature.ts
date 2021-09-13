import inquirer from 'inquirer';
import debug from 'debug';
import { GitHub } from './GitHub';
import { Git, GitBranchType } from './Git';
import { RC } from './RC';
import { getRemoteOrFail } from './utils';

const d = debug('mergeFeature');

type MergeFeaturePropsType = {
    doCheckoutToDev?: boolean;
};

export const mergeFeature = async (
    git: Git,
    branch: GitBranchType,
    { doCheckoutToDev }: MergeFeaturePropsType,
) => {
    const github = new GitHub();
    const config = await RC.getConfig();
    const remoteInfo = await getRemoteOrFail(git);

    const pr = await github.getPRByBranch(
        branch.name,
        config.developmentBranch,
        remoteInfo,
    );

    d('PR list', pr);

    if (!pr) {
        console.error(
            `No PR found for the current feature branch "${branch.name}"`,
        );
        console.error('Make one either on site or via "fea submit".');
        return;
    }

    const prURL = pr.html_url;

    // https://docs.github.com/en/free-pro-team@latest/graphql/reference/enums

    if (pr.draft) {
        console.error(
            `The pull request is in the draft state, can't merge. Un-draft it first: ${prURL}`,
        );
        return;
    }

    if (pr.state !== 'open') {
        console.error(`The pull request was closed, can't merge: ${prURL}`);
        return;
    }

    if (pr.locked) {
        console.error(`The pull request is locked, can't merge: ${prURL}`);
        return;
    }

    if (pr.merged) {
        console.error(`The pull request was already merged: ${prURL}`);
        return;
    }

    if (pr.mergeable_state !== 'clean') {
        if (pr.mergeable_state === 'unstable') {
            console.error(
                `The pull request checks not passed, can't merge: ${prURL}`,
            );
        } else {
            console.error(`The pull can't be merged: ${prURL}`);
        }
        return;
    }

    // eslint-disable-next-line no-console
    console.log(
        'Maybe you wish to change the message of the PR, to make it prettier for the CHANGELOG.',
    );
    // eslint-disable-next-line no-console
    console.log('Careful, this message could be seen by thousands of people!');
    // eslint-disable-next-line no-console
    console.log(`Current message: ${branch.description!.title}`);
    const answers = (await inquirer.prompt([
        {
            message: 'Alternative message would be:',
            name: 'title',
        },
    ])) as {
        title: string;
    };

    const newDescription = {
        ...branch.description!,
        title: answers.title || branch.description!.title,
    };

    const result = await github.mergePR({
        ...remoteInfo,
        pull_number: pr.number,
        commit_title: Git.composeCommitMessage(newDescription, pr.number),
    });

    if (result.status === 200) {
        // eslint-disable-next-line no-console
        console.log(`The feature PR #${pr.number} was successfully merged.`);

        const devBranch = config.developmentBranch;

        if (doCheckoutToDev) {
            await git.checkout(devBranch);
        }
        await git.deleteBranch(branch.name);
        if (doCheckoutToDev) {
            await git.pull(devBranch);
        }
    }
};
