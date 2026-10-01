import { Router, Request, Response } from 'express';
import { createEnquiry, listEnquiries } from '../controllers/enquiryController.js';
import { createShiftRequest, listShifts } from '../controllers/shiftController.js';
import { createApplication, listApplications } from '../controllers/careerController.js';
import { SUBURB_ZONES } from '../data/suburbs.js';

const router = Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'TCH Health Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    location: 'Townsville, QLD, Australia'
  });
});

// Suburbs & coverage zones
router.get('/suburbs', (req: Request, res: Response) => {
  const query = (req.query.q as string)?.toLowerCase().trim();
  if (!query) {
    return res.status(200).json({
      success: true,
      zones: SUBURB_ZONES
    });
  }

  const matchingZones = SUBURB_ZONES.map(z => {
    const matchedSuburbs = z.suburbs.filter(s => s.toLowerCase().includes(query));
    return {
      zone: z.zone,
      description: z.description,
      travelPolicy: z.travelPolicy,
      matchedSuburbs
    };
  }).filter(z => z.matchedSuburbs.length > 0);

  return res.status(200).json({
    success: true,
    query,
    totalMatches: matchingZones.reduce((sum, z) => sum + z.matchedSuburbs.length, 0),
    results: matchingZones
  });
});

// Enquiries
router.post('/enquiries', createEnquiry);
router.get('/enquiries', listEnquiries);

// Provider shift requests
router.post('/shifts', createShiftRequest);
router.get('/shifts', listShifts);

// Job applications
router.post('/careers', createApplication);
router.get('/careers', listApplications);

export default router;
