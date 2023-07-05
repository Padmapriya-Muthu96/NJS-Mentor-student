const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { dbUrl } = require('./config/dbconfig');

const app = express();
app.use(bodyParser.json());

//  Connect to MongoDB
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});

//  Create Mentor and Student models

// mentor model
const mentorSchema = new mongoose.Schema({
  name: String,
  email: String,
  id: String,
  
});
const Mentor = mongoose.model('Mentor', mentorSchema);

//student model
const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  id: String,
  batch: String,
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', default: null },
});
const Student = mongoose.model('Student', studentSchema);

// API to create mentors and students

//API for mentors

app.post('/mentors', (req, res) => {
  const mentorData = req.body;
  Mentor.create(mentorData)
    .then((mentor) => {
      res.status(201).json(mentor);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Unable to create mentor.' });
    });
});

app.post('/students', (req, res) => {
  const studentData = req.body;
  Student.create(studentData)
    .then((student) => {
      res.status(201).json(student);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Unable to create student.' });
    });
});

//  API to assign a student to a mentor
app.post('/students/:studentId/assign-mentor/:mentorId', (req, res) => {
  const { studentId, mentorId } = req.params;

  Mentor.findById(mentorId)
    .then((mentor) => {
      if (!mentor) {
        throw new Error('Mentor not found.');
      }
      return Student.findByIdAndUpdate(
        studentId,
        { mentor: mentorId },
        
        { new: true }
      );
    })
    .then((student) => {
      res.status(200).json(student);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Unable to assign mentor.' });
    });
    
});

// Step 5: Write an API to assign or change a mentor for a particular student
app.post('/students/:studentId/change-mentor/:mentorId', (req, res) => {
  const { studentId, mentorId } = req.params;

  Mentor.findById(mentorId)
    .then((mentor) => {
      if (!mentor) {
        throw new Error('Mentor not found.');
      }
      return Student.findByIdAndUpdate(
        studentId,
        { mentor: mentorId },
        { new: true }
      );
    })
    .then((student) => {
      res.status(200).json(student);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Unable to assign/change mentor.' });
    });
});

// Step 6: Write an API to show all students for a particular mentor
app.get('/mentors/:mentorId/students', (req, res) => {
  const { mentorId } = req.params;

  Student.find({ mentor: mentorId })
    .then((students) => {
      res.status(200).json(students);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Unable to fetch students.' });
    });
});

// Step 7: Write an API to show the previously assigned mentor for a particular student
app.get('/students/:studentId/previous-mentor', (req, res) => {
  const { studentId } = req.params;

  Student.findById(studentId)
    .populate('mentor')
    .exec()
    .then((student) => {
      const previousMentor = student.mentor || {};
      res.status(200).json(previousMentor);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Unable to fetch previous mentor.' });
    });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
