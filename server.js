const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { exec, spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'MyNewPass',
  database: 'miniUser'
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});

// 회원가입 엔드포인트
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    const user = { username, password: hash, coin: 0 };

    db.query('INSERT INTO users SET ?', user, (err, result) => {
      if (err) {
        return res.status(500).send('Database error');
      }
      res.status(201).send('Sign Up Complete');
    });
  });
});

// 로그인 엔드포인트
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      return res.status(500).send('Database error');
    }

    if (results.length === 0) {
      return res.status(401).send('Invalid username or password');
    }

    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (err) {
        console.error('bcrypt compare error:', err);
        return res.status(500).send('Server error');
      }

      if (isMatch) {
        res.status(200).send({
          message: 'Login successful',
          userData: {
            username: results[0].username,
            coin: results[0].coin
          }
        });
      } else {
        console.log('Password mismatch for user:', username);
        res.status(401).send('Invalid username or password');
      }
    });
  });
});



// Python 크롤링 스크립트를 실행하는 엔드포인트
app.post('/scrape', (req, res) => {
  const { manufacturer, model, subModel } = req.body;

  const command = `python encar.py "${manufacturer}" "${model}" "${subModel}"`; // Python 스크립트에 인자 전달

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return res.status(500).send('Error during scraping');
    }

    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
      return res.status(500).send('Error during scraping');
    }

    console.log(`Script output: ${stdout}`);
    res.send('Scraping completed successfully');
  });
});

// 엑셀 데이터를 읽어오는 엔드포인트
app.get('/cars', (req, res) => {
  const pythonProcess = spawn('python', ['read_excel.py']); // 엑셀 파일을 읽는 Python 스크립트 실행

  let data = ''; // 데이터를 저장할 변수 초기화

  pythonProcess.stdout.on('data', (chunk) => {
    data += chunk; // 데이터를 청크로 수신
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error executing script: ${data}`);
    res.status(500).send('Error during data fetching');
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) { // 프로세스가 성공적으로 종료되었을 때
      try {
        const carData = JSON.parse(data); // JSON 파싱 시도
        res.json(carData); // JSON 데이터를 클라이언트에 전송
      } catch (error) {
        console.error('JSON parsing error:', error.message);
        res.status(500).send('Error parsing JSON data');
      }
    } else {
      console.error(`Python script exited with code ${code}`);
      res.status(500).send('Python script failed');
    }
  });
});

// 서버 시작
app.listen(3001, () => {
  console.log('Server started on port 3001');
});