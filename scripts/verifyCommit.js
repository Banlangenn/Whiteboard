// Invoked on the commit-msg git hook by yorkie.

// const chalk = require('chalk')
const msgPath = process.env.GIT_PARAMS
// eslint-disable-next-line @typescript-eslint/no-require-imports
const msg = require('fs')
    .readFileSync(msgPath, 'utf-8')
    .trim()
    // - feat ：新功能
    // - fix ：修复 bug
    // - chore ：对构建或者辅助工具的更改
    // - refactor ：既不是修复 bug 也不是添加新功能的代码更改
    // - style ：不影响代码含义的更改 (例如空格、格式化、少了分号)- docs ：只是文档的更改
    // - perf ：提高性能的代码更改
    // - revert ：撤回提交
    // - test ：添加或修正测试
const commitRE = /^(revert: )?(feat|fix|chore|style|refactor|perf|test|types|)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
    console.log()
    console.error(
        '请按照规范提交commit message, \n例如：git commit -m \'feat: add list\' \n具体规范请看：https://github.com/conventional-changelog/commitlint'
    )
    process.exit(1)
}