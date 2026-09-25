import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: ดึงรายชื่อพนักงานทั้งหมด
export async function GET() {
  try {
    const staffList = await prisma.staff.findMany({
      orderBy: { createdAt: "desc" }, // เรียงพนักงานที่เพิ่งเพิ่มล่าสุดขึ้นก่อน
    });
    return NextResponse.json(staffList);
  } catch (error) {
    return NextResponse.json(
      { error: "ดึงข้อมูลพนักงานล้มเหลว" },
      { status: 500 },
    );
  }
}

// 2. POST: เพิ่มพนักงานใหม่เข้าคลินิก
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, role, phone, email } = body;

    // บันทึกลงฐานข้อมูล
    const newStaff = await prisma.staff.create({
      data: {
        fullName,
        role, // เช่น 'Doctor', 'Nurse', 'Admin'
        phone,
        email,
      },
    });

    return NextResponse.json(newStaff, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "สร้างข้อมูลพนักงานล้มเหลว" },
      { status: 500 },
    );
  }
}
