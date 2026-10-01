import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export interface ShiftRequestRecord {
  id: string;
  timestamp: string;
  providerName: string;
  contactPerson: string;
  phone: string;
  email: string;
  roleRequired: string;
  shiftDate: string;
  shiftTimes: string;
  locationSuburb: string;
  notes: string;
  urgency: 'routine' | 'urgent_24h' | 'emergency_sameday';
  status: 'received' | 'reviewing' | 'staff_matched' | 'confirmed';
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'shifts.json');

function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readShifts(): ShiftRequestRecord[] {
  initStorage();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeShifts(records: ShiftRequestRecord[]): void {
  initStorage();
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

export const createShiftRequest = async (req: Request, res: Response) => {
  try {
    const {
      providerName,
      contactPerson,
      phone,
      email,
      roleRequired,
      shiftDate,
      shiftTimes,
      locationSuburb,
      notes,
      urgency
    } = req.body;

    if (!providerName || !contactPerson || !phone || !roleRequired) {
      return res.status(400).json({
        success: false,
        message: 'Provider name, contact person, phone number, and requested role are required.'
      });
    }

    const referenceId = `TCH-SFT-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newRecord: ShiftRequestRecord = {
      id: referenceId,
      timestamp: new Date().toISOString(),
      providerName: String(providerName).trim(),
      contactPerson: String(contactPerson).trim(),
      phone: String(phone).trim(),
      email: String(email || '').trim(),
      roleRequired: String(roleRequired).trim(),
      shiftDate: String(shiftDate || '').trim(),
      shiftTimes: String(shiftTimes || '').trim(),
      locationSuburb: String(locationSuburb || '').trim(),
      notes: String(notes || '').trim(),
      urgency: urgency || 'routine',
      status: 'received'
    };

    const existing = readShifts();
    existing.unshift(newRecord);
    writeShifts(existing);

    console.log(`[TCH Agency Staffing] Shift request ${referenceId} submitted by ${providerName} for ${roleRequired}`);

    return res.status(201).json({
      success: true,
      message: 'Shift cover request received. Our roster team will verify staff availability and get back to you with worker profiles promptly.',
      referenceId,
      data: newRecord
    });
  } catch (err: any) {
    console.error('Error creating shift request:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process shift request.'
    });
  }
};

export const listShifts = async (req: Request, res: Response) => {
  try {
    const records = readShifts();
    return res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to list shift requests.'
    });
  }
};
