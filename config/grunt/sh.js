module.exports = {
    'build-es2018': {
        cmd: 'tsc -p src/tsconfig.json'
    },
    'build-es5': {
        cmd: 'rollup -c config/rollup/bundle.js'
    },
    'lint': {
        cmd: 'tslint --config config/tslint/src.json --project src/tsconfig.json src/*.ts src/**/*.ts'
    },
    'test-integration': {
        cmd: 'karma start config/karma/config-integration.js --single-run'
    },
    'test-unit': {
        cmd: 'karma start config/karma/config-unit.js --single-run'
    }
};
