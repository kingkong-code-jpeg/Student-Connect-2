const PDFDocument = require('pdfkit');

/**
 * Generate a PDF report and pipe it to the response.
 * @param {object} res - Express response
 * @param {string} title - Report title
 * @param {string[]} columns - Column headers
 * @param {string[][]} rows - Data rows
 */
function generatePDF(res, title, columns, rows) {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}_Report.pdf"`);
    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(0.5);

    // Report metadata
    doc.fontSize(10).font('Helvetica')
        .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.text(`Total Records: ${rows.length}`, { align: 'center' });
    doc.moveDown(1);

    // Table
    const tableTop = doc.y;
    const colWidth = (doc.page.width - 80) / columns.length;
    const rowHeight = 25;

    // Header row
    doc.fontSize(9).font('Helvetica-Bold');
    columns.forEach((col, i) => {
        doc.text(col, 40 + i * colWidth, tableTop, {
            width: colWidth - 5,
            align: 'left',
        });
    });

    // Header line
    doc.moveTo(40, tableTop + rowHeight - 5)
        .lineTo(doc.page.width - 40, tableTop + rowHeight - 5)
        .stroke();

    // Data rows
    doc.font('Helvetica').fontSize(8);
    let y = tableTop + rowHeight;

    rows.forEach((row) => {
        // Check if we need a new page
        if (y + rowHeight > doc.page.height - 60) {
            doc.addPage();
            y = 40;

            // Re-draw header on new page
            doc.fontSize(9).font('Helvetica-Bold');
            columns.forEach((col, i) => {
                doc.text(col, 40 + i * colWidth, y, {
                    width: colWidth - 5,
                    align: 'left',
                });
            });
            doc.moveTo(40, y + rowHeight - 5)
                .lineTo(doc.page.width - 40, y + rowHeight - 5)
                .stroke();
            y += rowHeight;
            doc.font('Helvetica').fontSize(8);
        }

        row.forEach((cell, i) => {
            doc.text(String(cell || ''), 40 + i * colWidth, y, {
                width: colWidth - 5,
                align: 'left',
            });
        });
        y += rowHeight;
    });

    doc.end();
}

module.exports = generatePDF;
