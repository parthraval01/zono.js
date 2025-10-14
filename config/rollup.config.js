import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
    // ESM
    {
        input: 'src/index.js',
        output: { file: 'dist/zono.esm.js', format: 'es', sourcemap: true },
        plugins: [resolve(), commonjs()]
    },
    // CJS
    {
        input: 'src/index.js',
        output: { file: 'dist/zono.cjs.js', format: 'cjs', sourcemap: true },
        plugins: [resolve(), commonjs()]
    },
    // UMD minified
    {
        input: 'src/index.js',
        output: { file: 'dist/zono.umd.min.js', name: 'Zono', format: 'umd', sourcemap: true },
        plugins: [resolve(), commonjs(), terser()]
    }
];
