// server.js
const express = require('express');
const app = express();
app.use(express.static('./dist')); // ← 托管静态文件
app.listen(8082);