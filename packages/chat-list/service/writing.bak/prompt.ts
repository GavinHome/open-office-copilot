// import optimize from './prompt/optimize.md'
// import contine_write from './prompt/contine_write.md';
// import summarize from './prompt/summarize.md'
// import make_longer from './prompt/make_longer.md'
// import make_shorter from './prompt/make_shorter.md'
// import make_titles from './prompt/make_titles.md'

// export default {
//     summarize,
//     optimize,
//     contine_write,
//     make_longer,
//     make_shorter,
//     make_titles
// } 

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

// 创建一个上下文，匹配 locales 目录下所有的 JSON 文件
// eslint-disable-next-line no-undef
function loadPromptAsync() {
    const context = require.context('./', true, /\.md$/);

    // 获取所有匹配的文件路径
    const keys = context.keys();
    const languageFiles = keys.reduce((pre, key: string) => {
        const content = context(key);
        if (key.endsWith('.md')) {
            const names = key.replace('./', '').replace('.md', '').split('/');
            const fileName = names[1];
            return {
                ...pre,
                [fileName]: content.default
            };
        }

    }, {});
    return languageFiles;
}

const prompts = loadPromptAsync();
export default prompts;
