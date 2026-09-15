import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PageSize, PAGE_SIZES } from '../types';

/**
 * Ensures all web fonts and images inside an element are fully loaded before capturing.
 */
async function waitForAssets(element: HTMLElement): Promise<void> {
  // 1. Wait for document fonts
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font timeout
    }
  }

  // 2. Wait for all <img> tags to load and decode
  const images = Array.from(element.querySelectorAll('img'));
  if (images.length > 0) {
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          })
      )
    );
  }
}

/**
 * Renders a page element to high-resolution canvas completely free from preview zoom scaling.
 */
export async function renderPageToCanvas(pageElement: HTMLElement): Promise<HTMLCanvasElement> {
  await waitForAssets(pageElement);

  // Clone the page element into a dedicated isolated offscreen container
  const clone = pageElement.cloneNode(true) as HTMLElement;

  // Extract explicit natural dimensions
  const width = pageElement.offsetWidth || parseInt(pageElement.style.width, 10) || 794;
  const height = pageElement.offsetHeight || parseInt(pageElement.style.height, 10) || 1123;

  const offscreenContainer = document.createElement('div');
  offscreenContainer.style.position = 'fixed';
  offscreenContainer.style.left = '-99999px';
  offscreenContainer.style.top = '0';
  offscreenContainer.style.width = `${width}px`;
  offscreenContainer.style.height = `${height}px`;
  offscreenContainer.style.overflow = 'visible';
  offscreenContainer.style.zIndex = '-1000';
  offscreenContainer.style.backgroundColor = '#ffffff';

  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.position = 'relative';
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.minWidth = `${width}px`;
  clone.style.minHeight = `${height}px`;
  clone.style.boxShadow = 'none';

  offscreenContainer.appendChild(clone);
  document.body.appendChild(offscreenContainer);

  try {
    // Wait for clone assets as well
    await waitForAssets(clone);

    const canvas = await html2canvas(clone, {
      scale: 2, // 2x high resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,
      logging: false,
    });

    return canvas;
  } finally {
    document.body.removeChild(offscreenContainer);
  }
}

export async function exportPageToPNG(pageElement: HTMLElement, pageIndex: number, totalPages: number): Promise<void> {
  const canvas = await renderPageToCanvas(pageElement);
  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = totalPages > 1 ? `handwritten-doc-page-${pageIndex + 1}.png` : `handwritten-doc.png`;
  link.href = image;
  link.click();
}

export async function exportAllPagesToPNG(pageElements: HTMLElement[]): Promise<void> {
  for (let i = 0; i < pageElements.length; i++) {
    await exportPageToPNG(pageElements[i], i, pageElements.length);
    if (pageElements.length > 1) {
      await new Promise((res) => setTimeout(res, 350));
    }
  }
}

export async function exportAllPagesToPDF(
  pageElements: HTMLElement[],
  pageSize: PageSize
): Promise<void> {
  const dimensions = PAGE_SIZES[pageSize];

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

    const canvas = await renderPageToCanvas(pageElements[i]);
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
