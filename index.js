const express = require('express');
const morgan = require('morgan');
const {createProxyMiddleware} = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();

const limiter = rateLimit({
    windowMs: 2* 60 * 1000,
    max: 5
})
 
const PORT = 3005;

app.use(morgan('combined'));
app.use(limiter);

app.use('/bookingService', async (req, res, next) => {
    console.log(req.headers['x-access-token']);
    try {
        const response = await axios.get('http://localhost:3001/api/v1/isAuthenticated', {
        headers: {
            'x-access-token': req.headers['x-access-token'],
        }
        })
        if(response.data.success) {
            next();
        } else {
            return res.status(401).json({
                message: "UnAuthorized"
            })
        }   
    } catch (error) {
        throw error;
    }
})
app.use('/bookingService', createProxyMiddleware({target:'http://localhost:3002', changeOrigin: true}))

app.get('/home', (req, res) => {
    return res.json({message: "OK"});
})

app.listen(PORT, () => {
    console.log("Server started on Port", PORT);
}) 