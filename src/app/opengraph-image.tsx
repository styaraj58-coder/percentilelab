import { ImageResponse } from "next/og";

export const alt = "Percentile Lab - MBA entrance exam mock tests";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "#14224b",
          color: "white",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#c9972e" }}>
          PERCENTILE LAB
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 76, fontWeight: 800, lineHeight: 1.1 }}>
          Practice like it&apos;s exam day.
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 76, fontWeight: 800, lineHeight: 1.1, color: "#e0b654" }}>
          Know your percentile.
        </div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 32, color: "rgba(255,255,255,0.78)" }}>
          Mock tests for CAT, MAH-CET, MAT, ATMA and UG BMS CET
        </div>
        <div style={{ display: "flex", marginTop: 14, width: 120, height: 8, borderRadius: 4, background: "#c9972e" }} />
      </div>
    ),
    size
  );
}
