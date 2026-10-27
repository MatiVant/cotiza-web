import { NextResponse } from "next/server";
import { createQuote, listQuotes } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() { return NextResponse.json({ quotes: listQuotes() }); }

export async function POST(request: Request) {
  const body = await request.json();
  const required = ["client", "phone", "description", "amount", "due"];
  if (required.some((field) => !body[field])) return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  const quote = createQuote({ client: String(body.client), phone: String(body.phone), description: String(body.description), amount: Number(body.amount), due: String(body.due), notes: String(body.notes || ""), status: "pendiente", source: body.source === "eve" ? "eve" : "user" });
  return NextResponse.json({ quote }, { status: 201 });
}
