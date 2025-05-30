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
const fromEmail: string = 'Elevate(Her) <no-reply@elevateher.tech>';
const adminEmail: string = ADMIN_EMAIL;

// Send a questionnaire submission email to the admin
export async function sendQuestionnaireEmail(data: {
  client_name: string;
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
  const { client_name, email, goals, skills, otherSkill, timeCommitment, linkedin, additionalInfo, source, mailingList } = data;

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

// Send a "Learn More" email to the admin
export async function sendLearnMoreEmail(data: {
  name: string;
  email: string;
  mailingList: boolean;
}) {
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

// Send a "Learn More" email to the prospect
export async function sendLearnMoreEmailProspect(data: { email: string; name: string }) {
  const { email, name } = data;
  const firstName = name.split(' ')[0]; // Get first word of the name

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