var md5 = require('md5');
var db_user = require('../db/users');
var db_words = require('../db/words');

//---------------------------------------------signup page call------------------------------------------------------
exports.signup = function (req, res) {
    if (req.method == "POST") {
        var post = req.body;

        var username = post.user_name;
        var email = post.email;
        var password = md5(post.password);

        db_user.signup(username, email, password, function() {
            res.redirect('/login');
        });
    } else {
        res.render('signup.ejs', { message: "" });
    }
};

//-----------------------------------------------login page call------------------------------------------------------
exports.login = function (req, res) {
    if (req.method == "POST") {
        var post = req.body;
        var username = post.user_name;
        var password = md5(post.password);

        // console.log(username);
        // console.log(password);
        db_user.verify_user(username, password, function (user) {
            req.session.user = user;
            console.log(user.id);
            res.redirect('/home/dashboard');
        }, function () {
            var message = '用户名或密码错误';
            res.render('index.ejs', { message: message });
        });
    } else {
        res.render('index.ejs', { message: '' });
    }

};
//-----------------------------------------------dashboard page functionality----------------------------------------------

exports.dashboard = function (req, res, next) {
    if (req.session.user === undefined) {
        res.redirect('/login');
        return;
    }
    var user = req.session.user;

    db_words.summary_today(user.id, function (learnt_today, reviewed_today) {
        // console.log(learnt_today);
        // console.log(reviewed_today);
        res.render('dashboard.ejs', {
            user: user,
            learnt_today: learnt_today ? learnt_today : 0,
            reviewed_today: reviewed_today ? reviewed_today : 0,
        });
    });
    // res.render('dashboard.ejs', { user: user });
    // db_user.get_user(user_id, function (user) {
    //     res.render('dashboard.ejs', { user: user });
    // });
};
//------------------------------------logout functionality----------------------------------------------
exports.logout = function (req, res) {
    req.session.destroy(function (err) {
        res.redirect("/login");
        return;
    })
};
//--------------------------------render user details after login--------------------------------
exports.profile = function (req, res) {
    if (req.session.user === undefined) {
        res.redirect('/login');
        return;
    }
    var user = req.session.user;
    // var userId = req.session.userId;

    res.render('profile.ejs', { user: user });
    // var sql = "SELECT * FROM `users` WHERE `id`='" + userId + "'";
    // db.query(sql, function (err, result) {
    //     res.render('profile.ejs', { data: result });
    // });
};
//---------------------------------edit users details after login----------------------------------
exports.editprofile = function (req, res) {
    if (req.session.user === undefined) {
        res.redirect('/login');
        return;
    }
    var user = req.session.user;

    res.render('edit_profile.ejs', { user: user });
    // var sql = "SELECT * FROM `users` WHERE `id`='" + userId + "'";
    // db.query(sql, function (err, results) {
    //     res.render('edit_profile.ejs', { data: results });
    // });
};

exports.check_username = function (req, res) {
    db_user.check_exists(req.query.user_name,
        () => res.status('500').end(),
        () => res.status('200').end()
    );
}