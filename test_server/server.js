const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const users = {
    testuser: { password: 'testpass', token: null },
};

const posts = [];

function sleepRandom() {
  return new Promise(resolve => {
      const timeToSleep = Math.random() * (10 - 2) + 2;
      setTimeout(resolve, timeToSleep * 1000);
  });
}

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username].password === password) {
    // In a real application, use a more secure way to generate tokens
    const token = `${username}-token-${new Date().getTime()}`;
    users[username].token = token;
    await sleepRandom()
    res.json({ token });
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = Object.values(users).find(user => user.token === token);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(403).send('Forbidden');
  }
});

app.post('/posts', async (req, res) => {
  const { title, content } = req.body;
  const newPost = { id: posts.length + 1, title, content };
  posts.push(newPost);
  await sleepRandom()
  res.status(201).json(newPost);
});

app.put('/posts/:id', async (req, res) => {
  const { title, content } = req.body;
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (post) {
    post.title = title;
    post.content = content;
    await sleepRandom()
    res.json(post);
  } else {
    res.status(404).send('Not Found');
  }
});

app.get('/posts/:id', async (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (post) {
    await sleepRandom()
    res.json(post);
  } else {
    res.status(404).send('Not Found');
  }
});

app.get('/posts', async (req, res) => {
  await sleepRandom()
  res.json(posts);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
