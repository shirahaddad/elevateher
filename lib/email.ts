import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

if (!RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

if (!ADMIN_EMAIL) {
  throw new Error('Missing ADMIN_EMAIL environment variable');
}

// At this point, TypeScript knows these are not undefined
const resend = new Resend(RESEND_API_KEY);
const fromEmail: string = 'Elevate(Her) <onboarding@resend.dev>';
const adminEmail: string = ADMIN_EMAIL;

export async function sendQuestionnaireEmail(data: {
  email: string;
  goals: string;
  skills: string[];
  otherSkill: string;
  timeCommitment: string;
  linkedin: string;
  additionalInfo: string;
  source: string;
  mailingList: boolean;
}) {
  const { email, goals, skills, otherSkill, timeCommitment, linkedin, additionalInfo, source, mailingList } = data;

  const skillsList = [...skills, otherSkill].filter(Boolean).join(', ');

  const html = `
    <h1>New Questionnaire Submission</h1>
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

export async function sendLearnMoreEmail(data: {
  name: string;
  email: string;
}) {
  const { name, email } = data;

  const html = `
    <h1>New Learn More Submission</h1>
    <p><strong>Email:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
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