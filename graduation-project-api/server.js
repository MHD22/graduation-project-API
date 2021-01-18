'use strict';

//App dependencies:
const express = require('express');
const mongoose = require('mongoose');
const Teacher = require('./models/teacher');
const Student = require('./models/student');
const Class = require('./models/class');
const superagent = require('superagent');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();
const nodemailer = require('nodemailer');
const randomToken = require('random-token').create('1234567890');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(7);


// var hash = bcrypt.hashSync("mazen", salt);
// console.log(hash);
// let result = bcrypt.compareSync("mazen", hash);
// console.log(result);

//App setup:
const app = express();
const PORT = process.env.PORT || 3000;


//App middlewares :
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});
let upload = multer({ dest: 'uploads/' });
app.use(cors());


//routes
app.post('/createPerson', upload.array("image", 3), createPersonHandler);
app.post('/checkImage', upload.single('photo'), checkImageHandler)
app.get('/teacherClasses', teacherClassesHandler);
app.get('/checkStudent/:id', isStudentExist);
app.get('/checkTeacher/:id/:email', isTeacherExist);
app.post('/loginTeacher', loginTeacherHandler);
app.post('/teachers', teachersHandler);
app.post('/teacherRegister',teacherRegisterHandler);
app.get('/classes', getClassesHandler)
app.get('/classHistory/:className', classHistoryHandler)
app.post('/classes', postClassesHandler);
app.post("/history/:className", historyHandler);
app.get('/students', getStudentsHandler);
app.put('/editClass', editClassHandler);
app.delete('/deleteClass', deleteClassHandler);
app.get("/checkClass/:className", checkfoundclass)

//test
app.post('/email',(req,res)=>{
  

})

// App connections:
connectTheDataBase()
  .then(res => {
    runTheServer();
  })
  .catch(e => { console.log(e) });


//helper functions :

function checkfoundclass(req , res){
  let {className} = req.params;
  Class.find({className}, function (err, result) {
    if (err) {
      res.json("Found")
    } else {
      res.json(result.length != 0) ;
    }
  });
}

function deleteClassHandler(req,res){
  let {className} = req.body;
  Class.deleteOne({ className }, function (err) {
    if(err){
       console.log(" error while delete the class from DB..",e);
       res.json(" error while delete the class from DB..",e);
    }
    else{
      console.log("Successful deletion");
      res.json("Successful deletion");
    }
  });
}

function editClassHandler(req,res){
  let {className,students} = req.body;
  Class.find({ className: `${className}` }, function (err, result) {
    if (err) {
      res.status(404).send("Class not found ..!");
    }
    else {
      if(result.length){
        students=students.map(std=>{
          let id_number = std.id;
          let firstSpace = std.name.indexOf(' ');
          let firstName = std.name.slice(0,firstSpace);
          let lastName = std.name.slice(firstSpace+1);
          return {firstName, lastName, id_number};

        })
        result[0].students = students;
        result[0].save();
        res.json(result[0]);
      }
      else{
        res.json("Class Not Found !")
      }
    }
  })
}

function getStudentsHandler(req, res) {

  Student.find({}, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      result = result.map((std) => {
        // let st = `${std.firstName} ${std.lastName}  |  ${std.id_number}`;
        let st = {
          'fname': `${std.firstName}`,
          'lname': `${std.lastName}`,
          'id': `${std.id_number}`,
        }
        return st;
      });
      console.log(result);
      res.json(result);
    }
  });
}

function postClassesHandler(req, res) {
  const arrStudents = [];
  const idsArr = req.body.ids;
  const fnames = req.body.fnames;
  const lnames = req.body.lnames;

  for (let i = 0; i < idsArr.length; i++) {
    let obj = {
      firstName: fnames[i],
      lastName: lnames[i],
      id_number: idsArr[i]
    }
    arrStudents.push(obj);
  }

  const class1 = new Class({
    teacher_id: req.body.teacherID,
    className: req.body.className,
    students: arrStudents
  });
  class1.save().then(response => { res.json(response) }).catch(e => { res.status(400).json("error while saving the class data " + e) });
}

function getClassesHandler(req, res) {
  Class.find({}, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
}

function teachersHandler(req, res) {
  let { email, id_number } = req.body;
  console.log(email, id_number);
  superagent.get(`http://localhost:3000/checkTeacher/${id_number}/${email}`)
    .then(teachweResponse => {
      if (teachweResponse.body) {
        res.json("Teacher Is Already Exist.")
      }
      else {
        let token = randomToken(6);
        let hashedToken = bcrypt.hashSync(token, salt);
        sendTokenByEmail(email,token);
        res.json('token:'+hashedToken);

      }
    })
    .catch(e => { res.status(500).json("error within checking the teacher existance") });
    
}

function teacherRegisterHandler(req,res){
  let { firstName, email, lastName, id_number, password, hashedToken, token } = req.body;
  let isTokenMatch = bcrypt.compareSync(token, hashedToken);
  if(isTokenMatch){
    const newTeacher = new Teacher({ firstName, lastName, id_number, email, password });
        newTeacher.save()
        .then(response => { res.json("Teacher Added Successfully") })
        .catch(e => { res.status(400).json("error while saving the Teacher data " + e) });
  }
  else{
    res.status(222).json("Token is wrong.");
  }
}

function sendTokenByEmail(email, token){
  let flag = true;
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: 'class.image.app@gmail.com',
      pass: 'M123456789@'
    }
  });
  let options={
    from: 'class.image.app@gmail.com',
    to: email,
    subject: 'Account Varification.',
    text: `Your access token is:${token} `
  };
  transporter.sendMail(options,(err,info)=>{
    if(err){
      console.log(`error while sending the token.. ${err}`);
      flag= false;
    }
    else{
      console.log("sent: ", info.response);
      flag= true;
    }
  })

  return flag;
}

function loginTeacherHandler(req, res){
  Teacher.find({ id_number: req.body.id, password: req.body.password }, function (err, result) {
    if (err) {
      console.log(err, "error while fetching teacher");
    } else {
      res.json(result);
    }
  });
}

function teacherClassesHandler(req, res) {
  const id = req.query.id;
  Class.find({ teacher_id: `${id}` }, function (err, result) {
    if (err) {
      res.status(500).json("error while Getting Classes\n", err);
    } else {
      res.json(result);
    }
  });
}

function classHistoryHandler(req,res){
  let {className} = req.params;
  Class.find({className}, function (err, result) {
    if (err) {
      console.log("error during get class history data",err);
    } else {
      res.json(result[0]);
    }
  });
}

function historyHandler(req, res) {
  let className = req.params.className;
  Class.find({ className: `${className}` }, function (err, result) {
    if (err) {
      res.status(404).send("Class not found ..!");
    }
    else {
      let his = result[0].history;
      let date = new Date();
      let fullDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
      let { ids } = req.body;
      let { imgs } = req.body;
      let obj = {
        "date": fullDate,
        "students": ids,
        "images": imgs
      }
      his.push(obj) ;
      result[0].history = his ;
      result[0].save() ;
      console.log(his);
      res.json('Done');
    }
  })
  console.log(className);
}

function checkImageHandler(req, res) {
  let img = req.file;
  console.log(img);
  let data = new FormData();
  data.append('photo', fs.createReadStream(img.path));

  let config = {
    method: 'post',
    url: 'https://api.luxand.cloud/photo/search',
    headers: {
      'token': process.env.LUXAND_TOKEN,
      ...data.getHeaders()
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      console.log(response.data);
      res.json(response.data)
    })
    .catch(function (error) {
      console.log(error);
    });


}

function createPersonHandler(req, res) {

  let { studentData } = req.body;
  studentData = JSON.parse(studentData);
  let { firstName, id_number } = studentData;
  let stName = firstName + " | " + id_number;
  superagent.get(`http://localhost:3000/checkStudent/${id_number}`)
    .then(studentResponse => {
      if (studentResponse.body) {
        res.json("The Student Is Already Exist")
      }
      else {
        res.json("Student Is Added Successfuly")
        let file = [].concat(req.files);
        createPersonOnLuxand(stName, file)
          .then(result => {

            let personID = result.id;
            studentData.faceID = personID;
            console.log(stName);
            addFaceToPerson(file[1], personID)
              .then(data => {

                addFaceToPerson(file[2], personID)
                  .then(data => {

                    listFacesOfPerson(file[0], personID)
                      .then(result => {
                        let images = result.map(obj => obj.url);
                        studentData.images = images;
                        createStudentRecord(studentData)
                          .then()
                          .catch(e => { res.status(400).json("error while saving the student data in the DB " + e) });
                      })

                  })
              })

          })
          .catch(error => {
            console.log('error fetching (create person On API)', error);
            res.status(400).json("The student doesn't created successfully!!")
          })
      }
    })
    .catch(error => { res.status(400).json("error while check the student") })

}


function createPersonOnLuxand(stName, file) {


  let data = new FormData();
  data.append('name', stName);
  data.append('photo', fs.createReadStream(file[0].path));
  data.append('store', '1');

  let config = {
    method: 'post',
    url: 'https://api.luxand.cloud/subject/v2',
    headers: {
      'token': '0ed0d51e90cc4f3ab510a564cfb94b60',
      ...data.getHeaders()
    },
    data: data
  };

  return axios(config)
    .then(function (response) {
      return response.data;
    })


}


function addFaceToPerson(file, id) {

  let data = new FormData();
  data.append('photo', fs.createReadStream(file.path));

  let config = {
    method: 'post',
    url: `https://api.luxand.cloud/subject/${id}`,
    headers: {
      'token': process.env.LUXAND_TOKEN,
      ...data.getHeaders()
    },
    data: data
  };

  return axios(config)
    .then(function (response) {
      return response.data;
    })
    .catch(error => console.log('error within adding  face to the person ', error));

}


function listFacesOfPerson(file, id) {
  let data = new FormData();
  data.append('photo', fs.createReadStream(file.path));

  let config = {
    method: 'get',
    url: `https://api.luxand.cloud/subject/${id}`,
    headers: {
      'token': process.env.LUXAND_TOKEN,
      ...data.getHeaders()
    },
    data: data
  };

  return axios(config)
    .then(function (response) {
      return response.data;
    })
    .catch(error => console.log('error during listing the faces of person..', error));

}


function connectTheDataBase() {

  mongoose.set('useNewUrlParser', true);
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useUnifiedTopology', true);
  return mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}@university.5ijt6.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
}


function runTheServer() {

  app.listen(PORT, () => {
    console.log(`Listining on PORT: ${PORT}`)
  })

}


function createStudentRecord(studentData) {
  let { firstName, lastName, id_number, password, faceID, images } = studentData;
  const std1 = new Student({ firstName, lastName, id_number, password, faceID, images });
  return std1.save()
}

function isStudentExist(req, res) {
  let id = req.params.id;

  Student.find({ id_number: `${id}` }, function (err, result) {
    if (err) {
      res.status(404).send("error during check the student");
    }
    else {

      res.json(result.length > 0);
    }
  })

}
function isTeacherExist(req, res) {
  let {id,email} = req.params;

  Teacher.find({$or: [{id_number: `${id}`},{email:`${email}`}] }, function (err, result) {
    if (err) {
      res.status(404).send("error during check the teacher");
    }
    else {
      res.json(result.length > 0);
    }
  })

}