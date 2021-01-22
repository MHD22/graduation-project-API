const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const classSchema = new Schema({
    teacher_id : {type:String , required:true},
    className: {type:String, required:true, unique:true},
    students: [{
        firstName: {type:String, required:true},
        lastName: {type:String, required:true},
        id_number : {type:String,required:true}
    

    }],
    history: [{
        date: String, students:Array , images:Array
    }]


}, {timestamps:true} );

const Class = mongoose.model('Class',classSchema);


module.exports = Class;