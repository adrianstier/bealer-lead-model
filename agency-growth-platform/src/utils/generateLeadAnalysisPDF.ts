/**
 * Lead Analysis PDF Report Generator
 * Creates a clean, professional PDF report from lead analysis data
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LeadAnalysisData {
  summary: {
    total_records: number;
    date_range: { start: string; end: string };
    overall_sale_rate: number;
    overall_contact_rate: number;
    overall_quote_rate: number;
    generated_at: string;
  };
  vendors: Array<{
    vendor: string;
    total_leads: number;
    sales: number;
    sale_rate: number;
    contact_rate: number;
    quote_rate: number;
    avg_call_duration: number;
  }>;
  agents: Array<{
    agent: string;
    total_calls: number;
    sales: number;
    sale_rate: number;
    contact_rate: number;
    quote_rate: number;
    total_talk_hours: number;
  }>;
  timing: {
    hourly: Array<{
      hour: number;
      total_calls: number;
      sale_rate: number;
      contact_rate: number;
    }>;
    daily: Array<{
      day: string;
      total_calls: number;
      sale_rate: number;
      contact_rate: number;
    }>;
  };
  funnel: {
    total_leads: number;
    contacted: number;
    contacted_rate: number;
    quoted: number;
    quoted_rate: number;
    sold: number;
    sold_rate: number;
  };
  recommendations: Array<{
    category: string;
    priority: string;
    action: string;
    reason: string;
  }>;
  diagnostics?: {
    roi_metrics?: {
      by_vendor: Array<{
        vendor: string;
        total_leads: number;
        total_spend: number;
        sales: number;
        cpl: number;
        cpb: number | null;
        roi_percent: number;
      }>;
    };
  };
}

export function generateLeadAnalysisPDF(data: LeadAnalysisData) {
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
    addNewPageIfNeeded(20);
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

  const formatNumber = (num: number) => num.toLocaleString();
  const formatPercent = (num: number) => `${num.toFixed(2)}%`;
  const formatCurrency = (num: number) => `$${num.toLocaleString()}`;

  // ============================================
  // TITLE PAGE
  // ============================================

  // Header bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Title
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Lead Performance Report', margin, 28);

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Bealer Insurance Agency', margin, 38);

  yPos = 60;

  // Report info box
  doc.setFillColor(249, 250, 251); // Gray-50
  doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 35, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Period:', margin + 8, yPos + 12);
  doc.text('Total Records:', margin + 8, yPos + 24);
  doc.text('Generated:', pageWidth / 2, yPos + 12);

  doc.setFont('helvetica', 'normal');
  doc.text(`${data.summary.date_range.start} to ${data.summary.date_range.end}`, margin + 45, yPos + 12);
  doc.text(formatNumber(data.summary.total_records), margin + 45, yPos + 24);
  doc.text(new Date(data.summary.generated_at).toLocaleDateString(), pageWidth / 2 + 35, yPos + 12);

  yPos += 50;

  // ============================================
  // EXECUTIVE SUMMARY
  // ============================================

  drawSectionTitle('Executive Summary');

  // Key metrics in a grid
  const metrics = [
    { label: 'Overall Sale Rate', value: formatPercent(data.summary.overall_sale_rate), color: secondaryColor },
    { label: 'Contact Rate', value: formatPercent(data.summary.overall_contact_rate), color: primaryColor },
    { label: 'Quote Rate', value: formatPercent(data.summary.overall_quote_rate), color: primaryColor },
    { label: 'Total Sales', value: formatNumber(data.funnel.sold), color: secondaryColor },
  ];

  const metricWidth = (pageWidth - (margin * 2) - 15) / 4;
  metrics.forEach((metric, i) => {
    const x = margin + (i * (metricWidth + 5));

    doc.setFillColor(249, 250, 251);
    doc.roundedRect(x, yPos, metricWidth, 30, 2, 2, 'F');

    doc.setFontSize(16);
    doc.setTextColor(...metric.color);
    doc.setFont('helvetica', 'bold');
    doc.text(metric.value, x + metricWidth / 2, yPos + 12, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.setFont('helvetica', 'normal');
    doc.text(metric.label, x + metricWidth / 2, yPos + 22, { align: 'center' });
  });

  yPos += 45;

  // ============================================
  // SALES FUNNEL
  // ============================================

  drawSectionTitle('Sales Funnel');

  const funnelData = [
    ['Stage', 'Count', 'Rate', 'Conversion'],
    ['Total Leads', formatNumber(data.funnel.total_leads), '100%', '-'],
    ['Contacted', formatNumber(data.funnel.contacted), formatPercent(data.funnel.contacted_rate), `${formatPercent(data.funnel.contacted_rate)} of leads`],
    ['Quoted', formatNumber(data.funnel.quoted), formatPercent(data.funnel.quoted_rate), `${formatPercent(data.funnel.quoted_rate)} of leads`],
    ['Sold', formatNumber(data.funnel.sold), formatPercent(data.funnel.sold_rate), `${formatPercent(data.funnel.sold_rate)} of leads`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [funnelData[0]],
    body: funnelData.slice(1),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 4,
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
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right', fontSize: 8, textColor: lightGray },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // VENDOR PERFORMANCE
  // ============================================

  addNewPageIfNeeded(80);
  drawSectionTitle('Vendor Performance');

  // Sort vendors by sale rate
  const sortedVendors = [...data.vendors].sort((a, b) => b.sale_rate - a.sale_rate);

  const vendorTableData = sortedVendors.map(v => [
    v.vendor.length > 25 ? v.vendor.substring(0, 22) + '...' : v.vendor,
    formatNumber(v.total_leads),
    formatNumber(v.sales),
    formatPercent(v.sale_rate),
    formatPercent(v.contact_rate),
    formatPercent(v.quote_rate),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Vendor', 'Leads', 'Sales', 'Sale %', 'Contact %', 'Quote %']],
    body: vendorTableData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
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
      0: { cellWidth: 50 },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // AGENT PERFORMANCE
  // ============================================

  addNewPageIfNeeded(80);
  drawSectionTitle('Agent Performance');

  // Filter out likely auto-dialers (very low call duration + high volume)
  const humanAgents = data.agents.filter(a =>
    !(a.total_calls > 10000 && a.sale_rate < 0.5)
  );

  // Sort by sale rate
  const sortedAgents = [...humanAgents].sort((a, b) => b.sale_rate - a.sale_rate);

  const agentTableData = sortedAgents.map(a => [
    a.agent,
    formatNumber(a.total_calls),
    formatNumber(a.sales),
    formatPercent(a.sale_rate),
    formatPercent(a.contact_rate),
    `${a.total_talk_hours.toFixed(1)}h`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Agent', 'Calls', 'Sales', 'Sale %', 'Contact %', 'Talk Time']],
    body: agentTableData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
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
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // TIMING ANALYSIS
  // ============================================

  addNewPageIfNeeded(100);
  drawSectionTitle('Best Call Times');

  // Best hours
  const bestHours = [...data.timing.hourly]
    .filter(h => h.total_calls >= 100)
    .sort((a, b) => b.sale_rate - a.sale_rate)
    .slice(0, 5);

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Performing Hours:', margin, yPos);
  yPos += 8;

  const hourTableData = bestHours.map(h => [
    `${h.hour}:00 - ${h.hour + 1}:00`,
    formatNumber(h.total_calls),
    formatPercent(h.sale_rate),
    formatPercent(h.contact_rate),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Time', 'Calls', 'Sale Rate', 'Contact Rate']],
    body: hourTableData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 3,
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
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'right', fontStyle: 'bold' },
      3: { halign: 'right' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;

  // Best days
  const bestDays = [...data.timing.daily].sort((a, b) => b.sale_rate - a.sale_rate);

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance by Day:', margin, yPos);
  yPos += 8;

  const dayTableData = bestDays.map(d => [
    d.day,
    formatNumber(d.total_calls),
    formatPercent(d.sale_rate),
    formatPercent(d.contact_rate),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Day', 'Calls', 'Sale Rate', 'Contact Rate']],
    body: dayTableData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 3,
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
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'right', fontStyle: 'bold' },
      3: { halign: 'right' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ============================================
  // ROI ANALYSIS (if available)
  // ============================================

  if (data.diagnostics?.roi_metrics?.by_vendor) {
    addNewPageIfNeeded(80);
    drawSectionTitle('ROI Analysis');

    const roiData = data.diagnostics.roi_metrics.by_vendor
      .filter(v => v.sales > 0)
      .sort((a, b) => b.roi_percent - a.roi_percent);

    const roiTableData = roiData.map(v => [
      v.vendor.length > 20 ? v.vendor.substring(0, 17) + '...' : v.vendor,
      formatNumber(v.total_leads),
      formatCurrency(v.total_spend),
      formatNumber(v.sales),
      v.cpb ? formatCurrency(v.cpb) : 'N/A',
      `${v.roi_percent > 0 ? '+' : ''}${v.roi_percent.toFixed(0)}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Vendor', 'Leads', 'Spend', 'Sales', 'Cost/Sale', 'ROI']],
      body: roiTableData,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
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
        0: { cellWidth: 40 },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold' },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // ============================================
  // RECOMMENDATIONS
  // ============================================

  addNewPageIfNeeded(60);
  drawSectionTitle('Key Recommendations');

  // Group by priority
  const highPriority = data.recommendations.filter(r => r.priority === 'high').slice(0, 4);
  const mediumPriority = data.recommendations.filter(r => r.priority === 'medium').slice(0, 3);

  const allRecs = [...highPriority, ...mediumPriority];

  allRecs.forEach((rec, i) => {
    addNewPageIfNeeded(25);

    // Priority badge
    const badgeColor = rec.priority === 'high' ? [239, 68, 68] : [245, 158, 11];
    doc.setFillColor(...(badgeColor as [number, number, number]));
    doc.roundedRect(margin, yPos, 35, 6, 1, 1, 'F');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(rec.priority.toUpperCase(), margin + 17.5, yPos + 4.5, { align: 'center' });

    // Category
    doc.setFontSize(7);
    doc.setTextColor(...lightGray);
    doc.setFont('helvetica', 'normal');
    doc.text(rec.category, margin + 40, yPos + 4.5);

    yPos += 10;

    // Action
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    const actionLines = doc.splitTextToSize(rec.action, pageWidth - (margin * 2));
    doc.text(actionLines, margin, yPos);
    yPos += actionLines.length * 4;

    // Reason
    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.setFont('helvetica', 'normal');
    const reasonLines = doc.splitTextToSize(rec.reason, pageWidth - (margin * 2));
    doc.text(reasonLines, margin, yPos);
    yPos += reasonLines.length * 3.5 + 8;
  });

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
    doc.text('Bealer Insurance Agency - Lead Performance Report', margin, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  // Save the PDF
  const fileName = `Lead_Analysis_${data.summary.date_range.start}_to_${data.summary.date_range.end}.pdf`;
  doc.save(fileName);

  return fileName;
}
