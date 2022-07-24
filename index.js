const express = require('express');
var cors = require('cors');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.use('/araosdevsm/login', require('./routes/login'));
app.use('/araosdevsm/gcp-apis', require('./routes/GoogleCloudRoutes/testApi'));
app.use('/araosdevsm/gcp-apis/timeline-images', require('./routes/GoogleCloudRoutes/getTimelineImg'));
app.use('/araosdevsm/createaccount', require('./routes/newAccount'));

app.listen(PORT, ()=>console.log(`Server running on ${PORT}`));

//https://medium.com/@olamilekan001/image-upload-with-google-cloud-storage-and-node-js-a1cf9baa1876