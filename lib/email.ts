import { Resend } from 'resend';

/**
 * Email service configuration and utilities for Elevate(Her) application.
 * 
 * This module handles all email communications including:
 * - Questionnaire submissions to admin
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

/**
 * Data structure for questionnaire submissions
 */
interface QuestionnaireData {
  /** Client's full name */
  client_name: string;
  /** Client's email address */
  email: string;
  /** Client's stated goals */
  goals: string;
  /** Array of skills the client wants to develop */
  skills: string[];
  /** Additional skill not in the predefined list */
  otherSkill: string;
  /** Client's available time commitment */
  timeCommitment: string;
  /** Client's LinkedIn profile URL */
  linkedin: string;
  /** Any additional information provided */
  additionalInfo: string;
  /** How the client found the service */
  source: string;
  /** Whether client wants to join mailing list */
  mailingList: boolean;
}

/**
 * Sends a notification email to the admin when a new questionnaire is submitted.
 * 
 * This function processes questionnaire data and sends a formatted HTML email
 * to the admin containing all the submission details for review.
 * 
 * @param data - The questionnaire submission data
 * @returns Promise<{success: boolean, error?: any}> - Result of the email operation
 * 
 * @example
 * ```typescript
 * const result = await sendQuestionnaireEmail({
 *   client_name: "Jane Doe",
 *   email: "jane@example.com",
 *   goals: "Career advancement",
 *   skills: ["Leadership", "Communication"],
 *   otherSkill: "Project Management",
 *   timeCommitment: "5-10 hours/week",
 *   linkedin: "https://linkedin.com/in/janedoe",
 *   additionalInfo: "Looking for executive coaching",
 *   source: "Google Search",
 *   mailingList: true
 * });
 * ```
 */
export async function sendQuestionnaireEmail(data: QuestionnaireData) {
  const { client_name, email, goals, skills, otherSkill, timeCommitment, linkedin, additionalInfo, source, mailingList } = data;

  // Combine skills array with other skill, filtering out empty values
  const skillsList = [...skills, otherSkill].filter(Boolean).join(', ');

  const html = `
    <h1>New Questionnaire Submission</h1>
    <p><strong>Name:</strong> ${client_name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Goals:</strong> ${goals}</p>
    <p><strong>Skills to Develop:</strong> ${skillsList}</p>
    <p><strong>Time Commitment:</strong> ${timeCommitment}</p>
    <p><strong>LinkedIn:</strong> ${linkedin || 'Not provided'}</p>
    <p><strong>Additional Info:</strong> ${additionalInfo || 'None'}</p>
    <p><strong>Source:</strong> ${source || 'None'}</p>
    <p><strong>Mailing List:</strong> ${mailingList ? 'Yes' : 'No'}</p>
  `;

  try {
    console.log('Email configuration:', {
      from: fromEmail,
      to: adminEmail,
      subject: 'New Questionnaire Submission',
      hasHtml: !!html
    });

    const { data: resendData, error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: 'New Questionnaire Submission',
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
    <p>Not sure where to begin? Book a free 25 min information session with us <a href="https://calendly.com/shira-haddad/elevateher-info-session">here</a>.</p>
    <p>Ready to elevate? Book your free 60 min intake session <a href="https://calendly.com/shira-haddad/elevate-her-joint-intake">now!</a></p>
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