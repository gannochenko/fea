import caseFormatter from 'case-formatter';

export class TextConverter {
    public static toKebab(value: string) {
        let result = caseFormatter.snakeToKebab(this.toSnake(value));
        if (typeof result === 'string') {
            result = result.replace(/^-+/, '');
        }

        return result;
    }

    public static toKebabSpecial(value: string) {
        return value.toLowerCase().trim().replace(/\s+/g, '-');
    }

    public static toPascal(value: string) {
        return caseFormatter.snakeToPascal(this.toSnake(value));
    }

    public static uCFirst(value: string) {
        return `${value.substr(0, 1).toUpperCase()}${value.substr(
            1,
            value.length - 1,
        )}`;
    }

    public static lCFirst(value: string) {
        return `${value.substr(0, 1).toLowerCase()}${value.substr(
            1,
            value.length - 1,
        )}`;
    }

    private static toSnake(value: string) {
        return value.replace(/[-\s]+/g, '_');
    }
}
