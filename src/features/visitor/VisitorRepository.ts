import Logger from '../../core/logger/Logger';

export type VisitorStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ARRIVED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED';

export interface VisitorPass {
  id: string;
  visitorId: string;
  qrCodeValue: string;
  type: 'QR' | 'TEMPORARY_PIN' | 'NFC' | 'PRINTED';
  validFrom: string;
  validUntil: string;
}

export interface Visitor {
  id: string;
  name: string;
  company: string;
  purpose: string;
  status: VisitorStatus;
  type: 'PRE_APPROVED' | 'WALK_IN';
  hostId: string;
  createdAt: string;
  idVerified: boolean;
  badgeNumber?: string;
  phone?: string;
  email?: string;
}

// Mock Data
let mockVisitors: Visitor[] = [
  {
    id: '1',
    name: 'John Doe',
    company: 'Acme Corp',
    purpose: 'Meeting',
    status: 'APPROVED',
    type: 'PRE_APPROVED',
    hostId: '1',
    createdAt: new Date().toISOString(),
    idVerified: false,
    phone: '555-0101',
    email: 'john@acme.com'
  },
  {
    id: '2',
    name: 'Jane Smith',
    company: 'Tech Solutions',
    purpose: 'Interview',
    status: 'CHECKED_IN',
    type: 'WALK_IN',
    hostId: '1',
    createdAt: new Date().toISOString(),
    idVerified: true,
    badgeNumber: 'B-102',
    phone: '555-0102',
  },
];

let mockPasses: VisitorPass[] = [
  {
    id: 'pass-1',
    visitorId: '1',
    qrCodeValue: 'qr-john-doe-123',
    type: 'QR',
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 86400000).toISOString(),
  }
];

export class VisitorRepository {
  static async getVisitors(page: number = 1, limit: number = 10): Promise<Visitor[]> {
    Logger.info(`VisitorRepository: getVisitors page=${page}`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const startIndex = (page - 1) * limit;
    return mockVisitors.slice(startIndex, startIndex + limit);
  }

  static async getVisitorById(id: string): Promise<Visitor | null> {
    Logger.info(`VisitorRepository: getVisitorById id=${id}`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockVisitors.find(v => v.id === id) || null;
  }

  static async searchVisitors(query: string): Promise<Visitor[]> {
    Logger.info(`VisitorRepository: searchVisitors query=${query}`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const lowerQuery = query.toLowerCase();
    return mockVisitors.filter(v => 
      v.name.toLowerCase().includes(lowerQuery) || 
      v.email?.toLowerCase().includes(lowerQuery) || 
      v.phone?.includes(query)
    );
  }

  static async getVisitorByPassQr(qrValue: string): Promise<Visitor | null> {
    Logger.info(`VisitorRepository: getVisitorByPassQr qr=${qrValue}`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const pass = mockPasses.find(p => p.qrCodeValue === qrValue);
    if (!pass) return null;
    return this.getVisitorById(pass.visitorId);
  }

  static async createVisitor(visitorData: Partial<Visitor>): Promise<{ visitor: Visitor, pass?: VisitorPass }> {
    Logger.info(`VisitorRepository: createVisitor`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const newVisitor: Visitor = {
      id: Math.random().toString(36).substr(2, 9),
      name: visitorData.name || '',
      company: visitorData.company || '',
      purpose: visitorData.purpose || '',
      type: visitorData.type || 'WALK_IN',
      hostId: visitorData.hostId || '1',
      status: visitorData.type === 'PRE_APPROVED' ? 'APPROVED' : 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
      idVerified: false,
      phone: visitorData.phone,
      email: visitorData.email,
    };
    
    mockVisitors.unshift(newVisitor);

    if (newVisitor.status === 'APPROVED') {
      const pass = await this.generatePass(newVisitor.id);
      return { visitor: newVisitor, pass };
    }

    return { visitor: newVisitor };
  }

  static async generatePass(visitorId: string): Promise<VisitorPass> {
    const pass: VisitorPass = {
      id: `pass-${Math.random().toString(36).substr(2, 9)}`,
      visitorId,
      qrCodeValue: `qr-${visitorId}-${Date.now()}`,
      type: 'QR',
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 86400000).toISOString(),
    };
    mockPasses.push(pass);
    return pass;
  }

  static async updateVisitorStatus(id: string, updates: Partial<Visitor>): Promise<Visitor | null> {
    Logger.info(`VisitorRepository: updateVisitorStatus id=${id} updates=${JSON.stringify(updates)}`);
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    const index = mockVisitors.findIndex(v => v.id === id);
    if (index === -1) return null;

    mockVisitors[index] = { ...mockVisitors[index], ...updates };
    return mockVisitors[index];
  }
}
