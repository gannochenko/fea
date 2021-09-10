import execa from 'execa';
import { TextConverter } from './TextConverter';

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
