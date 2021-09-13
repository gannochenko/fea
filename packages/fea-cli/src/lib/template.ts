import debug from 'debug';
import findUpAll from 'find-up-all';
import { promises } from 'fs';
import ejs from 'ejs';
import { GitHub } from './GitHub';
import { GitBranchDescriptionType } from './Git';

const d = debug('template');

const getDynamicTemplate = async () => {
    const files = await findUpAll('.github/PULL_REQUEST_TEMPLATE.ejs', {
        cwd: process.cwd(),
    });

    if (!files || !files[0]) {
        d('Dynamic template file not found');
        return '';
    }

    d(`Dynamic template file found: ${files[0]}`);
    return (await promises.readFile(files[0]).catch(() => '')).toString('utf8');
};

const getStaticTemplate = async () => {
    const files = await findUpAll('.github/PULL_REQUEST_TEMPLATE.md', {
        cwd: process.cwd(),
    });

    if (!files || !files[0]) {
        d('Static template file not found');
        return '';
    }

    d(`Static template file found: ${files[0]}`);
    return (await promises.readFile(files[0]).catch(() => '')).toString('utf8');
};

export const getTemplate = async (
    github: GitHub,
    description: GitBranchDescriptionType,
) => {
    let template = await getDynamicTemplate();
    if (template) {
        template = ejs.render(template, {
            ...description,
            ticketId: description.id,
        });
    } else {
        template = await getStaticTemplate();
    }

    const { id } = description;
    return template.replace(/#TICKET_ID#/g, id.length ? id : '000');
};
