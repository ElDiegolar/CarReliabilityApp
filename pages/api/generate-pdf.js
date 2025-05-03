// Modified version of pages/api/generate-pdf.js that includes timeline data and vehicle image
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { query } from '../../lib/database';

export const config = {
  runtime: 'nodejs',
  api: {
    responseLimit: '10mb',
  },
};

// Helper function to strip emoji characters
function stripEmoji(text) {
  if (typeof text !== 'string') return text;
  // Remove emojis using regex
  return text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emoticons
    .replace(/[\u{2600}-\u{26FF}]/gu, '') // Miscellaneous symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
    .replace(/[\u{1F100}-\u{1F1FF}]/gu, '') // Enclosed characters
    .replace(/[\u{1F200}-\u{1F2FF}]/gu, '') // Enclosed ideographic supplement
    .replace(/[\u{1F000}-\u{1F02F}]/gu, '') // Mahjong tiles
    .replace(/[\u{1F0A0}-\u{1F0FF}]/gu, '') // Playing cards
    .replace(/[\u{20A0}-\u{20CF}]/gu, '') // Currency symbols
    .replace(/[\u{2190}-\u{21FF}]/gu, '') // Arrows
    .replace(/[\u{2300}-\u{23FF}]/gu, '') // Miscellaneous Technical
    .replace(/[\u{2460}-\u{24FF}]/gu, '') // Enclosed alphanumerics
    .replace(/[\u{25A0}-\u{25FF}]/gu, '') // Geometric shapes
    .replace(/[\u{2B00}-\u{2BFF}]/gu, ''); // Miscellaneous symbols and arrows
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { year, make, model, mileage, reliability_data, timeline_data, imageUrl } = req.body;
    
    // Validate required fields
    if (!year || !make || !model || !mileage || !reliability_data) {
      return res.status(400).json({ error: 'Missing required vehicle information' });
    }

    // Strip emojis from all text inputs
    const cleanData = {
      year: stripEmoji(String(year)),
      make: stripEmoji(String(make)),
      model: stripEmoji(String(model)),
      mileage: mileage,
      reliability_data: {...reliability_data},
      timeline_data: timeline_data ? [...timeline_data] : null,
      imageUrl: imageUrl
    };

    // Clean the reliability data
    if (cleanData.reliability_data.aiAnalysis) {
      cleanData.reliability_data.aiAnalysis = stripEmoji(cleanData.reliability_data.aiAnalysis);
    }
    
    if (cleanData.reliability_data.commonIssues) {
      cleanData.reliability_data.commonIssues = cleanData.reliability_data.commonIssues.map(issue => ({
        ...issue,
        description: stripEmoji(issue.description),
        costToFix: stripEmoji(issue.costToFix),
        occurrence: stripEmoji(issue.occurrence),
        mileage: stripEmoji(issue.mileage)
      }));
    }

    // Clean timeline data
    if (cleanData.timeline_data) {
      cleanData.timeline_data = cleanData.timeline_data.map(event => ({
        ...event,
        title: stripEmoji(event.title),
        description: stripEmoji(event.description),
        engineeringChanges: event.engineeringChanges ? event.engineeringChanges.map(change => stripEmoji(change)) : []
      }));
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
    const textSize = 11;
    const headerSize = 24;
    const subheaderSize = 16;
    const lineHeight = 18;
    
    // Add decorative header bar
    page.drawRectangle({
      x: 0,
      y: height - 70,
      width: width,
      height: 70,
      color: rgb(0.98, 0.98, 0.98),
    });
    
    // Add subtle brand accent line
    page.drawRectangle({
      x: 0,
      y: height - 70,
      width: width,
      height: 3,
      color: rgb(0, 0.4, 0.8),
    });
    
    // Add header
    page.drawText(`Vehicle Reliability Report`, {
      x: margin,
      y: currentY,
      size: headerSize,
      font: helveticaBoldFont,
      color: rgb(0.1, 0.1, 0.2),
    });
    
    currentY -= 40;
    
    // Vehicle info section with subtle background
    const vehicleInfoBoxY = currentY - 40;
    page.drawRectangle({
      x: margin - 10,
      y: vehicleInfoBoxY - 20,
      width: width - 2 * margin + 20,
      height: 80,
      color: rgb(0.96, 0.97, 0.99),
      borderColor: rgb(0.8, 0.85, 0.9),
      borderWidth: 1,
    });
    
    page.drawText(`${cleanData.year} ${cleanData.make} ${cleanData.model}`, {
      x: margin,
      y: currentY,
      size: headerSize - 4,
      font: helveticaBoldFont,
      color: rgb(0.1, 0.1, 0.2),
    });
    
    currentY -= lineHeight + 4;
    
    page.drawText(`Mileage: ${cleanData.mileage.toLocaleString()} miles`, {
      x: margin,
      y: currentY,
      size: textSize,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.4),
    });
    
    currentY -= lineHeight * 1.5;
    
    // Draw modern reliability score box with gradient effect (simulated)
    const scoreBoxWidth = 180;
    const scoreBoxHeight = 100;
    const scoreBoxX = width - margin - scoreBoxWidth;
    const scoreBoxY = currentY - 20;
    
    // Background shadow for depth
    page.drawRectangle({
      x: scoreBoxX - 2,
      y: scoreBoxY - 2,
      width: scoreBoxWidth + 4,
      height: scoreBoxHeight + 4,
      color: rgb(0.85, 0.85, 0.85),
      borderColor: rgb(0.7, 0.7, 0.7),
      borderWidth: 0.5,
    });
    
    // Main background of score box
    page.drawRectangle({
      x: scoreBoxX,
      y: scoreBoxY,
      width: scoreBoxWidth,
      height: scoreBoxHeight,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.8, 0.85, 0.9),
      borderWidth: 2,
    });
    
    // Decorative top bar
    page.drawRectangle({
      x: scoreBoxX,
      y: scoreBoxY + scoreBoxHeight - 4,
      width: scoreBoxWidth,
      height: 4,
      color: rgb(0, 0.4, 0.8),
    });
    
    // Score label
    page.drawText(`Overall Score`, {
      x: scoreBoxX + 30,
      y: scoreBoxY + scoreBoxHeight - 35,
      size: subheaderSize - 2,
      font: helveticaBoldFont,
      color: rgb(0.2, 0.2, 0.3),
    });
    
    // The actual score
    page.drawText(`${cleanData.reliability_data.overallScore}`, {
      x: scoreBoxX + 55,
      y: scoreBoxY + 35,
      size: 32,
      font: helveticaBoldFont,
      color: getScoreColor(cleanData.reliability_data.overallScore),
    });
    
    page.drawText(`/100`, {
      x: scoreBoxX + 120,
      y: scoreBoxY + 35,
      size: subheaderSize,
      font: helveticaBoldFont,
      color: rgb(0.4, 0.4, 0.5),
    });
    
    // Date of report
    page.drawText(`Report Generated: ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: height - 170,
      size: textSize - 1,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    currentY -= lineHeight * 2;
    
    // Add vehicle image if available
    if (imageUrl) {
      try {
        // Fetch the image with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        console.log(`Attempting to fetch image: ${imageUrl}`);
        
        const imageResponse = await fetch(imageUrl, { 
          signal: controller.signal,
          headers: {
            // Some images might require a user-agent header
            'User-Agent': 'Mozilla/5.0 Vehicle Report Generator'
          }
        });
        clearTimeout(timeoutId);
        
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
        }
        
        const contentType = imageResponse.headers.get('content-type');
        console.log(`Image content type: ${contentType}`);
        
        const imageBytes = await imageResponse.arrayBuffer();
        console.log(`Image size: ${imageBytes.byteLength} bytes`);
        
        // Determine image type and embed accordingly
        let embeddedImage;
        if (contentType?.includes('jpeg') || contentType?.includes('jpg') || 
            imageUrl.toLowerCase().endsWith('.jpg') || imageUrl.toLowerCase().endsWith('.jpeg') || 
            imageUrl.includes('jpg') || imageUrl.includes('jpeg')) {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } else if (contentType?.includes('png') || imageUrl.toLowerCase().endsWith('.png') || 
                  imageUrl.includes('png')) {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else {
          // Try to determine from the first few bytes
          const header = new Uint8Array(imageBytes.slice(0, 4));
          const hexHeader = Array.from(header).map(b => b.toString(16).padStart(2, '0')).join('');
          
          console.log(`Image header: ${hexHeader}`);
          
          if (hexHeader.startsWith('ffd8')) {
            // JPEG starts with FFD8
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
          } else if (hexHeader.startsWith('89504e47')) {
            // PNG starts with 89 50 4E 47
            embeddedImage = await pdfDoc.embedPng(imageBytes);
          } else {
            // Default to JPG if type can't be determined
            console.log("Unable to determine image type, defaulting to JPG");
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
          }
        }
        
        // Scale the image - maintain aspect ratio but don't exceed 300px width
        const imgWidth = Math.min(300, width - 2 * margin);
        const scale = imgWidth / embeddedImage.width;
        const imgHeight = embeddedImage.height * scale;
        
        // Draw the image with rounded corners effect (using border)
        const imageY = currentY - imgHeight;
        
        // Border around image
        page.drawRectangle({
          x: margin - 2,
          y: imageY - 2,
          width: imgWidth + 4,
          height: imgHeight + 4,
          color: rgb(1, 1, 1),
          borderColor: rgb(0.85, 0.85, 0.85),
          borderWidth: 2,
        });
        
        page.drawImage(embeddedImage, {
          x: margin,
          y: imageY,
          width: imgWidth,
          height: imgHeight,
        });
        
        // Update the current Y position to be below the image
        currentY -= imgHeight + 30;
        
        console.log("Successfully embedded image in PDF");
      } catch (err) {
        console.error("Image embedding failed:", err);
        // Additional logging for debugging
        if (err.name === 'AbortError') {
          console.warn("Image fetch timed out after 8 seconds");
        }
        // Continue with PDF generation even if image fails
      }
    }
    
    // Category scores section with modern styling
    page.drawText(`Category Scores`, {
      x: margin,
      y: currentY,
      size: subheaderSize,
      font: helveticaBoldFont,
      color: rgb(0.1, 0.1, 0.2),
    });
    
    currentY -= lineHeight * 1.5;
    
    // Engine
    drawCategoryScore(page, margin, currentY, 'Engine', cleanData.reliability_data.categories.engine, helveticaFont, helveticaBoldFont);
    currentY -= lineHeight + 4;
    
    // Transmission
    drawCategoryScore(page, margin, currentY, 'Transmission', cleanData.reliability_data.categories.transmission, helveticaFont, helveticaBoldFont);
    currentY -= lineHeight + 4;
    
    // Check if full report with all categories is available
    if (cleanData.reliability_data.isPremium) {
      // Electrical System
      drawCategoryScore(page, margin, currentY, 'Electrical System', cleanData.reliability_data.categories.electricalSystem, helveticaFont, helveticaBoldFont);
      currentY -= lineHeight + 4;
      
      // Brakes
      drawCategoryScore(page, margin, currentY, 'Brakes', cleanData.reliability_data.categories.brakes, helveticaFont, helveticaBoldFont);
      currentY -= lineHeight + 4;
      
      // Suspension
      drawCategoryScore(page, margin, currentY, 'Suspension', cleanData.reliability_data.categories.suspension, helveticaFont, helveticaBoldFont);
      currentY -= lineHeight + 4;
      
      // Fuel System
      drawCategoryScore(page, margin, currentY, 'Fuel System', cleanData.reliability_data.categories.fuelSystem, helveticaFont, helveticaBoldFont);
      currentY -= lineHeight * 2;
    } else {
      // For free users, add note about premium
      currentY -= lineHeight;
      page.drawText(`Upgrade to premium for detailed category breakdown scores.`, {
        x: margin + 20,
        y: currentY,
        size: textSize,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.8),
      });
      currentY -= lineHeight * 2;
    }
    
    // Common issues section if premium
    if (cleanData.reliability_data.isPremium && cleanData.reliability_data.commonIssues && cleanData.reliability_data.commonIssues.length > 0) {
      page.drawText(`Common Issues`, {
        x: margin,
        y: currentY,
        size: subheaderSize,
        font: helveticaBoldFont,
        color: rgb(0.1, 0.1, 0.2),
      });
      
      currentY -= lineHeight * 1.5;
      
      // Loop through common issues
      for (const issue of cleanData.reliability_data.commonIssues) {
        // Add subtle background for each issue
        const issueBoxY = currentY - (lineHeight * 3.5);
        page.drawRectangle({
          x: margin - 5,
          y: issueBoxY - 5,
          width: width - 2 * margin + 10,
          height: lineHeight * 3.5 + 10,
          color: rgb(0.98, 0.98, 0.99),
          borderColor: rgb(0.9, 0.9, 0.95),
          borderWidth: 1,
        });
        
        // Issue description
        page.drawText(`• ${issue.description}`, {
          x: margin,
          y: currentY,
          size: textSize,
          font: helveticaBoldFont,
          color: rgb(0.8, 0.2, 0.2),
        });
        
        currentY -= lineHeight;
        
        // Issue details
        page.drawText(`   Cost to Fix: ${issue.costToFix}`, {
          x: margin,
          y: currentY,
          size: textSize,
          font: helveticaFont,
          color: rgb(0.3, 0.3, 0.4),
        });
        
        currentY -= lineHeight;
        
        page.drawText(`   Occurrence: ${issue.occurrence}`, {
          x: margin,
          y: currentY,
          size: textSize,
          font: helveticaFont,
          color: rgb(0.3, 0.3, 0.4),
        });
        
        currentY -= lineHeight;
        
        page.drawText(`   Typical Mileage: ${issue.mileage}`, {
          x: margin,
          y: currentY,
          size: textSize,
          font: helveticaFont,
          color: rgb(0.3, 0.3, 0.4),
        });
        
        currentY -= lineHeight * 1.5;
        
        // If we're running out of space, add a new page
        if (currentY < 150) {
          page = pdfDoc.addPage([612, 792]);
          currentY = height - 50;
        }
      }
    } else if (!cleanData.reliability_data.isPremium) {
      page.drawText(`Common Issues`, {
        x: margin,
        y: currentY,
        size: subheaderSize,
        font: helveticaBoldFont,
        color: rgb(0.1, 0.1, 0.2),
      });
      
      currentY -= lineHeight * 1.5;
      
      page.drawText(`Upgrade to premium for detailed common issues information.`, {
        x: margin + 20,
        y: currentY,
        size: textSize,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.8),
      });
      
      currentY -= lineHeight * 2;
    }
    
    // Analysis section
    page.drawText(`Reliability Analysis`, {
      x: margin,
      y: currentY,
      size: subheaderSize,
      font: helveticaBoldFont,
      color: rgb(0.1, 0.1, 0.2),
    });
    
    currentY -= lineHeight * 1.5;
    
    // AI analysis text - we need to wrap this text
    const analysisText = cleanData.reliability_data.isPremium 
      ? cleanData.reliability_data.aiAnalysis 
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
        color: cleanData.reliability_data.isPremium ? rgb(0.2, 0.2, 0.3) : rgb(0.4, 0.4, 0.8),
      });
      
      currentY -= lineHeight;
      
      // If we're running out of space, add a new page
      if (currentY < 100) {
        page = pdfDoc.addPage([612, 792]);
        currentY = height - 50;
      }
    }

    // Add timeline section if premium and timeline data exists
    if (cleanData.reliability_data.isPremium && cleanData.timeline_data && cleanData.timeline_data.length > 0) {
      // Add a new page for the timeline
      page = pdfDoc.addPage([612, 792]);
      currentY = height - 50;
      
      // Timeline header with background
      page.drawRectangle({
        x: 0,
        y: height - 70,
        width: width,
        height: 70,
        color: rgb(0.96, 0.97, 0.99),
      });
      
      page.drawText(`Design History & Engineering Timeline`, {
        x: margin,
        y: currentY,
        size: headerSize - 4,
        font: helveticaBoldFont,
        color: rgb(0.1, 0.1, 0.2),
      });
      
      currentY -= lineHeight * 2;
      
      page.drawText(`${cleanData.year} ${cleanData.make} ${cleanData.model} Evolution Timeline`, {
        x: margin,
        y: currentY,
        size: subheaderSize,
        font: helveticaBoldFont,
        color: rgb(0.3, 0.3, 0.4),
      });
      
      currentY -= lineHeight * 2;
      
      // Draw timeline events
      for (const event of cleanData.timeline_data) {
        // Check if we need a new page
        if (currentY < 180) {
          page = pdfDoc.addPage([612, 792]);
          currentY = height - 50;
        }
        
        // Year bubble with modern styling
        const bubbleSize = 35;
        const bubbleX = margin + 5;
        const bubbleY = currentY - (bubbleSize / 2);
        
        // Draw outer circle (border effect)
        page.drawCircle({
          x: bubbleX + (bubbleSize / 2),
          y: bubbleY,
          size: (bubbleSize / 2) + 2,
          color: rgb(0.9, 0.9, 0.95),
        });
        
        // Draw inner circle (main)
        page.drawCircle({
          x: bubbleX + (bubbleSize / 2),
          y: bubbleY,
          size: bubbleSize / 2,
          color: rgb(0, 0.4, 0.8),
        });
        
        // Year text in bubble
        page.drawText(event.year.toString(), {
          x: bubbleX + (event.year.toString().length === 4 ? 9 : 14),
          y: bubbleY - 5,
          size: 12,
          font: helveticaBoldFont,
          color: rgb(1, 1, 1),
        });
        
        // Draw vertical line (timeline connector)
        if (cleanData.timeline_data.indexOf(event) < cleanData.timeline_data.length - 1) {
          page.drawLine({
            start: { x: bubbleX + (bubbleSize / 2), y: bubbleY - (bubbleSize / 2) },
            end: { x: bubbleX + (bubbleSize / 2), y: bubbleY - (bubbleSize * 2.5) },
            thickness: 2,
            color: rgb(0.8, 0.85, 0.9),
          });
        }
        
        // Event title
        page.drawText(event.title, {
          x: margin + bubbleSize + 15,
          y: currentY,
          size: subheaderSize - 2,
          font: helveticaBoldFont,
          color: rgb(0.1, 0.1, 0.2),
        });
        
        currentY -= lineHeight * 1.5;
        
        // Event description - wrap text
        const descriptionLines = splitTextToLines(
          event.description,
          width - 2 * margin - bubbleSize - 15,
          textSize,
          helveticaFont
        );
        
        for (const line of descriptionLines) {
          page.drawText(line, {
            x: margin + bubbleSize + 15,
            y: currentY,
            size: textSize,
            font: helveticaFont,
            color: rgb(0.2, 0.2, 0.3),
          });
          
          currentY -= lineHeight;
        }
        
        // Engineering changes if they exist
        if (event.engineeringChanges && event.engineeringChanges.length > 0) {
          currentY -= lineHeight / 2;
          
          page.drawText(`Engineering Changes:`, {
            x: margin + bubbleSize + 15,
            y: currentY,
            size: textSize,
            font: helveticaBoldFont,
            color: rgb(0.3, 0.3, 0.4),
          });
          
          currentY -= lineHeight;
          
          for (const change of event.engineeringChanges) {
            page.drawText(`• ${change}`, {
              x: margin + bubbleSize + 25,
              y: currentY,
              size: textSize,
              font: helveticaFont,
              color: rgb(0.2, 0.2, 0.3),
            });
            
            currentY -= lineHeight;
          }
        }
        
        // Add spacing between timeline events
        currentY -= lineHeight * 1.5;
      }
    } else if (cleanData.reliability_data.isPremium && (!cleanData.timeline_data || cleanData.timeline_data.length === 0)) {
      // If premium but no timeline data
      currentY -= lineHeight * 2;
      
      page.drawText(`Design History & Engineering Timeline`, {
        x: margin,
        y: currentY,
        size: subheaderSize,
        font: helveticaBoldFont,
        color: rgb(0.1, 0.1, 0.2),
      });
      
      currentY -= lineHeight * 1.5;
      
      page.drawText(`No timeline data available for this vehicle model.`, {
        x: margin,
        y: currentY,
        size: textSize,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
    } else if (!cleanData.reliability_data.isPremium) {
      // For free users, mention timeline is a premium feature
      currentY -= lineHeight * 2;
      
      page.drawText(`Design History & Engineering Timeline`, {
        x: margin,
        y: currentY,
        size: subheaderSize,
        font: helveticaBoldFont,
        color: rgb(0.1, 0.1, 0.2),
      });
      
      currentY -= lineHeight * 1.5;
      
      page.drawText(`Upgrade to premium to access the complete design history and engineering timeline.`, {
        x: margin,
        y: currentY,
        size: textSize,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.8),
      });
    }
    
    // Add disclaimer at the bottom of the first page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    firstPage.drawText('Disclaimer: This report is based on aggregated data and may not represent your specific vehicle. Always consult a qualified mechanic.', {
      x: margin,
      y: 50,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Add footer with powered by info
    firstPage.drawText('Powered by Verida.com', {
      x: margin,
      y: 30,
      size: 10,
      font: helveticaBoldFont,
      color: rgb(0, 0.4, 0.8),
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
    return rgb(0, 0.7, 0.2); // Green for high scores
  } else if (score >= 60) {
    return rgb(0.9, 0.6, 0); // Orange for medium scores
  } else {
    return rgb(0.9, 0.1, 0); // Red for low scores
  }
}

// Helper function to draw category score with bar
function drawCategoryScore(page, x, y, category, score, regularFont, boldFont) {
  const barWidth = 160;
  const barHeight = 12;
  const scoreBarX = x + 240;
  
  // Category name
  page.drawText(`${category}:`, {
    x: x,
    y: y,
    size: 12,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.3),
  });
  
  // Score number
  page.drawText(`${score}/100`, {
    x: x + 180,
    y: y,
    size: 12,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.4),
  });
  
  // Background bar (light gray)
  page.drawRectangle({
    x: scoreBarX,
    y: y - 2,
    width: barWidth,
    height: barHeight,
    color: rgb(0.94, 0.94, 0.96),
  });
  
  // Score bar (colored based on score) with subtle gradient effect
  const scoreWidth = (barWidth * score) / 100;
  page.drawRectangle({
    x: scoreBarX,
    y: y - 2,
    width: scoreWidth,
    height: barHeight,
    color: getScoreColor(score),
  });
  
  // Add subtle border around the entire bar
  page.drawRectangle({
    x: scoreBarX,
    y: y - 2,
    width: barWidth,
    height: barHeight,
    borderColor: rgb(0.85, 0.85, 0.88),
    borderWidth: 1,
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