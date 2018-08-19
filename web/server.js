const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const { query } = require('../mysql');
const { search } = require('../search');
const app = express();
function common(req, res, next) {
    //res.locals是约定一个变量，它默认会用来渲染模板
    res.locals.user = req.session.user;
    next();
}
function mustLogin(req, res, next) {
    if (req.session.user) {//如果说会话中有此用户的话 
        next();
    } else {
        res.redirect('/login')
    }
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    secret: 'zfpx',
    saveUninitialized: true
}));
app.use(common);
app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, 'views'));
app.engine('html', require('ejs').__express);
app.get('/', async function (req, res) {
    let { tagId } = req.query;// ?tagId=1
    let tags = await query(`SELECT * FROM tags`);
    if (!tagId) {
        tagId = tags[0].id;
    }
    let articles = await query(`SELECT articles.* FROM article_tag at INNER JOIN articles on at.article_id = articles.id WHERE at.tag_id=? `, [tagId]);
    res.render('index', { title: '主页', tags, articles });
});
app.get('/detail/:id', async function (req, res) {
    let id = req.params.id;
    let articles = await query(`SELECT * FROM articles WHERE id =?`, [id]);
    res.render('detail', { title: '文章详情', article: articles[0] });
});
app.get('/search', async function (req, res) {
    res.render('search', { title: '搜索' });
});
app.post('/search', async function (req, res) {
    let { keyword } = req.body;
    let result = await search(keyword);
    console.log(result.hits.hits);
    res.render('result', { title: '搜索结果', articles: result.hits.hits });
});
app.get('/login', async function (req, res) {
    res.render('login', { title: '登录' });
});
app.post('/login', async function (req, res) {
    let { email } = req.body;
    let oldUsers = await query(`SELECT * FROM users WHERE email=?`, [email]);
    if (Array.isArray(oldUsers) && oldUsers.length > 0) {
        req.session.user = oldUsers[0];
        res.redirect('/');
    } else {
        let result = await query(`INSERT INTO users(email) VALUES(?)`, [email]);
        req.session.user = {
            id: result.insertId,
            email
        }
        res.redirect('/');
    }
});
app.get('/subscribe', mustLogin, async function (req, res) {
    let tags = await query(`SELECT * FROM tags`);
    let user = req.session.user;//{id,name}
    let selectedTags = await query(`SELECT tag_id from user_tag WHERE user_id = ?`, [user.id]);
    let selectTagIds = selectedTags.map(item => item['tag_id']);
    tags.forEach(item => {
        item.checked = selectTagIds.indexOf(item.id) != -1 ? 'true' : 'false';
    });
    res.render('subscribe', { title: '请订阅你感兴趣的标签', tags });
});
app.post('/subscribe', mustLogin, async function (req, res) {
    let { tags } = req.body;//[ '1', '2', '9' ] }
    console.log(tags);
    let user = req.session.user;//{id,name}
    await query(`DELETE FROM user_tag WHERE user_id=?`, [user.id]);
    for (let i = 0; i < tags.length; i++) {
        if (!isNaN(tags[i])) {
            await query(`INSERT INTO user_tag(user_id,tag_id) VALUES(?,?)`, [user.id, parseInt(tags[i])])
        }
    }
    res.redirect('/');
});
app.listen(8080);

let CronJob = require('cron').CronJob;
let { spawn } = require('child_process');
// ..../node ../tasks/main.js
let job = new CronJob("0 0 * * * *", function () {
    let child = spawn(process.execPath, [path.resolve(__dirname, '../tasks/main.js')]);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
});
job.start();