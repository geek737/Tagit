/*
  # Update Email Templates with Modern Styled Design
  
  This migration updates the email templates with a modern, professional design
  inspired by the notification dashboard style, including:
  - Modern card-based layout
  - Icons for each field
  - Color-coded sections
  - Professional typography
  - Responsive design
*/

-- Update contact_notification template (Admin email)
UPDATE email_templates
SET 
  subject = 'Nouveau message client ! - {{name}}',
  body_html = '
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau message client</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header avec gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C3AED 0%, #FF6B35 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 15px;">⭐</div>
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">
                Nouveau message client !
              </h1>
              <p style="color: #ffffff; margin: 0; font-size: 16px; opacity: 0.95;">
                Un nouveau client vient de vous contacter via le formulaire de contact.
              </p>
            </td>
          </tr>

          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #4B5563; font-size: 16px; margin: 0 0 30px 0; line-height: 1.6;">
                Voici les détails du message :
              </p>

              <!-- Boîte d''information client -->
              <div style="border: 2px solid #A7F3D0; border-left: 4px solid #7C3AED; border-radius: 12px; padding: 25px; margin-bottom: 30px; background-color: #F0FDF4;">
                <h2 style="color: #1F2937; font-size: 20px; font-weight: bold; margin: 0 0 20px 0; display: flex; align-items: center;">
                  <span style="margin-right: 10px; font-size: 24px;">👤</span>
                  Informations Client
                </h2>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #D1D5DB;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="40" style="vertical-align: top;">
                            <span style="font-size: 20px;">👤</span>
                          </td>
                          <td>
                            <div style="color: #6B7280; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">NOM COMPLET</div>
                            <div style="color: #1F2937; font-size: 16px; font-weight: 600;">{{name}}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #D1D5DB;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="40" style="vertical-align: top;">
                            <span style="font-size: 20px;">✉️</span>
                          </td>
                          <td>
                            <div style="color: #6B7280; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">EMAIL</div>
                            <div style="color: #1F2937; font-size: 16px; font-weight: 600;">
                              <a href="mailto:{{email}}" style="color: #7C3AED; text-decoration: none;">{{email}}</a>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #D1D5DB;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="40" style="vertical-align: top;">
                            <span style="font-size: 20px;">📱</span>
                          </td>
                          <td>
                            <div style="color: #6B7280; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">TÉLÉPHONE</div>
                            <div style="color: #1F2937; font-size: 16px; font-weight: 600;">
                              <a href="tel:{{phone}}" style="color: #7C3AED; text-decoration: none;">{{phone}}</a>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #D1D5DB;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="40" style="vertical-align: top;">
                            <span style="font-size: 20px;">📋</span>
                          </td>
                          <td>
                            <div style="color: #6B7280; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">SUJET</div>
                            <div style="color: #1F2937; font-size: 16px; font-weight: 600;">{{subject}}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="40" style="vertical-align: top;">
                            <span style="font-size: 20px;">💬</span>
                          </td>
                          <td>
                            <div style="color: #6B7280; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">MESSAGE</div>
                            <div style="color: #4B5563; font-size: 15px; line-height: 1.6; white-space: pre-wrap; margin-top: 8px;">{{message}}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Action requise -->
              <div style="border: 2px solid #FCD34D; border-radius: 12px; padding: 20px; background-color: #FEF3C7; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 24px; margin-right: 12px;">⚡</span>
                  <h3 style="color: #92400E; font-size: 18px; font-weight: bold; margin: 0;">Action requise :</h3>
                </div>
                <p style="color: #78350F; font-size: 14px; margin: 0; line-height: 1.6;">
                  Veuillez répondre à ce message dans les plus brefs délais. Vous pouvez répondre directement en utilisant l''adresse email fournie ci-dessus.
                </p>
              </div>

              <!-- Boutons d''action -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background: linear-gradient(135deg, #7C3AED 0%, #FF6B35 100%); border-radius: 8px; padding: 0;">
                          <a href="mailto:{{email}}?subject=Re: {{subject}}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">Répondre par Email</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="color: #6B7280; font-size: 14px; margin: 0;">
                Ce message a été envoyé depuis le formulaire de contact de <strong style="color: #7C3AED;">TagIT</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  ',
  body_text = 'Nouveau message client !

Informations Client:
- Nom complet: {{name}}
- Email: {{email}}
- Téléphone: {{phone}}
- Sujet: {{subject}}

Message:
{{message}}

Action requise: Veuillez répondre à ce message dans les plus brefs délais.
  ',
  updated_at = now()
WHERE template_type = 'contact_notification';

-- Update auto_response template (Client email)
UPDATE email_templates
SET 
  subject = 'Confirmation de réception - TagIT',
  body_html = '
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de réception</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header avec gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C3AED 0%, #FF6B35 100%); padding: 40px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 32px; font-weight: bold;">
                Message reçu !
              </h1>
              <p style="color: #ffffff; margin: 0; font-size: 16px; opacity: 0.9;">
                Merci de nous avoir contactés
              </p>
            </td>
          </tr>

          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #4B5563; font-size: 18px; margin: 0 0 20px 0; line-height: 1.6;">
                Bonjour <strong style="color: #1F2937;">{{name}}</strong>,
              </p>
              
              <p style="color: #4B5563; font-size: 16px; margin: 0 0 30px 0; line-height: 1.6;">
                Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés. Notre équipe va examiner votre demande et vous répondra dans les plus brefs délais.
              </p>

              <!-- Récapitulatif -->
              <div style="background-color: #F9FAFB; border-left: 4px solid #7C3AED; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #1F2937; font-size: 18px; font-weight: bold; margin: 0 0 20px 0; display: flex; align-items: center;">
                  <span style="margin-right: 10px; font-size: 24px;">📋</span>
                  Récapitulatif de votre message
                </h3>
                
                <div style="margin-bottom: 15px;">
                  <div style="color: #6B7280; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">SUJET</div>
                  <div style="color: #1F2937; font-size: 16px; font-weight: 500;">{{subject}}</div>
                </div>
                
                <div>
                  <div style="color: #6B7280; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">MESSAGE</div>
                  <div style="color: #4B5563; font-size: 15px; line-height: 1.6; white-space: pre-wrap; background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #E5E7EB;">{{message}}</div>
                </div>
              </div>

              <!-- Information -->
              <div style="border: 2px solid #A7F3D0; border-radius: 12px; padding: 20px; background-color: #F0FDF4; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 24px; margin-right: 10px;">ℹ️</span>
                  <h3 style="color: #065F46; font-size: 16px; font-weight: bold; margin: 0;">À propos de notre réponse</h3>
                </div>
                <p style="color: #047857; font-size: 14px; margin: 0; line-height: 1.6;">
                  Nous nous engageons à répondre à tous les messages dans un délai de 24 à 48 heures. Si votre demande est urgente, n''hésitez pas à nous appeler directement.
                </p>
              </div>

              <!-- Bouton d''action -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background: linear-gradient(135deg, #7C3AED 0%, #FF6B35 100%); border-radius: 8px; padding: 0;">
                          <a href="https://tagit.ma" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">Visiter notre site</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0;">
                <strong style="color: #7C3AED;">TagIT</strong> - Marketing Digital & Branding
              </p>
              <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                Ceci est un email automatique, merci de ne pas y répondre directement.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  ',
  body_text = 'Confirmation de réception - TagIT

Bonjour {{name}},

Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés. Notre équipe va examiner votre demande et vous répondra dans les plus brefs délais.

Récapitulatif de votre message:
Sujet: {{subject}}
Message: {{message}}

Nous nous engageons à répondre à tous les messages dans un délai de 24 à 48 heures. Si votre demande est urgente, n''hésitez pas à nous contacter directement.

Cordialement,
L''équipe TagIT
  ',
  updated_at = now()
WHERE template_type = 'auto_response';

