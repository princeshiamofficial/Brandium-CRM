import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { SalesPdfData } from "@/lib/sales-pdf";

// A4 in points; letterhead clearances match the on-screen sheet (38mm top, 30mm bottom, 16mm sides).
const MM = 2.8346;

const styles = StyleSheet.create({
  page: {
    paddingTop: 38 * MM,
    paddingBottom: 30 * MM,
    paddingHorizontal: 16 * MM,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1e293b",
  },
  // A4 is 595.28 × 841.89pt; "fill" stretches the letterhead to the page like the on-screen sheet
  letterhead: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 595.28,
    height: 841.89,
    objectFit: "fill",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingBottom: 10,
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#cbd5e1",
  },
  billTo: {
    flex: 1,
    padding: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 5,
  },
  label: { fontSize: 8, color: "#64748b", marginBottom: 3 },
  billName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#0f172a", marginBottom: 2 },
  billLine: { fontSize: 8.5, color: "#475569", marginTop: 1.5 },
  meta: { width: 190, alignItems: "flex-end" },
  metaCode: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#0a2e5c", marginBottom: 5 },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", gap: 4, marginTop: 2 },
  metaLabel: { color: "#64748b" },
  metaValue: { fontFamily: "Helvetica-Bold", color: "#334155" },
  barcode: { width: 150, height: 30, marginTop: 6 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 5,
    marginTop: 4,
  },
  table: { borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 4, marginBottom: 10 },
  thead: {
    flexDirection: "row",
    backgroundColor: "#0a2e5c",
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
  },
  tr: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: "#e2e8f0" },
  td: { paddingVertical: 5, paddingHorizontal: 6 },
  right: { textAlign: "right" },
  muted: { color: "#94a3b8" },
  gift: { color: "#6b7280", textDecoration: "line-through" },
  notes: {
    backgroundColor: "#fffbeb",
    borderWidth: 0.5,
    borderColor: "#fde68a",
    borderRadius: 4,
    padding: 7,
    color: "#92400e",
    marginBottom: 10,
    lineHeight: 1.4,
  },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", gap: 16, marginTop: 8 },
  terms: { width: "55%" },
  termItem: { flexDirection: "row", fontSize: 7.5, color: "#475569", marginTop: 1.5 },
  termIndex: { width: 12 },
  summary: {
    width: 200,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    borderRadius: 5,
  },
  sumRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 3 },
  sumStrong: { fontFamily: "Helvetica-Bold", color: "#0f172a" },
  sumMinus: { color: "#dc2626" },
  sumPaid: { color: "#16a34a" },
  due: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: "#cbd5e1",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0a2e5c",
  },
  stamp: { width: 80, height: 80, alignSelf: "flex-end", marginTop: 4 },
});

const COLS = { service: "46%", qty: "14%", unit: "20%", total: "20%" } as const;
const PAY_COLS = { date: "18%", amount: "17%", method: "17%", notes: "28%", by: "20%" } as const;

/** Shared A4 PDF for order invoices and quotations, rendered by `@react-pdf/renderer`. */
export function SalesPdfDocument({ data }: { data: SalesPdfData }) {
  return (
    <Document title={data.documentTitle} author="Brandium" creator="Brandium CRM">
      <Page size="A4" style={styles.page}>
        {data.letterheadUrl && <Image src={data.letterheadUrl} style={styles.letterhead} fixed />}

        <View style={styles.headerRow}>
          <View style={styles.billTo}>
            <Text style={styles.label}>Bill To:</Text>
            <Text style={styles.billName}>{data.billTo.name || "N/A"}</Text>
            {data.billTo.company ? (
              <Text style={styles.billLine}>{data.billTo.company}</Text>
            ) : null}
            {data.billTo.address ? (
              <Text style={styles.billLine}>{data.billTo.address}</Text>
            ) : null}
            {data.billTo.phone ? <Text style={styles.billLine}>{data.billTo.phone}</Text> : null}
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaCode}>
              {data.codeLabel} #{data.code}
            </Text>
            {data.dates.map((d) => (
              <View key={d.label} style={styles.metaRow}>
                <Text style={styles.metaLabel}>{d.label}</Text>
                <Text style={styles.metaValue}>{d.value}</Text>
              </View>
            ))}
            {data.barcodeDataUrl && <Image src={data.barcodeDataUrl} style={styles.barcode} />}
          </View>
        </View>

        <Text style={styles.sectionTitle}>{data.itemsTitle}</Text>
        <View style={styles.table}>
          <View style={styles.thead} fixed>
            <Text style={[styles.td, { width: COLS.service }]}>Service</Text>
            <Text style={[styles.td, styles.right, { width: COLS.qty }]}>Quantity</Text>
            <Text style={[styles.td, styles.right, { width: COLS.unit }]}>Unit Price</Text>
            <Text style={[styles.td, styles.right, { width: COLS.total }]}>Total Price</Text>
          </View>
          {data.items.length === 0 ? (
            <View style={styles.tr}>
              <Text style={[styles.td, styles.muted]}>No service items specified.</Text>
            </View>
          ) : (
            data.items.map((item, index) => (
              <View key={index} style={styles.tr} wrap={false}>
                <Text style={[styles.td, { width: COLS.service }]}>{item.name}</Text>
                <Text style={[styles.td, styles.right, { width: COLS.qty }]}>{item.quantity}</Text>
                <Text style={[styles.td, styles.right, { width: COLS.unit }]}>
                  {item.unitPrice}
                </Text>
                <Text
                  style={[
                    styles.td,
                    styles.right,
                    { width: COLS.total },
                    item.isGift ? styles.gift : {},
                  ]}
                >
                  {item.total}
                  {item.isGift ? " (Gift)" : ""}
                </Text>
              </View>
            ))
          )}
        </View>

        {data.notes ? (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>{data.notesTitle}</Text>
            <Text style={styles.notes}>{data.notes}</Text>
          </View>
        ) : null}

        {data.payments.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Payments History</Text>
            <View style={styles.table}>
              <View style={styles.thead}>
                <Text style={[styles.td, { width: PAY_COLS.date }]}>Date</Text>
                <Text style={[styles.td, styles.right, { width: PAY_COLS.amount }]}>Amount</Text>
                <Text style={[styles.td, { width: PAY_COLS.method }]}>Method</Text>
                <Text style={[styles.td, { width: PAY_COLS.notes }]}>Notes</Text>
                <Text style={[styles.td, { width: PAY_COLS.by }]}>Recorded By</Text>
              </View>
              {data.payments.map((p, index) => (
                <View key={index} style={styles.tr} wrap={false}>
                  <Text style={[styles.td, { width: PAY_COLS.date }]}>{p.date}</Text>
                  <Text
                    style={[styles.td, styles.right, styles.sumPaid, { width: PAY_COLS.amount }]}
                  >
                    {p.amount}
                  </Text>
                  <Text style={[styles.td, { width: PAY_COLS.method }]}>{p.method}</Text>
                  <Text style={[styles.td, { width: PAY_COLS.notes }]}>{p.notes}</Text>
                  <Text style={[styles.td, { width: PAY_COLS.by }]}>{p.recordedBy}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomRow} wrap={false}>
          <View style={styles.terms}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            {data.terms.map((term, index) => (
              <View key={index} style={styles.termItem}>
                <Text style={styles.termIndex}>{index + 1}.</Text>
                <Text style={{ flex: 1 }}>{term}</Text>
              </View>
            ))}
          </View>
          <View>
            <View style={styles.summary}>
              {data.totals.map((row) => (
                <View key={row.label} style={styles.sumRow}>
                  <Text style={row.tone === "strong" ? styles.sumStrong : styles.metaLabel}>
                    {row.label}
                  </Text>
                  <Text
                    style={
                      row.tone === "minus"
                        ? styles.sumMinus
                        : row.tone === "paid"
                          ? styles.sumPaid
                          : styles.sumStrong
                    }
                  >
                    {row.value}
                  </Text>
                </View>
              ))}
              {data.amountDue ? (
                <View style={styles.due}>
                  <Text>Amount Due:</Text>
                  <Text>{data.amountDue}</Text>
                </View>
              ) : null}
            </View>
            {data.paidStampUrl && <Image src={data.paidStampUrl} style={styles.stamp} />}
          </View>
        </View>
      </Page>
    </Document>
  );
}
