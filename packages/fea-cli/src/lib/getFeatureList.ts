import { Git, GitBranchDescriptionType } from './Git';
import { RC } from './RC';

type FeatureListElementType = {
    name: string;
    value: string;
    branchName: string;
    description: GitBranchDescriptionType;
};

export const getFeatureList = async () => {
    const git = new Git();

    const config = await RC.getConfig();

    const { developmentBranch, releaseBranch } = config;

    const list = await git.getBranches();
    const result: FeatureListElementType[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const branchItem of list) {
        if (branchItem !== developmentBranch && branchItem !== releaseBranch) {
            try {
                // eslint-disable-next-line no-await-in-loop
                const info = await git.getBranchInfo(branchItem);
                if (info && info.description) {
                    result.push({
                        name: `${Git.composeCommitMessage(
                            info.description,
                            undefined,
                        )} (${info.name})`,
                        value: branchItem,
                        branchName: info.name,
                        description: info.description,
                    });
                }
            } catch (e) {}
        }
    }

    return result;
};
