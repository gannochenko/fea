import debug from 'debug';
import execa from 'execa';
import { TextConverter } from './TextConverter';
import { Git } from './Git';

const d = debug('utils');

export const sanitizeString = (value: string) =>
    TextConverter.toKebabSpecial(value)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '');

export const isCommandAvailable = async (cmd: string) => {
    const cmdParts = cmd.trim().split(' ');
    if (!cmdParts.length) {
        return false;
    }

    const file = cmdParts.shift();
    return execa(file!, cmdParts, {
        stdio: 'ignore',
    })
        .then(() => true)
        .catch((e) => {
            // @ts-ignore
            return e.code !== 'ENOENT';
        });
};

export const getBranchOrFail = async (git: Git) => {
    const branch = await git.getCurrentBranch();

    if (!branch || !branch.description) {
        throw new Error(
            'Unable to obtain current branch description. Are you in the git repo folder? Was your branch created by gbelt?',
        );
    }

    d('Branch info', branch);

    return branch;
};

export const getRemoteOrFail = async (git: Git) => {
    const remoteInfo = await git.getRemoteInfo();

    if (!remoteInfo) {
        throw new Error(
            'Unable to read the remote endpoint info. Are you in the git repo folder? Does you repo have a remote?',
        );
    }

    d('Remote info', remoteInfo);

    return remoteInfo;
};
