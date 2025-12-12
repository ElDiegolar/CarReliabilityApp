// pages/api/generate-product-pdf.js - Generate PDF for product reliability reports
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const config = {
  runtime: 'nodejs',
  api: {
    responseLimit: '10mb',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, productData, reliability_data, specifications_data, timeline_data } = req.body;
    
    // Log data structure for debugging
    console.log('PDF Generation - Data received:');
    console.log('category:', category);
    console.log('productData:', productData);
    console.log('reliability_data keys:', reliability_data ? Object.keys(reliability_data) : 'null');
    console.log('commonIssues type:', typeof reliability_data?.commonIssues);
    console.log('specifications type:', typeof specifications_data);
    
    // Validate required fields
    if (!category) {
      return res.status(400).json({ error: 'Missing category', details: 'Category is required' });
    }
    if (!productData) {
      return res.status(400).json({ error: 'Missing product data', details: 'Product data is required' });
    }
    if (!reliability_data) {
      return res.status(400).json({ error: 'Missing reliability data', details: 'Reliability data is required' });
    }

    // Initialize PDF document
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add a page to the PDF
    let page = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = page.getSize();

    // Set some initial variables for positioning
    let currentY = height - 50;
    const margin = 50;
    const textSize = 12;
    const headerSize = 18;
    const subheaderSize = 14;
    const lineHeight = 20;
    const maxWidth = width - (margin * 2);
    
    // Helper function to add new page if needed
    const checkAndAddPage = () => {
      if (currentY < 100) {
        page = pdfDoc.addPage([612, 792]);
        currentY = height - 50;
        return true;
      }
      return false;
    };

    // Helper function to wrap text
    const wrapText = (text, maxWidth, fontSize, font) => {
      if (!text || typeof text !== 'string') {
        return [''];
      }
      
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines.length > 0 ? lines : [''];
    };

    // Add header
    page.drawText(`Product Reliability Report`, {
      x: margin,
      y: currentY,
      size: 24,
      font: helveticaBoldFont,
      color: rgb(0, 0.3, 0.7),
    });
    
    currentY -= 40;
    
    // Product info section
    const productTitle = `${productData.brand || ''} ${productData.model || 'Product'}`.trim();
    page.drawText(productTitle, {
      x: margin,
      y: currentY,
      size: headerSize,
      font: helveticaBoldFont,
    });
    
    currentY -= lineHeight;
    
    page.drawText(`Category: ${category}`, {
      x: margin,
      y: currentY,
      size: textSize,
      font: helveticaFont,
    });
    
    currentY -= 30;
    
    // Overall Score Section
    page.drawText('Overall Reliability Score', {
      x: margin,
      y: currentY,
      size: subheaderSize,
      font: helveticaBoldFont,
      color: rgb(0, 0.3, 0.7),
    });
    
    currentY -= 25;
    
    const overallScore = reliability_data.overallScore || 0;
    page.drawText(`${overallScore}/100`, {
      x: margin,
      y: currentY,
      size: 36,
      font: helveticaBoldFont,
      color: overallScore >= 80 ? rgb(0.2, 0.7, 0.2) : 
             overallScore >= 60 ? rgb(0.9, 0.7, 0.0) : 
             overallScore >= 40 ? rgb(0.9, 0.5, 0.0) : rgb(0.8, 0.2, 0.2),
    });
    
    currentY -= 40;
    
    // Rating description
    let ratingText = '';
    if (overallScore >= 80) ratingText = 'Excellent reliability rating';
    else if (overallScore >= 60) ratingText = 'Good reliability rating';
    else if (overallScore >= 40) ratingText = 'Average reliability rating';
    else ratingText = 'Below average reliability rating';
    
    page.drawText(ratingText, {
      x: margin,
      y: currentY,
      size: textSize,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    currentY -= 35;
    
    // Category Scores
    if (reliability_data.categories && Object.keys(reliability_data.categories).length > 0) {
      checkAndAddPage();
      
      page.drawText('Category Breakdown', {
        x: margin,
        y: currentY,
        size: subheaderSize,
        font: helveticaBoldFont,
        color: rgb(0, 0.3, 0.7),
      });
      
      currentY -= 25;
      
      for (const [categoryName, score] of Object.entries(reliability_data.categories)) {
        checkAndAddPage();
        
        const formattedCategory = categoryName.charAt(0).toUpperCase() + 
                                 categoryName.slice(1).replace(/([A-Z])/g, ' $1');
        
        page.drawText(`${formattedCategory}:`, {
          x: margin,
          y: currentY,
          size: textSize,
          font: helveticaBoldFont,
        });
        
        page.drawText(`${score}/100`, {
          x: margin + 200,
          y: currentY,
          size: textSize,
          font: helveticaFont,
          color: score >= 80 ? rgb(0.2, 0.7, 0.2) : 
                 score >= 60 ? rgb(0.9, 0.7, 0.0) : 
                 score >= 40 ? rgb(0.9, 0.5, 0.0) : rgb(0.8, 0.2, 0.2),
        });
        
        currentY -= lineHeight;
      }
      
      currentY -= 15;
    }
    
    // Common Issues
    if (reliability_data.commonIssues && Array.isArray(reliability_data.commonIssues) && reliability_data.commonIssues.length > 0) {
      checkAndAddPage();
      
      page.drawText('Common Issues', {
        x: margin,
        y: currentY,
        size: subheaderSize,
        font: helveticaBoldFont,
        color: rgb(0, 0.3, 0.7),
      });
      
      currentY -= 25;
      
      for (const issue of reliability_data.commonIssues) {
        checkAndAddPage();
        
        // Handle both string and object formats
        let issueText;
        if (typeof issue === 'string') {
          issueText = issue;
        } else if (typeof issue === 'object' && issue !== null) {
          // Try common property names
          issueText = issue.description || issue.issue || issue.title || issue.name;
          // If none found, stringify the object
          if (!issueText) {
            issueText = Object.entries(issue)
              .map(([key, val]) => `${key}: ${val}`)
              .join(', ');
          }
        } else {
          issueText = 'Unknown issue';
        }
        
        const issueLines = wrapText(`• ${issueText}`, maxWidth, textSize, helveticaFont);
        for (const line of issueLines) {
          checkAndAddPage();
          page.drawText(line, {
            x: margin,
            y: currentY,
            size: textSize,
            font: helveticaFont,
          });
          currentY -= lineHeight;
        }
      }
      
      currentY -= 15;
    }
    
    // Strengths
    if (reliability_data.strengths && Array.isArray(reliability_data.strengths) && reliability_data.strengths.length > 0) {
      checkAndAddPage();
      
      page.drawText('Strengths', {
        x: margin,
        y: currentY,
        size: subheaderSize,
        font: helveticaBoldFont,
        color: rgb(0, 0.3, 0.7),
      });
      
      currentY -= 25;
      
      for (const strength of reliability_data.strengths) {
        checkAndAddPage();
        
        // Handle both string and object formats
        let strengthText;
        if (typeof strength === 'string') {
          strengthText = strength;
        } else if (typeof strength === 'object' && strength !== null) {
          // Try common property names
          strengthText = strength.description || strength.strength || strength.title || strength.name;
          // If none found, stringify the object
          if (!strengthText) {
            strengthText = Object.entries(strength)
              .map(([key, val]) => `${key}: ${val}`)
              .join(', ');
          }
        } else {
          strengthText = 'Unknown strength';
        }
        
        const strengthLines = wrapText(`• ${strengthText}`, maxWidth, textSize, helveticaFont);
        for (const line of strengthLines) {
          checkAndAddPage();
          page.drawText(line, {
            x: margin,
            y: currentY,
            size: textSize,
            font: helveticaFont,
          });
          currentY -= lineHeight;
        }
      }
      
      currentY -= 15;
    }
    
    // Overall Analysis
    if (reliability_data.overallAnalysis) {
      checkAndAddPage();
      
      page.drawText('Overall Analysis', {
        x: margin,
        y: currentY,
        size: subheaderSize,
        font: helveticaBoldFont,
        color: rgb(0, 0.3, 0.7),
      });
      
      currentY -= 25;
      
      const analysisLines = wrapText(reliability_data.overallAnalysis, maxWidth, textSize, helveticaFont);
      for (const line of analysisLines) {
        checkAndAddPage();
        page.drawText(line, {
          x: margin,
          y: currentY,
          size: textSize,
          font: helveticaFont,
        });
        currentY -= lineHeight;
      }
      
      currentY -= 15;
    }
    
    // Specifications
    if (specifications_data && Object.keys(specifications_data).length > 0) {
      checkAndAddPage();
      
      page.drawText('Specifications', {
        x: margin,
        y: currentY,
        size: subheaderSize,
        font: helveticaBoldFont,
        color: rgb(0, 0.3, 0.7),
      });
      
      currentY -= 25;
      
      for (const [key, value] of Object.entries(specifications_data)) {
        checkAndAddPage();
        
        const formattedKey = key.charAt(0).toUpperCase() + 
                            key.slice(1).replace(/([A-Z])/g, ' $1');
        
        page.drawText(`${formattedKey}:`, {
          x: margin,
          y: currentY,
          size: textSize,
          font: helveticaBoldFont,
        });
        
        // Convert value to string, handling objects properly
        let valueStr;
        if (typeof value === 'object' && value !== null) {
          valueStr = JSON.stringify(value, null, 2);
        } else if (value === null || value === undefined) {
          valueStr = 'N/A';
        } else {
          valueStr = String(value);
        }
        
        const valueLines = wrapText(valueStr, maxWidth - 150, textSize, helveticaFont);
        for (let i = 0; i < valueLines.length; i++) {
          if (i > 0) {
            currentY -= lineHeight;
            checkAndAddPage();
          }
          page.drawText(valueLines[i], {
            x: margin + 150,
            y: currentY,
            size: textSize,
            font: helveticaFont,
          });
        }
        
        currentY -= lineHeight;
      }
      
      currentY -= 15;
    }
    
    // Timeline
    if (timeline_data && Array.isArray(timeline_data) && timeline_data.length > 0) {
      checkAndAddPage();
      
      page.drawText('Product Timeline', {
        x: margin,
        y: currentY,
        size: subheaderSize,
        font: helveticaBoldFont,
        color: rgb(0, 0.3, 0.7),
      });
      
      currentY -= 25;
      
      for (const event of timeline_data) {
        checkAndAddPage();
        
        const dateText = String(event?.date || event?.year || 'N/A');
        const titleText = String(event?.title || event?.event || 'Event');
        
        page.drawText(dateText, {
          x: margin,
          y: currentY,
          size: textSize,
          font: helveticaBoldFont,
        });
        
        currentY -= lineHeight;
        checkAndAddPage();
        
        const descLines = wrapText(titleText, maxWidth, textSize, helveticaFont);
        for (const line of descLines) {
          checkAndAddPage();
          page.drawText(line, {
            x: margin,
            y: currentY,
            size: textSize,
            font: helveticaFont,
          });
          currentY -= lineHeight;
        }
        
        if (event?.description && typeof event.description === 'string') {
          const detailLines = wrapText(event.description, maxWidth, textSize - 1, helveticaFont);
          for (const line of detailLines) {
            checkAndAddPage();
            page.drawText(line, {
              x: margin,
              y: currentY,
              size: textSize - 1,
              font: helveticaFont,
              color: rgb(0.4, 0.4, 0.4),
            });
            currentY -= lineHeight;
          }
        }
        
        currentY -= 10;
      }
    }
    
    // Add footer to all pages
    const pages = pdfDoc.getPages();
    const currentDate = new Date().toLocaleDateString();
    
    pages.forEach((p, index) => {
      p.drawText(`Generated by Lemnaed on ${currentDate}`, {
        x: margin,
        y: 30,
        size: 10,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      p.drawText(`Page ${index + 1} of ${pages.length}`, {
        x: width - margin - 50,
        y: 30,
        size: 10,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${productData.brand || 'product'}-${productData.model || 'report'}-reliability.pdf"`);
    
    // Send PDF
    return res.status(200).send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Error generating product PDF:', error);
    return res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
}
