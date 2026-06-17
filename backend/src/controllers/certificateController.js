const dbService = require('../utils/dbService');
const PDFDocument = require('pdfkit');

// @desc    Request/generate a certificate for a completed course with approved project
// @route   POST /api/certificates/generate
// @access  Private
exports.generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id || req.user._id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required.'
      });
    }

    // 1. Verify student progress
    const progressList = await dbService.findProgressByUser(studentId.toString());
    const progress = progressList.find(p => {
      const pId = p.courseId._id || p.courseId.id || p.courseId;
      return pId.toString() === courseId.toString();
    });

    if (!progress) {
      return res.status(400).json({
        success: false,
        message: 'You have not enrolled in this course.'
      });
    }

    // 2. Check if topics are completed (100%) and quiz is passed
    const isCompleted = progress.completionPercentage >= 100 && progress.quizPassed;
    if (!isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Course must be 100% complete and the phase quiz must be passed before requesting a certificate.'
      });
    }

    // 3. Verify project is submitted and approved by mentor
    const projects = await dbService.findProjects({
      studentId: studentId.toString(),
      courseId: courseId.toString()
    });
    
    const approvedProject = projects.find(p => p.status === 'Approved');
    if (!approvedProject) {
      return res.status(400).json({
        success: false,
        message: 'Your final project must be submitted and approved by a mentor before requesting a certificate.'
      });
    }

    // 4. Check if certificate already exists
    const existingCerts = await dbService.findCertificates({
      studentId: studentId.toString(),
      courseId: courseId.toString()
    });

    if (existingCerts.length > 0) {
      return res.json({
        success: true,
        message: 'Certificate already generated.',
        certificate: existingCerts[0]
      });
    }

    // 5. Generate Certificate
    const certificateId = 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const pdfPath = `/api/certificates/download/${certificateId}`;

    const certificate = await dbService.createCertificate({
      studentId: studentId.toString(),
      courseId: courseId.toString(),
      certificateId,
      pdfPath,
      approvalStatus: 'Approved',
      issueDate: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully.',
      certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get certificates by student ID
// @route   GET /api/certificates/student/:id
// @access  Private
exports.getStudentCertificates = async (req, res) => {
  try {
    const certs = await dbService.findCertificates({ studentId: req.params.id });
    res.json({
      success: true,
      count: certs.length,
      certificates: certs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Download Certificate PDF
// @route   GET /api/certificates/download/:id
// @access  Public (so it can be opened easily via browser link)
exports.downloadCertificate = async (req, res) => {
  try {
    const certs = await dbService.findCertificates({ certificateId: req.params.id });
    if (certs.length === 0) {
      return res.status(404).send('Certificate not found');
    }

    const cert = certs[0];
    const studentName = cert.studentId ? cert.studentId.name : 'Student';
    const courseTitle = cert.courseId ? cert.courseId.title : 'Course';
    const issueDate = new Date(cert.issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create a PDF document
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 40
    });

    // Set Response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate_${req.params.id}.pdf`);

    // Stream PDF directly to client
    doc.pipe(res);

    // Draw background design
    doc.rect(20, 20, 802, 555).lineWidth(4).stroke('#0f172a'); // Outer Dark Border
    doc.rect(28, 28, 786, 539).lineWidth(1).stroke('#3b82f6'); // Inner Blue Border

    // Draw Top Badge or Logo Design
    doc.font('Helvetica-Bold').fontSize(32).fillColor('#1e3a8a').text('EduFlick AI', { align: 'center', dy: 40 });
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#64748b').text('LMS AUTOMATION ENGINE', { align: 'center' });
    doc.moveDown(2.5);

    // Certificate Title
    doc.font('Helvetica-Bold').fontSize(36).fillColor('#0f172a').text('CERTIFICATE OF COMPLETION', { align: 'center' });
    doc.moveDown(1.5);

    // Main Certificate Text
    doc.font('Helvetica').fontSize(16).fillColor('#334155').text('This certifies that', { align: 'center' });
    doc.moveDown(0.8);

    // Student Name (large and highlighted)
    doc.font('Helvetica-Bold').fontSize(28).fillColor('#2563eb').text(studentName, { align: 'center' });
    doc.moveDown(0.8);

    // Success Statement
    doc.font('Helvetica').fontSize(16).fillColor('#334155').text('has successfully completed', { align: 'center' });
    doc.moveDown(0.8);

    // Course Title
    doc.font('Helvetica-BoldOblique').fontSize(22).fillColor('#0f172a').text(courseTitle, { align: 'center' });
    doc.moveDown(0.8);

    doc.font('Helvetica').fontSize(14).fillColor('#475569').text('and demonstrated practical project implementation.', { align: 'center' });
    doc.moveDown(3);

    // Footer columns (Date, Signatures, IDs)
    const startY = 460;
    
    // Left: Date
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a').text(`Date: ${issueDate}`, 80, startY);
    doc.moveTo(80, startY + 18).lineTo(250, startY + 18).lineWidth(1).stroke('#94a3b8');

    // Middle: Certificate ID
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a').text(`Certificate ID: ${cert.certificateId}`, 310, startY);
    doc.font('Helvetica').fontSize(10).fillColor('#64748b').text('Verified Security Hash', 310, startY + 20);

    // Right: Mentor Approval
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a').text('Mentor Approved', 580, startY);
    doc.moveTo(580, startY + 18).lineTo(750, startY + 18).lineWidth(1).stroke('#94a3b8');
    doc.font('Helvetica').fontSize(10).fillColor('#64748b').text('EduFlick Academy Mentor Board', 580, startY + 22);

    // Finalize PDF file
    doc.end();
  } catch (error) {
    console.error('Download PDF Error:', error);
    res.status(500).send('Internal Server Error. Could not generate PDF.');
  }
};
