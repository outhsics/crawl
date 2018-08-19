const nodemailer = require('nodemailer');
let logger = require('debug')('juejin:mail');
//设置发件人
let transporter = nodemailer.createTransport({
    service: 'qq',//服务
    port: 465,//端口号
    secureConnection: true,//使用加密连接
    auth: {
        user: '83687401@qq.com',//配置邮箱
        pass: 'gddqvytadxyncafg'//配置授权码，授权码需要在邮件客户端里生成
    }
});
//指定收件人

module.exports = function (to, title, href) {
    let mailOptions = {
        from: '83687401@qq.com',
        to,
        subject: '你订阅的标签有新的文章了',
        html: `<div>
          <a href="${href}">${title}</a>
        </div>`
    }
    return new Promise(function (resolve, reject) {
        transporter.sendMail(mailOptions, (err, info) => {
            logger(`发送邮件 发件人:83687401@qq.com,收件人: ${to}`, err, info);
            if (err) reject(err)
            else resolve(info);
        });
    });
}
