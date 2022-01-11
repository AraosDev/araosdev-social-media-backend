const express = require('express');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/araosdevsm/login', require('./routes/login'));

app.listen(PORT, ()=>console.log('Server running on 5000'));