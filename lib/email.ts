import { Resend } from 'resend';

/**
 * Email service configuration and utilities for Elevate(Her) application.
 * 
 * This module handles all email communications including:
 * - Learn more form submissions to admin
 * - Welcome emails to prospects
 * 
 * Uses Resend as the email service provider.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Validate required environment variables
if (!RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

if (!ADMIN_EMAIL) {
  throw new Error('Missing ADMIN_EMAIL environment variable');
}

// Initialize Resend client and email configuration
const resend = new Resend(RESEND_API_KEY);
const fromEmail: string = 'Elevate(Her) <no-reply@elevateher.tech>';
const adminEmail: string = ADMIN_EMAIL;
// Default sender for candidate-facing emails
const fromCandidate: string = 'Elevate(Her) <info@elevateher.tech>';

/**
 * Data structure for learn more form submissions
 */
interface LearnMoreData {
  /** Prospect's full name */
  name: string;
  /** Prospect's email address */
  email: string;
  /** Whether prospect wants to join mailing list */
  mailingList: boolean;
}

/**
 * Data structure for workshop waitlist submissions
 */
interface WorkshopWaitlistData {
  /** Prospect's full name */
  name: string;
  /** Prospect's email address */
  email: string;
  /** Whether prospect wants to join mailing list */
  mailingList: boolean;
  /** Category for the waitlist (e.g., 'workshops') */
  category: string;
  /** Optional LinkedIn profile URL */
  linkedin?: string;
  /** Optional deep link to admin vetting page for this entry */
  adminVettingLink?: string;
}

/**
 * Sends a notification email to the admin when someone submits the "Learn More" form.
 * 
 * This function sends a simple notification email to the admin with the prospect's
 * basic information for follow-up purposes.
 * 
 * @param data - The learn more form data
 * @returns Promise<{success: boolean, error?: any}> - Result of the email operation
 * 
 * @example
 * ```typescript
 * const result = await sendLearnMoreEmail({
 *   name: "John Smith",
 *   email: "john@example.com",
 *   mailingList: true
 * });
 * ```
 */
export async function sendLearnMoreEmail(data: LearnMoreData) {
  const { name, email, mailingList } = data;

  const html = `
    <h1>New Learn More Submission</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Mailing List:</strong> ${mailingList ? 'Yes' : 'No'}</p>
  `;

  try {
    console.log('Email configuration:', {
      from: fromEmail,
      to: adminEmail,
      subject: 'New Learn More Submission',
      hasHtml: !!html
    });

    const { data: resendData, error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: 'New Learn More Submission',
      html,
    });

    if (error) {
      console.error('Resend API error details:', {
        message: error.message,
        name: error.name
      });
      throw error;
    }

    console.log('Email sent successfully. Response:', resendData);
    return { success: true };
  } catch (error) {
    console.error('Error sending email. Full error:', error);
    const errorDetails = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: error.stack
    } : 'Unknown error occurred';
    
    return { 
      success: false, 
      error: errorDetails
    };
  }
} 

/**
 * Data structure for prospect welcome email
 */
interface ProspectEmailData {
  /** Prospect's email address */
  email: string;
  /** Prospect's full name */
  name: string;
}

/**
 * Sends a welcome email to prospects who submit the "Learn More" form.
 * 
 * This function sends a personalized welcome email introducing Shira and Cassie,
 * explaining the Elevate(Her) coaching service, and providing call-to-action
 * links for booking sessions.
 * 
 * The email includes:
 * - Personalized greeting using first name
 * - Introduction to the coaches and service
 * - Mission statement and value proposition
 * - Links to book information and intake sessions
 * 
 * @param data - The prospect's contact information
 * @returns Promise<{success: boolean, error?: any}> - Result of the email operation
 * 
 * @example
 * ```typescript
 * const result = await sendLearnMoreEmailProspect({
 *   email: "sarah@example.com",
 *   name: "Sarah Johnson"
 * });
 * ```
 */
export async function sendLearnMoreEmailProspect(data: ProspectEmailData) {
  const { email, name } = data;
  // Extract first name for personalization
  const firstName = name.split(' ')[0];

  const html = `
    <p>Hi ${firstName},</p>
    <p>We are Shira and Cassie, nice to meet you!</p>
    <p>Thank you for your interest in Elevate(Her).Tech Coaching.</p>
    <p>Our mission is to help as many professionals in tech step into their power with purpose. Whether you're newly promoted or eyeing your next big move, our unique two-coach approach gives you double the insight, strategy, and support from the start.</p>
    <p>We blend real-world tech leadership experience with proven coaching methods to help you grow with clarity, confidence, and impact.</p>
    <p>This isn't just career coaching—it's career elevation.</p>
    <br/>
    <p>Not sure where to begin? Book a free 30 min information session with us <a href="https://zcal.co/t/elevateher/introduction">here</a>.</p>
    <p>Ready to elevate? Book your free 60 min intake session <a href="https://zcal.co/t/elevateher/introduction">now!</a></p>
    <br/>
    <p>We can't wait to get to know you.</p>
    <p>Shira and Cassie<br/><a href="ElevateHer.Tech">ElevateHer.Tech</p>
  `;

  try {
    console.log('Email configuration:', {
      from: fromEmail,
      to: email,
      subject: 'Learn more about Elevate(Her)!',
      hasHtml: !!html
    });

    const { data: resendData, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Learn more about Elevate(Her)!',
      html,
    });

    if (error) {
      console.error('Resend API error details:', {
        message: error.message,
        name: error.name
      });
      throw error;
    }

    console.log('Email sent successfully. Response:', resendData);
    return { success: true };
  } catch (error) {
    console.error('Error sending email. Full error:', error);
    const errorDetails = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: error.stack
    } : 'Unknown error occurred';
    
    return { 
      success: false, 
      error: errorDetails
    };
  }
} 

/**
 * Sends an approval email to the candidate with the Slack invite link.
 */
export async function sendCommunityApprovalEmail(data: { name: string; email: string; slackInviteLink?: string }) {
  const { name, email, slackInviteLink } = data;
  const firstName = name.split(' ')[0] || 'there';
  const link = slackInviteLink || process.env.SLACK_INVITE_LINK || 'https://slack.com';
  const html = `
    <p>Hi ${firstName},</p>
    <p>Great news - your request to join the Elevate(Her) Slack community has been approved!</p>
    <p>Please use the link below to join:</p>
    <p><a href="${link}" style="color:#7c3aed; font-weight:bold;">Join Elevate(Her) on Slack</a></p>
    <p>If the link doesn’t work or expires, reply to this email and we’ll help you get set up.</p>
    <p>Welcome!<br/>Shira & Cassie</p>
  `;
  try {
    const { data: resendData, error } = await resend.emails.send({
      from: fromCandidate,
      to: email,
      subject: 'Welcome to the Elevate(Her) Slack Community!',
      html,
    });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Sends a respectful decline email to the candidate with the provided reason.
 */
export async function sendCommunityRejectionEmail(data: { name: string; email: string; reason: string }) {
  const { name, email, reason } = data;
  const firstName = name.split(' ')[0] || 'there';
  const html = `
    <p>Hi ${firstName},</p>
    <p>Thank you for your interest in joining the Elevate(Her) Slack community. We reviewed your request and we're not able to approve it at this time.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>If you'd like to discuss further, please reply to this email or reach out directly to Shira - we're happy to explore other ways to connect and support you.</p>
    <p>Warmly,<br/>Shira & Cassie</p>
  `;
  try {
    const { data: resendData, error } = await resend.emails.send({
      from: fromCandidate,
      to: email,
      subject: 'Regarding your Elevate(Her) community request',
      html,
    });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Sends a notification email to the admin when someone submits the waitlist form.
 * 
 * This function sends an email to the admin with the prospect's information for 
 * waitlist management purposes, clearly indicating the category.
 * 
 * @param data - The waitlist form data
 * @returns Promise<{success: boolean, error?: any}> - Result of the email operation
 * 
 * @example
 * ```typescript
 * const result = await sendWorkshopWaitlistEmail({
 *   name: "Jane Smith",
 *   email: "jane@example.com",
 *   mailingList: true,
 *   category: "workshops"
 * });
 * ```
 */
export async function sendWorkshopWaitlistEmail(data: WorkshopWaitlistData) {
  const { name, email, mailingList, category, linkedin, adminVettingLink } = data;

  // Capitalize category for display
  const categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);
  
  const html = `
    <h1>New ${categoryDisplay} Submission</h1>
    <p><strong>Category:</strong> <span style="background-color: #f3e8ff; padding: 2px 6px; border-radius: 4px; color: #7c3aed; font-weight: bold;">${categoryDisplay}</span></p>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>LinkedIn:</strong> ${linkedin ? `<a href="${linkedin}">${linkedin}</a>` : 'Not provided'}</p>
    <p><strong>Mailing List:</strong> ${mailingList ? 'Yes' : 'No'}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    ${adminVettingLink ? `<p><strong>Vetting Link:</strong> <a href="${adminVettingLink}">Open in Admin</a></p>` : ''}
  `;

  try {
    console.log('Email configuration:', {
      from: fromEmail,
      to: adminEmail,
      subject: `New ${categoryDisplay} Submission`,
      hasHtml: !!html
    });

    const { data: resendData, error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `New ${categoryDisplay} Submission`,
      html,
    });

    if (error) {
      console.error('Resend API error details:', {
        message: error.message,
        name: error.name
      });
      throw error;
    }

    console.log('Email sent successfully. Response:', resendData);
    return { success: true };
  } catch (error) {
    console.error('Error sending email. Full error:', error);
    const errorDetails = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: error.stack
    } : 'Unknown error occurred';
    
    return { 
      success: false, 
      error: errorDetails
    };
  }
}