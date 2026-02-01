// Notification Service for Christina's Child Care Center
// In-app notifications with stubs for SMS/Email integration

import {
  Notification,
  NotificationType,
  Employee,
} from '@/types/employee';
import { createNotification } from './employee-storage';

// ============================================================================
// In-App Toast Notifications (using browser events)
// ============================================================================

export type ToastVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface ToastData {
  id: string;
  title: string;
  message: string;
  variant: ToastVariant;
  duration?: number; // milliseconds, default 5000
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Custom event for toast notifications
const TOAST_EVENT = 'christinas:toast';

export function showToast(data: Omit<ToastData, 'id'>): string {
  const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const toastData: ToastData = { ...data, id };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: toastData }));
  }

  return id;
}

export function onToast(callback: (data: ToastData) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ToastData>;
    callback(customEvent.detail);
  };

  window.addEventListener(TOAST_EVENT, handler);
  return () => window.removeEventListener(TOAST_EVENT, handler);
}

// ============================================================================
// Notification Creation Helpers
// ============================================================================

export async function notifySchedulePublished(
  employees: Employee[],
  weekStart: string
): Promise<Notification[]> {
  const notifications: Notification[] = [];

  for (const employee of employees) {
    const notification = await createNotification({
      employee_id: employee.id,
      type: 'schedule_published',
      title: 'Schedule Published',
      message: `The schedule for the week of ${formatDate(weekStart)} has been published.`,
      action_url: '/employee/schedule',
    });
    notifications.push(notification);
  }

  return notifications;
}

export async function notifyScheduleChanged(
  employee: Employee,
  date: string,
  changeDescription: string
): Promise<Notification> {
  return createNotification({
    employee_id: employee.id,
    type: 'schedule_changed',
    title: 'Schedule Updated',
    message: `Your schedule for ${formatDate(date)} has been updated: ${changeDescription}`,
    action_url: '/employee/schedule',
  });
}

export async function notifyRequestApproved(
  employee: Employee,
  requestType: string,
  date: string
): Promise<Notification> {
  return createNotification({
    employee_id: employee.id,
    type: 'request_approved',
    title: 'Request Approved',
    message: `Your ${requestType} request for ${formatDate(date)} has been approved.`,
    action_url: '/employee/schedule',
  });
}

export async function notifyRequestDenied(
  employee: Employee,
  requestType: string,
  date: string,
  reason?: string
): Promise<Notification> {
  let message = `Your ${requestType} request for ${formatDate(date)} has been denied.`;
  if (reason) {
    message += ` Reason: ${reason}`;
  }

  return createNotification({
    employee_id: employee.id,
    type: 'request_denied',
    title: 'Request Denied',
    message,
    action_url: '/employee/schedule',
  });
}

export async function notifyTimeOffReminder(
  employee: Employee,
  date: string
): Promise<Notification> {
  return createNotification({
    employee_id: employee.id,
    type: 'time_off_reminder',
    title: 'Time Off Reminder',
    message: `Reminder: You have approved time off on ${formatDate(date)}.`,
    action_url: '/employee/time-off',
  });
}

export async function notifyTrainingDue(
  employee: Employee,
  trainingName: string,
  dueDate: string
): Promise<Notification> {
  return createNotification({
    employee_id: employee.id,
    type: 'training_due',
    title: 'Training Due',
    message: `Your ${trainingName} training is due by ${formatDate(dueDate)}.`,
    action_url: '/employee/training',
  });
}

export async function sendGeneralNotification(
  employee: Employee,
  title: string,
  message: string,
  actionUrl?: string
): Promise<Notification> {
  return createNotification({
    employee_id: employee.id,
    type: 'general',
    title,
    message,
    action_url: actionUrl,
  });
}

// ============================================================================
// SMS Integration Stub
// ============================================================================

export interface SMSConfig {
  provider: 'twilio' | 'aws-sns' | 'none';
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
}

let smsConfig: SMSConfig = { provider: 'none' };

export function configureSMS(config: SMSConfig): void {
  smsConfig = config;
  console.log('[SMS] Configured SMS provider:', config.provider);
}

export async function sendSMS(
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (smsConfig.provider === 'none') {
    console.log('[SMS STUB] Would send SMS to', to, ':', message);
    return { success: true, messageId: 'stub_' + Date.now() };
  }

  // In production, implement actual SMS sending here
  // Example for Twilio:
  // const client = require('twilio')(smsConfig.accountSid, smsConfig.authToken);
  // const result = await client.messages.create({
  //   body: message,
  //   from: smsConfig.fromNumber,
  //   to: to
  // });
  // return { success: true, messageId: result.sid };

  console.log('[SMS STUB] SMS integration not implemented for provider:', smsConfig.provider);
  return { success: false, error: 'SMS integration not implemented' };
}

// ============================================================================
// Email Integration Stub
// ============================================================================

export interface EmailConfig {
  provider: 'sendgrid' | 'aws-ses' | 'smtp' | 'none';
  apiKey?: string;
  fromEmail?: string;
  fromName?: string;
}

let emailConfig: EmailConfig = { provider: 'none' };

export function configureEmail(config: EmailConfig): void {
  emailConfig = config;
  console.log('[Email] Configured email provider:', config.provider);
}

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

export async function sendEmail(
  message: EmailMessage
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (emailConfig.provider === 'none') {
    console.log('[EMAIL STUB] Would send email to', message.to);
    console.log('[EMAIL STUB] Subject:', message.subject);
    console.log('[EMAIL STUB] Body:', message.body.substring(0, 100) + '...');
    return { success: true, messageId: 'stub_' + Date.now() };
  }

  // In production, implement actual email sending here
  // Example for SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(emailConfig.apiKey);
  // const result = await sgMail.send({
  //   to: message.to,
  //   from: { email: emailConfig.fromEmail, name: emailConfig.fromName },
  //   subject: message.subject,
  //   text: message.isHtml ? undefined : message.body,
  //   html: message.isHtml ? message.body : undefined,
  // });
  // return { success: true, messageId: result[0].headers['x-message-id'] };

  console.log('[EMAIL STUB] Email integration not implemented for provider:', emailConfig.provider);
  return { success: false, error: 'Email integration not implemented' };
}

// ============================================================================
// Multi-Channel Notification
// ============================================================================

export interface NotificationChannels {
  inApp: boolean;
  sms: boolean;
  email: boolean;
}

export async function sendMultiChannelNotification(
  employee: Employee,
  type: NotificationType,
  title: string,
  message: string,
  channels: NotificationChannels = { inApp: true, sms: false, email: false },
  actionUrl?: string
): Promise<{
  inApp?: Notification;
  sms?: { success: boolean; messageId?: string; error?: string };
  email?: { success: boolean; messageId?: string; error?: string };
}> {
  const results: {
    inApp?: Notification;
    sms?: { success: boolean; messageId?: string; error?: string };
    email?: { success: boolean; messageId?: string; error?: string };
  } = {};

  // In-app notification
  if (channels.inApp) {
    results.inApp = await createNotification({
      employee_id: employee.id,
      type,
      title,
      message,
      action_url: actionUrl,
    });

    // Also show a toast
    showToast({
      title,
      message,
      variant: type === 'request_denied' ? 'warning' : 'info',
    });
  }

  // SMS notification
  if (channels.sms && employee.phone) {
    results.sms = await sendSMS(employee.phone, `${title}: ${message}`);
  }

  // Email notification
  if (channels.email && employee.email) {
    results.email = await sendEmail({
      to: employee.email,
      subject: `Christina's Child Care - ${title}`,
      body: `
        <h2>${title}</h2>
        <p>${message}</p>
        ${actionUrl ? `<p><a href="${actionUrl}">View Details</a></p>` : ''}
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from Christina's Child Care Center.
        </p>
      `,
      isHtml: true,
    });
  }

  return results;
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Map notification types to toast variants
export function getToastVariantForType(type: NotificationType): ToastVariant {
  switch (type) {
    case 'request_approved':
      return 'success';
    case 'request_denied':
      return 'warning';
    case 'training_due':
    case 'time_off_reminder':
      return 'info';
    case 'schedule_changed':
      return 'info';
    case 'schedule_published':
      return 'success';
    default:
      return 'default';
  }
}
