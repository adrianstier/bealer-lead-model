/**
 * Data Documentation PDF Generator
 * Creates a clean, professional PDF documenting the data methodology and definitions
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DataOverview {
  columns: Record<string, {
    data_type: string;
    description: string;
    sample_values: (string | number | null)[];
    interpretation: string;
  }>;
  status_classification: Record<string, {
    example_statuses: string[];
    meaning: string;
    funnel_stage: string;
  }>;
  calculated_metrics: Array<{
    metric: string;
    formula: string;
    purpose: string;
  }>;
  data_notes: string[];
  methodology_summary: string;
}

interface LeadAnalysisData {
  summary: {
    total_records: number;
    date_range: { start: string; end: string };
    overall_sale_rate: number;
    overall_contact_rate: number;
    overall_quote_rate: number;
    generated_at: string;
  };
  data_overview?: DataOverview;
}

export function generateDataDocumentationPDF(data: LeadAnalysisData) {
  if (!data.data_overview) {
    alert('Data documentation not available');
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Colors
  const primaryColor = [79, 70, 229] as [number, number, number]; // Indigo
  const secondaryColor = [16, 185, 129] as [number, number, number]; // Emerald
  const textColor = [31, 41, 55] as [number, number, number]; // Gray-800
  const lightGray = [107, 114, 128] as [number, number, number]; // Gray-500
  const amberColor = [245, 158, 11] as [number, number, number]; // Amber

  // Helper functions
  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  const drawSectionTitle = (title: string) => {
    addNewPageIfNeeded(25);
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPos);
    yPos += 8;

    // Underline
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
    yPos += 6;
  };

  const drawSubsectionTitle = (title: string) => {
    addNewPageIfNeeded(15);
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPos);
    yPos += 6;
  };

  // ============================================
  // TITLE PAGE
  // ============================================

  // Header bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Title
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Data Documentation', margin, 25);

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Lead Analysis Methodology & Definitions', margin, 38);

  yPos = 60;

  // Report info box
  doc.setFillColor(249, 250, 251); // Gray-50
  doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 25, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Data Period:', margin + 8, yPos + 10);
  doc.text('Total Records:', margin + 8, yPos + 20);

  doc.setFont('helvetica', 'normal');
  doc.text(`${data.summary.date_range.start} to ${data.summary.date_range.end}`, margin + 45, yPos + 10);
  doc.text(data.summary.total_records.toLocaleString(), margin + 45, yPos + 20);

  yPos += 40;

  // ============================================
  // METHODOLOGY SUMMARY
  // ============================================

  drawSectionTitle('Methodology Overview');

  doc.setFontSize(9);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  const methodologyLines = doc.splitTextToSize(data.data_overview.methodology_summary, pageWidth - (margin * 2));
  doc.text(methodologyLines, margin, yPos);
  yPos += methodologyLines.length * 4 + 10;

  // ============================================
  // DATA NOTES
  // ============================================

  if (data.data_overview.data_notes.length > 0) {
    drawSectionTitle('Dataset Summary');

    data.data_overview.data_notes.forEach((note, i) => {
      addNewPageIfNeeded(15);

      // Bullet point
      doc.setFillColor(...primaryColor);
      doc.circle(margin + 2, yPos - 1, 1.5, 'F');

      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(note, pageWidth - (margin * 2) - 10);
      doc.text(noteLines, margin + 8, yPos);
      yPos += noteLines.length * 4 + 4;
    });

    yPos += 6;
  }

  // ============================================
  // RAW DATA COLUMNS
  // ============================================

  addNewPageIfNeeded(80);
  drawSectionTitle('Raw Data Columns');

  doc.setFontSize(8);
  doc.setTextColor(...lightGray);
  doc.setFont('helvetica', 'italic');
  doc.text('Each row in the source data represents one call to a potential customer', margin, yPos);
  yPos += 10;

  Object.entries(data.data_overview.columns).forEach(([columnName, info]) => {
    addNewPageIfNeeded(50);

    // Column name header with data type badge
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, yPos - 4, pageWidth - (margin * 2), 40, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(columnName, margin + 4, yPos + 2);

    // Data type badge
    doc.setFillColor(229, 231, 235);
    const badgeWidth = doc.getTextWidth(info.data_type) + 6;
    doc.roundedRect(pageWidth - margin - badgeWidth - 4, yPos - 3, badgeWidth, 8, 1, 1, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...lightGray);
    doc.setFont('helvetica', 'normal');
    doc.text(info.data_type, pageWidth - margin - badgeWidth / 2 - 1, yPos + 2, { align: 'center' });

    yPos += 8;

    // Description
    doc.setFontSize(8);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(info.description, pageWidth - (margin * 2) - 8);
    doc.text(descLines, margin + 4, yPos);
    yPos += descLines.length * 3.5 + 2;

    // Sample values
    doc.setFontSize(7);
    doc.setTextColor(...lightGray);
    doc.setFont('helvetica', 'bold');
    doc.text('Sample values:', margin + 4, yPos);
    doc.setFont('helvetica', 'normal');
    const sampleText = info.sample_values
      .slice(0, 4)
      .map(v => String(v).length > 30 ? String(v).substring(0, 27) + '...' : String(v))
      .join(', ');
    doc.text(sampleText, margin + 32, yPos);
    yPos += 5;

    // How we use it
    doc.setFontSize(7);
    doc.setTextColor(...amberColor);
    doc.setFont('helvetica', 'bold');
    doc.text('How we use it:', margin + 4, yPos);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    const interpLines = doc.splitTextToSize(info.interpretation, pageWidth - (margin * 2) - 38);
    doc.text(interpLines, margin + 35, yPos);
    yPos += interpLines.length * 3 + 10;
  });

  // ============================================
  // STATUS CLASSIFICATION
  // ============================================

  addNewPageIfNeeded(60);
  drawSectionTitle('Status Classification Logic');

  doc.setFontSize(8);
  doc.setTextColor(...lightGray);
  doc.setFont('helvetica', 'italic');
  doc.text('How raw "Current Status" values are interpreted and classified', margin, yPos);
  yPos += 8;

  const statusData = Object.entries(data.data_overview.status_classification).map(([category, info]) => [
    category,
    info.example_statuses.slice(0, 2).join(', '),
    info.meaning.length > 50 ? info.meaning.substring(0, 47) + '...' : info.meaning,
    info.funnel_stage,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Category', 'Example Values', 'Meaning', 'Funnel Stage']],
    body: statusData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35 },
      1: { cellWidth: 40 },
      2: { cellWidth: 55 },
      3: { cellWidth: 30 },
    },
    didParseCell: (data) => {
      // Color-code funnel stages
      if (data.column.index === 3 && data.section === 'body') {
        const stage = String(data.cell.raw);
        if (stage === 'Sale') {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = 'bold';
        } else if (stage === 'Hot') {
          data.cell.styles.textColor = [249, 115, 22];
        } else if (stage === 'Quoted') {
          data.cell.styles.textColor = [245, 158, 11];
        } else if (stage.includes('Lost')) {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // CALCULATED METRICS
  // ============================================

  addNewPageIfNeeded(60);
  drawSectionTitle('Calculated Metrics');

  doc.setFontSize(8);
  doc.setTextColor(...lightGray);
  doc.setFont('helvetica', 'italic');
  doc.text('How key performance indicators are derived from raw data', margin, yPos);
  yPos += 10;

  data.data_overview.calculated_metrics.forEach((metric, i) => {
    addNewPageIfNeeded(35);

    // Metric name
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, yPos - 4, pageWidth - (margin * 2), 30, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(metric.metric, margin + 4, yPos + 2);

    yPos += 8;

    // Formula
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin + 4, yPos - 2, pageWidth - (margin * 2) - 8, 10, 1, 1, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin + 4, yPos - 2, pageWidth - (margin * 2) - 8, 10, 1, 1, 'S');

    doc.setFontSize(8);
    doc.setTextColor(...textColor);
    doc.setFont('courier', 'normal');
    doc.text(metric.formula, margin + 8, yPos + 4);

    yPos += 12;

    // Purpose
    doc.setFontSize(7);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Purpose:', margin + 4, yPos);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    const purposeLines = doc.splitTextToSize(metric.purpose, pageWidth - (margin * 2) - 30);
    doc.text(purposeLines, margin + 26, yPos);
    yPos += purposeLines.length * 3 + 12;
  });

  // ============================================
  // QUICK REFERENCE SUMMARY
  // ============================================

  addNewPageIfNeeded(80);
  drawSectionTitle('Quick Reference');

  // Key metrics summary
  const summaryData = [
    ['Overall Sale Rate', `${data.summary.overall_sale_rate.toFixed(2)}%`, 'Percentage of all leads that resulted in a sale'],
    ['Contact Rate', `${data.summary.overall_contact_rate.toFixed(2)}%`, 'Percentage of leads where customer was reached'],
    ['Quote Rate', `${data.summary.overall_quote_rate.toFixed(2)}%`, 'Percentage of leads that received a quote'],
    ['Total Records', data.summary.total_records.toLocaleString(), 'Individual call records analyzed'],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value', 'Definition']],
    body: summaryData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: secondaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { halign: 'right', cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 90 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // FOOTER ON ALL PAGES
  // ============================================

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.setFont('helvetica', 'normal');
    doc.text('Bealer Insurance Agency - Data Documentation', margin, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  // Save the PDF
  const fileName = `Lead_Data_Documentation_${data.summary.date_range.start}_to_${data.summary.date_range.end}.pdf`;
  doc.save(fileName);

  return fileName;
}
