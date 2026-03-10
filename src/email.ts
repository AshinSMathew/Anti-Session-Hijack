import * as nodemailer from 'nodemailer';

export async function email(
  service: string,
  sender_mail: string,
  sender_app_password: string,
  receiver_mail: string
): Promise<void> {
  const transporter = nodemailer.createTransport({
    service,
    auth: {
      user: sender_mail,
      pass: sender_app_password
    }
  });

  const mailOptions = {
    from: sender_mail,
    to: receiver_mail,
    subject: 'Immediate Action Required: Session Compromise Detected',
    text:
`Hello,

Unauthorized access to your account through a compromised session has been detected.

The affected session has to be terminated to prevent further access.

REQUIRED ACTIONS:
- Log out from all devices immediately
- Change your account password immediately
- Log in again from a trusted device
- Review recent account activity

Failure to act quickly may put your data at risk.

If you do not recognize this activity, your credentials may be compromised.
Please take the necessary steps to secure your account immediately.`
  };

  await transporter.sendMail(mailOptions);
}
