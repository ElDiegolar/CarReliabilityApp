// pages/api/reports/create-share-link.js
import { query } from '../../../lib/database';
import crypto from 'crypto';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, reliability_data, specifications, timeline } = req.body;
    
    // Validate type
    if (!type || !['vehicle', 'product'].includes(type)) {
      return res.status(400).json({ error: 'Invalid or missing report type' });
    }

    // Validate required fields
    if (!reliability_data) {
      return res.status(400).json({ error: 'Missing reliability data' });
    }

    // Generate unique share ID
    const shareId = crypto.randomBytes(16).toString('hex');
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://lemnaed.com'}/report/${shareId}`;

    if (type === 'vehicle') {
      const { year, make, model, mileage } = req.body;
      
      if (!year || !make || !model) {
        return res.status(400).json({ error: 'Missing required vehicle data' });
      }

      // Store vehicle report data
      await query(
        `INSERT INTO shared_reports 
         (share_id, report_type, year, make, model, mileage, reliability_data, specifications_data, timeline_data, created_at, expires_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW() + INTERVAL '30 days')`,
        [
          shareId,
          'vehicle',
          year,
          make,
          model,
          mileage,
          JSON.stringify(reliability_data),
          specifications ? JSON.stringify(specifications) : null,
          timeline ? JSON.stringify(timeline) : null
        ]
      );
    } else {
      // Product report
      const { category, product_data } = req.body;
      
      if (!category || !product_data) {
        return res.status(400).json({ error: 'Missing required product data' });
      }

      // Store product report data
      await query(
        `INSERT INTO shared_reports 
         (share_id, report_type, category, product_data, reliability_data, specifications_data, timeline_data, created_at, expires_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW() + INTERVAL '30 days')`,
        [
          shareId,
          'product',
          category,
          JSON.stringify(product_data),
          JSON.stringify(reliability_data),
          specifications ? JSON.stringify(specifications) : null,
          timeline ? JSON.stringify(timeline) : null
        ]
      );
    }

    return res.status(200).json({ 
      shareId,
      shareUrl,
      message: 'Share link created successfully'
    });

  } catch (error) {
    console.error('Error creating share link:', error);
    return res.status(500).json({ error: 'Failed to create share link' });
  }
}
