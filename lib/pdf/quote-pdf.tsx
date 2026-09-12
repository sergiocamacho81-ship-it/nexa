import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Deliberately presentation-only: every value here is already formatted
// (currency, dates, translated labels) by the caller (the PDF route
// handler), the same way a page component receives pre-formatted values —
// no Intl/business logic lives in this file.
export type QuotePdfLineItem = {
  description: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
};

export type QuotePdfProps = {
  organizationName: string;
  quoteNumberLabel: string;
  statusLabel: string;
  dateLabel: string;
  validUntilLabel: string | null;
  billToName: string | null;
  billToAddressLines: string[];
  lineItems: QuotePdfLineItem[];
  labels: {
    billTo: string;
    description: string;
    quantity: string;
    unitPrice: string;
    lineTotal: string;
    subtotal: string;
    vat: string;
    total: string;
    notes: string;
  };
  subtotalLabel: string;
  vatLabel: string;
  totalLabel: string;
  notes: string | null;
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  orgName: { fontSize: 16, fontWeight: 700 },
  quoteNumber: { fontSize: 14, fontWeight: 700, textAlign: "right" },
  metaLine: { fontSize: 10, color: "#555", textAlign: "right", marginTop: 2 },
  billToBlock: { marginBottom: 24 },
  billToLabel: { fontSize: 9, color: "#888", textTransform: "uppercase", marginBottom: 4 },
  billToName: { fontSize: 11, fontWeight: 700 },
  billToLine: { fontSize: 10, color: "#333" },
  table: { marginTop: 8, borderTopWidth: 1, borderTopColor: "#ddd" },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 6,
  },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 6 },
  colDescription: { flex: 3 },
  colQuantity: { flex: 1, textAlign: "right" },
  colUnitPrice: { flex: 1, textAlign: "right" },
  colLineTotal: { flex: 1, textAlign: "right" },
  tableHeaderText: { fontSize: 9, color: "#888", textTransform: "uppercase" },
  totalsBlock: { marginTop: 16, alignItems: "flex-end" },
  totalsLine: { flexDirection: "row", gap: 24, marginTop: 2 },
  totalsLabel: { fontSize: 10, color: "#555" },
  totalsValue: { fontSize: 10, width: 80, textAlign: "right" },
  grandTotalLabel: { fontSize: 12, fontWeight: 700, color: "#1a1a1a" },
  grandTotalValue: { fontSize: 12, fontWeight: 700, width: 80, textAlign: "right" },
  notes: { marginTop: 24, fontSize: 9, color: "#555" },
});

export function QuotePdfDocument({
  organizationName,
  quoteNumberLabel,
  statusLabel,
  dateLabel,
  validUntilLabel,
  billToName,
  billToAddressLines,
  lineItems,
  labels,
  subtotalLabel,
  vatLabel,
  totalLabel,
  notes,
}: QuotePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.orgName}>{organizationName}</Text>
          <View>
            <Text style={styles.quoteNumber}>{quoteNumberLabel}</Text>
            <Text style={styles.metaLine}>{dateLabel}</Text>
            {validUntilLabel && <Text style={styles.metaLine}>{validUntilLabel}</Text>}
            <Text style={styles.metaLine}>{statusLabel}</Text>
          </View>
        </View>

        {billToName && (
          <View style={styles.billToBlock}>
            <Text style={styles.billToLabel}>{labels.billTo}</Text>
            <Text style={styles.billToName}>{billToName}</Text>
            {billToAddressLines.map((line, i) => (
              <Text key={i} style={styles.billToLine}>
                {line}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDescription, styles.tableHeaderText]}>{labels.description}</Text>
            <Text style={[styles.colQuantity, styles.tableHeaderText]}>{labels.quantity}</Text>
            <Text style={[styles.colUnitPrice, styles.tableHeaderText]}>{labels.unitPrice}</Text>
            <Text style={[styles.colLineTotal, styles.tableHeaderText]}>{labels.lineTotal}</Text>
          </View>
          {lineItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colUnitPrice}>{item.unitPrice}</Text>
              <Text style={styles.colLineTotal}>{item.lineTotal}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsLine}>
            <Text style={styles.totalsLabel}>{labels.subtotal}</Text>
            <Text style={styles.totalsValue}>{subtotalLabel}</Text>
          </View>
          <View style={styles.totalsLine}>
            <Text style={styles.totalsLabel}>{labels.vat}</Text>
            <Text style={styles.totalsValue}>{vatLabel}</Text>
          </View>
          <View style={styles.totalsLine}>
            <Text style={styles.grandTotalLabel}>{labels.total}</Text>
            <Text style={styles.grandTotalValue}>{totalLabel}</Text>
          </View>
        </View>

        {notes && (
          <View style={styles.notes}>
            <Text style={styles.billToLabel}>{labels.notes}</Text>
            <Text>{notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
