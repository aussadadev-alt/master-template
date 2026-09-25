import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: ดึงประวัติการรักษาทั้งหมด
export async function GET() {
  try {
    const records = await prisma.serviceRecord.findMany({
      // ดึงข้อมูลแฟ้มประวัติแบบจัดเต็ม เพื่อให้หมอดูย้อนหลังได้ครบถ้วน
      include: {
        customer: true,
        serviceTarget: true,
        staff: true,
        booking: true,
      },
      orderBy: { serviceDate: "desc" }, // เรียงประวัติการรักษาล่าสุดขึ้นก่อน
    });
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json(
      { error: "ดึงข้อมูลประวัติการรักษาล้มเหลว" },
      { status: 500 },
    );
  }
}

// 2. POST: บันทึกประวัติการรักษาใหม่ (หลังตรวจเสร็จ)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerId,
      serviceTargetId,
      staffId,
      bookingId,
      diagnosis,
      treatment,
      notes,
    } = body;

    // ดักไว้ก่อน: ต้องรู้ว่าใครคือลูกค้า และใครคือหมอผู้รักษา
    if (!customerId || !staffId) {
      return NextResponse.json(
        { error: "ต้องระบุ ID ลูกค้า (customerId) และ หมอผู้รักษา (staffId)" },
        { status: 400 },
      );
    }

    // บันทึกลงฐานข้อมูล
    const newRecord = await prisma.serviceRecord.create({
      data: {
        customerId,
        serviceTargetId, // สัตว์เลี้ยงตัวไหน
        staffId, // หมอคนไหน
        bookingId, // มาจากคิวรหัสอะไร (ถ้ามี)
        serviceDate: new Date(), // ประทับตราวันเวลาปัจจุบันที่กดเซฟเลย
        diagnosis, // ผลวินิจฉัย/อาการ
        treatment, // การรักษา/ยาที่จ่าย
        notes, // หมายเหตุเพิ่มเติม
      },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "บันทึกประวัติการรักษาล้มเหลว" },
      { status: 500 },
    );
  }
}
