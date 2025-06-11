const router = require('express').Router();
const multer = require('multer');

module.exports = function (mydb, ObjectId) {
  let storage = multer.diskStorage({
    destination: (req, file, done) => {
      done(null, './public/image');
    },
    filename: (req, file, done) => {
      done(null, file.originalname);
    }
  });
  let upload = multer({ storage: storage });

  router.post('/save', upload.single('picture'), (req, res) => {
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.someDate);

    let imagepath = '';
    if (req.file) {
      imagepath = '/' + req.file.path.replace(/\\/g, '/'); // 경로 정리
    }

    mydb.collection('post').insertOne({
      title: req.body.title,
      content: req.body.content,
      date: req.body.someDate,
      path: imagepath
    }).then(() => {
      console.log('데이터 추가성공');
      res.redirect('/list');
    }).catch(err => {
      console.error(err);
      res.status(500).send('DB 저장 중 오류');
    });
  });

  router.post('/delete', (req, res) => {
    req.body._id = new ObjectId(req.body._id);
    mydb.collection('post').deleteOne(req.body)
      .then(() => {
        res.status(200).send();
      });
  });

  router.post('/edit', (req, res) => {
    req.body.id = new ObjectId(req.body.id);
    mydb.collection('post')
      .updateOne(
        { _id: req.body.id },
        { $set: { title: req.body.title, content: req.body.content, date: req.body.someDate } }
      )
      .then(() => {
        res.redirect('/list');
      });
  });

  return router;
};
