import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { execSync } from 'child_process';

// Get git commit hash
const getGitCommitHash = () => {
    try {
        return execSync('git rev-parse HEAD').toString().trim();
    } catch {
        return 'unknown';
    }
};

// Get package version
const packageJson = require('./package.json');

export default defineConfig({
    plugins: [
        react()
    ],
    define: {
        COMMITHASH: JSON.stringify(getGitCommitHash()),
        APP_VERSION: JSON.stringify(packageJson.version),
        global: 'globalThis',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@S': resolve(__dirname, './src/Slices'),
            '@assets': resolve(__dirname, './node_modules/@patternfly/react-core/dist/styles/assets'),
            '@images': resolve(__dirname, './public/images'),
            // Handle lodash-es to use CommonJS version
            'lodash-es': 'lodash',
            // Force rappid to use ESM version
            '@inmanta/rappid': resolve(__dirname, './node_modules/@inmanta/rappid/joint-plus.mjs'),
            // Handle CSS import with proper alias
            '@inmanta/rappid/joint-plus.css': resolve(__dirname, './node_modules/@inmanta/rappid/joint-plus.css'),
            // Force uuid to use CJS entry point
            'uuid': 'uuid',
            '@rappidcss': resolve(__dirname, 'node_modules/@inmanta/rappid/joint-plus.css'),
        },
    },
    server: {
        port: 9000,
        host: true,
        proxy: {
            '/api': {
                target: process.env.VITE_API_BASEURL || 'http://localhost:8888',
                changeOrigin: true,
                secure: false,
                configure: (proxy, options) => {
                    proxy.on('error', (err, req, res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, res) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            },
            '/lsm': {
                target: process.env.VITE_API_BASEURL || 'http://localhost:8888',
                changeOrigin: true,
                secure: false,
                configure: (proxy, options) => {
                    proxy.on('error', (err, req, res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, res) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            external: ['@inmanta/rappid'],
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    patternfly: ['@patternfly/react-core', '@patternfly/react-icons'],
                    monaco: ['@monaco-editor/react', 'monaco-editor'],
                },
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./test-setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'cobertura'],
            exclude: [
                'node_modules/',
                'dist/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/__mocks__/**',
                'cypress/**',
            ],
        },
        deps: {
            inline: [
                '@inmanta/rappid',
                'mermaid',
                'monaco-editor',
                '@monaco-editor/react',
                'graphql-request',
                '@patternfly/react-styles'
            ],
        },
        server: {
            deps: {
                inline: [
                    '@inmanta/rappid',
                    'mermaid',
                    'monaco-editor',
                    '@monaco-editor/react',
                    'graphql-request',
                    '@patternfly/react-styles'
                ],
            },
        },
        resolve: {
            alias: {
                'monaco-editor': resolve(__dirname, '__mocks__/monaco-editor.js'),
                '@patternfly/react-log-viewer': resolve(__dirname, '__mocks__/@patternfly/react-log-viewer/index.js'),
                '@patternfly/react-code-editor': resolve(__dirname, '__mocks__/@patternfly/react-code-editor.js'),
            },
        },
        css: {
            modules: {
                classNameStrategy: 'non-scoped',
            },
        },
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-dom/client',
            'monaco-editor',
            '@monaco-editor/react',
            'mermaid',
            '@inmanta/rappid',
            'graphql-request',
            '@patternfly/react-styles',
        ],
        exclude: [
            '@joint/core',
            '@tanstack/react-query',
        ],
        force: true,
    },
    ssr: {
        noExternal: [
            'monaco-editor',
            '@monaco-editor/react',
            'mermaid',
            '@inmanta/rappid',
        ],
    },
    worker: {
        format: 'es',
    },
    css: {
        devSourcemap: false,
    },
    esbuild: {
        target: 'es2020',
    },
} as UserConfig); 