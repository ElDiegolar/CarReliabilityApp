import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
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
    const { year, make, model, mileage, reliability_data, timeline_data, specifications_data, imageUrl } = req.body;
    
    // Validate required fields
    if (!year || !make || !model || !mileage || !reliability_data) {
      return res.status(400).json({ error: 'Missing required vehicle information' });
    }

    // Define modern color palette
    const colors = {
      primary: rgb(0.12, 0.29, 0.49),      // Deep blue
      secondary: rgb(0.27, 0.65, 0.78),    // Teal blue
      accent: rgb(0.93, 0.37, 0.18),       // Coral
      gray: rgb(0.85, 0.85, 0.85),         // Light gray
      darkGray: rgb(0.4, 0.4, 0.4),        // Dark gray
      lightBg: rgb(0.97, 0.97, 0.97),      // Off-white
      white: rgb(1, 1, 1),                 // White
      black: rgb(0.1, 0.1, 0.1),           // Near black
      good: rgb(0.13, 0.7, 0.42),          // Green
      warning: rgb(0.95, 0.68, 0.13),      // Amber
      danger: rgb(0.87, 0.22, 0.24)        // Red
    };
    
    // Initialize PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const helveticaBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
    
    // Add a page to the PDF
    let page = pdfDoc.addPage([612, 792]); // Letter size - use let instead of const
    const { width, height } = page.getSize();

    // Function to convert miles to kilometers
    const milesToKilometers = (miles) => {
      return Math.round(miles * 1.60934);
    };

    // Set some initial variables for positioning
    let currentY = height - 40;
    const margin = 60;
    const contentWidth = width - (margin * 2);
    
    // Font sizes
    const fonts = {
      title: 28,
      subtitle: 20,
      heading: 16,
      subheading: 14,
      body: 11,
      small: 9,
      tiny: 8
    };
    
    // Draw header background strip
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width: width,
      height: 120,
      color: colors.primary
    });
    
    // Add report title
    page.drawText(`VEHICLE RELIABILITY REPORT`, {
      x: margin,
      y: currentY,
      size: fonts.title,
      font: helveticaBoldFont,
      color: colors.white,
    });
    
    currentY -= 30;
    
    // Vehicle name
    page.drawText(`${year} ${make} ${model}`, {
      x: margin,
      y: currentY,
      size: fonts.subtitle,
      font: helveticaBoldFont,
      color: colors.white,
    });
    
    // Convert mileage to kilometers
    const kilometers = milesToKilometers(mileage);
    
    currentY -= 25;
    
    // Display mileage in both miles and kilometers
    page.drawText(`Mileage: ${mileage.toLocaleString()} mi | ${kilometers.toLocaleString()} km`, {
      x: margin,
      y: currentY,
      size: fonts.body,
      font: helveticaFont,
      color: colors.white,
    });
    
    currentY -= 25;
    
    // Add date
    page.drawText(`Report Date: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, {
      x: margin,
      y: currentY,
      size: fonts.body,
      font: helveticaFont,
      color: colors.white,
    });
    
    // Draw circular overall score indicator in the top right corner
    const scoreSize = 90;
    const scoreX = width - margin - scoreSize;
    const scoreY = height - 65 - (scoreSize / 2);
    
    // Draw score background circle
    page.drawCircle({
      x: scoreX + (scoreSize / 2),
      y: scoreY,
      radius: scoreSize / 2,
      color: colors.white,
    });
    
    // Score text
    const scoreValue = reliability_data.overallScore;
    const scoreColor = getScoreColor(scoreValue, colors);
    
    // Draw circular progress for score
    drawCircularProgress(
      page, 
      scoreX + (scoreSize / 2), 
      scoreY, 
      scoreSize / 2 - 5, 
      scoreValue, 
      scoreColor, 
      colors.gray
    );
    
    // Add score text in center
    page.drawText(`${scoreValue}`, {
      x: scoreX + (scoreSize / 2) - (scoreValue.toString().length * 9),
      y: scoreY - 10,
      size: 28,
      font: helveticaBoldFont,
      color: scoreColor,
    });
    
    // Add "out of 100" text
    page.drawText(`out of 100`, {
      x: scoreX + (scoreSize / 2) - 28,
      y: scoreY - 30,
      size: 10,
      font: helveticaFont,
      color: colors.darkGray,
    });
    
    // Start main content area
    currentY = height - 150;
    
    // Draw white content background with shadow effect
    page.drawRectangle({
      x: margin - 15,
      y: 75,
      width: width - (margin * 2) + 30,
      height: currentY - 65,
      color: colors.white,
      borderColor: colors.gray,
      borderWidth: 0.5,
      borderOpacity: 0.5,
    });
    
    // Draw shadow effect
    page.drawRectangle({
      x: margin - 10,
      y: 70,
      width: width - (margin * 2) + 20,
      height: 10,
      color: colors.gray,
      opacity: 0.1,
    });
    
    // Add subtle divider
    currentY -= 30;
    drawDivider(page, margin, width - margin, currentY, colors.gray, 0.5);
    
    currentY -= 30;
    
    // SPECIFICATIONS SECTION
    if (specifications_data) {
      // Section heading in a styled box
      drawSectionHeading(page, margin, currentY, 'VEHICLE SPECIFICATIONS', helveticaBoldFont, fonts.heading, colors);
      
      currentY -= 55;
      
      // Add vehicle image if available
      let imageWidth = 0;
      let imageHeight = 0;
      let imageX = margin;
      let imageY = currentY;
      
      if (imageUrl) {
        try {
          // Fetch the image with a timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
          
          console.log(`Attempting to fetch image: ${imageUrl}`);
          
          const imageResponse = await fetch(imageUrl, { 
            signal: controller.signal,
            headers: {
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
          
          // Scale the image - maintain aspect ratio for specifications section
          imageWidth = Math.min(240, (width - 2 * margin) / 2.2);
          const scale = imageWidth / embeddedImage.width;
          imageHeight = embeddedImage.height * scale;
          
          // Draw image background box with soft shadow
          page.drawRectangle({
            x: imageX - 5,
            y: imageY - imageHeight - 5,
            width: imageWidth + 10,
            height: imageHeight + 10,
            color: colors.white,
            borderColor: colors.gray,
            borderWidth: 0.5,
          });
          
          // Draw the image
          page.drawImage(embeddedImage, {
            x: imageX,
            y: imageY - imageHeight,
            width: imageWidth,
            height: imageHeight,
          });
          
          console.log("Successfully embedded image in PDF");
        } catch (err) {
          console.error("Image embedding failed:", err);
          // Additional logging for debugging
          if (err.name === 'AbortError') {
            console.warn("Image fetch timed out after 8 seconds");
          }
          // Continue with PDF generation even if image fails
          imageWidth = 0;
          imageHeight = 0;
        }
      }
      
      // Specifications table section (to the right of the image if there's an image)
      const specTableX = imageWidth > 0 ? margin + imageWidth + 25 : margin;
      const specTableWidth = imageWidth > 0 ? width - margin - imageWidth - margin - 25 : width - 2 * margin;
      let specTableY = currentY;
      const columnGap = 25;
      
      // Draw specs background
      page.drawRectangle({
        x: specTableX - 10,
        y: specTableY - 230, // Approximate height needed
        width: specTableWidth + 20,
        height: 230,
        color: colors.lightBg,
        borderColor: colors.gray,
        borderWidth: 0.5,
        borderOpacity: 0.5,
        opacity: 0.8,
      });
      
      // ENGINE SPECIFICATIONS
      specTableY -= 25;
      drawCardHeader(page, specTableX, specTableY, 'ENGINE', helveticaBoldFont, fonts.subheading, colors.secondary);
      
      specTableY -= 30;
      
      // Create two columns
      const leftColX = specTableX + 10;
      const rightColX = specTableX + (specTableWidth / 2) + 10;
      const colWidth = (specTableWidth / 2) - 20;
      
      // Engine specs (left column)
      drawSpecRow(page, leftColX, specTableY, 'Type', specifications_data.engine.type, helveticaFont, helveticaBoldFont, fonts.body, colors);
      specTableY -= 25;
      
      drawSpecRow(page, leftColX, specTableY, 'Displacement', specifications_data.engine.displacement, helveticaFont, helveticaBoldFont, fonts.body, colors);
      specTableY -= 25;
      
      drawSpecRow(page, leftColX, specTableY, 'Horsepower', specifications_data.engine.horsepower, helveticaFont, helveticaBoldFont, fonts.body, colors);
      specTableY -= 25;
      
      drawSpecRow(page, leftColX, specTableY, 'Torque', specifications_data.engine.torque, helveticaFont, helveticaBoldFont, fonts.body, colors);
      
      // Reset Y position
      specTableY = currentY - 25;
      
      // DRIVETRAIN (right column)
      drawCardHeader(page, rightColX, specTableY, 'DRIVETRAIN', helveticaBoldFont, fonts.subheading, colors.secondary);
      
      specTableY -= 30;
      
      drawSpecRow(page, rightColX, specTableY, 'Transmission', specifications_data.transmission, helveticaFont, helveticaBoldFont, fonts.body, colors);
      specTableY -= 25;
      
      drawSpecRow(page, rightColX, specTableY, 'Drive Type', specifications_data.drivetrain, helveticaFont, helveticaBoldFont, fonts.body, colors);
      specTableY -= 25;
      
      // DIMENSIONS (right column continued)
      drawCardHeader(page, rightColX, specTableY, 'DIMENSIONS', helveticaBoldFont, fonts.subheading, colors.secondary);
      
      specTableY -= 30;
      
      drawSpecRow(page, rightColX, specTableY, 'Length', specifications_data.dimensions.length, helveticaFont, helveticaBoldFont, fonts.body, colors);
      specTableY -= 25;
      
      drawSpecRow(page, rightColX, specTableY, 'Width', specifications_data.dimensions.width, helveticaFont, helveticaBoldFont, fonts.body, colors);
      specTableY -= 25;
      
      drawSpecRow(page, rightColX, specTableY, 'Height', specifications_data.dimensions.height, helveticaFont, helveticaBoldFont, fonts.body, colors);
      
      // Update currentY to be below the image or the specs table, whichever is lower
      const imageBottom = imageY - imageHeight - 10;
      const specTableBottom = currentY - 230 - 10;
      currentY = Math.min(imageBottom, specTableBottom);
      
      // If we're premium, include additional specifications
      if (reliability_data.isPremium) {
        currentY -= 40;
        
        // ADDITIONAL SPECIFICATIONS SECTION
        if (currentY < 200) {
          // Not enough space, add a new page
          page = pdfDoc.addPage([612, 792]);
          currentY = height - 70;
          
          // Add subtitle to the new page
          page.drawText(`${year} ${make} ${model} - Additional Specifications`, {
            x: margin,
            y: currentY,
            size: fonts.heading,
            font: helveticaBoldFont,
            color: colors.primary,
          });
          
          currentY -= 40;
        }
        
        // Draw a two-column grid for additional specifications
        // First column - Fuel Economy
        const col1X = margin;
        const col1Width = (contentWidth / 2) - 15;
        let col1Y = currentY;
        
        // Draw background box
        page.drawRectangle({
          x: col1X - 10,
          y: col1Y - 140,
          width: col1Width + 20,
          height: 140,
          color: colors.lightBg,
          borderColor: colors.gray,
          borderWidth: 0.5,
          borderOpacity: 0.5,
          opacity: 0.8,
        });
        
        // FUEL ECONOMY
        drawCardHeader(page, col1X, col1Y, 'FUEL ECONOMY', helveticaBoldFont, fonts.subheading, colors.secondary);
        
        col1Y -= 30;
        
        drawSpecRow(page, col1X + 10, col1Y, 'City', specifications_data.fuelEconomy.city, helveticaFont, helveticaBoldFont, fonts.body, colors);
        col1Y -= 25;
        
        drawSpecRow(page, col1X + 10, col1Y, 'Highway', specifications_data.fuelEconomy.highway, helveticaFont, helveticaBoldFont, fonts.body, colors);
        col1Y -= 25;
        
        drawSpecRow(page, col1X + 10, col1Y, 'Combined', specifications_data.fuelEconomy.combined, helveticaFont, helveticaBoldFont, fonts.body, colors);
        
        // Second column - Additional Info
        const col2X = margin + col1Width + 30;
        const col2Width = (contentWidth / 2) - 15;
        let col2Y = currentY;
        
        // Draw background box
        page.drawRectangle({
          x: col2X - 10,
          y: col2Y - 140,
          width: col2Width + 20,
          height: 140,
          color: colors.lightBg,
          borderColor: colors.gray,
          borderWidth: 0.5,
          borderOpacity: 0.5,
          opacity: 0.8,
        });
        
        // OTHER SPECIFICATIONS
        drawCardHeader(page, col2X, col2Y, 'OTHER SPECIFICATIONS', helveticaBoldFont, fonts.subheading, colors.secondary);
        
        col2Y -= 30;
        
        drawSpecRow(page, col2X + 10, col2Y, 'Weight', specifications_data.weight, helveticaFont, helveticaBoldFont, fonts.body, colors);
        col2Y -= 25;
        
        drawSpecRow(page, col2X + 10, col2Y, 'Seating', specifications_data.seatingCapacity, helveticaFont, helveticaBoldFont, fonts.body, colors);
        col2Y -= 25;
        
        drawSpecRow(page, col2X + 10, col2Y, 'Cargo', specifications_data.cargoCapacity, helveticaFont, helveticaBoldFont, fonts.body, colors);
        
        // Update currentY to continue with the next section
        currentY = col1Y - 110;
        
        // SAFETY FEATURES
        if (specifications_data.safetyFeatures && specifications_data.safetyFeatures.length > 0) {
          currentY -= 20;
          
          if (currentY < 200) {
            // Not enough space, add a new page
            page = pdfDoc.addPage([612, 792]);
            currentY = height - 70;
            
            // Add subtitle to the new page
            page.drawText(`${year} ${make} ${model} - Safety Features`, {
              x: margin,
              y: currentY,
              size: fonts.heading,
              font: helveticaBoldFont,
              color: colors.primary,
            });
            
            currentY -= 40;
          }
          
          // Draw safety features section
          drawSectionHeading(page, margin, currentY, 'SAFETY FEATURES', helveticaBoldFont, fonts.heading, colors);
          
          currentY -= 55;
          
          // Background for safety features
          const safetyBoxHeight = Math.min(specifications_data.safetyFeatures.length * 25 + 20, 200);
          
          page.drawRectangle({
            x: margin - 10,
            y: currentY - safetyBoxHeight + 10,
            width: contentWidth + 20,
            height: safetyBoxHeight,
            color: colors.lightBg,
            borderColor: colors.gray,
            borderWidth: 0.5,
            borderOpacity: 0.5,
            opacity: 0.8,
          });
          
          // List safety features in two columns if there are more than 4
          const featuresPerColumn = Math.ceil(specifications_data.safetyFeatures.length / 
                                    (specifications_data.safetyFeatures.length > 4 ? 2 : 1));
          
          let featureX = margin + 10;
          let featureY = currentY - 15;
          let featureCount = 0;
          
          for (const feature of specifications_data.safetyFeatures) {
            // Draw bullet point
            page.drawCircle({
              x: featureX - 5,
              y: featureY + 4,
              radius: 2.5,
              color: colors.secondary,
            });
            
            // Draw feature text
            page.drawText(feature, {
              x: featureX + 5,
              y: featureY,
              size: fonts.body,
              font: helveticaFont,
              color: colors.black,
            });
            
            featureY -= 25;
            featureCount++;
            
            // Move to second column if needed
            if (featureCount === featuresPerColumn && featureCount < specifications_data.safetyFeatures.length) {
              featureX = margin + (contentWidth / 2) + 10;
              featureY = currentY - 15;
            }
          }
          
          // Update currentY for next section
          currentY -= safetyBoxHeight + 20;
        }
        
        // WARRANTY INFORMATION
        if (specifications_data.warranty) {
          if (currentY < 150) {
            // Not enough space, add a new page
            page = pdfDoc.addPage([612, 792]);
            currentY = height - 70;
          }
          
          // Draw warranty box
          const warrantyBoxHeight = 70;
          
          page.drawRectangle({
            x: margin - 10,
            y: currentY - warrantyBoxHeight + 10,
            width: contentWidth + 20,
            height: warrantyBoxHeight,
            color: colors.primary,
            opacity: 0.1,
          });
          
          // Warranty title
          page.drawText('WARRANTY INFORMATION', {
            x: margin + 10,
            y: currentY - 20,
            size: fonts.subheading,
            font: helveticaBoldFont,
            color: colors.primary,
          });
          
          // Warranty text
          const warrantyLines = splitTextToLines(
            specifications_data.warranty, 
            contentWidth - 20, 
            fonts.body, 
            helveticaFont
          );
          
          let warrantyY = currentY - 45;
          
          for (const line of warrantyLines) {
            page.drawText(line, {
              x: margin + 10,
              y: warrantyY,
              size: fonts.body,
              font: helveticaFont,
              color: colors.black,
            });
            
            warrantyY -= 20;
          }
          
          currentY -= warrantyBoxHeight + 30;
        }
      } else {
        // Not premium - add upgrade message
        currentY -= 40;
        
        // Draw upgrade box
        const upgradeBoxHeight = 70;
        
        page.drawRectangle({
          x: margin - 10,
          y: currentY - upgradeBoxHeight + 10,
          width: contentWidth + 20,
          height: upgradeBoxHeight,
          color: colors.secondary,
          opacity: 0.1,
        });
        
        // Upgrade message
        page.drawText('PREMIUM FEATURE', {
          x: margin + 10,
          y: currentY - 20,
          size: fonts.subheading,
          font: helveticaBoldFont,
          color: colors.secondary,
        });
        
        page.drawText('Upgrade to premium for complete specifications data, including fuel economy,', {
          x: margin + 10,
          y: currentY - 45,
          size: fonts.body,
          font: helveticaFont,
          color: colors.black,
        });
        
        page.drawText('safety features, and warranty information.', {
          x: margin + 10,
          y: currentY - 65,
          size: fonts.body,
          font: helveticaFont,
          color: colors.black,
        });
        
        currentY -= upgradeBoxHeight + 30;
      }
    }
    
    // Check if we need a new page for Category Scores
    if (currentY < 350) {
      page = pdfDoc.addPage([612, 792]);
      currentY = height - 70;
      
      // Add subtitle to the new page
      page.drawText(`${year} ${make} ${model} - Reliability Analysis`, {
        x: margin,
        y: currentY,
        size: fonts.heading,
        font: helveticaBoldFont,
        color: colors.primary,
      });
      
      currentY -= 40;
    }
    
    // CATEGORY SCORES SECTION
    drawSectionHeading(page, margin, currentY, 'RELIABILITY SCORES', helveticaBoldFont, fonts.heading, colors);
    
    currentY -= 55;
    
    // Draw modern score cards
    const scoreCategories = [
      { name: 'Engine', score: reliability_data.categories.engine },
      { name: 'Transmission', score: reliability_data.categories.transmission },
    ];
    
    // Add premium categories if available
    if (reliability_data.isPremium) {
      scoreCategories.push(
        { name: 'Electrical System', score: reliability_data.categories.electricalSystem },
        { name: 'Brakes', score: reliability_data.categories.brakes },
        { name: 'Suspension', score: reliability_data.categories.suspension },
        { name: 'Fuel System', score: reliability_data.categories.fuelSystem }
      );
    }
    
    // Calculate layout for score cards
    const cardsPerRow = 3;
    const cardMargin = 20;
    const cardWidth = (contentWidth - (cardMargin * (cardsPerRow - 1))) / cardsPerRow;
    const cardHeight = 90;
    
    // Draw cards in grid layout
    let cardIndex = 0;
    for (const category of scoreCategories) {
      const row = Math.floor(cardIndex / cardsPerRow);
      const col = cardIndex % cardsPerRow;
      
      const cardX = margin + (col * (cardWidth + cardMargin));
      const cardY = currentY - (row * (cardHeight + cardMargin));
      
      // Draw card background
      page.drawRectangle({
        x: cardX,
        y: cardY - cardHeight,
        width: cardWidth,
        height: cardHeight,
        color: colors.white,
        borderColor: colors.gray,
        borderWidth: 0.5,
      });
      
      // Category name
      page.drawText(category.name.toUpperCase(), {
        x: cardX + 10,
        y: cardY - 25,
        size: fonts.subheading,
        font: helveticaBoldFont,
        color: colors.primary,
      });
      
      // Score value
      const scoreColor = getScoreColor(category.score, colors);
      
      // Score circle background
      page.drawCircle({
        x: cardX + cardWidth - 30,
        y: cardY - 30,
        radius: 20,
        color: colors.lightBg,
      });
      
      // Progress circle around score
      drawCircularProgress(
        page, 
        cardX + cardWidth - 30, 
        cardY - 30, 
        18, 
        category.score, 
        scoreColor, 
        colors.gray
      );
      
      // Score number
      page.drawText(category.score.toString(), {
        x: cardX + cardWidth - 30 - (category.score.toString().length * 4),
        y: cardY - 34,
        size: fonts.heading,
        font: helveticaBoldFont,
        color: scoreColor,
      });
      
      // Score bar
      const barY = cardY - 60;
      const barHeight = 8;
      
      // Background bar
      page.drawRectangle({
        x: cardX + 10,
        y: barY - barHeight,
        width: cardWidth - 20,
        height: barHeight,
        color: colors.gray,
        opacity: 0.3,
      });
      
      // Score progress bar
      page.drawRectangle({
        x: cardX + 10,
        y: barY - barHeight,
        width: ((cardWidth - 20) * category.score) / 100,
        height: barHeight,
        color: scoreColor,
      });
      
      cardIndex++;
    }
    
    // Update currentY to be below the score cards
    const rowCount = Math.ceil(scoreCategories.length / cardsPerRow);
    currentY -= (rowCount * (cardHeight + cardMargin)) + 20;
    
    // If not premium, add an upgrade note
    if (!reliability_data.isPremium) {
      // Draw upgrade box
      const upgradeBoxHeight = 60;
      
      page.drawRectangle({
        x: margin - 10,
        y: currentY - upgradeBoxHeight + 10,
        width: contentWidth + 20,
        height: upgradeBoxHeight,
        color: colors.secondary,
        opacity: 0.1,
      });
      
      // Upgrade message
      page.drawText('PREMIUM FEATURE', {
        x: margin + 10,
        y: currentY - 20,
        size: fonts.subheading,
        font: helveticaBoldFont,
        color: colors.secondary,
      });
      
      page.drawText('Upgrade to premium for detailed category breakdown scores for all major vehicle systems.', {
        x: margin + 10,
        y: currentY - 40,
        size: fonts.body,
        font: helveticaFont,
        color: colors.black,
      });
      
      currentY -= upgradeBoxHeight + 30;
    }
    
    // COMMON ISSUES SECTION
    if (reliability_data.isPremium && reliability_data.commonIssues && reliability_data.commonIssues.length > 0) {
      // Check if we need a new page
      if (currentY < 300) {
        page = pdfDoc.addPage([612, 792]);
        currentY = height - 70;
        
        // Add subtitle to the new page
        page.drawText(`${year} ${make} ${model} - Common Issues`, {
          x: margin,
          y: currentY,
          size: fonts.heading,
          font: helveticaBoldFont,
          color: colors.primary,
        });
        
        currentY -= 40;
      }
      
      drawSectionHeading(page, margin, currentY, 'COMMON ISSUES', helveticaBoldFont, fonts.heading, colors);
      
      currentY -= 55;
      
      // Loop through common issues with modern styling
      for (let i = 0; i < reliability_data.commonIssues.length; i++) {
        const issue = reliability_data.commonIssues[i];
        
        // Issue card height calculation
        const issueCardHeight = 130;
        
        // Check if we need a new page
        if (currentY - issueCardHeight < 100) {
          page = pdfDoc.addPage([612, 792]);
          currentY = height - 70;
        }
        
        // Draw issue card background
        page.drawRectangle({
          x: margin - 10,
          y: currentY - issueCardHeight + 10,
          width: contentWidth + 20,
          height: issueCardHeight,
          color: colors.white,
          borderColor: colors.gray,
          borderWidth: 0.5,
        });
        
        // Draw colored issue number badge
        page.drawRectangle({
          x: margin - 10,
          y: currentY - 20,
          width: 40,
          height: 30,
          color: colors.primary,
        });
        
        // Issue number
        page.drawText(`#${i + 1}`, {
          x: margin,
          y: currentY - 15,
          size: fonts.heading,
          font: helveticaBoldFont,
          color: colors.white,
        });
        
        // Issue description
        page.drawText(issue.description, {
          x: margin + 40,
          y: currentY - 15,
          size: fonts.subheading,
          font: helveticaBoldFont,
          color: colors.primary,
        });
        
        // Issue details with icons
        const detailY = currentY - 50;
        const iconSize = 15;
        
        // Cost info
        page.drawText(' ',{
          x: margin + 5,
          y: detailY,
          size: fonts.heading,
          font: helveticaBoldFont,
          color: colors.accent,
        });
        
        page.drawText(`Cost to Fix: ${issue.costToFix}`, {
          x: margin + 25,
          y: detailY,
          size: fonts.body,
          font: helveticaFont,
          color: colors.black,
        });
        
        // Occurrence info
        page.drawText('!', {
          x: margin + 5,
          y: detailY - 25,
          size: fonts.heading,
          font: helveticaBoldFont,
          color: colors.secondary,
        });
        
        page.drawText(`Occurrence: ${issue.occurrence}`, {
          x: margin + 25,
          y: detailY - 25,
          size: fonts.body,
          font: helveticaFont,
          color: colors.black,
        });
        
        // Convert mileage values in the text if they exist
        let mileageText = issue.mileage;
        if (typeof issue.mileage === 'string') {
          // Try to extract numbers from the mileage string
          const mileageMatch = issue.mileage.match(/(\d[\d,]*)/g);
          if (mileageMatch) {
            // Replace each number with its equivalent in miles and kilometers
            mileageText = issue.mileage.replace(/(\d[\d,]*)/g, (match) => {
              const numericValue = parseInt(match.replace(/,/g, ''));
              if (!isNaN(numericValue)) {
                return `${numericValue.toLocaleString()} mi (${milesToKilometers(numericValue).toLocaleString()} km)`;
              }
              return match;
            });
          }
        }
        
        // Mileage info
        page.drawText('⚙', {
          x: margin + 5,
          y: detailY - 50,
          size: fonts.heading,
          font: helveticaOblique,
          color: colors.primary,
        });
        
        page.drawText(`Typical Mileage: ${mileageText}`, {
          x: margin + 25,
          y: detailY - 50,
          size: fonts.body,
          font: helveticaFont,
          color: colors.black,
        });
        
        currentY -= issueCardHeight + 20;
      }
    } else if (!reliability_data.isPremium) {
      // Draw premium upgrade box for common issues
      const upgradeBoxHeight = 60;
      
      page.drawRectangle({
        x: margin - 10,
        y: currentY - upgradeBoxHeight + 10,
        width: contentWidth + 20,
        height: upgradeBoxHeight,
        color: colors.secondary,
        opacity: 0.1,
      });
      
      // Upgrade message
      page.drawText('PREMIUM FEATURE', {
        x: margin + 10,
        y: currentY - 20,
        size: fonts.subheading,
        font: helveticaBoldFont,
        color: colors.secondary,
      });
      
      page.drawText('Upgrade to premium for detailed information about common issues and their solutions.', {
        x: margin + 10,
        y: currentY - 40,
        size: fonts.body,
        font: helveticaFont,
        color: colors.black,
      });
      
      currentY -= upgradeBoxHeight + 30;
    }
    
    // RELIABILITY ANALYSIS SECTION
    if (currentY < 250) {
      page = pdfDoc.addPage([612, 792]);
      currentY = height - 70;
      
      // Add subtitle to the new page
      page.drawText(`${year} ${make} ${model} - Expert Analysis`, {
        x: margin,
        y: currentY,
        size: fonts.heading,
        font: helveticaBoldFont,
        color: colors.primary,
      });
      
      currentY -= 40;
    }
    
    drawSectionHeading(page, margin, currentY, 'EXPERT RELIABILITY ANALYSIS', helveticaBoldFont, fonts.heading, colors);
    
    currentY -= 55;
    
    // AI analysis text with modern styling
    const analysisText = reliability_data.isPremium 
      ? reliability_data.aiAnalysis 
      : 'Upgrade to premium for detailed reliability analysis from our automotive experts.';
    
    // Draw analysis background
    const analysisLines = splitTextToLines(analysisText, contentWidth - 20, fonts.body, helveticaFont);
    const analysisHeight = (analysisLines.length * 20) + 40;
    
    page.drawRectangle({
      x: margin - 10,
      y: currentY - analysisHeight + 10,
      width: contentWidth + 20,
      height: analysisHeight,
      color: reliability_data.isPremium ? colors.lightBg : colors.secondary,
      opacity: reliability_data.isPremium ? 0.8 : 0.1,
      borderColor: colors.gray,
      borderWidth: 0.5,
    });
    
    // Add quote marks if premium
    if (reliability_data.isPremium) {
      page.drawText('"', {
        x: margin,
        y: currentY - 10,
        size: 40,
        font: helveticaBoldFont,
        color: colors.primary,
        opacity: 0.3,
      });
    }
    
    // Draw analysis text
    let analysisY = currentY - 30;
    
    for (const line of analysisLines) {
      page.drawText(line, {
        x: margin + 10,
        y: analysisY,
        size: fonts.body,
        font: reliability_data.isPremium ? helveticaOblique : helveticaFont,
        color: colors.black,
      });
      
      analysisY -= 20;
    }
    
    // Add premium badge if premium
    if (reliability_data.isPremium) {
      page.drawRectangle({
        x: width - margin - 100,
        y: currentY - analysisHeight - 10,
        width: 110,
        height: 25,
        color: colors.primary,
      });
      
      page.drawText('EXPERT ANALYSIS', {
        x: width - margin - 95,
        y: currentY - analysisHeight - 5,
        size: fonts.small,
        font: helveticaBoldFont,
        color: colors.white,
      });
    }
    
    currentY -= analysisHeight + 40;
    
    // TIMELINE SECTION (if premium)
    if (reliability_data.isPremium && timeline_data && timeline_data.length > 0) {
      // Add a new page for the timeline
      page = pdfDoc.addPage([612, 792]);
      currentY = height - 70;
      
      // Add page title
      page.drawText(`${year} ${make} ${model} - Engineering Timeline`, {
        x: margin,
        y: currentY,
        size: fonts.heading,
        font: helveticaBoldFont,
        color: colors.primary,
      });
      
      currentY -= 40;
      
      drawSectionHeading(page, margin, currentY, 'DESIGN HISTORY & ENGINEERING TIMELINE', helveticaBoldFont, fonts.heading, colors);
      
      currentY -= 55;
      
      // Draw timeline with modern styling
      const timelineStartX = margin + 50;
      const circleRadius = 15;
      let timelineY = currentY;
      
      // Draw main vertical line
      page.drawLine({
        start: { x: timelineStartX, y: timelineY },
        end: { x: timelineStartX, y: 100 },
        thickness: 2,
        color: colors.secondary,
        opacity: 0.5,
      });
      
      // Draw timeline events
      for (const event of timeline_data) {
        // Check if we need a new page
        if (timelineY < 200) {
          page = pdfDoc.addPage([612, 792]);
          timelineY = height - 100;
          
          // Continue the timeline line on the new page
          page.drawLine({
            start: { x: timelineStartX, y: timelineY + 30 },
            end: { x: timelineStartX, y: 100 },
            thickness: 2,
            color: colors.secondary,
            opacity: 0.5,
          });
        }
        
        // Year circle
        page.drawCircle({
          x: timelineStartX,
          y: timelineY,
          radius: circleRadius,
          color: colors.primary,
        });
        
        // Year text
        page.drawText(event.year.toString(), {
          x: timelineStartX - (event.year.toString().length * 4),
          y: timelineY - 5,
          size: fonts.body,
          font: helveticaBoldFont,
          color: colors.white,
        });
        
        // Event box
        const eventBoxX = timelineStartX + 30;
        const eventBoxWidth = contentWidth - 80;
        
        // Calculate box height based on content
        const titleHeight = 25;
        const descriptionLines = splitTextToLines(event.description, eventBoxWidth - 20, fonts.body, helveticaFont);
        const descriptionHeight = descriptionLines.length * 20;
        
        let engineeringHeight = 0;
        if (event.engineeringChanges && event.engineeringChanges.length > 0) {
          engineeringHeight = 25 + (event.engineeringChanges.length * 20);
        }
        
        const eventBoxHeight = titleHeight + descriptionHeight + engineeringHeight + 20;
        
        // Draw event box with shadow effect
        page.drawRectangle({
          x: eventBoxX + 5,
          y: timelineY - eventBoxHeight + 5,
          width: eventBoxWidth,
          height: eventBoxHeight,
          color: colors.gray,
          opacity: 0.3,
        });
        
        page.drawRectangle({
          x: eventBoxX,
          y: timelineY - eventBoxHeight + 10,
          width: eventBoxWidth,
          height: eventBoxHeight,
          color: colors.white,
          borderColor: colors.gray,
          borderWidth: 0.5,
        });
        
        // Draw connecting line
        page.drawLine({
          start: { x: timelineStartX + circleRadius, y: timelineY },
          end: { x: eventBoxX, y: timelineY },
          thickness: 2,
          color: colors.secondary,
          opacity: 0.5,
        });
        
        // Event title with colored background
        page.drawRectangle({
          x: eventBoxX,
          y: timelineY - 5,
          width: eventBoxWidth,
          height: titleHeight,
          color: colors.secondary,
          opacity: 0.1,
        });
        
        page.drawText(event.title, {
          x: eventBoxX + 10,
          y: timelineY - 20,
          size: fonts.subheading,
          font: helveticaBoldFont,
          color: colors.primary,
        });
        
        // Event description
        let descY = timelineY - titleHeight - 10;
        
        for (const line of descriptionLines) {
          page.drawText(line, {
            x: eventBoxX + 10,
            y: descY,
            size: fonts.body,
            font: helveticaFont,
            color: colors.black,
          });
          
          descY -= 20;
        }
        
        // Engineering changes
        if (event.engineeringChanges && event.engineeringChanges.length > 0) {
          descY -= 5;
          
          page.drawText('Engineering Changes:', {
            x: eventBoxX + 10,
            y: descY,
            size: fonts.body,
            font: helveticaBoldFont,
            color: colors.primary,
          });
          
          descY -= 20;
          
          for (const change of event.engineeringChanges) {
            // Draw bullet point
            page.drawCircle({
              x: eventBoxX + 15,
              y: descY + 4,
              radius: 2,
              color: colors.accent,
            });
            
            page.drawText(change, {
              x: eventBoxX + 25,
              y: descY,
              size: fonts.body,
              font: helveticaFont,
              color: colors.black,
            });
            
            descY -= 20;
          }
        }
        
        // Move to next timeline event
        timelineY -= eventBoxHeight + 40;
      }
    } else if (!reliability_data.isPremium) {
      // Premium upgrade note for timeline
      // Draw premium upgrade box
      const upgradeBoxHeight = 60;
      
      page.drawRectangle({
        x: margin - 10,
        y: currentY - upgradeBoxHeight + 10,
        width: contentWidth + 20,
        height: upgradeBoxHeight,
        color: colors.secondary,
        opacity: 0.1,
      });
      
      // Upgrade message
      page.drawText('PREMIUM FEATURE', {
        x: margin + 10,
        y: currentY - 20,
        size: fonts.subheading,
        font: helveticaBoldFont,
        color: colors.secondary,
      });
      
      page.drawText('Upgrade to premium to access the complete design history and engineering timeline.', {
        x: margin + 10,
        y: currentY - 40,
        size: fonts.body,
        font: helveticaFont,
        color: colors.black,
      });
    }
    
    // Add footer to all pages
    const pageCount = pdfDoc.getPageCount();
    for (let i = 0; i < pageCount; i++) {
      const footerPage = pdfDoc.getPage(i);
      const { width, height } = footerPage.getSize();
      
      // Bottom colored bar
      footerPage.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: 40,
        color: colors.primary,
      });
      
      // Disclaimer text
      footerPage.drawText('Disclaimer: This report is based on aggregated data and may not represent your specific vehicle. Always consult a qualified mechanic.', {
        x: margin,
        y: 25,
        size: fonts.tiny,
        font: helveticaFont,
        color: colors.white,
        opacity: 0.8,
      });
      
      // Powered by text
      footerPage.drawText('Powered by Lemnaed.com', {
        x: margin,
        y: 10,
        size: fonts.small,
        font: helveticaBoldFont,
        color: colors.white,
      });
      
      // Page number
      footerPage.drawText(`Page ${i + 1} of ${pageCount}`, {
        x: width - margin - 60,
        y: 10,
        size: fonts.small,
        font: helveticaFont,
        color: colors.white,
      });
    }
    
    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    
    // Set the content type and send the PDF bytes
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Lemnaed ${year}-${make}-${model}-reliability-report.pdf"`);
    res.status(200).send(Buffer.from(pdfBytes));
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ error: 'Failed to generate PDF report' });
  }
}

// Helper function to get RGB color based on score
function getScoreColor(score, colors) {
  if (score >= 80) {
    return colors.good; // Green for high scores
  } else if (score >= 60) {
    return colors.warning; // Amber for medium scores
  } else {
    return colors.danger; // Red for low scores
  }
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

// Draw section heading with modern styling
function drawSectionHeading(page, x, y, text, font, fontSize, colors) {
  // Draw heading line
  page.drawLine({
    start: { x: x - 10, y: y - 10 },
    end: { x: x + 150, y: y - 10 },
    thickness: 2,
    color: colors.primary,
  });
  
  // Draw heading text
  page.drawText(text, {
    x: x,
    y: y - 5,
    size: fontSize,
    font: font,
    color: colors.primary,
  });
  
  // Draw accent dot
  page.drawCircle({
    x: x + 160,
    y: y - 10,
    radius: 3,
    color: colors.accent,
  });
}

// Draw a divider line
function drawDivider(page, startX, endX, y, color, thickness = 1) {
  page.drawLine({
    start: { x: startX, y: y },
    end: { x: endX, y: y },
    thickness: thickness,
    color: color,
    opacity: 0.5,
  });
}

// Draw card header
function drawCardHeader(page, x, y, text, font, fontSize, color) {
  page.drawText(text, {
    x: x,
    y: y,
    size: fontSize,
    font: font,
    color: color,
  });
  
  // Draw underline
  page.drawLine({
    start: { x: x, y: y - 5 },
    end: { x: x + text.length * 8, y: y - 5 },
    thickness: 1,
    color: color,
    opacity: 0.5,
  });
}

// Draw a specification row with label and value
function drawSpecRow(page, x, y, label, value, regularFont, boldFont, fontSize, colors) {
  // Label
  page.drawText(`${label}:`, {
    x: x,
    y: y,
    size: fontSize,
    font: boldFont,
    color: colors.primary,
  });
  
  // Value
  page.drawText(value, {
    x: x + 100,
    y: y,
    size: fontSize,
    font: regularFont,
    color: colors.black,
  });
}

// Draw circular progress indicator
function drawCircularProgress(page, centerX, centerY, radius, percentage, color, backgroundColor) {
  const segments = 36; // Number of segments to approximate the circle
  const anglePerSegment = (2 * Math.PI) / segments;
  const filledSegments = Math.floor((percentage / 100) * segments);
  
  // Draw background circle
  for (let i = 0; i < segments; i++) {
    const startAngle = i * anglePerSegment;
    const endAngle = (i + 1) * anglePerSegment;
    
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);
    
    page.drawLine({
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
      thickness: 3,
      color: backgroundColor,
      opacity: 0.3,
    });
  }
  
  // Draw progress circle
  for (let i = 0; i < filledSegments; i++) {
    const startAngle = i * anglePerSegment - (Math.PI / 2); // Start from top (subtract 90 degrees)
    const endAngle = (i + 1) * anglePerSegment - (Math.PI / 2);
    
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);
    
    page.drawLine({
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
      thickness: 3,
      color: color,
    });
  }
}