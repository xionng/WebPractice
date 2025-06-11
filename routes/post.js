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

  // 🔥 /enter 페이지 렌더링
  router.get('/enter', (req, res) => {
    res.render('enter.ejs');
  });

  // 🔥 /list 페이지 렌더링
  router.get('/list', (req, res) => {
    mydb.collection('post').find().toArray()
      .then(result => {
        res.render('list.ejs', { data: result });
      });
  });

  // 🔥 /content/:id 페이지 렌더링
  router.get('/content/:id', (req, res) => {
    req.params.id = new ObjectId(req.params.id);
    mydb.collection('post').findOne({ _id: req.params.id })
      .then(result => {
        res.render('content.ejs', { data: result });
      });
  });

  // 🔥 /save: AJAX로 업로드된 파일 경로 포함 저장
  router.post('/save', (req, res) => {
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.someDate);
    console.log(req.body.uploadedPath); // AJAX 첨부된 파일 경로

    mydb.collection('post').insertOne({
      title: req.body.title,
      content: req.body.content,
      date: req.body.someDate,
      path: req.body.uploadedPath || '' // AJAX 업로드된 파일 경로
    }).then(() => {
      console.log('데이터 추가성공');
      res.redirect('/list');
    }).catch(err => {
      console.error(err);
      res.status(500).send('DB 저장 중 오류');
    });
  });

  // 🔥 /photo: AJAX 파일 업로드 전용
  router.post('/photo', upload.single('picture'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }
    console.log(req.file);
    res.json({
      message: '사진 업로드 완료!',
      path: '/image/' + req.file.originalname
    });
  });

  // 🔥 /delete: 게시물 삭제
  router.post('/delete', (req, res) => {
    req.body._id = new ObjectId(req.body._id);
    mydb.collection('post').deleteOne(req.body)
      .then(() => {
        res.status(200).send();
      });
  });

  // 🔥 /edit: 게시물 수정
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

  // 🔥 /search: 검색 기능
  router.get('/search', (req, res) => {
    const searchValue = req.query.value;
    console.log('검색어:', searchValue);

    mydb.collection('post').find({ title: { $regex: searchValue, $options: 'i' } }).toArray()
      .then(result => {
        res.render('list.ejs', { data: result });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('검색 오류');
      });
  });

  return router;
};
