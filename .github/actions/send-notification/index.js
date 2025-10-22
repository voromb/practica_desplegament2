const core = require('@actions/core');
const nodemailer = require('nodemailer');

async function run() {
    try {
        const recipient = core.getInput('recipient');
        const linterResult = core.getInput('linter_result');
        const cypressResult = core.getInput('cypress_result');
        const badgeResult = core.getInput('badge_result');
        const deployResult = core.getInput('deploy_result');

        core.info('=== Configuració SMTP ===');
        core.info(`Host: ${process.env.SMTP_HOST}`);
        core.info(`Port: ${process.env.SMTP_PORT}`);
        core.info(`User: ${process.env.SMTP_USER}`);
        core.info(`Pass length: ${process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0}`);

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error('SMTP_USER or SMTP_PASS is missing');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        core.info('Verificant connexió...');
        await transporter.verify();
        core.info('✓ Connexió verificada!');

        const repoName = process.env.GITHUB_REPOSITORY;
        const workflowName = process.env.GITHUB_WORKFLOW;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: recipient,
            subject: 'Resultat del workflow executat',
            html: `
        <h2>Notificació de GitHub Actions</h2>
        <p>S'ha realitzat un push en la branca main que ha provocat l'execució del workflow <strong>${workflowName}</strong> amb els següents resultats:</p>
        <ul>
          <li><strong>linter_job:</strong> ${linterResult}</li>
          <li><strong>cypress_job:</strong> ${cypressResult}</li>
          <li><strong>add_badge_job:</strong> ${badgeResult}</li>
          <li><strong>deploy_job:</strong> ${deployResult}</li>
        </ul>
        <p>Repositori: ${repoName}</p>
      `,
        };

        core.info('Enviant email...');
        const info = await transporter.sendMail(mailOptions);
        core.info(`✓ Email enviat correctament! ID: ${info.messageId}`);

    } catch (error) {
        core.error(`Error detallat: ${error.stack}`);
        core.setFailed(`Error enviant l'email: ${error.message}`);
    }
}

run();