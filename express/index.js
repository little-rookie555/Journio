const express = require("express");
const cors = require('cors'); 
const userRouter = require('./router/index');
const app = express();
const send = require("./middlewares/send");
const joi = require('@hapi/joi');

// Middleware setup
app.use(express.json());
app.use(cors());  
app.use(send);

// Routes
app.use('/api', userRouter); 

// Error handling middleware should be last
app.use((err, req, res, next) => {
    if (err instanceof joi.ValidationError) return res.cc('参数验证失败：' + err.details[0].message)
    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
    res.send({
        status: 1,
        message: err instanceof Error ? err.message : err
    });
});

app.listen(5107, () => {
    console.log("Server is running on http://127.0.0.1:5107");
});