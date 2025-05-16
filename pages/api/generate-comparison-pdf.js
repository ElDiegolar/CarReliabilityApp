// pages/api/generate-comparison-pdf.js - Updated with kilometers conversion and row-based layout
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
      const kmValue = milesToKilometers(vehicle.mileage);
      page.drawText(`${index + 1}. ${vehicle.year} ${vehicle.make} ${vehicle.model}`, {
        x: margin,
        y: currentY,
        size: textSize,
        font: helveticaBoldFont,
      });
      
      page.drawText(`Mileage: ${vehicle.mileage.toLocaleString()} miles (${kmValue.toLocaleString()} km)`, {
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
    
    // Draw reliability scores in a row-based layout
    const tableWidth = width - 2 * margin;
    const colWidthName = 150; // Width of criteria name column
    const colWidthScore = (tableWidth - colWidthName) / vehicles.length; // Equal width for each vehicle
    
    // Draw table headers
    page.drawText('Category', margin, currentY, { size: textSize, font: helveticaBoldFont });
    
    vehicles.forEach((vehicle, index) => {
      const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
      page.drawText(vehicleName, margin + colWidthName + (colWidthScore * index), currentY, { 
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
      // Skip premium categories if not needed (shouldn't happen here since user is premium)
      if (category.premium && !isPremium) continue;
      
      ensureSpace(lineHeight * 2);
      
      // Draw category name
      page.drawText(category.name, margin, currentY, { 
        size: textSize, 
        font: category.key === 'overallScore' ? helveticaBoldFont : helveticaFont 
      });
      
      // Draw score for each vehicle
      vehicles.forEach((vehicle, index) => {
        let score;
        if (category.key === 'overallScore') {
          score = vehicle.reliability_data?.overallScore || 'N/A';
        } else if (category.category) {
          score = vehicle.reliability_data?.categories?.[category.key] || 'N/A';
        } else {
          score = 'N/A';
        }
        
        // Draw score with appropriate color
        const scoreColor = score !== 'N/A' ? getScoreColor(score) : rgb(0, 0, 0);
        const textWidth = helveticaBoldFont.widthOfTextAtSize(score.toString(), textSize);
        
        // Center the score in its column
        const scoreX = margin + colWidthName + (colWidthScore * index) + (colWidthScore / 2) - (textWidth / 2);
        
        page.drawText(score.toString(), scoreX, currentY, { 
          size: textSize, 
          font: category.key === 'overallScore' ? helveticaBoldFont : helveticaFont,
          color: scoreColor
        });
      });
      
      currentY -= lineHeight;
      drawHorizontalLine(currentY + lineHeight / 2);
      currentY -= lineHeight / 2;
    }
    
    // Common Issues Section - using row-based layout
    currentY -= lineHeight;
    ensureSpace(lineHeight * 3);
    drawSectionHeader('Common Issues', currentY);
    currentY -= lineHeight * 2;
    
    // Create a new page for common issues if space is limited
    if (currentY < height / 2) {
      page = pdfDoc.addPage([612, 792]);
      currentY = height - 50;
      drawSectionHeader('Common Issues', currentY);
      currentY -= lineHeight * 2;
    }
    
    // Process each vehicle one at a time
    for (let vehicleIndex = 0; vehicleIndex < vehicles.length; vehicleIndex++) {
      const vehicle = vehicles[vehicleIndex];
      
      // Draw vehicle name
      ensureSpace(lineHeight * 2);
      page.drawText(`${vehicleIndex + 1}. ${vehicle.year} ${vehicle.make} ${vehicle.model}:`, {
        x: margin,
        y: currentY,
        size: textSize,
        font: helveticaBoldFont,
      });
      
      currentY -= lineHeight * 1.5;
      
      // Check if there are common issues
      if (vehicle.reliability_data?.commonIssues?.length > 0) {
        // Process each issue
        for (const issue of vehicle.reliability_data.commonIssues) {
          ensureSpace(lineHeight * 4); // Ensure space for the issue
          
          // Format and wrap issue description
          const issueText = `• ${issue.description}`;
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
            
            // Try to convert any numeric values in the mileage string to include km
            let mileageText = issue.mileage;
            if (typeof issue.mileage === 'string') {
              // Extract numbers from the string
              const mileageMatches = issue.mileage.match(/(\d[\d,]*)/g);
              if (mileageMatches) {
                mileageText = issue.mileage;
                
                // Replace each number with its miles/km equivalent
                for (const match of mileageMatches) {
                  const numericValue = parseInt(match.replace(/,/g, ''));
                  if (!isNaN(numericValue)) {
                    const kmValue = milesToKilometers(numericValue);
                    // Replace numbers while preserving text around them
                    mileageText = mileageText.replace(
                      match, 
                      `${numericValue.toLocaleString()} miles (${kmValue.toLocaleString()} km)`
                    );
                  }
                }
              }
            }
            
            // Wrap the mileage text if needed
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
          
          // Add space between issues
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
      
      // Add space between vehicles
      currentY -= lineHeight;
    }
    
    // Add a conclusion/interpretation section
    ensureSpace(lineHeight * 5);
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
        footerPage.drawText('This Lemnaed comparison report was generated automatically. Data should be verified with a qualified mechanic.', {
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
    res.setHeader('Content-Disposition', `attachment; filename="Lemnaed-vehicle-comparison-report.pdf"`);
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