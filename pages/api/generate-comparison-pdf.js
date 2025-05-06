// pages/api/generate-comparison-pdf.js
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { withAuth } from '../../lib/auth';
import { query } from '../../lib/database';

export const config = {
  runtime: 'nodejs',
  api: {
    responseLimit: '10mb',
  },
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vehicleIds } = req.body;
    
    if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0 || vehicleIds.length > 3) {
      return res.status(400).json({ error: 'Please provide 1-3 valid vehicle IDs' });
    }

    const userId = req.user.id;
    
    // Check if user is premium
    const now = new Date().toISOString();
    const subscriptionResult = await query(`
      SELECT us.id
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 
      AND us.status = $2 
      AND (us.current_period_end IS NULL OR us.current_period_end > $3)
      AND (sp.name = 'premium' OR sp.name = 'professional')
    `, [userId, 'active', now]);
    
    const isPremium = subscriptionResult.rows.length > 0;
    
    if (!isPremium) {
      return res.status(403).json({ error: 'Premium subscription required for PDF export' });
    }
    
    // Get vehicles data with a single query
    const placeholders = vehicleIds.map((_, index) => `$${index + 2}`).join(', ');
    const vehiclesResult = await query(
      `SELECT id, year, make, model, mileage, reliability_data
       FROM saved_vehicles 
       WHERE user_id = $1 AND id IN (${placeholders})`,
      [userId, ...vehicleIds]
    );
    
    if (vehiclesResult.rows.length === 0) {
      return res.status(404).json({ error: 'No vehicles found' });
    }
    
    const vehicles = vehiclesResult.rows;
    
    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add a page to the PDF
    let page = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = page.getSize();
    
    // Set initial variables for positioning
    let currentY = height - 50;
    const margin = 50;
    const textSize = 12;
    const headerSize = 18;
    const subheaderSize = 14;
    const lineHeight = 20;
    const minSpaceRequired = 100; // Minimum space required at bottom of page

    // Helper function to check if we need a new page and create one if necessary
    const ensureSpace = (spaceNeeded) => {
      if (currentY - spaceNeeded < minSpaceRequired) {
        page = pdfDoc.addPage([612, 792]);
        currentY = height - 50;
        return true;
      }
      return false;
    };
    
    // Add header
    page.drawText(`Vehicle Comparison Report`, {
      x: margin,
      y: currentY,
      size: 24,
      font: helveticaBoldFont,
      color: rgb(0, 0.3, 0.7),
    });
    
    currentY -= 40;
    
    // Date of report
    page.drawText(`Report Date: ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: currentY,
      size: textSize,
      font: helveticaFont,
    });
    
    currentY -= lineHeight * 2;
    
    // Add vehicle names
    ensureSpace(lineHeight * (vehicles.length + 2));
    
    page.drawText('Comparing:', {
      x: margin,
      y: currentY,
      size: subheaderSize,
      font: helveticaBoldFont,
    });
    
    currentY -= lineHeight;
    
    vehicles.forEach((vehicle, index) => {
      page.drawText(`${index + 1}. ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.mileage.toLocaleString()} miles)`, {
        x: margin + 10,
        y: currentY,
        size: textSize,
        font: helveticaFont,
      });
      
      currentY -= lineHeight;
    });
    
    currentY -= lineHeight;
    
    // Draw comparison table
    
    // Table headers
    const colWidth = (width - 2 * margin) / (vehicles.length + 1);
    
    // Helper function to draw a table cell
    const drawTableCell = (text, x, y, isHeader = false, align = 'left', color = rgb(0, 0, 0)) => {
      const font = isHeader ? helveticaBoldFont : helveticaFont;
      const actualX = align === 'center' ? x + colWidth / 2 - font.widthOfTextAtSize(text.toString(), textSize) / 2 : x;
      
      page.drawText(text.toString(), {
        x: actualX,
        y: y,
        size: textSize,
        font: font,
        color: color,
      });
    };
    
    // Helper to draw a row divider
    const drawRowDivider = (y) => {
      page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });
    };
    
    // Helper to draw section header
    const drawSectionHeader = (text, y) => {
      // Draw background
      page.drawRectangle({
        x: margin,
        y: y - 2,
        width: width - 2 * margin,
        height: lineHeight + 4,
        color: rgb(0.9, 0.95, 1),
      });
      
      // Draw text
      page.drawText(text, {
        x: margin + 5,
        y: y,
        size: subheaderSize,
        font: helveticaBoldFont,
        color: rgb(0, 0.3, 0.7),
      });
    };
    
    // Draw "Basic Information" section
    ensureSpace(lineHeight * 4);
    
    currentY -= lineHeight;
    drawSectionHeader('Basic Information', currentY);
    currentY -= lineHeight * 1.5;
    
    // Draw header row
    drawTableCell('Criteria', margin, currentY, true);
    vehicles.forEach((vehicle, index) => {
      drawTableCell(`Vehicle ${index + 1}`, margin + colWidth * (index + 1), currentY, true, 'center');
    });
    
    currentY -= lineHeight;
    drawRowDivider(currentY + lineHeight / 2);
    
    // Draw mileage row
    ensureSpace(lineHeight * 2);
    
    currentY -= lineHeight / 2;
    drawTableCell('Mileage', margin, currentY);
    vehicles.forEach((vehicle, index) => {
      drawTableCell(`${vehicle.mileage.toLocaleString()} miles`, margin + colWidth * (index + 1), currentY, false, 'center');
    });
    
    currentY -= lineHeight;
    drawRowDivider(currentY + lineHeight / 2);
    
    // Draw "Reliability Scores" section
    ensureSpace(lineHeight * 4);
    
    currentY -= lineHeight;
    drawSectionHeader('Reliability Scores', currentY);
    currentY -= lineHeight * 1.5;
    
    // Draw overall score row
    drawTableCell('Overall Score', margin, currentY);
    vehicles.forEach((vehicle, index) => {
      const score = vehicle.reliability_data?.overallScore || 'N/A';
      let scoreColor = rgb(0, 0, 0);
      
      if (score !== 'N/A') {
        if (score >= 80) scoreColor = rgb(0, 0.7, 0);
        else if (score >= 60) scoreColor = rgb(0.9, 0.6, 0);
        else scoreColor = rgb(0.9, 0, 0);
      }
      
      drawTableCell(score.toString(), margin + colWidth * (index + 1), currentY, false, 'center', scoreColor);
    });
    
    currentY -= lineHeight;
    drawRowDivider(currentY + lineHeight / 2);
    
    // Engine Score
    ensureSpace(lineHeight * 2);
    
    currentY -= lineHeight / 2;
    drawTableCell('Engine', margin, currentY);
    vehicles.forEach((vehicle, index) => {
      const score = vehicle.reliability_data?.categories?.engine || 'N/A';
      let scoreColor = rgb(0, 0, 0);
      
      if (score !== 'N/A') {
        if (score >= 80) scoreColor = rgb(0, 0.7, 0);
        else if (score >= 60) scoreColor = rgb(0.9, 0.6, 0);
        else scoreColor = rgb(0.9, 0, 0);
      }
      
      drawTableCell(score.toString(), margin + colWidth * (index + 1), currentY, false, 'center', scoreColor);
    });
    
    currentY -= lineHeight;
    drawRowDivider(currentY + lineHeight / 2);
    
    // Transmission Score
    ensureSpace(lineHeight * 2);
    
    currentY -= lineHeight / 2;
    drawTableCell('Transmission', margin, currentY);
    vehicles.forEach((vehicle, index) => {
      const score = vehicle.reliability_data?.categories?.transmission || 'N/A';
      let scoreColor = rgb(0, 0, 0);
      
      if (score !== 'N/A') {
        if (score >= 80) scoreColor = rgb(0, 0.7, 0);
        else if (score >= 60) scoreColor = rgb(0.9, 0.6, 0);
        else scoreColor = rgb(0.9, 0, 0);
      }
      
      drawTableCell(score.toString(), margin + colWidth * (index + 1), currentY, false, 'center', scoreColor);
    });
    
    currentY -= lineHeight;
    drawRowDivider(currentY + lineHeight / 2);
    
    // Additional categories for premium users
    const premiumCategories = [
      { key: 'electricalSystem', name: 'Electrical System' },
      { key: 'brakes', name: 'Brakes' },
      { key: 'suspension', name: 'Suspension' },
      { key: 'fuelSystem', name: 'Fuel System' }
    ];
    
    for (const category of premiumCategories) {
      ensureSpace(lineHeight * 2);
      
      currentY -= lineHeight / 2;
      drawTableCell(category.name, margin, currentY);
      
      vehicles.forEach((vehicle, index) => {
        const score = vehicle.reliability_data?.categories?.[category.key] || 'N/A';
        let scoreColor = rgb(0, 0, 0);
        
        if (score !== 'N/A') {
          if (score >= 80) scoreColor = rgb(0, 0.7, 0);
          else if (score >= 60) scoreColor = rgb(0.9, 0.6, 0);
          else scoreColor = rgb(0.9, 0, 0);
        }
        
        drawTableCell(score.toString(), margin + colWidth * (index + 1), currentY, false, 'center', scoreColor);
      });
      
      currentY -= lineHeight;
      drawRowDivider(currentY + lineHeight / 2);
    }
    
    // Common Issues section - always start on a new page for better organization
    page = pdfDoc.addPage([612, 792]);
    currentY = height - 50;
    
    drawSectionHeader('Common Issues', currentY);
    currentY -= lineHeight * 1.5;
    
    // Estimate how much space we need for each vehicle's issues
    const issuesSpaceNeeded = vehicles.reduce((maxHeight, vehicle) => {
      // Base height for vehicle name
      let vehicleHeight = lineHeight * 2;
      
      // Add height for each issue
      if (vehicle.reliability_data?.commonIssues?.length > 0) {
        vehicleHeight += vehicle.reliability_data.commonIssues.reduce((issueHeight, issue) => {
          // Estimate wrapped text height
          const issueText = `• ${issue.description}`;
          const wrappedLines = wrapText(issueText, colWidth - 20, textSize, helveticaFont);
          
          // Height for the issue description
          let height = wrappedLines.length * lineHeight * 0.9;
          
          // Add height for cost if present
          if (issue.costToFix) {
            height += lineHeight * 0.8;
          }
          
          // Add spacing between issues
          height += lineHeight * 0.2;
          
          return issueHeight + height;
        }, 0);
      } else {
        // Height for "No common issues" message
        vehicleHeight += lineHeight;
      }
      
      return Math.max(maxHeight, vehicleHeight);
    }, 0);
    
    // Check if we need a new page for all the issues
    if (currentY - issuesSpaceNeeded < minSpaceRequired) {
      page = pdfDoc.addPage([612, 792]);
      currentY = height - 50;
      drawSectionHeader('Common Issues', currentY);
      currentY -= lineHeight * 1.5;
    }
    
    // Draw each vehicle's common issues in columns
    const columnStartY = currentY;
    
    for (let vehicleIndex = 0; vehicleIndex < vehicles.length; vehicleIndex++) {
      const vehicle = vehicles[vehicleIndex];
      let columnY = columnStartY;
      const columnX = margin + colWidth * vehicleIndex;
      
      // Draw vehicle name
      page.drawText(`${vehicle.year} ${vehicle.make} ${vehicle.model}:`, {
        x: columnX,
        y: columnY,
        size: textSize,
        font: helveticaBoldFont,
      });
      
      columnY -= lineHeight;
      
      // Check if we need to continue on a new page
      if (columnY < minSpaceRequired) {
        page = pdfDoc.addPage([612, 792]);
        columnY = height - 50;
      }
      
      // Draw issues or "No issues" message
      if (vehicle.reliability_data?.commonIssues?.length > 0) {
        for (const issue of vehicle.reliability_data.commonIssues) {
          // Format and wrap issue text
          const issueText = `• ${issue.description}`;
          const wrappedLines = wrapText(issueText, colWidth - 20, textSize, helveticaFont);
          
          // Draw each line of the wrapped text
          for (const line of wrappedLines) {
            // Check if we need to continue on a new page
            if (columnY < minSpaceRequired) {
              page = pdfDoc.addPage([612, 792]);
              columnY = height - 50;
            }
            
            page.drawText(line, {
              x: columnX,
              y: columnY,
              size: textSize - 1,
              font: helveticaFont,
            });
            
            columnY -= lineHeight * 0.9;
          }
          
          // Add cost if present
          if (issue.costToFix) {
            // Check if we need to continue on a new page
            if (columnY < minSpaceRequired) {
              page = pdfDoc.addPage([612, 792]);
              columnY = height - 50;
            }
            
            page.drawText(`  Cost: ${issue.costToFix}`, {
              x: columnX,
              y: columnY,
              size: textSize - 1,
              font: helveticaFont,
              color: rgb(0.4, 0.4, 0.4),
            });
            
            columnY -= lineHeight * 0.8;
          }
          
          // Add space between issues
          columnY -= lineHeight * 0.2;
        }
      } else {
        page.drawText('No common issues reported', {
          x: columnX,
          y: columnY,
          size: textSize - 1,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5),
        });
        
        columnY -= lineHeight;
      }
    }
    
    // Add footer to the last page
    page.drawText('This comparison report was generated automatically. Data should be verified with a qualified mechanic.', {
      x: width / 2 - 240,
      y: 30,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    
    // Set the content type and send the PDF bytes
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="vehicle-comparison-report.pdf"`);
    res.status(200).send(Buffer.from(pdfBytes));
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ error: 'Failed to generate PDF report' });
  }
}

// Helper function to wrap text
function wrapText(text, maxWidth, fontSize, font) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const lineWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (lineWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

export default withAuth(handler);