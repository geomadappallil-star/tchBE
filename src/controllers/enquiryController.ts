import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { forwardEnquiryEmail } from '../services/emailService.js';

export interface EnquiryRecord {
  id: string;
  timestamp: string;
  name: string;
  phone: string;
  email?: string;
  suburb?: string;
  enquiryType: string;
  service: string;
  message: string;
  fundingType?: string;
  status: 'new' | 'contacted' | 'resolved';
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'enquiries.json');

// Ensure data directory and file exist
function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readEnquiries(): EnquiryRecord[] {
  initStorage();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeEnquiries(records: EnquiryRecord[]): void {
  initStorage();
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

export const createEnquiry = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, suburb, enquiryType, service, message, fundingType } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required to submit an enquiry.'
      });
    }

    const referenceId = `TCH-ENQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: EnquiryRecord = {
      id: referenceId,
      timestamp: new Date().toISOString(),
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : undefined,
      suburb: suburb ? String(suburb).trim() : undefined,
      enquiryType: enquiryType || 'General Enquiry',
      service: service || 'Not specified',
      message: message ? String(message).trim() : '',
      fundingType: fundingType || 'Unspecified',
      status: 'new'
    };

    const existing = readEnquiries();
    existing.unshift(newRecord);
    writeEnquiries(existing);

    console.log(`[TCH Support] New enquiry received: ${referenceId} from ${newRecord.name} (${newRecord.phone})`);

    // Asynchronously forward email to abeymanoj007@gmail.com from admin@tchservices.com.au
    forwardEnquiryEmail({
      referenceId,
      name: newRecord.name,
      phone: newRecord.phone,
      email: newRecord.email,
      suburb: newRecord.suburb,
      enquiryType: newRecord.enquiryType,
      service: newRecord.service,
      message: newRecord.message,
      fundingType: newRecord.fundingType,
      timestamp: newRecord.timestamp
    }).catch(emailErr => console.error('[Enquiry Email Forward Error]:', emailErr));

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. Alan or a member of the TCH team will review your enquiry and contact you promptly.',
      referenceId,
      data: newRecord
    });
  } catch (err: any) {
    console.error('Error creating enquiry:', err);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred while processing your enquiry.'
    });
  }
};

export const listEnquiries = async (req: Request, res: Response) => {
  try {
    const records = readEnquiries();
    return res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve enquiries.'
    });
  }
};
