// const { someUtil } = require('../src/util');

expect.extend({
    toHaveEnoughMinerals(input, arg1, arg2) {
        return {
            pass: false,
            message: () => 'Not enough minerals',
        };
    },
});
