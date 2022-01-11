const express = require('express');
const mongojs = require('mongojs');
const router = express.Router();

const url = 'mongodb://localhost:27017/araosDevSM';
const db = mongojs(url, ['users']);

router.post('/', (req, res)=>{
    const userName = req.body.username;
    const password = req.body.password;
    let verified = false;
    db.users.find((error, documents)=>{
        if(error) {
            res.json({status: 400, credentialsVerified: 'FAILED'})
        }
        else{
            documents.map(doc=>{
                if(doc.userName === userName && doc.password === password){
                    const { userName, email, phoneNumber } = doc;
                    res.json({status: 200, credentialsVerified: 'OK', details: { userName, email, phoneNumber }});
                    verified = true;
                }
            });
            if(!verified) res.json({status: 400, credentialsVerified: 'FAILED'});
        }
    })
});

module.exports = router;