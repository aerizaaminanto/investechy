import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateProjectReportPDF(data) {
    let browser = null;
    try {
        console.log("Starting PDF generation with Puppeteer...");
        // 1. Resolve template path
        const templatePath = path.join(__dirname, '..', 'templates', 'reportTemplate.ejs');
        
        // 2. Render EJS to HTML string
        const htmlContent = await ejs.renderFile(templatePath, data);

        // 3. Launch Puppeteer
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        
        const page = await browser.newPage();
        
        // 4. Set HTML content
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // 5. Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, 
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });

        console.log("PDF generation successful.");
        return pdfBuffer;

    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
