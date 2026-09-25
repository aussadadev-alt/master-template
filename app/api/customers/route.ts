import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ดึง Prisma จากไฟล์ศูนย์กลางที่เราเพิ่งสร้าง

// 1. ฟังก์ชัน GET: ดึงข้อมูลลูกค้าทั้งหมด
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" }, // เรียงคนล่าสุดขึ้นก่อน
    });
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// 2. ฟังก์ชัน POST: เพิ่มข้อมูลลูกค้าใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json(); // รับข้อมูลที่ส่งมาจากหน้าเว็บ
    const { fullName, phone, email, address } = body;

    // สั่ง Prisma บันทึกลงตาราง Customer
    const newCustomer = await prisma.customer.create({
      data: {
        fullName,
        phone,
        email,
        address,
      },
    });

    return NextResponse.json(newCustomer, { status: 201 }); // ส่งข้อมูลที่สร้างเสร็จกลับไปบอกหน้าเว็บว่า "เรียบร้อย!"
  } catch (error) {
    return NextResponse.json({ error: "สร้างข้อมูลล้มเหลว" }, { status: 500 });
  }
}
