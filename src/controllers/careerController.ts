import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export interface CareerApplicationRecord {
  id: string;
  timestamp: string;
  fullName: string;
  phone: string;
  email: string;
  roleApplied: string;
  yearsExperience: string;
  ahpraRegistration?: string;
  hasNdisCheck: boolean;
  hasBlueCard: boolean;
  hasFirstAid: boolean;
  hasDriverLicence: boolean;
  availability: string;
  notes: string;
  status: 'received' | 'reviewing' | 'interview_scheduled' | 'onboarded';
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'careers.json');

function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readApplications(): CareerApplicationRecord[] {
  initStorage();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeApplications(records: CareerApplicationRecord[]): void {
  initStorage();
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

export const createApplication = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      phone,
      email,
      roleApplied,
      yearsExperience,
      ahpraRegistration,
      hasNdisCheck,
      hasBlueCard,
      hasFirstAid,
      hasDriverLicence,
      availability,
      notes
    } = req.body;

    if (!fullName || !phone || !email || !roleApplied) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone, email, and target role are required.'
      });
    }

    const referenceId = `TCH-APP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newRecord: CareerApplicationRecord = {
      id: referenceId,
      timestamp: new Date().toISOString(),
      fullName: String(fullName).trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      roleApplied: String(roleApplied).trim(),
      yearsExperience: String(yearsExperience || '0-1 year').trim(),
      ahpraRegistration: ahpraRegistration ? String(ahpraRegistration).trim() : undefined,
      hasNdisCheck: Boolean(hasNdisCheck),
      hasBlueCard: Boolean(hasBlueCard),
      hasFirstAid: Boolean(hasFirstAid),
      hasDriverLicence: Boolean(hasDriverLicence),
      availability: String(availability || 'Casual / Flexible').trim(),
      notes: String(notes || '').trim(),
      status: 'received'
    };

    const existing = readApplications();
    existing.unshift(newRecord);
    writeApplications(existing);

    console.log(`[TCH Recruitment] Application ${referenceId} submitted by ${fullName} for ${roleApplied}`);

    return res.status(201).json({
      success: true,
      message: 'Application received! Alan and our recruitment team will review your qualifications and contact you for an introductory discussion.',
      referenceId,
      data: newRecord
    });
  } catch (err: any) {
    console.error('Error creating career application:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process application.'
    });
  }
};

export const listApplications = async (req: Request, res: Response) => {
  try {
    const records = readApplications();
    return res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to list career applications.'
    });
  }
};
