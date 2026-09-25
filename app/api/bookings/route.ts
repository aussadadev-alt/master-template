import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: ดึงข้อมูลการจองคิวทั้งหมด
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      // include ดึงข้อมูลที่เกี่ยวข้องมาแสดงให้ครบ จะได้เอาไปจัดหน้าปฏิทินง่ายๆ
      include: {
        customer: true,
        serviceTarget: true,
        staff: true,
      },
      orderBy: { bookingDate: "asc" }, // เรียงตามวันที่จอง (คิวที่ใกล้ถึงก่อนขึ้นก่อน)
    });
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json(
      { error: "ดึงข้อมูลการจองคิวล้มเหลว" },
      { status: 500 },
    );
  }
}

// 2. POST: สร้างคิวใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, serviceTargetId, staffId, bookingDate, status, notes } =
      body;

    // ดักไว้ก่อน: ถ้าไม่มีลูกค้า หรือ ไม่มีเวลานัด ให้เตือน
    if (!customerId || !bookingDate) {
      return NextResponse.json(
        { error: "ต้องระบุ ID ลูกค้า และ วันเวลาที่จอง (bookingDate)" },
        { status: 400 },
      );
    }

    // บันทึกลงฐานข้อมูล
    const newBooking = await prisma.booking.create({
      data: {
        customerId,
        serviceTargetId, // จะส่งหรือไม่ส่งมาก็ได้ (เผื่อลูกค้ามาซื้อของเฉยๆ ไม่ได้พาสัตว์มา)
        staffId, // จะระบุหมอเลย หรือรอจัดคิวหน้างานก็ได้
        bookingDate: new Date(bookingDate), // แปลงข้อความให้กลายเป็นรูปแบบวันที่ที่ฐานข้อมูลรู้จัก
        status: status || "WAITING", // ถ้าไม่ได้ส่งสถานะมา ให้ตั้งเป็น "รอคิว" (WAITING) ไว้ก่อน
        notes,
      },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "สร้างการจองคิวล้มเหลว" },
      { status: 500 },
    );
  }
}
