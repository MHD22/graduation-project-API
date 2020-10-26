const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const studentSchema = new Schema({
    firstName: {type:String , required: true},
    lastName: {type:String,required :true},
    id_number: {type:String , required:true , unique:true},
    password: {type: String, required:true},
    faceID: {type:String , required:true , unique:true},
    images: Array
}, {timestamps:true} );

const Student = mongoose.model('Student',studentSchema);


module.exports = Student;