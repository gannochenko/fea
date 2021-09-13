// @ts-ignore
import findUpAll from 'find-up-all';
import debug from 'debug';

type RCType = {
    developmentBranch: string;
    releaseBranch: string;
    ticketIdPrefix: string;
    ticketViewURLTemplate?: string;
    releasePRName: string;
};

const d = debug('rc');

const defaultSettings = {
    developmentBranch: 'dev',
    releaseBranch: 'master',
    ticketIdPrefix: '',
    releasePRName: 'Next release',
};

export class RC {
    private static config?: RCType;

    public static async getConfig(): Promise<RCType> {
        if (!this.config) {
            const files = await findUpAll('.fearc', {
                cwd: process.cwd(),
            });

            d(files);

            if (!files || !files[0]) {
                return defaultSettings;
            }

            const [rcFile] = files;

            d(`RC file found at: ${rcFile}`);

            try {
                this.config = await import(rcFile);
            } catch (e: any) {
                console.error(
                    `Was not able to import the RC file located at: ${rcFile}: ${e.message}`,
                );
                d(e.stack);
                return defaultSettings;
            }
        }

        const config = { ...defaultSettings, ...this.config };
        d('Config', config);

        return config;
    }
}
