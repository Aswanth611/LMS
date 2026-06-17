const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  approvalStatus: {
    type: String,
    default: 'Approved'
  },
  pdfPath: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Certificate', CertificateSchema);
