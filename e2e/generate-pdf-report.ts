import { chromium } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function generatePDFReport() {
  console.log('Starting PDF report generation...')

  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Load the HTML file
  const htmlPath = path.join(__dirname, 'test-summary-report.html')
  console.log(`Loading HTML from: ${htmlPath}`)

  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle'
  })

  // Wait for fonts to load
  await page.waitForTimeout(2000)

  // Generate PDF
  const pdfPath = path.join(__dirname, 'waxfeed-test-summary.pdf')
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '12mm',
      right: '12mm'
    },
    displayHeaderFooter: false
  })

  console.log(`PDF report generated: ${pdfPath}`)

  await browser.close()
  console.log('Done!')
}

generatePDFReport().catch(error => {
  console.error('Error generating PDF:', error)
  process.exit(1)
})
