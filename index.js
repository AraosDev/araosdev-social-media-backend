const express = require('express');
var cors = require('cors');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.use('/araosdevsm/login', require('./routes/login'));
app.use('/araosdevsm/createaccount', require('./routes/newAccount'));

app.listen(PORT, ()=>console.log('Server running on 5000'));