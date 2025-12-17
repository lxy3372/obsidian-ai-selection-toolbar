import tseslint from 'typescript-eslint';
import obsidianmd from 'eslint-plugin-obsidianmd';
import globals from 'globals';

export default tseslint.config(
    {
        ignores: ['main.js', 'node_modules/**', '*.config.mjs', 'dist/**']
    },
    ...tseslint.configs.recommended,
    ...obsidianmd.configs.recommended,
    {
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: true,
                sourceType: 'module'
            },
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        rules: {
            // TypeScript 规则
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { 
                args: 'none',
                varsIgnorePattern: '^_',
                argsIgnorePattern: '^_'
            }],
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unsafe-assignment': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'warn',
            '@typescript-eslint/no-unsafe-call': 'warn',
            '@typescript-eslint/no-unsafe-return': 'warn',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-misused-promises': 'warn',
            
            // 通用规则
            'no-prototype-builtins': 'off',
            'no-undef': 'off', // TypeScript 已经处理
            
            // Obsidian 特定规则
            'obsidianmd/prefer-file-manager-trash-file': 'error',
            'obsidianmd/no-static-styles-assignment': 'warn',
            'obsidianmd/settings-tab/no-manual-html-headings': 'warn',
            'obsidianmd/ui/sentence-case': 'warn',
            
            // 导入规则
            'import/no-extraneous-dependencies': ['error', {
                devDependencies: true,
                peerDependencies: true
            }]
        }
    }
);
