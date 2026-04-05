import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    action: "upload-excel",
    status: "not-implemented",
    message: "Excel upload handling belongs here once workbook parsing is wired in."
  });
}
