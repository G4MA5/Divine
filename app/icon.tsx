import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon dérivé du logo [div_dev_Now] : un « d » doré sur encre. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#15120f", color: "#cda75c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, fontStyle: "italic", fontWeight: 700 }}>
        d
      </div>
    ),
    size,
  );
}
