"use client";

import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { ChildMonthlyReportPayload } from "./api";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#1e293b",
  },
  title: { fontSize: 20, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 12, color: "#64748b", marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#0f172a",
  },
  row: { flexDirection: "row", gap: 12, marginBottom: 8 },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 10,
  },
  statLabel: { fontSize: 9, color: "#64748b", marginBottom: 4 },
  statValue: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  line: { marginBottom: 4 },
  encourage: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    lineHeight: 1.5,
  },
  footer: { position: "absolute", bottom: 28, left: 40, right: 40, fontSize: 9, color: "#94a3b8" },
});

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function ReportDocument({ data }: { data: ChildMonthlyReportPayload }) {
  const report = data.report!;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Monthly progress report</Text>
        <Text style={styles.subtitle}>
          {data.child.name} · {data.monthLabel}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.row}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Sessions</Text>
              <Text style={styles.statValue}>{report.totalSessions}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total time</Text>
              <Text style={styles.statValue}>{formatDuration(report.totalTimeSecs)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Most improved</Text>
              <Text style={styles.statValue}>{report.mostImprovedArea ?? "—"}</Text>
            </View>
          </View>
          <Text style={styles.line}>
            vs prior month: sessions {report.previousMonth.sessionsDelta >= 0 ? "+" : ""}
            {report.previousMonth.sessionsDelta}, time{" "}
            {report.previousMonth.timeDeltaSecs >= 0 ? "+" : ""}
            {formatDuration(Math.abs(report.previousMonth.timeDeltaSecs))}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skill area breakdown</Text>
          {report.skillBreakdown.length === 0 ? (
            <Text style={styles.line}>No skill-tagged play this month.</Text>
          ) : (
            report.skillBreakdown.map((s) => (
              <Text key={s.skill} style={styles.line}>
                {s.skill}: {s.percent}% ({formatDuration(s.seconds)})
              </Text>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top games</Text>
          {report.topGames.length === 0 ? (
            <Text style={styles.line}>No games played this month.</Text>
          ) : (
            report.topGames.map((g, i) => (
              <Text key={g.id} style={styles.line}>
                {i + 1}. {g.title} — {g.plays} play{g.plays === 1 ? "" : "s"}
              </Text>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Encouragement</Text>
          <Text style={styles.encourage}>{report.encouragement}</Text>
        </View>

        <Text style={styles.footer}>Handwith Content Library · Premium progress report</Text>
      </Page>
    </Document>
  );
}

export async function downloadMonthlyReportPdf(data: ChildMonthlyReportPayload) {
  if (!data.report) throw new Error("Report data is not available");
  const blob = await pdf(<ReportDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.child.name.replace(/\s+/g, "-").toLowerCase()}-report-${data.month}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
