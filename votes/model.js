let mongoose = require("mongoose");

let voterSchema = new mongoose.Schema({
    voters:Number,
    candidate:{type:String,enum: ['can1', 'can2', 'can3']},
    voterId:String,
    votersCount:Number,
    createdDate: { type: Date, default: Date.now }
});


let votersSchema = mongoose.model("voters",voterSchema);

let create = function(values){
    return votersSchema.create(values);
};

let findOneByValues = function (values) {
    return votersSchema.findOne(values).exec();
}

let findAllByValues = function(values,options){
    return votersSchema.find(values, [], options).exec();
}

module.exports = {
    create,
    findOneByValues,
    findAllByValues
};