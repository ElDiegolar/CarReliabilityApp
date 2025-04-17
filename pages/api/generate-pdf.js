// pages/api/generate-pdf.js
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { query } from '../../lib/database';

export const config = {
  runtime: 'nodejs',
  api: {
    responseLimit: '10mb',
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { year, make, model, mileage, reliability_data } = req.body;
    
    // Validate required fields
    if (!year || !make || !model || !mileage || !reliability_data) {
      return res.status(400).json({ error: 'Missing required vehicle information' });
    }

    // Initialize PDF document
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add a page to the PDF
    let page = pdfDoc.addPage([612, 792]); // Letter size - use let instead of const
    const { width, height } = page.getSize();
    
    // Set some initial variables for positioning
    let currentY = height - 50;
    const margin = 50;
    const textSize = 12;
    const headerSize = 18;
    const subheaderSize = 14;
    const lineHeight = 20;
    
    // Add header
    page.drawText(`Vehicle Reliability Report`, {
      x: margin,
      y: currentY,
      size: 24,
      font: helveticaBoldFont,
      color: rgb(0, 0.3, 0.7),
    });
    
    currentY -= 40;
    
    // Vehicle info section
    page.drawText(`${year} ${make} ${model}`, {
      x: margin,
      y: currentY,
      size: headerSize,
      font: helveticaBoldFont,
    });
    
    currentY -= lineHeight;
    
    page.drawText(`Mileage: ${mileage.toLocaleString()} miles`, {
      x: margin,
      y: currentY,
      size: textSize,
      font: helveticaFont,
    });
    
    currentY -= lineHeight * 2;
    
    // Draw colored reliability score box
    const scoreBoxWidth = 150;
    const scoreBoxHeight = 80;
    const scoreBoxX = width - margin - scoreBoxWidth;
    const scoreBoxY = height - 150;
    
    // Background of score box
    page.drawRectangle({
      x: scoreBoxX,
      y: scoreBoxY,
      width: scoreBoxWidth,
      height: scoreBoxHeight,
      color: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(0, 0.3, 0.7),
      borderWidth: 2,
    });
    
    // Score label
    page.drawText(`Overall Score`, {
      x: scoreBoxX + 25,
      y: scoreBoxY + scoreBoxHeight - 25,
      size: subheaderSize,
      font: helveticaBoldFont,
      color: rgb(0, 0.3, 0.7),
    });
    
    // The actual score
    page.drawText(`${reliability_data.overallScore}/100`, {
      x: scoreBoxX + 40,
      y: scoreBoxY + 25,
      size: 24,
      font: helveticaBoldFont,
      color: getScoreColor(reliability_data.overallScore),
    });
    
    // Date of report
    page.drawText(`Report Date: ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: currentY,
      size: textSize,
      font: helveticaFont,
    });
    
    currentY -= lineHeight * 2;
    
    // Category scores section
    page.drawText(`Category Scores`, {
      x: margin,
      y: currentY,
      size: subheaderSize,
      font: helveticaBoldFont,
    });
    
    currentY -= lineHeight * 1.5;
    
    // Engine
    drawCategoryScore(page, margin, currentY, 'Engine', reliability_data.categories.engine, helveticaFont, helveticaBoldFont);
    currentY -= lineHeight;
    
    // Transmission
    drawCategoryScore(page, margin, currentY, 'Transmission', reliability_data.categories.transmission, helveticaFont, helveticaBoldFont);
    currentY -= lineHeight;
    
    // Check if full report with all categories is available
    if (reliability_data.isPremium) {
      // Electrical System
      drawCategoryScore(page, margin, currentY, 'Electrical System', reliability_data.categories.electricalSystem, helveticaFont, helveticaBoldFont);
      currentY -= lineHeight;
      
      // Brakes
      drawCategoryScore(page, margin, currentY, 'Brakes', reliability_data.categories.brakes, helveticaFont, helveticaBoldFont);
      currentY -= lineHeight;
      
      // Suspension
      drawCategoryScore(page, margin, currentY, 'Suspension', reliability_data.categories.suspension, helveticaFont, helveticaBoldFont);
      currentY -= lineHeight;
      
      // Fuel System
      drawCategoryScore(page, margin, currentY, 'Fuel System', reliability_data.categories.fuelSystem, helveticaFont, helveticaBoldFont);
      currentY -= lineHeight * 2;
    } else {
      // For free users, add note about premium
      currentY -= lineHeight;
      page.drawText(`Upgrade to premium for detailed category breakdown scores.`, {
        x: margin + 20,
        y: currentY,
        size: textSize,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      currentY -= lineHeight * 2;
    }
    
    // Common issues section if premium
    if (reliability_data.isPremium && reliability_data.commonIssues && reliability_data.commonIssues.length > 0) {
      page.drawText(`Common Issues`, {
        x: margin,
        y: currentY,
        size: subheaderSize,
        font: helveticaBoldFont,
      });
      
      currentY -= lineHeight * 1.5;
      
      // Loop through common issues
      for (const issue of reliability_data.commonIssues) {
        // Issue description
        page.drawText(`• ${issue.description}`, {
          x: margin,
          y: currentY,
          size: textSize,
          font: helveticaBoldFont,
        });
        
        currentY -= lineHeight;
        
        // Issue details
        page.drawText(`   Cost to Fix: ${issue.costToFix}`, {
          x: margin,
          y: currentY,
          size: textSize,
          font: helveticaFont,
        });
        
        currentY -= lineHeight;
        
        page.drawText(`   Occurrence: ${issue.occurrence}`, {
          x: margin,
          y: currentY,
          size: textSize,
          font: helveticaFont,
        });
        
        currentY -= lineHeight;
        
        page.drawText(`   Typical Mileage: ${issue.mileage}`, {
          x: margin,
          y: currentY,
          size: textSize,
          font: helveticaFont,
        });
        
        currentY -= lineHeight * 1.5;
        
        // If we're running out of space, add a new page
        if (currentY < 150) {
          page = pdfDoc.addPage([612, 792]);
          currentY = height - 50;
        }
      }
    } else if (!reliability_data.isPremium) {
      page.drawText(`Common Issues`, {
        x: margin,
        y: currentY,
        size: subheaderSize,
        font: helveticaBoldFont,
      });
      
      currentY -= lineHeight * 1.5;
      
      page.drawText(`Upgrade to premium for detailed common issues information.`, {
        x: margin + 20,
        y: currentY,
        size: textSize,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      currentY -= lineHeight * 2;
    }
    
    // Analysis section
    page.drawText(`Reliability Analysis`, {
      x: margin,
      y: currentY,
      size: subheaderSize,
      font: helveticaBoldFont,
    });
    
    currentY -= lineHeight * 1.5;
    
    // AI analysis text - we need to wrap this text
    const analysisText = reliability_data.isPremium 
      ? reliability_data.aiAnalysis 
      : 'Upgrade to premium for detailed reliability analysis.';
    
    // Split analysis text into multiple lines
    const analysisLines = splitTextToLines(analysisText, width - 2 * margin, textSize, helveticaFont);
    
    // Draw analysis text line by line
    for (const line of analysisLines) {
      page.drawText(line, {
        x: margin,
        y: currentY,
        size: textSize,
        font: helveticaFont,
      });
      
      currentY -= lineHeight;
      
      // If we're running out of space, add a new page
      if (currentY < 100) {
        page = pdfDoc.addPage([612, 792]);
        currentY = height - 50;
      }
    }
    
    // Add disclaimer at the bottom of the first page
    page.drawText('Disclaimer: This report is based on aggregated data and may not represent your specific vehicle. Always consult a qualified mechanic.', {
      x: margin,
      y: 50,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Add footer with powered by info
    page.drawText('Powered by CarReliability.com', {
      x: margin,
      y: 30,
      size: 10,
      font: helveticaBoldFont,
      color: rgb(0, 0.3, 0.7),
    });
    
    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    
    // Set the content type and send the PDF bytes
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${year}-${make}-${model}-reliability-report.pdf"`);
    res.status(200).send(Buffer.from(pdfBytes));
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ error: 'Failed to generate PDF report' });
  }
}

// Helper function to get RGB color based on score
function getScoreColor(score) {
  if (score >= 80) {
    return rgb(0, 0.7, 0); // Green for high scores
  } else if (score >= 60) {
    return rgb(0.9, 0.6, 0); // Orange for medium scores
  } else {
    return rgb(0.9, 0, 0); // Red for low scores
  }
}

// Helper function to draw category score with bar
function drawCategoryScore(page, x, y, category, score, regularFont, boldFont) {
  const barWidth = 150;
  const barHeight = 10;
  const scoreBarX = x + 230;
  
  // Category name
  page.drawText(`${category}:`, {
    x: x,
    y: y,
    size: 12,
    font: boldFont,
  });
  
  // Score number
  page.drawText(`${score}/100`, {
    x: x + 170,
    y: y,
    size: 12,
    font: regularFont,
  });
  
  // Background bar (gray)
  page.drawRectangle({
    x: scoreBarX,
    y: y - 2,
    width: barWidth,
    height: barHeight,
    color: rgb(0.9, 0.9, 0.9),
  });
  
  // Score bar (colored based on score)
  const scoreWidth = (barWidth * score) / 100;
  page.drawRectangle({
    x: scoreBarX,
    y: y - 2,
    width: scoreWidth,
    height: barHeight,
    color: getScoreColor(score),
  });
}

// Helper function to split text into multiple lines
function splitTextToLines(text, maxWidth, fontSize, font) {
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