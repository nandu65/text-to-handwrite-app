import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PageSize, PAGE_SIZES } from '../types';

export async function exportPageToPNG(pageElement: HTMLElement, pageIndex: number, totalPages: number): Promise<void> {
  const canvas = await html2canvas(pageElement, {
    scale: 2, // 2x high resolution
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = totalPages > 1 ? `handwritten-doc-page-${pageIndex + 1}.png` : `handwritten-doc.png`;
  link.href = image;
  link.click();
}

export async function exportAllPagesToPNG(pageElements: HTMLElement[]): Promise<void> {
  for (let i = 0; i < pageElements.length; i++) {
    await exportPageToPNG(pageElements[i], i, pageElements.length);
    // Slight delay between multiple automatic downloads
    if (pageElements.length > 1) {
      await new Promise((res) => setTimeout(res, 300));
    }
  }
}

export async function exportAllPagesToPDF(
  pageElements: HTMLElement[],
  pageSize: PageSize
): Promise<void> {
  const dimensions = PAGE_SIZES[pageSize];
  
  // Format for jsPDF: 'a4', 'a5', 'letter' or custom [width, height] in mm
  let pdfFormat: string | [number, number] = 'a4';
  if (pageSize === 'A4') {
    pdfFormat = 'a4';
  } else if (pageSize === 'A5') {
    pdfFormat = 'a5';
  } else if (pageSize === 'Letter') {
    pdfFormat = 'letter';
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pdfFormat,
    compress: true,
  });

  for (let i = 0; i < pageElements.length; i++) {
    if (i > 0) {
      pdf.addPage(pdfFormat, 'portrait');
    }

    const canvas = await html2canvas(pageElements[i], {
      scale: 2, // 2x high resolution for crisp print quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(
      imgData,
      'JPEG',
      0,
      0,
      dimensions.widthMm,
      dimensions.heightMm,
      undefined,
      'FAST'
    );
  }

  pdf.save(`handwritten-doc-${pageSize.toLowerCase()}.pdf`);
}
