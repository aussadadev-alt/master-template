import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: ดึงข้อมูลสัตว์เลี้ยงทั้งหมด
export async function GET() {
  try {
    const targets = await prisma.serviceTarget.findMany({
      // include คือคำสั่งเทพของ Prisma ที่สั่งให้ดึงข้อมูลลูกค้า (เจ้าของ) พ่วงมาด้วยเลย
      include: {
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(targets);
  } catch (error) {
    return NextResponse.json(
      { error: "ดึงข้อมูลสัตว์เลี้ยงล้มเหลว" },
      { status: 500 },
    );
  }
}

// 2. POST: ลงทะเบียนสัตว์เลี้ยงตัวใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, details, customerId } = body;

    // ดักไว้ก่อน: ถ้าลืมส่ง ID เจ้าของมา ให้เตือนกลับไป
    if (!customerId) {
      return NextResponse.json(
        { error: "ต้องระบุ ID เจ้าของ (customerId)" },
        { status: 400 },
      );
    }

    // บันทึกลงฐานข้อมูล
    const newTarget = await prisma.serviceTarget.create({
      data: {
        name,
        type,
        details,
        customerId, // ผูกสัตว์เลี้ยงตัวนี้เข้ากับ ID ของลูกค้า
      },
    });

    return NextResponse.json(newTarget, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "สร้างข้อมูลสัตว์เลี้ยงล้มเหลว" },
      { status: 500 },
    );
  }
}
