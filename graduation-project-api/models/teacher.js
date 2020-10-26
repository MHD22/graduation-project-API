const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const teacherSchema = new Schema({
    firstName: {type:String , required: true},
    lastName: {type:String,required :true},
    id_number: {type:String , required:true , unique:true},
    password: {type: String, required:true},
}, {timestamps:true} );

const Teacher = mongoose.model('Teacher',teacherSchema);


module.exports = Teacher;