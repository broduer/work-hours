import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { run } from 'vite-plugin-run';

const lactPreBuild = () => ({
    name: 'lact-pre-build',
    buildStart() {
        execSync('php vendor/bin/lact', { stdio: 'inherit' });
    },
});

const lactWindowsFix = () => ({
    name: 'lact-windows-fix',
    enforce: 'pre' as const,
    resolveId(id: string) {
        // lact v1.2.2 uses PHP's DIRECTORY_SEPARATOR when generating import paths.
        // On Windows, DIRECTORY_SEPARATOR is '\', producing an invalid path:
        //   import { route } from '/vendor/.../actions\routes'
        // During dev the id arrives as a root-relative path; during production
        // builds Rollup resolves it to an absolute path first. Handle both forms.
        const normalized = id.replace(/\\/g, '/');
        if (
            normalized === '/vendor/msamgan/lact/resources/actions/routes' ||
            normalized.endsWith('/vendor/msamgan/lact/resources/actions/routes')
        ) {
            return resolve(__dirname, 'vendor/msamgan/lact/resources/actions/routes.js');
        }

        return null;
    },
});

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        run([
            {
                name: 'lact',
                build: false,
                run: ['php', 'artisan', 'lact:run'],
                pattern: ['routes/**/*.php', 'app/**/Http/Controllers/**/*.php'],
            },
        ]),
        lactPreBuild(),
        lactWindowsFix(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
            '@actions': resolve(__dirname, 'vendor/msamgan/lact/resources/actions'),
            '@': resolve(__dirname, 'resources/js'),
        },
    },
});
