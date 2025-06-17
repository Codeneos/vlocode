import { rollup } from '../../scripts/rollup.mjs';

export default rollup({
    input: {
        'sass-compiler': 'src/bin.ts',
        index: 'src/index.ts'
    }
});