const { chromium, firefox, webkit } = require("playwright");

const CENTRE_URL =
  "https://www.doctolib.fr/vaccination-covid-19/paris/centre-de-vaccination-covid-19-ville-de-paris?highlight%5Bspeciality_ids%5D%5B%5D=5494&pid=practice-176642";

const BROWSER = firefox;

const firstInjectionPfizerBioNTech =
  "1re injection vaccin COVID-19 (Pfizer-BioNTech)";

const secondInjectionPfizerBioNTech =
  "2de injection vaccin COVID-19 (Pfizer-BioNTech)";

const thirdInjectionPfizerBioNTech =
  "3e injection vaccin COVID-19 (Pfizer-BioNTech)	";

const VACCIN = firstInjectionPfizerBioNTech;

async function main() {
  const browser = await BROWSER.launch({
    headless: false,
    slowMo: 100,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(CENTRE_URL);
  checkBooking(page);
}

/**
 *
 * @param {playwright.Page} page
 */
async function checkBooking(page) {
  await page.waitForSelector("div #booking_motive");
  await page.click("div #booking_motive");

  // We select the option we want
  await page.selectOption("select#booking_motive", {
    label: VACCIN,
  });

  // We deselect the select
  await page.waitForSelector("div #booking_motive");
  await page.click("div #booking_motive");

  try {
    // We see if we have the error message (we wait 3 seconds)
    await page.waitForSelector("text=Aucun rendez-vous n'est disponible", {
      timeout: 3000,
    });
    console.log("Aucun rendez-vous n'est disponible");
    // We wait 2 minutes to not impact dotolib
    await wait(120_000);
    // We start again!
    await page.reload();
    return checkBooking(page);
  } catch (e) {
    // We did not get the error message, there is surely an appointment available
    console.log("Je pense avoir trouvé une dose");
    // If the meeting is not viable, you will have to restart the script
  }
}

function wait(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

main();
