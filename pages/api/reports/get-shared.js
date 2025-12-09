// pages/api/reports/get-shared.js
import { query } from '../../../lib/database';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shareId } = req.query;
    
    if (!shareId) {
      return res.status(400).json({ error: 'Share ID is required' });
    }

    // Fetch the shared report
    const result = await query(
      `SELECT report_type, year, make, model, mileage, category, product_data, 
              reliability_data, specifications_data, timeline_data, created_at
       FROM shared_reports 
       WHERE share_id = $1 AND expires_at > NOW()`,
      [shareId]
    );

    if (result.rows.length === 0) {
      console.log('Report not found for shareId:', shareId);
      return res.status(404).json({ error: 'Report not found or expired' });
    }

    const report = result.rows[0];
    console.log('Found report:', { shareId, report_type: report.report_type });
    
    // Increment view count
    await query(
      `UPDATE shared_reports SET view_count = view_count + 1 WHERE share_id = $1`,
      [shareId]
    );
    
    const reportType = report.report_type || 'vehicle';

    const response = {
      report_type: reportType,
      reliability_data: report.reliability_data,
      specifications_data: report.specifications_data,
      timeline_data: report.timeline_data,
      created_at: report.created_at
    };

    if (reportType === 'vehicle') {
      response.year = report.year;
      response.make = report.make;
      response.model = report.model;
      response.mileage = report.mileage;
    } else {
      response.category = report.category;
      response.product_data = report.product_data;
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching shared report:', error);
    return res.status(500).json({ error: 'Failed to fetch shared report' });
  }
}
