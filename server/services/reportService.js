const PDFDocument = require('pdfkit');
const { Family, FamilyMember, Relationship, FamilyMemberCondition, Assessment, CounselorNote, User } = require('../models');

/**
 * Generates a comprehensive clinical assessment PDF report
 * @param {string} assessmentId
 * @param {string} userId - User requesting report
 * @returns {Promise<Buffer>}
 */
async function generateAssessmentPDF(assessmentId) {
  const assessment = await Assessment.findById(assessmentId)
    .populate('familyId')
    .populate('userId', 'name email');

  if (!assessment) {
    throw new Error('Assessment not found');
  }

  const familyId = assessment.familyId._id;
  const family = assessment.familyId;
  const members = await FamilyMember.find({ familyId });
  const relationships = await Relationship.find({ familyId }).populate('fromMemberId toMemberId');
  const conditions = await FamilyMemberCondition.find({ familyId }).populate('conditionId memberId');
  const counselorNotes = await CounselorNote.find({ assessmentId }).populate('counselorId', 'name email');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      info: {
        Title: `GeneTrace Assessment Report - ${family.name}`,
        Author: 'GeneTrace Genetic Assessment Platform',
        Subject: 'Preconception Genetic Decision-Support Report'
      }
    });

    const buffers = [];
    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', err => reject(err));

    const primaryColor = '#0d9488'; // Brand Teal
    const darkSlate = '#1e293b';
    const textGray = '#475569';
    const lightBg = '#f8fafc';
    const borderColor = '#e2e8f0';

    // Helper: Header bar
    const renderHeader = (title) => {
      doc.rect(40, doc.y, 515, 26).fill(primaryColor);
      doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold')
         .text(title.toUpperCase(), 50, doc.y - 20, { width: 495 });
      doc.moveDown(0.8);
      doc.fillColor(darkSlate).font('Helvetica');
    };

    // --- TITLE / COVER SECTION ---
    doc.rect(40, 40, 515, 60).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold')
       .text('GENETRACE ASSESSMENT REPORT', 55, 52);
    doc.fontSize(10).font('Helvetica')
       .text('Preconception Genetic Assessment and Guidance Platform | AIES Decision Support', 55, 78);

    doc.moveDown(3);

    // --- 1. CASE INFORMATION ---
    renderHeader('1. Case & Client Information');
    const startY = doc.y;
    doc.fontSize(10);
    doc.text(`Family / Case Name: ${family.name}`, 50, startY);
    doc.text(`Case ID: ${family._id}`, 50, startY + 16);
    doc.text(`Assessment ID: ${assessment._id}`, 50, startY + 32);
    doc.text(`Date Generated: ${new Date(assessment.createdAt).toLocaleString()}`, 320, startY);
    doc.text(`Patient / Proband: ${assessment.userId?.name || 'Anonymous'} (${assessment.userId?.email || 'N/A'})`, 320, startY + 16);
    doc.text(`Engine Version: ${assessment.engineVersion}`, 320, startY + 32);

    doc.y = startY + 54;
    doc.moveDown(1);

    // --- 2. FAMILY SUMMARY ---
    renderHeader('2. Family Composition & Demographics');
    doc.text(`Total Recorded Family Members: ${members.length}`, 50);
    doc.text(`Total Documented Genetic Relationships: ${relationships.length}`, 50);
    doc.moveDown(0.5);

    // Table of members
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Name', 50, doc.y, { width: 140 });
    doc.text('Sex', 200, doc.y, { width: 70 });
    doc.text('Role / Proband', 280, doc.y, { width: 100 });
    doc.text('Status', 390, doc.y, { width: 80 });
    doc.moveDown(0.4);
    doc.rect(40, doc.y, 515, 1).fill(borderColor);
    doc.moveDown(0.4);

    doc.font('Helvetica');
    members.forEach(m => {
      const rowY = doc.y;
      doc.text(m.name, 50, rowY, { width: 140 });
      doc.text(m.sex, 200, rowY, { width: 70 });
      doc.text(m.isProband ? '★ Primary Proband' : 'Relative', 280, rowY, { width: 100 });
      doc.text(m.deceased ? 'Deceased' : 'Living', 390, rowY, { width: 80 });
      doc.moveDown(0.3);
    });

    doc.moveDown(1);

    // --- 3. DIAGNOSED CONDITIONS & CARRIER STATUS ---
    renderHeader('3. Clinical & Genetic Conditions');
    if (conditions.length === 0) {
      doc.fontSize(10).text('No hereditary conditions or carrier statuses recorded in this family.', 50);
    } else {
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Member', 50, doc.y, { width: 120 });
      doc.text('Condition Name', 180, doc.y, { width: 160 });
      doc.text('Status', 350, doc.y, { width: 80 });
      doc.text('Age of Onset', 440, doc.y, { width: 70 });
      doc.moveDown(0.4);
      doc.rect(40, doc.y, 515, 1).fill(borderColor);
      doc.moveDown(0.4);

      doc.font('Helvetica');
      conditions.forEach(c => {
        const rowY = doc.y;
        doc.text(c.memberId?.name || 'Unknown', 50, rowY, { width: 120 });
        doc.text(`${c.conditionId?.name || 'Unknown'} (${c.conditionId?.category || ''})`, 180, rowY, { width: 160 });
        doc.text(c.status, 350, rowY, { width: 80 });
        doc.text(c.ageAtOnset !== null && c.ageAtOnset !== undefined ? `${c.ageAtOnset} yrs` : 'Unspecified', 440, rowY, { width: 70 });
        doc.moveDown(0.3);
      });
    }

    doc.moveDown(1.5);

    // Check page space for assessment section
    if (doc.y > 600) doc.addPage();

    // --- 4. ASSESSMENT & RULE ENGINE EVALUATION ---
    renderHeader('4. Expert System Assessment Results');
    
    // Result category highlight box
    const catBoxY = doc.y;
    let boxColor = '#e0f2fe'; // light blue default
    let catTextColor = '#0369a1';
    if (assessment.resultCategory === 'COUNSELOR_REVIEW') {
      boxColor = '#fee2e2';
      catTextColor = '#b91c1c';
    } else if (assessment.resultCategory === 'REVIEW_RECOMMENDED') {
      boxColor = '#fef3c7';
      catTextColor = '#b45309';
    }

    doc.rect(40, catBoxY, 515, 45).fill(boxColor);
    doc.fillColor(catTextColor).fontSize(12).font('Helvetica-Bold')
       .text(`ASSESSMENT CLASSIFICATION: ${assessment.resultCategory.replace(/_/g, ' ')}`, 55, catBoxY + 12);
    doc.fontSize(9).font('Helvetica')
       .text(assessment.summary, 55, catBoxY + 28, { width: 485 });

    doc.y = catBoxY + 55;
    doc.moveDown(0.8);
    doc.fillColor(darkSlate);

    // --- 5. TRIGGERED RULES & EXPLANATION ---
    doc.fontSize(11).font('Helvetica-Bold').text('Triggered Decision-Support Rules & Justification:', 50);
    doc.moveDown(0.4);

    if (assessment.triggeredRules.length === 0) {
      doc.fontSize(10).font('Helvetica').text('No high-priority clinical genetic alert rules were triggered.', 50);
    } else {
      assessment.triggeredRules.forEach((tr, idx) => {
        if (doc.y > 700) doc.addPage();
        doc.fontSize(10).font('Helvetica-Bold').text(`${idx + 1}. [${tr.ruleCode}] ${tr.name} (Priority: ${tr.priority})`, 50);
        doc.fontSize(9).font('Helvetica').text(`Explanation: ${tr.explanation}`, 65, doc.y, { width: 470 });
        doc.moveDown(0.5);
      });
    }

    doc.moveDown(1);

    // --- 6. EDUCATIONAL GUIDANCE ---
    if (doc.y > 650) doc.addPage();
    renderHeader('5. Recommended Guidance & Next Steps');
    doc.fontSize(9).font('Helvetica');
    assessment.guidance.forEach((g, i) => {
      doc.text(`•  ${g}`, 55, doc.y, { width: 480 });
      doc.moveDown(0.4);
    });

    doc.moveDown(1);

    // --- 7. COUNSELOR REVIEW & CLINICAL NOTES ---
    if (counselorNotes.length > 0) {
      if (doc.y > 650) doc.addPage();
      renderHeader('6. Genetic Counselor Review & Clinical Notes');
      counselorNotes.forEach(cn => {
        doc.fontSize(9).font('Helvetica-Bold')
           .text(`Counselor: ${cn.counselorId?.name || 'Specialist'} | ${new Date(cn.createdAt).toLocaleDateString()}`, 50);
        doc.font('Helvetica').text(`Note: ${cn.note}`, 50, doc.y, { width: 490 });
        if (cn.recommendation) {
          doc.moveDown(0.3);
          doc.font('Helvetica-Bold').text('Formal Clinical Recommendation:', 50);
          doc.font('Helvetica').text(cn.recommendation, 50, doc.y, { width: 490 });
        }
        doc.moveDown(0.8);
      });
    }

    // --- 8. MANDATORY DISCLAIMER ---
    if (doc.y > 680) doc.addPage();
    doc.rect(40, doc.y, 515, 55).fill('#f1f5f9');
    doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold')
       .text('CLINICAL DECISION SUPPORT & REGULATORY NOTICE', 50, doc.y + 8);
    doc.font('Helvetica').text(assessment.disclaimer, 50, doc.y + 4, { width: 495 });

    doc.end();
  });
}

module.exports = {
  generateAssessmentPDF
};
