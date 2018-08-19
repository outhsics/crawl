let request = require('request-promise');
let cheerio = require('cheerio');
let logger = require('debug')('juejin:read');
//读取标签的列表
async function tags(url) {
    logger('开始读取标签列表');
    let html = await request(url);
    let $ = cheerio.load(html);
    let infos = $('div.info-box');
    let tags = [];
    infos.each(function (index, item) {
        let that = $(item);
        let href = that.children('a').first().attr('href');//取出此标签的超链接 
        let image = that.find('div.lazy').first().data('src');//取出此标签对应的图片
        image = image.split('?')[0];
        let name = that.find('div.title').first().text();//取出标签的名称
        let subscribe = that.find('div.subscribe').first().text();
        let article = that.find('div.article').first().text();
        subscribe = parseInt(subscribe.match(/(\d+)/)[1]);
        article = parseInt(article.match(/(\d+)/)[1]);
        logger('读到标签:' + name);
        tags.push({
            url: `https://juejin.im${href}`,
            image,
            name,
            subscribe,
            article
        });
    });
    return tags.slice(0, 4);
}
//这里用来读取标签下面文章的列表
async function articles(url) {
    logger('开始读取标签下的文章列表');
    let html = await request(url);
    let $ = cheerio.load(html);
    let list = $('.info-row.title-row > a.title');
    let articles = [];
    for (let i = 0; i < 3; i++) {
        let _this = $(list[i]);
        let href = `https://juejin.im${_this.attr('href')}`;//取得超链接 /post/5b7652106fb9a009ac5589f2
        let lastSlashIndex = href.lastIndexOf('/');
        let id = href.slice(lastSlashIndex + 1);//提取此文章的ID
        let title = _this.text();
        let { content, tags } = await readArticle(id, href);
        logger('读取文章:' + title);
        articles.push({
            id,//从网站爬到的ID
            title,// 标题
            href,//超链接
            content,//文章的内容
            tags  //标签数组
        });
    }
    return articles;
}
//参数是文章的ID和文章的超链接，返回的是文章的内容和所拥有的标签的数组
async function readArticle(id, href) {
    let html = await request(href);
    let $ = cheerio.load(html);
    let content = $('.article-content').first().html();
    if (content)
        content = content.replace(/&#x(\w+?);/g, function (matched, point) {
            return String.fromCodePoint(`0x${point}`);
        });
    let tagTitles = $('.tag-title');
    let tags = [];
    tagTitles.each(function (index, item) {
        let _this = $(item);
        tags.push(_this.text());
    });
    return { content, tags };
}




//tags('https://juejin.im/subscribe/all').then(ret => console.log(ret))
//articles('https://juejin.im/tag/%E5%93%8D%E5%BA%94%E5%BC%8F%E8%AE%BE%E8%AE%A1').then(ret => console.log(ret))
//readArticle('5b7652106fb9a009ac5589f2', 'https://juejin.im/post/5b7652106fb9a009ac5589f2').then(ret => console.log(ret))
module.exports = {
    tags,
    articles
}