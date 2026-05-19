import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const defaultIncome=['Jual Mobil','Profit Mobil','Ngopseh','Fee Makelar','Komisi','Titip Jual','Gaji','Bonus','Investasi','Freelance','Lainnya'];
const defaultExpense=['Operasional','Makan','BBM','Servis Mobil','Pajak','Cicilan','Tagihan','Belanja','Marketing','Transfer Keluarga','Investasi','Lainnya'];
async function main(){const email=process.env.SEED_EMAIL||'admin@pos.local';const password=process.env.SEED_PASSWORD||'password123';const user=await prisma.user.upsert({where:{email},update:{},create:{email,fullName:'Admin POS',passwordHash:await bcrypt.hash(password,10)}});await prisma.category.createMany({data:[...defaultIncome.map(name=>({userId:user.id,name,type:'INCOME' as const,icon:'TrendingUp',color:'emerald'})),...defaultExpense.map(name=>({userId:user.id,name,type:'EXPENSE' as const,icon:'Receipt',color:'blue'}))],skipDuplicates:true});console.log('Seed user:',email,'password:',password)}
main().finally(()=>prisma.$disconnect());
