// ============================================================
// GOOGLE APPS SCRIPT – Double Opt-In pro Srovname.cz B2B
// ============================================================
// NASTAVENÍ: Vyplňte níže vaše hodnoty
// ============================================================

const CONFIG = {
  // ID vaší Google tabulky – najdete ho v URL tabulky:
  // https://docs.google.com/spreadsheets/d/TOTO_JE_ID/edit
  SHEET_ID: "150bg9x8msPuQJMCCBCG91FBM6KSUFrniQQP2AF2w_L8",

  // Název listu v tabulce (výchozí je "List1", nebo si ho přejmenujte)
  SHEET_NAME: "Registrace",

  // URL vaší live stránky (bez lomítka na konci)
  SITE_URL: "https://srovname-b2b-landing.vercel.app",

  // E-mail, ze kterého se odešle potvrzení (musí být váš Google účet)
  FROM_NAME: "Srovname.cz B2B",

  // Interní notifikace – kdo dostane email o každé nové registraci
  NOTIFY_EMAIL: "lucie.thiemlova@srovname.cz",
};

// ============================================================
// doPost – zpracuje odeslaný formulář
// ============================================================
function doPost(e) {
  try {
    const params = e.parameter;
    const agency = params.agency || "";
    const ico = params.ico || "";
    const email = params.email || "";
    const phone = params.phone || "";
    const name = params.name || "";

    Logger.log("doPost zavolán. Email: " + email + ", Agency: " + agency);

    if (!email) {
      Logger.log("Chybí email – konec");
      return jsonResponse({ success: false, error: "Chybí e-mail" });
    }

    // Vygeneruj unikátní token
    const token = generateToken();
    const timestamp = new Date().toISOString();

    // NEJDŘÍV pošli email – než se pokusíme ukládat do sheetu
    const confirmUrl = `${CONFIG.SITE_URL}/potvrdit.html?token=${token}&email=${encodeURIComponent(email)}`;

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

    Logger.log("Odesílám potvrzovací email na: " + email);
    MailApp.sendEmail({
      to: email,
      subject: "Potvrďte vaši registraci – Srovname.cz B2B",
      htmlBody: emailHtml,
      name: CONFIG.FROM_NAME,
    });
    Logger.log("Potvrzovací email odeslán ✅");

    // Interní notifikace
    if (CONFIG.NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: CONFIG.NOTIFY_EMAIL,
        subject: `Nová B2B registrace (čeká na potvrzení): ${agency}`,
        body: `Nová registrace:\nJméno: ${name}\nAgency: ${agency}\nIČO: ${ico}\nEmail: ${email}\nTelefon: ${phone}\nStav: ČEKÁ NA POTVRZENÍ`,
      });
      Logger.log("Interní notifikace odeslána na: " + CONFIG.NOTIFY_EMAIL);
    }

    // Ulož do Google Sheets
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
      if (!sheet) {
        Logger.log("List '" + CONFIG.SHEET_NAME + "' nenalezen – používám první list");
        sheet = ss.getSheets()[0];
      }
      Logger.log("Ukládám do listu: " + sheet.getName());

      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          "Datum odeslání", "Stav", "Jméno", "Agency", "IČO", "E-mail", "Telefon", "Token", "Datum potvrzení"
        ]);
      }
      sheet.appendRow([
        timestamp, "ČEKÁ NA POTVRZENÍ", name, agency, ico, email, phone, token, ""
      ]);
      Logger.log("Uloženo do sheetu ✅");
    } catch (sheetErr) {
      Logger.log("Chyba při ukládání do sheetu: " + sheetErr.toString());
      // Email byl odeslán – pokračujeme i přes chybu sheetu
    }

    return jsonResponse({ success: true });

  } catch (err) {
    Logger.log("Kritická chyba: " + err.toString());
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// ============================================================
// doGet – potvrdí registraci ze token odkazu
// ============================================================
function doGet(e) {
  const token = e.parameter.token;
  const email = e.parameter.email || "";

  if (!token) {
    return HtmlService.createHtmlOutput(redirect(`${CONFIG.SITE_URL}/potvrdit.html?status=error`));
  }

  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    // Sloupce: [0]Datum, [1]Stav, [2]Jméno, [3]Agency, [4]IČO, [5]Email, [6]Telefon, [7]Token, [8]Datum potvrzení
    const TOKEN_COL = 7;
    const STATUS_COL = 1;
    const CONFIRMED_COL = 8;
    const EMAIL_COL = 5;

    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][TOKEN_COL] === token) {
        if (data[i][STATUS_COL] === "POTVRZENO") {
          // Už potvrzeno – jen přesměruj
          const confirmedEmail = data[i][EMAIL_COL];
          return HtmlService.createHtmlOutput(
            redirect(`${CONFIG.SITE_URL}/potvrdit.html?status=ok&email=${encodeURIComponent(confirmedEmail)}`)
          );
        }
        // Aktualizuj stav na POTVRZENO
        sheet.getRange(i + 1, STATUS_COL + 1).setValue("POTVRZENO");
        sheet.getRange(i + 1, CONFIRMED_COL + 1).setValue(new Date().toISOString());
        const confirmedEmail = data[i][EMAIL_COL];

        // Interní notifikace o potvrzení
        if (CONFIG.NOTIFY_EMAIL) {
          MailApp.sendEmail({
            to: CONFIG.NOTIFY_EMAIL,
            subject: `✅ Registrace POTVRZENA: ${data[i][3]}`,
            body: `Registrace byla potvrzena:\nJméno: ${data[i][2]}\nAgency: ${data[i][3]}\nIČO: ${data[i][4]}\nEmail: ${confirmedEmail}`,
          });
        }

        found = true;
        return HtmlService.createHtmlOutput(
          redirect(`${CONFIG.SITE_URL}/potvrdit.html?status=ok&email=${encodeURIComponent(confirmedEmail)}`)
        );
      }
    }

    if (!found) {
      return HtmlService.createHtmlOutput(redirect(`${CONFIG.SITE_URL}/potvrdit.html?status=error`));
    }

  } catch (err) {
    return HtmlService.createHtmlOutput(redirect(`${CONFIG.SITE_URL}/potvrdit.html?status=error`));
  }
}

// ============================================================
// Pomocné funkce
// ============================================================
function generateToken() {
  return Utilities.getUuid().replace(/-/g, "");
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function redirect(url) {
  return `<meta http-equiv="refresh" content="0;url=${url}"><script>window.location.href="${url}";<\/script>`;
}

// ============================================================
// TEST FUNKCE – spusťte ji ručně z Apps Script editoru
// Ověří, že email odesílání funguje
// ============================================================
function testEmail() {
  try {
    MailApp.sendEmail({
      to: CONFIG.NOTIFY_EMAIL,
      subject: "TEST – Srovname.cz GAS funguje ✅",
      body: "Pokud vidíte tento email, Google Apps Script funguje správně a může odesílat emaily.",
    });
    Logger.log("✅ Testovací email odeslán na: " + CONFIG.NOTIFY_EMAIL);
  } catch (e) {
    Logger.log("❌ Chyba: " + e.toString());
  }
}

