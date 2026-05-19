import { prisma } from '@/lib/prisma';
import { createAdmin } from '@/lib/actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SetupAdmin(){if(await prisma.user.count()>0)redirect('/login');return <main className="min-h-screen grid place-items-center p-4"><form action={createAdmin} className="glass w-full max-w-md rounded-[2rem] p-6 space-y-4"><h1 className="text-2xl font-black">Buat Admin Pertama</h1><div><label>Nama</label><input name="fullName" required/></div><div><label>Email</label><input name="email" type="email" required/></div><div><label>Password</label><input name="password" type="password" minLength={6} required/></div><button className="btn btn-primary w-full">Buat Admin</button></form></main>}
