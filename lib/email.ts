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
    <p>Not sure where to begin? Book a free 30 min information session with us <a href="https://zcal.co/t/elevateher/intoduction">here</a>.</p>
    <p>Ready to elevate? Book your free 60 min intake session <a href="https://zcal.co/t/elevateher/intoduction">now!</a></p>
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
 * Sends a confirmation email to users who submit the questionnaire.
 * 
 * This function sends a personalized thank you email to questionnaire
 * respondents with next steps and resources.
 * 
 * @param data - The user's contact information from questionnaire
 * @returns Promise<{success: boolean, error?: any}> - Result of the email operation
 * 
 * @example
 * ```typescript
 * const result = await sendQuestionnaireEmailProspect({
 *   email: "jane@example.com",
 *   name: "Jane Doe"
 * });
 * ```
 */
export async function sendQuestionnaireEmailProspect(data: { email: string; name: string }) {
  const { email, name } = data;
  // Extract first name for personalization
  const firstName = name.split(' ')[0];

  // Use the new sender address for this email
  const fromQuestionnaire = 'Elevate(Her) <info@elevateher.tech>';

  const html = `
    <p>Hi ${firstName},</p>
    <p>Thank you so much for filling out the questionnaire with us — we're thrilled to meet you!</p>
    <p>
      Please use this <a href="https://zcal.co/t/elevateher/intoduction">link</a> to book your first free session - we'll use the information provided in the questionnaire to tailor the conversation to your needs.
    </p>
    <p>
      During our 60-minutes we'll discuss your top goals and priorities, and explore how we can best support you on your career journey in tech. Whether you're stepping into leadership, considering a career pivot, or looking to build confidence in a male-dominated space — this is your time to be heard and celebrated.
    </p>
    <p><strong>Here's what to expect:</strong></p>
    <ul style="list-style:none; padding-left:0;">
      <li>✅ A warm introduction to your coaches</li>
      <li>✅ A conversation centered around <em>your</em> goals</li>
      <li>✅ Space to discuss where you feel stuck — and where you're ready to grow</li>
      <li>✅ An outline of what coaching could look like with Elevate(Her)</li>
    </ul>
    <p>No additional prep is needed — just bring your whole, authentic self.</p>
    <p>We're so glad you're here. Let's make this the beginning of something powerful.</p>
    <p>With purpose and possibility,</p>
    <p>Shira and Cassie</p>
  `;

  try {
    console.log('Email configuration:', {
      from: fromQuestionnaire,
      to: email,
      subject: "🎉 Welcome to Elevate(Her)! Let's get started",
      hasHtml: !!html
    });

    const { data: resendData, error } = await resend.emails.send({
      from: fromQuestionnaire,
      to: email,
      subject: "🎉 Welcome to Elevate(Her)! Let's get started",
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
  const { name, email, mailingList, category } = data;

  // Capitalize category for display
  const categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);
  
  const html = `
    <h1>New ${categoryDisplay} Waitlist Signup</h1>
    <p><strong>Category:</strong> <span style="background-color: #f3e8ff; padding: 2px 6px; border-radius: 4px; color: #7c3aed; font-weight: bold;">${categoryDisplay}</span></p>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Mailing List:</strong> ${mailingList ? 'Yes' : 'No'}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
  `;

  try {
    console.log('Email configuration:', {
      from: fromEmail,
      to: adminEmail,
      subject: `New ${categoryDisplay} Waitlist Signup`,
      hasHtml: !!html
    });

    const { data: resendData, error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `New ${categoryDisplay} Waitlist Signup`,
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