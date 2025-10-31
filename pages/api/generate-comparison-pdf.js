// pages/api/generate-comparison-pdf.js - Fixed version
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
    
    // Function to convert miles to kilometers
    const milesToKilometers = (miles) => {
      return Math.round(miles * 1.60934);
    };
    
    // PDF export is now available to all authenticated users
    
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
    page.drawText(`Lemnaed - Vehicle Comparison Report`, {
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
    
    // Add vehicle overview
    ensureSpace(lineHeight * (vehicles.length + 3));
    
    page.drawText('Vehicles Being Compared:', {
      x: margin,
      y: currentY,
      size: subheaderSize,
      font: helveticaBoldFont,
    });
    
    currentY -= lineHeight * 1.5;
    
    vehicles.forEach((vehicle, index) => {
      const mileage = vehicle.mileage || 0;
      const kmValue = milesToKilometers(mileage);
      
      // Safely handle vehicle name
      const vehicleName = `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim();
      const mileageText = `Mileage: ${mileage.toLocaleString()} miles (${kmValue.toLocaleString()} km)`;
      
      page.drawText(`${index + 1}. ${vehicleName}`, {
        x: margin,
        y: currentY,
        size: textSize,
        font: helveticaBoldFont,
      });
      
      page.drawText(mileageText, {
        x: margin + 250,
        y: currentY,
        size: textSize,
        font: helveticaFont,
      });
      
      currentY -= lineHeight * 1.2;
    });
    
    currentY -= lineHeight;
    
    // Helper function to draw a section header
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
    
    // Draw "Reliability Scores" section
    ensureSpace(lineHeight * 3);
    drawSectionHeader('Reliability Scores', currentY);
    currentY -= lineHeight * 2;
    
    // Define the score categories for comparison
    const scoreCategories = [
      { key: 'overallScore', name: 'Overall Score', premium: false },
      { key: 'engine', name: 'Engine', premium: false, category: true },
      { key: 'transmission', name: 'Transmission', premium: false, category: true },
      { key: 'electricalSystem', name: 'Electrical System', premium: true, category: true },
      { key: 'brakes', name: 'Brakes', premium: true, category: true },
      { key: 'suspension', name: 'Suspension', premium: true, category: true },
      { key: 'fuelSystem', name: 'Fuel System', premium: true, category: true }
    ];
    
    // Helper to get score color
    const getScoreColor = (score) => {
      if (score >= 80) return rgb(0, 0.7, 0); // Green
      if (score >= 60) return rgb(0.9, 0.6, 0); // Orange
      return rgb(0.9, 0, 0); // Red
    };
    
    // Calculate column widths
    const tableWidth = width - 2 * margin;
    const colWidthName = 150;
    const availableWidth = tableWidth - colWidthName;
    const colWidthScore = vehicles.length > 0 ? availableWidth / vehicles.length : 150;
    
    // Draw table headers
    page.drawText('Category', {
      x: margin,
      y: currentY,
      size: textSize,
      font: helveticaBoldFont
    });
    
    vehicles.forEach((vehicle, index) => {
      const vehicleName = `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim();
      const maxLength = 20; // Truncate long names
      const displayName = vehicleName.length > maxLength ? vehicleName.substring(0, maxLength) + '...' : vehicleName;
      
      page.drawText(displayName, {
        x: margin + colWidthName + (colWidthScore * index) + 5,
        y: currentY,
        size: textSize,
        font: helveticaBoldFont
      });
    });
    
    currentY -= lineHeight;
    
    // Helper to draw a horizontal line
    const drawHorizontalLine = (y) => {
      page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });
    };
    
    // Draw horizontal divider
    drawHorizontalLine(currentY + lineHeight / 2);
    currentY -= lineHeight / 2;
    
    // Draw each score category
    for (const category of scoreCategories) {
      // Skip premium categories if not premium user
  // Premium restriction removed: include all categories
      
      ensureSpace(lineHeight * 2);
      
      // Draw category name
      page.drawText(category.name, {
        x: margin,
        y: currentY,
        size: textSize,
        font: category.key === 'overallScore' ? helveticaBoldFont : helveticaFont
      });
      
      // Draw score for each vehicle
      vehicles.forEach((vehicle, index) => {
        let score = 'N/A';
        
        try {
          if (category.key === 'overallScore') {
            score = vehicle.reliability_data?.overallScore || 'N/A';
          } else if (category.category && vehicle.reliability_data?.categories) {
            score = vehicle.reliability_data.categories[category.key] || 'N/A';
          }
        } catch (error) {
          console.error('Error getting score:', error);
          score = 'N/A';
        }
        
        // Draw score with appropriate color
        const scoreColor = score !== 'N/A' && !isNaN(score) ? getScoreColor(score) : rgb(0, 0, 0);
        const scoreText = score.toString();
        
        // Calculate text width for centering
        let textWidth = 0;
        try {
          textWidth = helveticaFont.widthOfTextAtSize(scoreText, textSize);
        } catch (error) {
          textWidth = scoreText.length * 6; // Fallback estimate
        }
        
        // Center the score in its column
        const scoreX = margin + colWidthName + (colWidthScore * index) + (colWidthScore / 2) - (textWidth / 2);
        
        page.drawText(scoreText, {
          x: Math.max(margin + colWidthName + (colWidthScore * index) + 5, scoreX),
          y: currentY,
          size: textSize,
          font: category.key === 'overallScore' ? helveticaBoldFont : helveticaFont,
          color: scoreColor
        });
      });
      
      currentY -= lineHeight;
      drawHorizontalLine(currentY + lineHeight / 2);
      currentY -= lineHeight / 2;
    }
    
    // Common Issues Section
    currentY -= lineHeight;
    ensureSpace(lineHeight * 3);
    drawSectionHeader('Common Issues', currentY);
    currentY -= lineHeight * 2;
    
    // Process each vehicle one at a time
    for (let vehicleIndex = 0; vehicleIndex < vehicles.length; vehicleIndex++) {
      const vehicle = vehicles[vehicleIndex];
      
      // Draw vehicle name
      ensureSpace(lineHeight * 2);
      const vehicleName = `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim();
      
      page.drawText(`${vehicleIndex + 1}. ${vehicleName}:`, {
        x: margin,
        y: currentY,
        size: textSize,
        font: helveticaBoldFont,
      });
      
      currentY -= lineHeight * 1.5;
      
      // Check if there are common issues
      const commonIssues = vehicle.reliability_data?.commonIssues;
      if (commonIssues && Array.isArray(commonIssues) && commonIssues.length > 0) {
        // Process each issue
        for (const issue of commonIssues) {
          ensureSpace(lineHeight * 4);
          
          // Issue description
          const issueText = `• ${issue.description || 'Unknown issue'}`;
          const wrappedLines = wrapText(issueText, width - 2 * margin - 20, textSize, helveticaFont);
          
          // Draw each line of the wrapped text
          for (let i = 0; i < wrappedLines.length; i++) {
            page.drawText(wrappedLines[i], {
              x: margin + 10,
              y: currentY,
              size: textSize,
              font: helveticaFont,
            });
            
            currentY -= lineHeight * 0.9;
          }
          
          // Issue details indented
          const detailsIndent = margin + 25;
          
          // Add cost if present
          if (issue.costToFix) {
            ensureSpace(lineHeight);
            page.drawText(`Cost to Fix: ${issue.costToFix}`, {
              x: detailsIndent,
              y: currentY,
              size: textSize - 1,
              font: helveticaFont,
              color: rgb(0.3, 0.3, 0.3),
            });
            
            currentY -= lineHeight * 0.9;
          }
          
          // Add occurrence if present
          if (issue.occurrence) {
            ensureSpace(lineHeight);
            page.drawText(`Frequency: ${issue.occurrence}`, {
              x: detailsIndent,
              y: currentY,
              size: textSize - 1,
              font: helveticaFont,
              color: rgb(0.3, 0.3, 0.3),
            });
            
            currentY -= lineHeight * 0.9;
          }
          
          // Add mileage information if present, with km conversion
          if (issue.mileage) {
            ensureSpace(lineHeight);
            
            let mileageText = issue.mileage;
            if (typeof issue.mileage === 'string') {
              // Extract numbers and convert to include km
              const mileageMatches = issue.mileage.match(/(\d[\d,]*)/g);
              if (mileageMatches) {
                for (const match of mileageMatches) {
                  const numericValue = parseInt(match.replace(/,/g, ''));
                  if (!isNaN(numericValue)) {
                    const kmValue = milesToKilometers(numericValue);
                    mileageText = mileageText.replace(
                      match, 
                      `${numericValue.toLocaleString()} miles (${kmValue.toLocaleString()} km)`
                    );
                  }
                }
              }
            }
            
            const wrappedMileage = wrapText(`Typical Mileage: ${mileageText}`, width - 2 * margin - 30, textSize - 1, helveticaFont);
            
            for (const line of wrappedMileage) {
              ensureSpace(lineHeight);
              page.drawText(line, {
                x: detailsIndent,
                y: currentY,
                size: textSize - 1,
                font: helveticaFont,
                color: rgb(0.3, 0.3, 0.3),
              });
              
              currentY -= lineHeight * 0.9;
            }
          }
          
          currentY -= lineHeight * 0.5;
        }
      } else {
        // No issues found
        page.drawText('No common issues reported for this vehicle.', {
          x: margin + 10,
          y: currentY,
          size: textSize,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5),
        });
        
        currentY -= lineHeight * 1.5;
      }
      
      currentY -= lineHeight;
    }
    
    // Add interpretation guide
    ensureSpace(lineHeight * 6);
    drawSectionHeader('Interpretation Guide', currentY);
    currentY -= lineHeight * 1.5;
    
    const interpretationText = [
      "How to interpret these scores:",
      "• 80-100: Excellent reliability - Few issues expected",
      "• 60-79: Good reliability - Occasional issues may arise",
      "• 40-59: Average reliability - Several issues likely",
      "• Below 40: Poor reliability - Frequent issues expected"
    ];
    
    for (const line of interpretationText) {
      ensureSpace(lineHeight);
      page.drawText(line, {
        x: margin,
        y: currentY,
        size: textSize,
        font: line === interpretationText[0] ? helveticaBoldFont : helveticaFont,
      });
      
      currentY -= lineHeight;
    }
    
    // Add footer to all pages
    const pageCount = pdfDoc.getPageCount();
    for (let i = 0; i < pageCount; i++) {
      const footerPage = pdfDoc.getPage(i);
      
      // Page number
      footerPage.drawText(`Page ${i + 1} of ${pageCount}`, {
        x: width - margin - 80,
        y: 30,
        size: 10,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // Disclaimer on last page
      if (i === pageCount - 1) {
        footerPage.drawText('This report was generated automatically. Data should be verified with a qualified mechanic.', {
          x: margin,
          y: 40,
          size: 10,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
      
      // Logo/branding
      footerPage.drawText('Powered by Lemnaed.com', {
        x: margin,
        y: 20,
        size: 10,
        font: helveticaBoldFont,
        color: rgb(0, 0.3, 0.7),
      });
    }
    
    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    
    // Set the content type and send the PDF bytes
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="vehicle-comparison-report.pdf"`);
    res.status(200).send(Buffer.from(pdfBytes));
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ 
      error: 'Failed to generate PDF report',
      details: error.message 
    });
  }
}

// Helper function to wrap text
function wrapText(text, maxWidth, fontSize, font) {
  if (!text || typeof text !== 'string') {
    return [''];
  }
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    let lineWidth;
    try {
      lineWidth = font.widthOfTextAtSize(testLine, fontSize);
    } catch (error) {
      // Fallback calculation if font width calculation fails
      lineWidth = testLine.length * (fontSize * 0.6);
    }
    
    if (lineWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [''];
}

export default withAuth(handler);