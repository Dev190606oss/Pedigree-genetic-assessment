const { generateAssessmentPDF } = require('../services/reportService');
const { Assessment, Family, Report } = require('../models');
const { ROLES } = require('../constants');
const { logAudit } = require('../middleware/audit');

const downloadReport = async (req, res, next) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await Assessment.findById(assessmentId).populate('familyId');
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment record not found.' });
    }

    // Role check: User owns family or is Counselor/Admin
    if (
      req.user.role === ROLES.USER &&
      assessment.userId.toString() !== req.user._id.toString() &&
      assessment.familyId?.ownerId?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, error: 'Forbidden.' });
    }

    const pdfBuffer = await generateAssessmentPDF(assessmentId);

    // Save report generation record
    await Report.create({
      familyId: assessment.familyId._id,
      assessmentId: assessment._id,
      generatedBy: req.user._id,
      fileReference: `report-${assessment._id}.pdf`
    });

    await logAudit({
      actorId: req.user._id,
      action: 'REPORT_DOWNLOADED',
      entityType: 'Report',
      entityId: assessment._id,
      metadata: { familyId: assessment.familyId._id }
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="pedigree-assessment-${assessment._id}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  downloadReport
};
