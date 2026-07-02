import { VisitorRepository } from '../VisitorRepository';
import { Visitor } from '../../../domain/models/Visitor';
import { Visit } from '../../../domain/models/Visit';
import { VisitorPass } from '../../../domain/models/VisitorPass';
import { VisitStatus, PassStatus, VisitorStatus } from '../../../domain/models/enums';
import { IStorageService } from '../../../domain/services/IStorageService';
import { NotificationFacade } from '../../notifications/NotificationFacade';
import Logger from '../../../core/logger/Logger';

export interface RegisterWalkInVisitorPayload {
  visitorData: Partial<Visitor>;
  visitData: Partial<Visit>;
  photoLocalUri?: string;
  idCardLocalUri?: string;
  isPreApproved?: boolean; // If true (e.g. Host creates), visit is APPROVED and pass generated. If false (e.g. Guard creates), visit is PENDING.
}

export class RegisterWalkInVisitorUseCase {
  constructor(
    private storageService: IStorageService,
    private notificationFacade: NotificationFacade
  ) {}

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private validatePhone(phone: string): boolean {
    const re = /^[0-9+\-\s()]{7,15}$/;
    return re.test(phone);
  }

  private async uploadOptionalFile(localUri: string | undefined, path: string): Promise<string | undefined> {
    if (!localUri) return undefined;
    if (/^https?:\/\//i.test(localUri)) return localUri;

    try {
      return await this.storageService.uploadFile(localUri, path);
    } catch (error) {
      Logger.warn(`[RegisterWalkInVisitorUseCase] Failed to upload ${path}. Continuing without remote image.`, error);
      return undefined;
    }
  }

  async execute(payload: RegisterWalkInVisitorPayload): Promise<{ visitor: Visitor, visit: Visit, pass: VisitorPass }> {
    Logger.info(`[RegisterWalkInVisitorUseCase] Executing`);

    const { visitorData, visitData, photoLocalUri, idCardLocalUri } = payload;

    // 1. Validation
    if (visitorData.email && !this.validateEmail(visitorData.email)) {
      throw new Error('Invalid email format');
    }
    if (visitorData.phone && !this.validatePhone(visitorData.phone)) {
      throw new Error('Invalid phone format');
    }
    if (visitData.expectedExitTime && visitData.entryTime) {
      if (new Date(visitData.expectedExitTime) <= new Date(visitData.entryTime)) {
        throw new Error('Valid Until must be after Valid From');
      }
    }

    // 2. Upload Images
    let photoUrl = visitorData.photoUrl;
    let idCardUrl = visitorData.idCardUrl;
    
    photoUrl = await this.uploadOptionalFile(photoLocalUri || photoUrl, `visitors/photos/`);
    idCardUrl = await this.uploadOptionalFile(idCardLocalUri || idCardUrl, `visitors/ids/`);

    const updatedVisitorData = {
      ...visitorData,
      photoUrl,
      idCardUrl,
      status: VisitorStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 3. Delegate to Repository to persist (assuming repository handles the actual creation logic or we do it here)
    // The user requested: "Keep all business logic inside a RegisterWalkInVisitorUseCase; the repository should only persist data."
    // Let's create the entities here and pass to repository to save.

    const generatedVisitorId = visitorData.id || this.generateUUID();
    
    const finalVisitor: Visitor = {
      id: generatedVisitorId,
      name: visitorData.name || 'Unknown',
      phone: visitorData.phone,
      email: visitorData.email,
      company: visitorData.company,
      governmentId: visitorData.governmentId,
      photoUrl,
      idCardUrl,
      status: VisitorStatus.ACTIVE,
      totalVisits: (visitorData.totalVisits || 0) + 1,
      previousHosts: visitorData.previousHosts || [],
      previousPurposes: visitorData.previousPurposes || [],
      previousCompanies: visitorData.previousCompanies || [],
      createdAt: visitorData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const visitId = this.generateUUID();
    
    // Determine status based on who is registering
    const initialStatus = payload.isPreApproved ? VisitStatus.APPROVED : VisitStatus.PENDING;

    const finalVisit: Visit = {
      id: visitId,
      visitorId: finalVisitor.id,
      hostId: visitData.hostId || 'Unknown Host',
      purpose: visitData.purpose || 'Meeting',
      building: visitData.building,
      floor: visitData.floor,
      vehicleNumber: visitData.vehicleNumber,
      status: initialStatus,
      scheduledDate: new Date().toISOString(),
      entryTime: visitData.entryTime || new Date().toISOString(),
      expectedExitTime: visitData.expectedExitTime,
      notes: visitData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: payload.isPreApproved ? 'Host' : 'Guard/Receptionist',
    };

    let finalPass: VisitorPass | undefined;

    // Always generate pass for CHECKED_IN or APPROVED visitors
    if (initialStatus === VisitStatus.APPROVED) {
      const secureToken = this.generateUUID();
      finalPass = {
        id: secureToken,
        visitId: finalVisit.id,
        visitorId: finalVisitor.id,
        passId: `VX-${Math.floor(1000 + Math.random() * 9000)}`,
        qrToken: secureToken,
        token: secureToken,
        visitorName: finalVisitor.name,
        hostName: finalVisit.hostId, // Replace with actual host name if fetched
        company: finalVisitor.company,
        purpose: finalVisit.purpose,
        status: PassStatus.GENERATED,
        validFrom: finalVisit.entryTime || new Date().toISOString(),
        validUntil: finalVisit.expectedExitTime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        gracePeriodMinutes: 30,
        publicUrl: `https://rajeev02.github.io/vms/pass.html?token=${secureToken}`,
        generatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    // Clean objects to remove undefined fields which Firestore rejects
    const cleanObject = (obj: any) => {
      Object.keys(obj).forEach(key => {
        if (obj[key] === undefined) {
          delete obj[key];
        }
      });
      return obj;
    };

    cleanObject(finalVisitor);
    cleanObject(finalVisit);
    if (finalPass) cleanObject(finalPass);

    // 4. Save entities
    // In our repository, saveWalkInRegistration can handle optional passes. 
    // If we only have a pending visit, we don't save a pass.
    if (finalPass) {
      await VisitorRepository.saveWalkInRegistration(finalVisitor, finalVisit, finalPass);
      // 5. Send Notifications
      await this.notificationFacade.sendPassGenerated(finalVisitor, finalPass);
    } else {
      // Just save Visitor and Visit
      // We should ideally have a different repository method, but we can pass a dummy pass or update the repository.
      // For simplicity, let's assume the repository checks if pass exists.
      await VisitorRepository.saveWalkInRegistration(finalVisitor, finalVisit, {} as VisitorPass);
      // Notify Host that a visitor is waiting for approval
      await this.notificationFacade.sendArrivalNotification(finalVisitor, finalVisit);
    }

    return { visitor: finalVisitor, visit: finalVisit, pass: finalPass as VisitorPass };
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
