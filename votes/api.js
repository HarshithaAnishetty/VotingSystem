let express = require('express');
let votersModel = require("./model");
let router = express.Router();
let _ = require('underscore');

// let requiresBody = (req,res,next)=>{
//     if(req.body && _.isObject(req.body) && !_.isEmpty(req.body)){
//         next();
//     }else{
//         res.status(400).json({status:false,message:"Invalid or empty data",data:null});
//     }
// }

let castVote = (req, res) => {

    let body = req.body;

    return new Promise((resolve, reject) => {
        if (!_.isObject(body) || _.isEmpty(body)) reject("Invalid Data");
        else if (!body.candidate) reject("Please select candidate");
        else if(!body.voterId)reject("Please enter voterId");
        else resolve(null);
    }).then(() => {
        votersModel.findOneByValues({ voterId: body.voterId })
            .then(response => {
                if (response) {
                    res.status(409).json({ status: false, message: 'User already casted vote', data: null });
                    return;
                }
                votersModel.create(body)
                    .then((response) => {
                        let data = response.toJSON();
                        res.status(200).json({ status: true, message: 'User casted vote', data: data });
                    }).catch((err) => {                   
                        console.log(err);
                        res.status(500).json({ status: false, message: 'Internal server error', data: null });               
                    });
            }).catch(err => {
                console.log(err);
                res.status(500).json({ status: false, message: 'Internal server error', data: null });
            })
    }).catch((err) => {
        console.log(err);
        res.status(400).json({ status: false, message: err, data: null });
    });
};

let getVotersCount = (req, res) => {

    let limit = req.params.limit;
    let timestamp = req.params.timestamp;

    let options = {
        sort: { createdDate: -1 }
    };

    if (limit) options.limit = Number(limit);
    let findByQuery = {};
    let andQuery = [];
    
    if (timestamp) andQuery.push({ createdDate: { $lt: new Date(timestamp) } });

    if (req.body.candidate) andQuery.push({ candidate: req.body.candidate });

    if (andQuery.length > 0)
    findByQuery = { $and: andQuery };


    votersModel.findAllByValues(findByQuery, options)
        .then((response) => {
            let can1Data=[],can2Data=[],can3Data=[],totalData;
            response.forEach(vote=>{
                vote = vote.toJSON();
                if(vote.candidate=="can1"){
                    can1Data.push(vote);
                }else if(vote.candidate=="can2"){
                    can2Data.push(vote);
                }else{
                    can3Data.push(vote);
                }
            });
            totalData = {"Candidate1":can1Data.length,
                         "Candidate2":can2Data.length,
                         "Candidate3":can3Data.length}
            res.json({ status: true, message: 'Users data fetched', data: totalData });
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ status: false, message: 'Error', data: null });
        });
}


router.post('/vote',castVote);
router.get('/getCount/:limit?/:timestamp?',getVotersCount);

module.exports = router;