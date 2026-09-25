import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: ดึงข้อมูลบิลแจ้งหนี้ทั้งหมด
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      // ดึงประวัติลูกค้า และประวัติการจ่ายเงินย่อยๆ ของบิลนี้มาแสดงด้วย
      include: {
        customer: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลบิลล้มเหลว" }, { status: 500 });
  }
}

// 2. POST: สร้างบิลแจ้งหนี้ใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, amount, dueDate, notes } = body;

    if (!customerId || amount === undefined) {
      return NextResponse.json(
        { error: "ต้องระบุ ID ลูกค้า และ ยอดเงิน (amount)" },
        { status: 400 },
      );
    }

    const newInvoice = await prisma.invoice.create({
      data: {
        customerId,
        amount,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
      },
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "สร้างบิลล้มเหลว" }, { status: 500 });
  }
}
