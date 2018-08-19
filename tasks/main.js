let debug = require('debug');
let logger = debug('juejin:main');
let sendMail = require('../mail');
let read = require('./read');
let write = require('./write');
let tagsUrl = 'https://juejin.im/subscribe/all';
(async function () {
    //1. 先读取所有的标签
    let tags = await read.tags(tagsUrl);
    //2. 把标签保存到数据库里
    await write.saveTags(tags);
    let allArticles = {};
    //3. 读取标签下面的文章
    for (let i = 0; i < tags.length; i++) {
        let tag = tags[i];
        let articles = await read.articles(tag.url);
        //这是为了去重，因为不同标签下面的文章可会有重复，所以说用ID来进行去重
        articles.forEach(item => {
            allArticles[item.id] = item;
        });
    }
    await write.saveArticles(Object.values(allArticles));
    //await sendMail('83687401@qq.com', '真的，移动端尺寸自适应与dpr无关', 'http://localhost:8080/detail/5b346e8f5188251e1d39bd09');
})().then(ret => {
    logger('全部任务执行完毕，进程退出');
    process.exit(0);
}, err => {
    logger('任务执行出错', err);
    process.exit(1);
});