const core = require('@actions/core');
const nodemailer = require('nodemailer');

async function run() {
    try {
        const recipient = core.getInput('recipient');
        const linterResult = core.getInput('linter_result');
        const cypressResult = core.getInput('cypress_result');
        const badgeResult = core.getInput('badge_result');
        const deployResult = core.getInput('deploy_result');

        core.info(`Configurant transport amb host: ${process.env.SMTP_HOST}`);
        core.info(`Port: ${process.env.SMTP_PORT}`);
        core.info(`User: ${process.env.SMTP_USER}`);

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verificar la connexió
        await transporter.verify();
        core.info('Connexió SMTP verificada correctament');

        const repoName = process.env.GITHUB_REPOSITORY;
        const workflowName = process.env.GITHUB_WORKFLOW;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: recipient,
            subject: 'Resultat del workflow executat',
            html: `
        <h2>Notificació de GitHub Actions</h2>
        <p>Aci ficariem el que vuiguerem pero com son persones en cultura ho ficarem aixina: S'ha realitzat un push en la branca main que ha provocat l'execució del workflow <strong>${workflowName}</strong> amb els següents resultats:</p>
        <ul>
          <li><strong>linter_job:</strong> ${linterResult}</li>
          <li><strong>cypress_job:</strong> ${cypressResult}</li>
          <li><strong>add_badge_job:</strong> ${badgeResult}</li>
          <li><strong>deploy_job:</strong> ${deployResult}</li>
        </ul>
        <p>Repositori: ${repoName}</p>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        core.info(`Email enviat correctament: ${info.messageId}`);

    } catch (error) {
        core.setFailed(`Error enviant l'email: ${error.message}`);
    }
}

run();