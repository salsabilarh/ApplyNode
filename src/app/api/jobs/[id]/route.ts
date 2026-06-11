import { NextResponse } from 'next/server';
import { PrismaClient, JobStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    // Destrukturisasi data dari form frontend
    const { deadline, plannedApplyDate, openingDate, status, ...restData } = body;
    const updatePayload: any = { ...restData };

    // 1. Ambil data asli lowongan dari database mysql
    const existingJob = await prisma.job.findUnique({
      where: { id },
      select: { status: true, deadline: true }
    });

    if (!existingJob) {
      return NextResponse.json({ message: 'Data lowongan tidak ditemukan.' }, { status: 404 });
    }

    // 2. Dapatkan waktu SEKARANG dalam format Tahun-Bulan-Tanggal murni UTC
    const sekarang = new Date();
    const utcSekarang = new Date(Date.UTC(sekarang.getUTCFullYear(), sekarang.getUTCMonth(), sekarang.getUTCDate()));

    // 3. Tentukan objek tanggal deadline baru
    let targetDeadlineUTC: Date;

    if (deadline) {
      const cleanDeadline = deadline.split('T')[0]; // Format 'YYYY-MM-DD'
      targetDeadlineUTC = new Date(`${cleanDeadline}T00:00:00.000Z`);
      updatePayload.deadline = targetDeadlineUTC;
    } else {
      targetDeadlineUTC = new Date(existingJob.deadline);
    }

    if (plannedApplyDate) {
      const cleanPlannedDate = plannedApplyDate.split('T')[0];
      updatePayload.plannedApplyDate = new Date(`${cleanPlannedDate}T00:00:00.000Z`);
    }

    if (openingDate) {
      const cleanOpeningDate = openingDate.split('T')[0];
      updatePayload.openingDate = new Date(`${cleanOpeningDate}T00:00:00.000Z`);
    }

    // 4. Ambil nilai tanggal murni dari deadline untuk komparasi dengan waktu sekarang
    const targetDeadlineMurni = new Date(Date.UTC(
      targetDeadlineUTC.getUTCFullYear(),
      targetDeadlineUTC.getUTCMonth(),
      targetDeadlineUTC.getUTCDate()
    ));

    // Pengecekan kondisi pemulihan status
    const apakahStatusClosed = existingJob.status === 'CLOSED' || status === 'CLOSED';
    const apakahDeadlineValid = targetDeadlineMurni.getTime() >= utcSekarang.getTime();

    // AMAN: Jika terdeteksi CLOSED dan deadlinenya valid (>= hari ini), PAKSA pindah ke BACKLOG
    if (apakahStatusClosed && apakahDeadlineValid) {
      updatePayload.status = JobStatus.BACKLOG;
    } else {
      // Jika tidak memenuhi syarat pemulihan, gunakan status dari form frontend, jika kosong gunakan status lama di DB
      updatePayload.status = status || existingJob.status;
    }

    // 5. Eksekusi update data ke database
    const updatedJob = await prisma.job.update({
      where: { id },
      data: updatePayload,
    });

    return NextResponse.json(updatedJob, { status: 200 });
  } catch (error: any) {
    console.error('Error Update Job Auto-Status:', error);
    return NextResponse.json(
      { message: 'Gagal melakukan modifikasi data lowongan.', error: error.message },
      { status: 500 }
    );
  }
}