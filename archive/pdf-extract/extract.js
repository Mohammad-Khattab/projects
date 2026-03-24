const fs = require('fs');
const PDFParser = require("pdf2json");

const files = [
    'C:\\Users\\m7md5\\Downloads\\Test Bank - quiz1 (ch23 and ch24)-.pdf',
    'C:\\Users\\m7md5\\Downloads\\Summary and notes Ch. 24.pdf',
    'C:\\Users\\m7md5\\Downloads\\Chapter 23.pdf',
    'C:\\Users\\m7md5\\Downloads\\Ch. 23- Electric Fields.pdf'
];

async function extract() {
    for (let i=0; i<files.length; i++) {
        await new Promise((resolve, reject) => {
            let pdfParser = new PDFParser(this, 1);
            pdfParser.on("pdfParser_dataError", errData => { console.error('Error', errData); resolve(); });
            pdfParser.on("pdfParser_dataReady", pdfData => {
                fs.writeFileSync('C:\\Claude Code Test 1\\pdf-extract\\output_' + i + '.txt', pdfParser.getRawTextContent());
                console.log('Extracted ' + files[i]);
                resolve();
            });
            pdfParser.loadPDF(files[i]);
        });
    }
}
extract();
