const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const users = {
    testuser: { password: 'testpass', token: null },
};

const posts = [];

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  console.log(username)
  if (users[username] && users[username].password === password) {
    // In a real application, use a more secure way to generate tokens
    const token = `${username}-token-${new Date().getTime()}`;
    users[username].token = token;
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

app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  const newPost = { id: posts.length + 1, title, content };
  posts.push(newPost);
  res.status(201).json(newPost);
});

app.put('/posts/:id', (req, res) => {
  const { title, content } = req.body;
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (post) {
    post.title = title;
    post.content = content;
    res.json(post);
  } else {
    res.status(404).send('Not Found');
  }
});

app.get('/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (post) {
    res.json(post);
  } else {
    res.status(404).send('Not Found');
  }
});

app.get('/posts', (req, res) => {
  res.json(posts);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
