// ============================================================
// GOOGLE APPS SCRIPT – Double Opt-In pro Srovname.cz B2B
// ============================================================

const CONFIG = {
  SHEET_ID: "150bg9x8msPuQJMCCBCG91FBM6KSUFrniQQP2AF2w_L8",
  SHEET_NAME: "Registrace",
  SITE_URL: "https://srovname-b2b-landing.vercel.app",
  FROM_NAME: "Srovname.cz B2B",
  NOTIFY_EMAIL: "lucie.thiemlova@srovname.cz",
};

// ============================================================
// doPost – zpracuje odeslaný formulář
// ============================================================
function doPost(e) {
  try {
    const params = e.parameter;
    
    // 1. Server-side Honeypot Check
    if (params.website_url) {
      Logger.log("BOT DETECTED: Honeypot field filled.");
      return jsonResponse({ success: false, error: "Spam detected" });
    }

    const agency = sanitizeInput(params.agency || "");
    const ico = sanitizeInput(params.ico || "");
    const email = sanitizeInput(params.email || "").toLowerCase();
    const phone = sanitizeInput(params.phone || "");
    const name = sanitizeInput(params.name || "");

    Logger.log("doPost zavolán. Email: " + email + ", Agency: " + agency);

    // 2. Server-side Basic Validation
    if (!email || !email.includes("@")) {
      return jsonResponse({ success: false, error: "Neplatný e-mail" });
    }
    if (!/^\d{8}$/.test(ico.replace(/\s/g, ""))) {
      return jsonResponse({ success: false, error: "Neplatné IČO" });
    }

    const token = generateToken();
    const timestamp = new Date().toISOString();

    // Ulož token do PropertiesService (spolehlivé vestavěné úložiště)
    const props = PropertiesService.getScriptProperties();
    props.setProperty('token_' + token, JSON.stringify({
      email, name, agency, ico, phone, timestamp, confirmed: false
    }));
    Logger.log("Token uložen: " + token);

    // Odkaz vede přes GAS doGet, který token ověří
    const GAS_EXEC_URL = ScriptApp.getService().getUrl();
    const confirmUrl = `${GAS_EXEC_URL}?token=${token}&email=${encodeURIComponent(email)}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="cs">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://srovname-b2b-landing.vercel.app/images/logo-srovname-new.png" alt="Srovname.cz" style="height: 40px;">
        </div>
        <h2 style="color: #FF6723;">Potvrďte vaši registraci</h2>
        <p>Dobrý den, <strong>${name}</strong>,</p>
        <p>obdrželi jsme vaši žádost o B2B partnerství se Srovname.cz. Pro dokončení registrace prosím potvrďte váš e-mail kliknutím na tlačítko níže.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${confirmUrl}"
             style="background-color: #FF6723; color: white; padding: 16px 40px; text-decoration: none;
                    border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            ✅ Potvrdit registraci
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">Pokud se tlačítko neotevře, zkopírujte tento odkaz do prohlížeče:</p>
        <p style="font-size: 13px; word-break: break-all; color: #FF6723;">${confirmUrl}</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">
          Pokud jste tuto registraci nepožadovali, tento email ignorujte.<br>
          © 2026 Srovname.cz – Všechna práva vyhrazena.
        </p>
      </body>
      </html>
    `;

    Logger.log("Odesílám email na: " + email);
    MailApp.sendEmail({
      to: email,
      subject: "Potvrďte vaši registraci – Srovname.cz B2B",
      htmlBody: emailHtml,
      name: CONFIG.FROM_NAME,
    });
    Logger.log("Email odeslán ✅");

    if (CONFIG.NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: CONFIG.NOTIFY_EMAIL,
        subject: `Nová B2B registrace (čeká na potvrzení): ${agency}`,
        body: `Nová registrace:\nJméno: ${name}\nAgency: ${agency}\nIČO: ${ico}\nEmail: ${email}\nTelefon: ${phone}`,
      });
    }

    // Ulož do Google Sheets (reporting)
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
      if (!sheet) sheet = ss.getSheets()[0];
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Datum odeslání", "Stav", "Jméno", "Agency", "IČO", "E-mail", "Telefon", "Token", "Datum potvrzení"]);
      }
      sheet.appendRow([timestamp, "ČEKÁ NA POTVRZENÍ", name, agency, ico, email, phone, token, ""]);
      Logger.log("Uloženo do sheetu ✅");
    } catch (sheetErr) {
      Logger.log("Sheet chyba (token je bezpečně v PropertiesService): " + sheetErr.toString());
    }

    return jsonResponse({ success: true });

  } catch (err) {
    Logger.log("Kritická chyba: " + err.toString());
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// ============================================================
// doGet – ověří token a potvrdí registraci
// ============================================================
function doGet(e) {
  const token = e.parameter.token;
  const SITE = CONFIG.SITE_URL;

  if (!token) {
    return HtmlService.createHtmlOutput(redirect(`${SITE}/potvrdit.html?status=error`));
  }

  try {
    const props = PropertiesService.getScriptProperties();
    const tokenKey = 'token_' + token;
    const stored = props.getProperty(tokenKey);

    Logger.log("doGet token: " + token + ", nalezen: " + (stored ? "ANO" : "NE"));

    if (!stored) {
      return HtmlService.createHtmlOutput(redirect(`${SITE}/potvrdit.html?status=error`));
    }

    const data = JSON.parse(stored);

    if (data.confirmed) {
      return HtmlService.createHtmlOutput(
        redirect(`${SITE}/potvrdit.html?status=ok&email=${encodeURIComponent(data.email)}`)
      );
    }

    // Označ jako potvrzeno
    data.confirmed = true;
    data.confirmedAt = new Date().toISOString();
    props.setProperty(tokenKey, JSON.stringify(data));
    Logger.log("Potvrzeno ✅ pro: " + data.email);

    if (CONFIG.NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: CONFIG.NOTIFY_EMAIL,
        subject: `✅ Registrace POTVRZENA: ${data.agency}`,
        body: `Registrace potvrzena:\nJméno: ${data.name}\nAgency: ${data.agency}\nIČO: ${data.ico}\nEmail: ${data.email}`,
      });
    }

    // Aktualizuj Sheet
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      const sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getSheets()[0];
      const sheetData = sheet.getDataRange().getValues();
      for (let i = 1; i < sheetData.length; i++) {
        if (sheetData[i][7] === token) {
          sheet.getRange(i + 1, 2).setValue("POTVRZENO");
          sheet.getRange(i + 1, 9).setValue(data.confirmedAt);
          break;
        }
      }
    } catch (sheetErr) {
      Logger.log("Sheet update chyba (nevadí): " + sheetErr.toString());
    }

    return HtmlService.createHtmlOutput(
      redirect(`${SITE}/potvrdit.html?status=ok&email=${encodeURIComponent(data.email)}`)
    );

  } catch (err) {
    Logger.log("doGet chyba: " + err.toString());
    return HtmlService.createHtmlOutput(redirect(`${SITE}/potvrdit.html?status=error`));
  }
}

// ============================================================
// Pomocné funkce
// ============================================================
function generateToken() {
  return Utilities.getUuid().replace(/-/g, "");
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return "";
  return input
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .trim();
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function redirect(url) {
  return `<meta http-equiv="refresh" content="0;url=${url}"><script>window.location.href="${url}";<\/script>`;
}

// TEST – spusťte ručně z editoru
function testEmail() {
  MailApp.sendEmail({
    to: CONFIG.NOTIFY_EMAIL,
    subject: "TEST – Srovname.cz GAS funguje ✅",
    body: "Google Apps Script funguje správně.",
  });
  Logger.log("✅ Test odeslán na: " + CONFIG.NOTIFY_EMAIL);
}
