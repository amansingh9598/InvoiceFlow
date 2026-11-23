import puppeteer from 'puppeteer';
import invoiceHTML from './invoiceTemplate.js';

let browserPromise;
const getBrowser = () => {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  }
  return browserPromise;
};

export async function generateInvoicePDF(invoice, seller) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(invoiceHTML(invoice, seller), { waitUntil: 'load' });
    return await page.pdf({ format: 'A4', printBackground: true });
  } finally {
    await page.close();
  }
}
