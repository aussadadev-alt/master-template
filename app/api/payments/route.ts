import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: ดึงประวัติการรับชำระเงินทั้งหมด
export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: { invoice: true },
      orderBy: { paymentDate: "desc" },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json(
      { error: "ดึงประวัติรับเงินล้มเหลว" },
      { status: 500 },
    );
  }
}

// 2. POST: บันทึกการรับชำระเงิน (พร้อมระบบเช็คยอดและอัปเดตสถานะบิลอัตโนมัติ)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, amountPaid, paymentMethod, notes } = body;

    if (!invoiceId || !amountPaid || !paymentMethod) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน (invoiceId, amountPaid, paymentMethod)" },
        { status: 400 },
      );
    }

    // 1. บันทึกประวัติการรับเงิน
    const newPayment = await prisma.payment.create({
      data: { invoiceId, amountPaid, paymentMethod, notes },
    });

    // 2. ระบบเช็คยอดอัตโนมัติ: ดึงยอดจ่ายทั้งหมดของบิลนี้มารวมกัน
    const allPayments = await prisma.payment.findMany({ where: { invoiceId } });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amountPaid, 0);

    // 3. ถ้าจ่ายครบหรือเกินยอดบิล ให้เปลี่ยนสถานะบิลเป็น PAID อัตโนมัติ
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    if (invoice && totalPaid >= invoice.amount) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID" },
      });
    }

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "บันทึกรับชำระเงินล้มเหลว" },
      { status: 500 },
    );
  }
}
