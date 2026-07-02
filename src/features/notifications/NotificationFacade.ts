import { 
  IEmailService, 
  ISmsService, 
  IWhatsAppService, 
  IPushNotificationService,
  INotificationPayload
} from '../../domain/services/INotificationService';
import { Visit } from '../../domain/models/Visit';
import { Visitor } from '../../domain/models/Visitor';
import { VisitorPass } from '../../domain/models/VisitorPass';
import { Host } from '../../domain/models/Host';

export class NotificationFacade {
  constructor(
    private emailService: IEmailService,
    private smsService: ISmsService,
    private whatsAppService: IWhatsAppService,
    private pushService: IPushNotificationService
  ) {}

  async sendApprovalRequest(visitor: Visitor, visit: Visit, host: Partial<Host>) {
    const payload: INotificationPayload = {
      recipientId: host.id,
      recipientName: host.name,
      contactDetail: host.email || 'host@example.com',
      subject: 'New Visitor Approval Request',
      message: `You have a new visitor request from ${visitor.name} (${visitor.company || 'N/A'}) for ${visit.purpose}. Please approve or reject in the app.`,
    };
    
    // Notify host via email and push
    await this.emailService.sendEmail(payload);
    await this.pushService.sendPushNotification({
      ...payload,
      contactDetail: 'host-device-token' // Mock token
    });
  }

  async sendArrivalNotification(visitor: Visitor, visit: Visit) {
    const payload: INotificationPayload = {
      recipientId: visit.hostId,
      recipientName: 'Unknown Host', // Will be overridden if we have the host details later
      contactDetail: 'host@example.com',
      subject: 'Walk-In Visitor Waiting',
      message: `${visitor.name} has arrived and is waiting for your approval.`,
    };
    await this.pushService.sendPushNotification({
      ...payload,
      contactDetail: 'host-device-token'
    });
  }

  async sendPassGenerated(visitor: Visitor, pass: VisitorPass) {
    const payload: INotificationPayload = {
      recipientId: visitor.id,
      recipientName: visitor.name,
      contactDetail: visitor.email || visitor.phone || 'visitor@example.com',
      subject: 'Your Visitor Pass is Ready',
      message: `Hello ${visitor.name}, your visitor pass has been generated. Pass ID: ${pass.passId}. View it here: ${pass.publicUrl}`,
    };

    // Notify visitor via email and SMS/WhatsApp
    if (visitor.email) {
      await this.emailService.sendEmail(payload);
    }
    if (visitor.phone) {
      await this.smsService.sendSms({ ...payload, contactDetail: visitor.phone });
      await this.whatsAppService.sendWhatsAppMessage({ ...payload, contactDetail: visitor.phone });
    }
  }

  async sendRejected(visitor: Visitor) {
    const payload: INotificationPayload = {
      recipientId: visitor.id,
      recipientName: visitor.name,
      contactDetail: visitor.email || visitor.phone || 'visitor@example.com',
      subject: 'Visit Request Update',
      message: `Hello ${visitor.name}, unfortunately your visit request has been rejected at this time.`,
    };

    if (visitor.email) {
      await this.emailService.sendEmail(payload);
    } else if (visitor.phone) {
      await this.smsService.sendSms({ ...payload, contactDetail: visitor.phone });
    }
  }

  async sendCheckInAlert(visitor: Visitor, host: Partial<Host>) {
    const payload: INotificationPayload = {
      recipientId: host.id,
      recipientName: host.name,
      contactDetail: host.email || 'host@example.com',
      subject: 'Your Visitor has Arrived',
      message: `${visitor.name} has just checked in at the main gate.`,
    };

    await this.pushService.sendPushNotification({
      ...payload,
      contactDetail: 'host-device-token'
    });
    await this.emailService.sendEmail(payload);
  }
}
