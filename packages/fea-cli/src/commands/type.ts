import { Application } from '../lib/application';

export type CommandArgumentsType = Record<string, string>;

export interface CommandInstance {
    execute: () => Promise<void>;
}

export interface Command {
    new (
        application: Application,
        args: CommandArgumentsType,
        flags: CommandArgumentsType,
    ): CommandInstance;
    command: string;
    alias: string;
    description: string;
    options: [string, string][];
}

export function Implements<T>() {
    return <U extends T>(constructor: U) => {
        // eslint-disable-next-line no-unused-expressions
        constructor;
    };
}
