import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { SMTPClient } from "npm:emailjs@4.0.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

interface SMTPSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'tls' | 'ssl' | 'none';
  from_email: string;
  from_name: string;
  is_enabled: boolean;
}

interface EmailTemplate {
  template_type: string;
  subject: string;
  body_html: string;
  body_text: string;
  is_enabled: boolean;
}

interface EmailRecipient {
  email: string;
  name: string;
  is_primary: boolean;
  is_enabled: boolean;
}

function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  }
  return result;
}

async function sendEmail(
  smtp: SMTPSettings,
  to: string,
  toName: string,
  subject: string,
  htmlBody: string,
  textBody: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = new SMTPClient({
      user: smtp.username,
      password: smtp.password,
      host: smtp.host,
      port: smtp.port,
      tls: smtp.encryption === 'tls',
      ssl: smtp.encryption === 'ssl',
    });

    await client.sendAsync({
      from: `${smtp.from_name} <${smtp.from_email}>`,
      to: toName ? `${toName} <${to}>` : to,
      subject: subject,
      text: textBody,
      attachment: [
        { data: htmlBody, alternative: true },
      ],
    });

    return { success: true };
  } catch (error) {
    console.error('SMTP Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (action === 'test' && req.method === 'POST') {
      const smtpData: SMTPSettings = await req.json();
      
      try {
        const client = new SMTPClient({
          user: smtpData.username,
          password: smtpData.password,
          host: smtpData.host,
          port: smtpData.port,
          tls: smtpData.encryption === 'tls',
          ssl: smtpData.encryption === 'ssl',
        });

        await client.sendAsync({
          from: `${smtpData.from_name} <${smtpData.from_email}>`,
          to: smtpData.from_email,
          subject: 'Test SMTP Connection',
          text: 'This is a test email to verify your SMTP configuration is working correctly.',
          attachment: [
            { 
              data: '<html><body><h2>SMTP Test Successful</h2><p>Your SMTP configuration is working correctly.</p></body></html>', 
              alternative: true 
            },
          ],
        });

        return new Response(
          JSON.stringify({ success: true, message: 'Test email sent successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Connection failed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData: ContactFormData = await req.json();

    if (!formData.name || !formData.email || !formData.message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '';

    const { data: submission, error: submissionError } = await supabase
      .from('contact_submissions')
      .insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        subject: formData.subject || 'Contact Form Submission',
        message: formData.message,
        ip_address: clientIp,
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Submission error:', submissionError);
      return new Response(
        JSON.stringify({ error: 'Failed to save submission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: smtpSettings } = await supabase
      .from('smtp_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!smtpSettings?.is_enabled || !smtpSettings?.host) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Message received successfully',
          submission_id: submission.id,
          emails_sent: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: templates } = await supabase
      .from('email_templates')
      .select('*');

    const { data: recipients } = await supabase
      .from('email_recipients')
      .select('*')
      .eq('is_enabled', true);

    const now = new Date();
    const placeholders = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || 'Non fourni',
      subject: formData.subject || 'Contact Form Submission',
      message: formData.message,
      date: now.toLocaleDateString('fr-FR'),
      time: now.toLocaleTimeString('fr-FR'),
    };

    let notificationSent = false;
    let autoResponseSent = false;

    const notificationTemplate = templates?.find(t => t.template_type === 'contact_notification' && t.is_enabled);
    if (notificationTemplate && recipients && recipients.length > 0) {
      const subject = replacePlaceholders(notificationTemplate.subject, placeholders);
      const htmlBody = replacePlaceholders(notificationTemplate.body_html, placeholders);
      const textBody = replacePlaceholders(notificationTemplate.body_text, placeholders);

      for (const recipient of recipients) {
        const result = await sendEmail(
          smtpSettings as SMTPSettings,
          recipient.email,
          recipient.name,
          subject,
          htmlBody,
          textBody
        );
        if (result.success) notificationSent = true;
      }
    }

    const autoResponseTemplate = templates?.find(t => t.template_type === 'auto_response' && t.is_enabled);
    if (autoResponseTemplate) {
      const subject = replacePlaceholders(autoResponseTemplate.subject, placeholders);
      const htmlBody = replacePlaceholders(autoResponseTemplate.body_html, placeholders);
      const textBody = replacePlaceholders(autoResponseTemplate.body_text, placeholders);

      const result = await sendEmail(
        smtpSettings as SMTPSettings,
        formData.email,
        formData.name,
        subject,
        htmlBody,
        textBody
      );
      autoResponseSent = result.success;
    }

    await supabase
      .from('contact_submissions')
      .update({
        notification_sent: notificationSent,
        auto_response_sent: autoResponseSent,
      })
      .eq('id', submission.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Message sent successfully',
        submission_id: submission.id,
        notification_sent: notificationSent,
        auto_response_sent: autoResponseSent,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});