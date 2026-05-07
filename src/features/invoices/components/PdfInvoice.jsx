import React from "react";
import { Page, Text, View, Document, StyleSheet, Font } from "@react-pdf/renderer";
import { Image } from "@react-pdf/renderer";
// Global font for modern look
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf" }
  ]
});

const styles = StyleSheet.create({
  page: { fontFamily: "Roboto", fontSize: 11, padding: 30, lineHeight: 1.4, backgroundColor: "#fafbfc", color: "#191919" },
  section: { marginBottom: 10, padding: 10 },
  header: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  tableHeader: { fontSize: 12, fontWeight: "bold", backgroundColor: "#eef2ff", borderBottom: "1px solid #d4d4d8" },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #eee", minHeight: 20 },
  cell: { flexGrow: 1, minWidth: 50, padding: 2 },
  // Add more styles as needed
});

export const PdfInvoice = ({ invoice, company }) => {
  const { serialNumber, date, customerName, products, taxBreakdown = {}, totalAmount = 0, address, gstin, ...rest } = invoice;
  const { cgst = 0, sgst = 0, igst = 0, totalTax = 0 } = taxBreakdown;
  // Example: get date as "12 Nov 2024"
  let displayDate = date ? new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" }) : "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={[styles.section, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
          <Text style={[styles.header, { color: "#2d3a77" }]}>
            {company?.name ?? "Invoice"}
          </Text>
          {/* You can add a company logo here if available */}
        </View>
        {/* Invoice Info */}
        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          <View style={{ flex: 2 }}>
            <Text>Invoice No: {serialNumber}</Text>
            <Text>Date: {displayDate}</Text>
            <Text>Customer: {customerName}</Text>
            {address && <Text>Address: {address}</Text>}
            {gstin && <Text>Customer GSTIN: {gstin}</Text>}
          </View>
          <View style={{ flex: 1 }}>
            {company?.gstin && <Text>Company GSTIN: {company.gstin}</Text>}
            {company?.address && <Text>Company Address: {company.address}</Text>}
            {company?.phone && <Text>Phone: {company.phone}</Text>}
          </View>
        </View>
        {/* Products Table */}
        <View style={{ marginBottom: 12 }}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cell, { minWidth: 140 }]}>Product</Text>
            <Text style={styles.cell}>Qty</Text>
            <Text style={styles.cell}>Unit Price</Text>
            <Text style={styles.cell}>Tax %</Text>
            <Text style={styles.cell}>Price With Tax</Text>
          </View>
          {products?.map((p, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.cell, { minWidth: 140 }]}>{p.productName || p.name}</Text>
              <Text style={styles.cell}>{p.quantity}</Text>
              <Text style={styles.cell}>₹{p.unitPrice?.toFixed(2) ?? "0.00"}</Text>
              <Text style={styles.cell}>{p.tax || 0}%</Text>
              <Text style={styles.cell}>₹{p.priceWithTax?.toFixed(2) ?? "0.00"}</Text>
            </View>
          ))}
        </View>
        {/* Tax Breakdown */}
        <Text style={styles.header}>Tax Breakdown</Text>
        {igst > 0 ? (
          <Text>IGST: ₹{igst.toFixed(2)}</Text>
        ) : (
          <>
            <Text>CGST: ₹{cgst.toFixed(2)} &nbsp; SGST: ₹{sgst.toFixed(2)}</Text>
          </>
        )}
        <Text style={{ marginTop: 4, color: "#b91c1c", fontWeight: "bold" }}>Total Tax: ₹{totalTax.toFixed(2)}</Text>
        <Text style={{ fontWeight: "bold", marginTop: 8, fontSize: 13 }}>Grand Total: ₹{totalAmount.toFixed(2)}</Text>
        {/* Optional Terms */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 2 }}>Terms & Conditions:</Text>
          <Text>1. Goods once sold will not be taken back.</Text>
          <Text>2. Payment due within 15 days from the date of invoice.</Text>
        </View>
        {/* UPI QR Code Section */}
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
            Scan to Pay via UPI
          </Text>
          {/* Note: For actual QR in PDF, you'll need to generate it as image first */}
          <Text style={{ fontSize: 10, color: '#666' }}>
            UPI ID: {company?.upiId || 'merchant@paytm'}
          </Text>
          <Text style={{ fontSize: 10, color: '#666' }}>
            Scan QR code with any UPI app to pay instantly
          </Text>
        </View>
      </Page>
    </Document>
  );
};
