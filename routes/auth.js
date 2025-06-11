const router = require('express').Router();

module.exports = function (mydb, ObjectId, sha) {
  router.get('/session', (req, res) => {
    if (isNaN(req.session.milk)) req.session.milk = 0;
    req.session.milk += 1000;
    res.send("session : " + req.session.milk + "원");
  });

  router.get('/login', (req, res) => {
    if (req.session.user) {
      res.render('index.ejs', { user: req.session.user });
    } else {
      res.render('login.ejs');
    }
  });

    router.post("/login", (req, res) => {
  mydb.collection("account")
    .findOne({ userid: req.body.userid })
    .then((result) => {
      if (result && result.userpw == sha(req.body.userpw)) {
        req.session.user = result;  // 🔥 DB에서 찾은 사용자 정보 전체를 세션에!
        console.log("새로운 로그인:", result);
        res.redirect("/");
      } else {
        res.render("login.ejs", { error: "아이디 또는 비밀번호가 틀립니다." });
      }
    });
});


  router.get('/logout', (req, res) => {
    req.session.destroy();
    res.render('index.ejs', { user: null });
  });

  router.get('/signup', (req, res) => {
    res.render('signup.ejs');
  });

  router.post('/signup', (req, res) => {
    mydb.collection('account').insertOne({
      userid: req.body.userid,
      userpw: sha(req.body.userpw),
      usergroup: req.body.usergroup,
      useremail: req.body.useremail
    }).then(() => {
      res.redirect('/');
    });
  });

  return router;
};
