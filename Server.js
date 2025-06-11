const express = require('express');
const app = express();
const sha = require('sha256');
const multer = require('multer');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv').config();
const session = require('express-session');
const bodyParser = require('body-parser');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieParser('ncvka0e398423kpfd'));
app.use(session({
  secret: 'dkufe8938493j4e08349u',
  resave: false,
  saveUninitialized: true
}));

const url = process.env.DB_URL;
let mydb;

MongoClient.connect(url)
  .then((client) => {
    mydb = client.db("myboard");
    console.log("✅ DB 연결 성공");

    // 기능별 라우터 연결
    app.use('/', require('./routes/post.js')(mydb, ObjectId));
    app.use('/', require('./routes/add.js')(mydb, ObjectId));
    app.use('/', require('./routes/auth.js')(mydb, ObjectId, sha));

    // 루트 페이지
    app.get("/", (req, res) => {
      if (req.session.user) {
        res.render("index.ejs", { user: req.session.user });
      } else {
        res.render("index.ejs", { user: null });
      }
    });

    const port = 8080;
    app.listen(port, () => {
      console.log(`🌟 서버가 ${port}번 포트에서 실행 중입니다!`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB 연결 실패:", err);
  });