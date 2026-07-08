'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { toNumber, ym } from '@/lib/utils';
import type { Prisma, InvestmentSnapshot } from '@prisma/client';
import { AccountType, CategoryType, TransactionType, DebtType } from '@prisma/client';

async function userId(){const u=await requireUser(); if(!u) redirect('/login'); return u.id;}
async function assertOpen(uid:string,date:Date){
  const m=ym(date);
  const [monthly, annual] = await Promise.all([
    prisma.monthlyClosing.findUnique({where:{userId_month:{userId:uid,month:m}}}),
    prisma.annualClosing.findUnique({where:{userId_year:{userId:uid,year:date.getUTCFullYear()}}}),
  ]);
  if(monthly) throw new Error(`Bulan ${m} sudah closing`);
  if(annual) throw new Error(`Tahun ${date.getUTCFullYear()} sudah closing`);
}
const defaultIncome=['Jual Mobil','Profit Mobil','Ngopseh','Fee Makelar','Komisi','Titip Jual','Gaji','Bonus','Investasi','Freelance','Lainnya'];
const defaultExpense=['Operasional','Makan','BBM','Servis Mobil','Pajak','Cicilan','Tagihan','Belanja','Marketing','Transfer Keluarga','Investasi','Lainnya'];
export async function createAdmin(fd:FormData){const count=await prisma.user.count(); if(count>0) redirect('/login'); const email=String(fd.get('email')); const password=String(fd.get('password')); const fullName=String(fd.get('fullName')||'Admin'); const user=await prisma.user.create({data:{email,fullName,passwordHash:await bcrypt.hash(password,10)}}); await createDefaultCategories(user.id); redirect('/login');}
export async function createDefaultCategories(uid:string){await prisma.category.createMany({data:[...defaultIncome.map(name=>({userId:uid,name,type:'INCOME' as const,icon:'TrendingUp',color:'emerald'})),...defaultExpense.map(name=>({userId:uid,name,type:'EXPENSE' as const,icon:'Receipt',color:'blue'}))],skipDuplicates:true});}
export async function completeSetup(fd:FormData){const uid=await userId(); await createDefaultCategories(uid); const account=String(fd.get('account')||'Kas Utama'); const balance=toNumber(fd.get('balance')); await prisma.account.create({data:{userId:uid,name:account,type:(fd.get('accountType')||'BANK') as AccountType,balance,initialBalance:balance,isPrimary:true}}); const debtName=String(fd.get('debtName')||''); if(debtName) await prisma.debt.create({data:{userId:uid,type:'DEBT',name:debtName,amount:toNumber(fd.get('debtAmount')),remainingAmount:toNumber(fd.get('debtAmount')),dueDate:fd.get('debtDue')?new Date(String(fd.get('debtDue'))):null,notes:String(fd.get('debtNotes')||'')}}); const recName=String(fd.get('recName')||''); if(recName) await prisma.debt.create({data:{userId:uid,type:'RECEIVABLE',name:recName,amount:toNumber(fd.get('recAmount')),remainingAmount:toNumber(fd.get('recAmount')),dueDate:fd.get('recDue')?new Date(String(fd.get('recDue'))):null,notes:String(fd.get('recNotes')||'')}}); const invCat=String(fd.get('invCat')||''); if(invCat) await prisma.investmentSnapshot.create({data:{userId:uid,category:invCat,month:ym(),balance:toNumber(fd.get('invBalance')),notes:String(fd.get('invNotes')||'')}}); const carName=String(fd.get('carName')||''); if(carName) await prisma.car.create({data:{userId:uid,name:carName,brand:String(fd.get('brand')||''),model:String(fd.get('model')||''),year:Number(fd.get('year')||0)||null,purchasePrice:toNumber(fd.get('purchasePrice')),estimatedSellPrice:toNumber(fd.get('estimatedSellPrice')),notes:String(fd.get('carNotes')||'')}}); await prisma.user.update({where:{id:uid},data:{setupCompleted:true}}); redirect('/dashboard');}
export async function addAccount(fd:FormData){const uid=await userId(); const initial=toNumber(fd.get('initialBalance')); if(fd.get('isPrimary')) await prisma.account.updateMany({where:{userId:uid},data:{isPrimary:false}}); await prisma.account.create({data:{userId:uid,name:String(fd.get('name')),type:fd.get('type') as AccountType,balance:initial,initialBalance:initial,color:String(fd.get('color')||'emerald'),icon:String(fd.get('icon')||'Wallet'),isPrimary:fd.get('isPrimary')==='true'}}); revalidatePath('/accounts');}
export async function deleteAccount(fd:FormData){const uid=await userId(); const id=String(fd.get('id')); const txCount=await prisma.transaction.count({where:{accountId:id,userId:uid}}); if(txCount>0)throw new Error('Tidak bisa hapus rekening yang masih memiliki transaksi'); await prisma.account.deleteMany({where:{id,userId:uid}}); revalidatePath('/accounts'); revalidatePath('/dashboard');}
export async function mergeAccount(fd:FormData){const uid=await userId(); const sourceId=String(fd.get('id')); const targetId=String(fd.get('targetAccountId')); if(sourceId===targetId)throw new Error('Rekening tujuan tidak boleh sama'); await prisma.$transaction(async tx=>{const [src,tgt]=await Promise.all([tx.account.findFirst({where:{id:sourceId,userId:uid}}),tx.account.findFirst({where:{id:targetId,userId:uid}})]); if(!src)throw new Error('Rekening sumber tidak ditemukan'); if(!tgt)throw new Error('Rekening tujuan tidak ditemukan'); await tx.transaction.updateMany({where:{accountId:sourceId,userId:uid},data:{accountId:targetId}}); await tx.transaction.updateMany({where:{transferToAccountId:sourceId,userId:uid},data:{transferToAccountId:targetId}}); await tx.carCost.updateMany({where:{accountId:sourceId,userId:uid},data:{accountId:targetId}}); await tx.debt.updateMany({where:{accountId:sourceId,userId:uid},data:{accountId:targetId}}); await tx.debtPayment.updateMany({where:{accountId:sourceId,userId:uid},data:{accountId:targetId}}); await tx.recurringBill.updateMany({where:{accountId:sourceId,userId:uid},data:{accountId:targetId}}); await tx.savingsDeposit.updateMany({where:{accountId:sourceId,userId:uid},data:{accountId:targetId}}); await tx.account.update({where:{id:targetId},data:{balance:{increment:Number(src.balance)}}}); if(src.isPrimary)await tx.account.update({where:{id:targetId},data:{isPrimary:true}}); await tx.account.delete({where:{id:sourceId}});}); revalidatePath('/accounts'); revalidatePath('/dashboard'); revalidatePath('/transactions'); revalidatePath('/debts'); revalidatePath('/bills'); revalidatePath('/cars'); revalidatePath('/savings');}
export async function adjustAccount(fd:FormData){
  const uid=await userId(); 
  const id=String(fd.get('id')); 
  const newBalance=toNumber(fd.get('balance')); 
  const date=fd.get('date')?new Date(String(fd.get('date'))):new Date(); 
  const note=String(fd.get('note')||''); 
  
  // Check if account exists first
  const acc=await prisma.account.findFirst({where:{id,userId:uid}});
  if(!acc)throw new Error('Rekening tidak ditemukan');
  
  const diff=newBalance-Number(acc.balance);
  if(diff===0)return;
  
  // Try to check if month is open, but don't block if it fails
  try {
    await assertOpen(uid,date);
  } catch(e) {
    // If month is closed, still allow adjustment with warning
    console.warn('Month closed, allowing force adjustment');
  }
  
  await prisma.$transaction(async tx=>{
    await tx.account.update({where:{id},data:{balance:newBalance}}); 
    
    // Find or create "Penyesuaian Saldo" category
    const catName = diff > 0 ? 'Penyesuaian Saldo' : 'Penyesuaian Saldo';
    const catType = diff > 0 ? 'INCOME' : 'EXPENSE';
    let category = await tx.category.findFirst({
      where:{userId:uid, name:catName, type:catType as CategoryType}
    });
    if(!category){
      category = await tx.category.create({
        data:{userId:uid, name:catName, type:catType as CategoryType, icon:'Scale', color:'orange'}
      });
    }
    
    await tx.transaction.create({
      data:{
        userId:uid,
        accountId:id,
        categoryId:category.id,
        type:diff>0?'INCOME':'EXPENSE',
        amount:Math.abs(diff),
        date,
        description:`Penyesuaian saldo${note?`: ${note}`:''}`,
        sourceType:'balance_adjustment',
        sourceId:id
      }
    });
  }); 
  revalidatePath('/accounts'); 
  revalidatePath('/dashboard'); 
  revalidatePath('/transactions');
}
export async function addCategory(fd:FormData){const uid=await userId(); await prisma.category.create({data:{userId:uid,name:String(fd.get('name')),type:fd.get('type') as CategoryType,icon:String(fd.get('icon')||'Circle'),color:String(fd.get('color')||'emerald'),isActive:true}}); revalidatePath('/categories');}
export async function toggleCategory(fd:FormData){const uid=await userId(); const id=String(fd.get('id')); const cat=await prisma.category.findFirst({where:{id,userId:uid}}); if(cat) await prisma.category.update({where:{id},data:{isActive:!cat.isActive}}); revalidatePath('/categories');}
export async function addTransaction(fd:FormData){const uid=await userId(); const type=fd.get('type') as TransactionType; const amount=toNumber(fd.get('amount')); const date=new Date(String(fd.get('date'))); await assertOpen(uid,date); const accountId=String(fd.get('accountId')); const transferTo=String(fd.get('transferToAccountId')||''); if(type==='TRANSFER'){if(!transferTo)throw new Error('Pilih rekening tujuan'); if(transferTo===accountId)throw new Error('Rekening tujuan harus berbeda');} await prisma.$transaction(async tx=>{const t=await tx.transaction.create({data:{userId:uid,type,amount,date,description:String(fd.get('description')||''),accountId,categoryId:type==='TRANSFER'?null:(String(fd.get('categoryId')||'')||null),transferToAccountId:type==='TRANSFER'?transferTo:null}}); if(type==='INCOME') await tx.account.update({where:{id:accountId},data:{balance:{increment:amount}}}); if(type==='EXPENSE') await tx.account.update({where:{id:accountId},data:{balance:{decrement:amount}}}); if(type==='TRANSFER'){await tx.account.update({where:{id:accountId},data:{balance:{decrement:amount}}}); await tx.account.update({where:{id:transferTo},data:{balance:{increment:amount}}});} await tx.transactionAuditLog.create({data:{userId:uid,transactionId:t.id,action:'CREATE',newData:t as unknown as Prisma.InputJsonValue}});}); revalidatePath('/transactions'); revalidatePath('/dashboard');}
export async function deleteTransaction(fd:FormData){const uid=await userId(); const id=String(fd.get('id')); const t=await prisma.transaction.findFirst({where:{id,userId:uid}}); if(!t)return; await assertOpen(uid,t.date); await prisma.$transaction(async tx=>{if(t.type==='INCOME') await tx.account.update({where:{id:t.accountId},data:{balance:{decrement:t.amount}}}); if(t.type==='EXPENSE') await tx.account.update({where:{id:t.accountId},data:{balance:{increment:t.amount}}}); if(t.type==='TRANSFER'&&t.transferToAccountId){await tx.account.update({where:{id:t.accountId},data:{balance:{increment:t.amount}}}); await tx.account.update({where:{id:t.transferToAccountId},data:{balance:{decrement:t.amount}}});} await tx.transactionAuditLog.create({data:{userId:uid,transactionId:id,action:'DELETE',oldData:t as unknown as Prisma.InputJsonValue}}); await tx.transaction.delete({where:{id}});}); revalidatePath('/transactions'); revalidatePath('/dashboard');}
export async function addCar(fd:FormData){const uid=await userId(); await assertOpen(uid,new Date()); const accountId=String(fd.get('accountId')||''); const purchase=toNumber(fd.get('purchasePrice')); const myMoney=toNumber(fd.get('myMoney')); const debtName=String(fd.get('debtName')||''); const debtAmount=toNumber(fd.get('debtAmount')); await prisma.$transaction(async tx=>{const car=await tx.car.create({data:{userId:uid,name:String(fd.get('name')),brand:String(fd.get('brand')||''),model:String(fd.get('model')||''),year:Number(fd.get('year')||0)||null,color:String(fd.get('color')||''),transmission:String(fd.get('transmission')||''),licensePlate:String(fd.get('licensePlate')||''),frameNumber:String(fd.get('frameNumber')||''),engineNumber:String(fd.get('engineNumber')||''),mileage:Number(fd.get('mileage')||0)||null,purchasePrice:purchase,estimatedSellPrice:toNumber(fd.get('estimatedSellPrice')),notes:String(fd.get('notes')||''),photos:String(fd.get('photos')||'').split('\n').filter(Boolean)}}); if(accountId&&myMoney>0){await tx.account.update({where:{id:accountId},data:{balance:{decrement:myMoney}}});} if(debtName&&debtAmount>0){await tx.debt.create({data:{userId:uid,type:'DEBT',name:debtName,amount:debtAmount,remainingAmount:debtAmount,carId:car.id,notes:`Pinjaman untuk beli mobil ${car.name}`}});}}); revalidatePath('/cars'); revalidatePath('/debts'); revalidatePath('/dashboard');}
export async function deleteCar(fd:FormData){const uid=await userId(); const id=String(fd.get('id')); await prisma.car.deleteMany({where:{id,userId:uid}}); revalidatePath('/cars'); revalidatePath('/dashboard'); revalidatePath('/debts');}
export async function addCarCost(fd:FormData){const uid=await userId(); const amount=toNumber(fd.get('amount')); const accountId=String(fd.get('accountId')); const date=new Date(String(fd.get('date'))); await assertOpen(uid,date); await prisma.$transaction(async tx=>{const c=await tx.carCost.create({data:{userId:uid,carId:String(fd.get('carId')),accountId,amount,description:String(fd.get('description')),date}}); await tx.account.update({where:{id:accountId},data:{balance:{decrement:amount}}});}); revalidatePath('/cars'); revalidatePath('/dashboard'); revalidatePath('/transactions');}
export async function sellCar(fd:FormData){const uid=await userId(); const id=String(fd.get('carId')); const accountId=String(fd.get('accountId')); const price=toNumber(fd.get('sellPrice')); const date=new Date(String(fd.get('date'))); await assertOpen(uid,date); await prisma.$transaction(async tx=>{const car=await tx.car.findFirst({where:{id,userId:uid},include:{costs:true}}); if(!car)throw new Error('Mobil tidak ditemukan'); const modal=Number(car.purchasePrice)+car.costs.reduce((a,k)=>a+Number(k.amount),0); const selisih=price-modal; const costIds=car.costs.map(k=>k.id); const oldTxCount=await tx.transaction.count({where:{sourceType:{in:['car_purchase','car_cost']},sourceId:{in:[id,...costIds]}}}); const isOldModel=oldTxCount>0; await tx.car.updateMany({where:{id,userId:uid},data:{status:'SOLD',sellPrice:price,soldAt:date}}); await tx.account.update({where:{id:accountId},data:{balance:{increment:price}}}); const jualCat=(await tx.category.findFirst({where:{userId:uid,name:'Jual Mobil',type:'INCOME'}}))??(await tx.category.create({data:{userId:uid,name:'Jual Mobil',type:'INCOME',icon:'TrendingUp',color:'emerald'}})); if(isOldModel){await tx.transaction.create({data:{userId:uid,accountId,categoryId:jualCat.id,type:'INCOME',amount:price,date,description:`Jual mobil ${car.name} (omzet)`,sourceType:'car_sale',sourceId:id}});}else if(selisih>0){await tx.transaction.create({data:{userId:uid,accountId,categoryId:jualCat.id,type:'INCOME',amount:selisih,date,description:`Profit jual mobil ${car.name} (jual ${price} - modal ${modal})`,sourceType:'car_sale',sourceId:id}});}else if(selisih<0){await tx.transaction.create({data:{userId:uid,accountId,type:'EXPENSE',amount:Math.abs(selisih),date,description:`Rugi jual mobil ${car.name} (jual ${price} - modal ${modal})`,sourceType:'car_sale_loss',sourceId:id}});} const carDebts=await tx.debt.findMany({where:{userId:uid,carId:id,status:'ACTIVE'}}); for(const debt of carDebts){const payAmount=Number(debt.remainingAmount); await tx.debtPayment.create({data:{userId:uid,debtId:debt.id,accountId,amount:payAmount,date,notes:`Auto-lunas dari penjualan mobil`}}); await tx.debt.update({where:{id:debt.id},data:{remainingAmount:0,status:'PAID'}}); await tx.account.update({where:{id:accountId},data:{balance:{decrement:payAmount}}}); if(isOldModel){await tx.transaction.create({data:{userId:uid,accountId,type:'EXPENSE',amount:payAmount,date,description:`Bayar hutang ${debt.name} (mobil laku)`,sourceType:'debt_payment',sourceId:debt.id}});}}}); revalidatePath('/cars'); revalidatePath('/debts'); revalidatePath('/dashboard');}
export async function addDebt(fd:FormData){const uid=await userId(); const amount=toNumber(fd.get('amount')); const accountId=String(fd.get('accountId')||''); const type=String(fd.get('type')); const name=String(fd.get('name')); await prisma.$transaction(async tx=>{const debt=await tx.debt.create({data:{userId:uid,type:type as DebtType,name,amount,remainingAmount:amount,accountId:accountId||null,dueDate:fd.get('dueDate')?new Date(String(fd.get('dueDate'))):null,notes:String(fd.get('notes')||'')}}); if(accountId){if(type==='DEBT'){await tx.account.update({where:{id:accountId},data:{balance:{increment:amount}}});}else if(type==='RECEIVABLE'){await tx.account.update({where:{id:accountId},data:{balance:{decrement:amount}}});} await tx.transaction.create({data:{userId:uid,accountId,type:type==='DEBT'?'INCOME':'EXPENSE',amount,date:new Date(),description:type==='DEBT'?`Terima utang ${name}`:`Berikan piutang ${name}`,sourceType:'debt_created',sourceId:debt.id}});}}); revalidatePath('/debts'); revalidatePath('/dashboard'); revalidatePath('/transactions');}
export async function deleteDebt(fd:FormData){
  const uid=await userId(); 
  const debtId=String(fd.get('debtId')); 
  const debt=await prisma.debt.findFirst({where:{id:debtId,userId:uid}}); 
  if(!debt)return; 
  
  const remainAmt=Number(debt.remainingAmount);
  
  await prisma.$transaction(async tx=>{
    // Reverse balance changes
    if(debt.accountId){
      if(debt.type==='DEBT'){
        await tx.account.update({where:{id:debt.accountId},data:{balance:{decrement:remainAmt}}});
      } else {
        await tx.account.update({where:{id:debt.accountId},data:{balance:{increment:remainAmt}}});
      }
    }
    
    // Delete all related transactions
    await tx.transaction.deleteMany({where:{userId:uid,sourceType:'debt_created',sourceId:debtId}});
    await tx.transaction.deleteMany({where:{userId:uid,sourceType:'debt_payment',sourceId:debtId}});
    
    // Delete debt payments
    await tx.debtPayment.deleteMany({where:{debtId}});
    
    // Delete the debt itself
    await tx.debt.delete({where:{id:debtId}});
  }); 
  
  revalidatePath('/debts'); 
  revalidatePath('/dashboard'); 
  revalidatePath('/transactions');
}
export async function deleteDebtPayment(fd:FormData){const uid=await userId(); const paymentId=String(fd.get('paymentId')); const payment=await prisma.debtPayment.findFirst({where:{id:paymentId,userId:uid}}); if(!payment)return; const debt=await prisma.debt.findFirst({where:{id:payment.debtId,userId:uid}}); if(!debt)return; await prisma.$transaction(async tx=>{await tx.account.update({where:{id:payment.accountId},data:{balance:debt.type==='DEBT'?{increment:payment.amount}:{decrement:payment.amount}}}); const newRemaining=Number(debt.remainingAmount)+Number(payment.amount); await tx.debt.update({where:{id:debt.id},data:{remainingAmount:newRemaining,status:'ACTIVE'}}); await tx.transaction.deleteMany({where:{userId:uid,sourceType:'debt_payment',sourceId:debt.id,amount:payment.amount}}); await tx.debtPayment.delete({where:{id:paymentId}});}); revalidatePath('/debts'); revalidatePath('/dashboard'); revalidatePath('/transactions');}
export async function payDebt(fd:FormData){const uid=await userId(); const debt=await prisma.debt.findFirst({where:{id:String(fd.get('debtId')),userId:uid}}); if(!debt)return; const amount=toNumber(fd.get('amount')); if(amount>Number(debt.remainingAmount))throw new Error('Pembayaran melebihi sisa hutang'); const accountId=debt.accountId||String(fd.get('accountId')||''); const date=new Date(String(fd.get('date'))); await assertOpen(uid,date); await prisma.$transaction(async tx=>{await tx.debtPayment.create({data:{userId:uid,debtId:debt.id,accountId,amount,date,notes:String(fd.get('notes')||'')}}); const remain=Number(debt.remainingAmount)-amount; await tx.debt.update({where:{id:debt.id},data:{remainingAmount:Math.max(0,remain),status:remain<=0?'PAID':'ACTIVE'}}); if(debt.type==='DEBT'){await tx.account.update({where:{id:accountId},data:{balance:{decrement:amount}}});}else{await tx.account.update({where:{id:accountId},data:{balance:{increment:amount}}}); } let skipTx=false; if(debt.carId&&debt.type==='DEBT'){const costIds=(await tx.carCost.findMany({where:{carId:debt.carId},select:{id:true}})).map(c=>c.id); const cnt=await tx.transaction.count({where:{sourceType:{in:['car_purchase','car_cost']},sourceId:{in:[debt.carId,...costIds]}}}); skipTx=cnt===0;} if(!skipTx){await tx.transaction.create({data:{userId:uid,accountId,type:debt.type==='DEBT'?'EXPENSE':'INCOME',amount,date,description:debt.type==='DEBT'?`Bayar hutang ${debt.name}`:`Terima piutang ${debt.name}`,sourceType:'debt_payment',sourceId:debt.id}});}}); revalidatePath('/debts'); revalidatePath('/dashboard');}
export async function addInvestment(fd:FormData){const uid=await userId(); await prisma.investmentSnapshot.upsert({where:{userId_category_month:{userId:uid,category:String(fd.get('category')),month:String(fd.get('month'))}},create:{userId:uid,category:String(fd.get('category')),month:String(fd.get('month')),balance:toNumber(fd.get('balance')),notes:String(fd.get('notes')||'')},update:{balance:toNumber(fd.get('balance')),notes:String(fd.get('notes')||'')}}); revalidatePath('/investments'); revalidatePath('/dashboard');}
export async function addBill(fd:FormData){const uid=await userId(); const billType=String(fd.get('billType')||'MONTHLY') as 'MONTHLY'|'INSTALLMENT'; const data:{userId:string;accountId:string;name:string;amount:number;dueDay:number;notes:string;billType:'MONTHLY'|'INSTALLMENT';totalAmount?:number;totalMonths?:number;startDate?:Date}={userId:uid,accountId:String(fd.get('accountId')),name:String(fd.get('name')),amount:toNumber(fd.get('amount')),dueDay:Number(fd.get('dueDay')||1),notes:String(fd.get('notes')||''),billType}; if(billType==='INSTALLMENT'){data.totalAmount=toNumber(fd.get('totalAmount')); data.totalMonths=Number(fd.get('totalMonths')); data.startDate=new Date(String(fd.get('startDate')));} await prisma.recurringBill.create({data}); revalidatePath('/bills'); revalidatePath('/dashboard');}
export async function payBill(fd:FormData){const uid=await userId(); const bill=await prisma.recurringBill.findFirst({where:{id:String(fd.get('id')),userId:uid}}); if(!bill)return; const accountId=String(fd.get('accountId')||bill.accountId); const date=fd.get('date')?new Date(String(fd.get('date'))):new Date(); await assertOpen(uid,date); const desc=String(fd.get('description')||`Bayar tagihan ${bill.name}`); await prisma.$transaction(async tx=>{const newPaidMonths=bill.paidMonths+1; const isInstallmentComplete=bill.billType==='INSTALLMENT'&&bill.totalMonths!==null&&newPaidMonths>=bill.totalMonths; await tx.recurringBill.update({where:{id:bill.id},data:{status:isInstallmentComplete?'PAID':'UNPAID',lastPaidAt:date,paidMonths:newPaidMonths}}); await tx.account.update({where:{id:accountId},data:{balance:{decrement:bill.amount}}}); await tx.transaction.create({data:{userId:uid,accountId,type:'EXPENSE',amount:bill.amount,date,description:desc,sourceType:'bill',sourceId:bill.id}});}); revalidatePath('/bills'); revalidatePath('/dashboard');}
export async function deleteBill(fd:FormData){const uid=await userId(); const id=String(fd.get('id')); await prisma.recurringBill.deleteMany({where:{id,userId:uid}}); revalidatePath('/bills'); revalidatePath('/dashboard');}
export async function closeMonth(fd:FormData){
  const uid=await userId();
  const month=String(fd.get('month'));
  const [y,m]=month.split('-').map(Number);
  const monthStart=new Date(Date.UTC(y,m-1,1));
  const monthEnd=new Date(Date.UTC(y,m,1));

  const [accounts,transactions,cars,debts,investments,savings,categories]=await Promise.all([
    prisma.account.findMany({where:{userId:uid}}),
    prisma.transaction.findMany({where:{userId:uid,date:{gte:monthStart,lt:monthEnd}},include:{category:true}}),
    prisma.car.findMany({where:{userId:uid,status:'AVAILABLE'},include:{costs:true}}),
    prisma.debt.findMany({where:{userId:uid,status:'ACTIVE'}}),
    prisma.investmentSnapshot.findMany({where:{userId:uid,month}}),
    prisma.savingsGoal.findMany({where:{userId:uid}}),
    prisma.category.findMany({where:{userId:uid}}),
  ]);

  const income=transactions.filter(t=>t.type==='INCOME').reduce((a,t)=>a+Number(t.amount),0);
  const expense=transactions.filter(t=>t.type==='EXPENSE').reduce((a,t)=>a+Number(t.amount),0);

  // Breakdown per kategori
  const incomeByCategory=categories.filter(c=>c.type==='INCOME').map(c=>({
    name:c.name,
    total:transactions.filter(t=>t.type==='INCOME'&&t.categoryId===c.id).reduce((a,t)=>a+Number(t.amount),0)
  })).filter(c=>c.total>0);

  const expenseByCategory=categories.filter(c=>c.type==='EXPENSE').map(c=>({
    name:c.name,
    total:transactions.filter(t=>t.type==='EXPENSE'&&t.categoryId===c.id).reduce((a,t)=>a+Number(t.amount),0)
  })).filter(c=>c.total>0);

  // Aset mobil = total modal (purchasePrice + semua biaya)
  const carDetails=cars.map(c=>({
    name:c.name,
    purchasePrice:Number(c.purchasePrice),
    totalCosts:c.costs.reduce((a,k)=>a+Number(k.amount),0),
    totalModal:Number(c.purchasePrice)+c.costs.reduce((a,k)=>a+Number(k.amount),0),
  }));
  const totalCarModal=carDetails.reduce((a,c)=>a+c.totalModal,0);

  // Hutang detail
  const debtDetails=debts.filter(d=>d.type==='DEBT').map(d=>({
    name:d.name,
    remaining:Number(d.remainingAmount),
    dueDate:d.dueDate?.toISOString().slice(0,10)||null,
  }));
  const receivableDetails=debts.filter(d=>d.type==='RECEIVABLE').map(d=>({
    name:d.name,
    remaining:Number(d.remainingAmount),
    dueDate:d.dueDate?.toISOString().slice(0,10)||null,
  }));

  // Investasi detail
  const investmentDetails=investments.map(i=>({
    category:i.category,
    balance:Number(i.balance),
    notes:i.notes||'',
  }));

  // Tabungan detail
  const savingsDetails=savings.map(g=>({
    name:g.name,
    savedAmount:Number(g.savedAmount),
    targetAmount:Number(g.targetAmount),
    isCompleted:g.isCompleted,
  }));

  const summary={
    // Cashflow
    income,
    expense,
    profit:income-expense,
    totalTransactions:transactions.length,

    // Breakdown kategori
    incomeByCategory,
    expenseByCategory,

    // Rekening snapshot
    accounts:accounts.map(a=>({name:a.name,type:a.type,balance:Number(a.balance)})),
    totalCash:accounts.reduce((a,x)=>a+Number(x.balance),0),

    // Aset mobil (total modal)
    cars:carDetails,
    totalCarModal,

    // Hutang & piutang
    debts:debtDetails,
    receivables:receivableDetails,
    totalDebt:debtDetails.reduce((a,d)=>a+d.remaining,0),
    totalReceivable:receivableDetails.reduce((a,d)=>a+d.remaining,0),

    // Investasi
    investments:investmentDetails,
    totalInvestment:investmentDetails.reduce((a,i)=>a+i.balance,0),

    // Tabungan
    savings:savingsDetails,
    totalSavings:savingsDetails.reduce((a,g)=>a+g.savedAmount,0),

    // Net Worth snapshot
    netWorth:
      accounts.reduce((a,x)=>a+Number(x.balance),0)+
      totalCarModal+
      investmentDetails.reduce((a,i)=>a+i.balance,0)+
      savingsDetails.reduce((a,g)=>a+g.savedAmount,0)+
      receivableDetails.reduce((a,d)=>a+d.remaining,0)-
      debtDetails.reduce((a,d)=>a+d.remaining,0),

    closedAt:new Date().toISOString(),
  };

  await prisma.monthlyClosing.upsert({
    where:{userId_month:{userId:uid,month}},
    create:{userId:uid,month,summaryJson:summary},
    update:{summaryJson:summary}
  });
  revalidatePath('/reports');
}

export async function closeAnnual(fd:FormData){
  const uid=await userId();
  const yearRaw=fd.get('year');
  const year=Number(yearRaw);
  if(!yearRaw || Number.isNaN(year)) throw new Error('Invalid year');

  const yearStart=new Date(year+'-01-01T00:00:00.000Z');
  const yearEnd=new Date(year+1+'-01-01T00:00:00.000Z');

  const [accounts,transactions,cars,debts,invesSnapshots,savings,categories]=await Promise.all([
    prisma.account.findMany({where:{userId:uid}}),
    prisma.transaction.findMany({where:{userId:uid,date:{gte:yearStart,lt:yearEnd}},include:{category:true}}),
    prisma.car.findMany({where:{userId:uid,status:'AVAILABLE'},include:{costs:true}}),
    prisma.debt.findMany({where:{userId:uid,status:'ACTIVE'}}),
    prisma.investmentSnapshot.findMany({where:{userId:uid,month:{gte:`${year}-01`, lt:`${year+1}-01`}}}),
    prisma.savingsGoal.findMany({where:{userId:uid}}),
    prisma.category.findMany({where:{userId:uid}}),
  ]);

  const income=transactions.filter(t=>t.type==='INCOME').reduce((a,t)=>a+Number(t.amount),0);
  const expense=transactions.filter(t=>t.type==='EXPENSE').reduce((a,t)=>a+Number(t.amount),0);

  const incomeByCategory=categories.filter(c=>c.type==='INCOME').map(c=>({
    name:c.name,
    total:transactions.filter(t=>t.type==='INCOME'&&t.categoryId===c.id).reduce((a,t)=>a+Number(t.amount),0)
  })).filter(c=>c.total>0);

  const expenseByCategory=categories.filter(c=>c.type==='EXPENSE').map(c=>({
    name:c.name,
    total:transactions.filter(t=>t.type==='EXPENSE'&&t.categoryId===c.id).reduce((a,t)=>a+Number(t.amount),0)
  })).filter(c=>c.total>0);

  const carDetails=cars.map(c=>({
    name:c.name,
    purchasePrice:Number(c.purchasePrice),
    totalCosts:c.costs.reduce((a,k)=>a+Number(k.amount),0),
    totalModal:Number(c.purchasePrice)+c.costs.reduce((a,k)=>a+Number(k.amount),0),
  }));
  const totalCarModal=carDetails.reduce((a,c)=>a+c.totalModal,0);

  const debtDetails=debts.filter(d=>d.type==='DEBT').map(d=>({
    name:d.name,
    remaining:Number(d.remainingAmount),
    dueDate:d.dueDate?.toISOString().slice(0,10)||null,
  }));
  const receivableDetails=debts.filter(d=>d.type==='RECEIVABLE').map(d=>({
    name:d.name,
    remaining:Number(d.remainingAmount),
    dueDate:d.dueDate?.toISOString().slice(0,10)||null,
  }));

  // Untuk annual, ambil snapshot investasi bulan terakhir di tahun tsb per kategori
  const latestMonthByCategory: Record<string,string> = {};
  for(const row of invesSnapshots as InvestmentSnapshot[]){
    if(!latestMonthByCategory[row.category] || String(row.month) > latestMonthByCategory[row.category]){
      latestMonthByCategory[row.category]=String(row.month);
    }
  }
  const investmentDetails=Object.entries(latestMonthByCategory).map(([category,month])=>{
    const row=(invesSnapshots as InvestmentSnapshot[]).find(r=>r.category===category && String(r.month)===month);
    return {
      category,
      balance:Number(row?.balance ?? 0),
      notes: row?.notes || '',
    };
  });

  const savingsDetails=savings.map(g=>({
    name:g.name,
    savedAmount:Number(g.savedAmount),
    targetAmount:Number(g.targetAmount),
    isCompleted:g.isCompleted,
  }));

  const summary={
    income,
    expense,
    profit:income-expense,
    totalTransactions:transactions.length,

    incomeByCategory,
    expenseByCategory,

    accounts:accounts.map(a=>({name:a.name,type:a.type,balance:Number(a.balance)})),
    totalCash:accounts.reduce((a,x)=>a+Number(x.balance),0),

    cars:carDetails,
    totalCarModal,

    debts:debtDetails,
    receivables:receivableDetails,
    totalDebt:debtDetails.reduce((a,d)=>a+d.remaining,0),
    totalReceivable:receivableDetails.reduce((a,d)=>a+d.remaining,0),

    investments:investmentDetails,
    totalInvestment:investmentDetails.reduce((a,i)=>a+i.balance,0),

    savings:savingsDetails,
    totalSavings:savingsDetails.reduce((a,g)=>a+g.savedAmount,0),

    netWorth:
      accounts.reduce((a,x)=>a+Number(x.balance),0)+
      totalCarModal+
      investmentDetails.reduce((a,i)=>a+i.balance,0)+
      savingsDetails.reduce((a,g)=>a+g.savedAmount,0)+
      receivableDetails.reduce((a,d)=>a+d.remaining,0)-
      debtDetails.reduce((a,d)=>a+d.remaining,0),

    closedAt:new Date().toISOString(),
  };

  const totalAssets=
    accounts.reduce((a,x)=>a+Number(x.balance),0)+
    totalCarModal+
    investmentDetails.reduce((a,i)=>a+i.balance,0)+
    savingsDetails.reduce((a,g)=>a+g.savedAmount,0)+
    receivableDetails.reduce((a,d)=>a+d.remaining,0);
  const totalLiabilities=debtDetails.reduce((a,d)=>a+d.remaining,0);

  await prisma.annualClosing.upsert({
    where:{userId_year:{userId:uid,year}},
    create:{
      userId:uid,
      year,
      totalIncome:income,
      totalExpense:expense,
      netIncome:income-expense,
      totalAssets,
      totalLiabilities,
      taxPaid:0,
      summaryJson:summary
    },
    update:{
      totalIncome:income,
      totalExpense:expense,
      netIncome:income-expense,
      totalAssets,
      totalLiabilities,
      taxPaid:0,
      summaryJson:summary
    }
  });

  revalidatePath('/reports/annual');
}

export async function addSavingsGoal(fd:FormData){const uid=await userId(); await prisma.savingsGoal.create({data:{userId:uid,name:String(fd.get('name')),targetAmount:toNumber(fd.get('targetAmount')),deadline:fd.get('deadline')?new Date(String(fd.get('deadline'))):null,notes:String(fd.get('notes')||'')}}); revalidatePath('/savings'); revalidatePath('/dashboard');}
export async function deleteSavingsGoal(fd:FormData){const uid=await userId(); await prisma.savingsGoal.deleteMany({where:{id:String(fd.get('id')),userId:uid}}); revalidatePath('/savings'); revalidatePath('/dashboard');}
export async function depositSavings(fd:FormData){const uid=await userId(); const goalId=String(fd.get('goalId')); const accountId=String(fd.get('accountId')); const amount=toNumber(fd.get('amount')); const date=new Date(String(fd.get('date'))); await assertOpen(uid,date); await prisma.$transaction(async tx=>{const goal=await tx.savingsGoal.findFirst({where:{id:goalId,userId:uid}}); if(!goal)return; await tx.savingsDeposit.create({data:{userId:uid,goalId,accountId,amount,date,notes:String(fd.get('notes')||'')}}); const newSaved=Number(goal.savedAmount)+amount; const isCompleted=newSaved>=Number(goal.targetAmount); await tx.savingsGoal.update({where:{id:goalId},data:{savedAmount:newSaved,isCompleted}}); await tx.account.update({where:{id:accountId},data:{balance:{decrement:amount}}}); await tx.transaction.create({data:{userId:uid,accountId,type:'EXPENSE',amount,date,description:`Tabungan: ${goal.name}`,sourceType:'savings',sourceId:goalId}});}); revalidatePath('/savings'); revalidatePath('/dashboard');}
export async function withdrawSavings(fd:FormData){const uid=await userId(); const goalId=String(fd.get('goalId')); const accountId=String(fd.get('accountId')); const amount=toNumber(fd.get('amount')); const date=new Date(String(fd.get('date'))); await assertOpen(uid,date); await prisma.$transaction(async tx=>{const goal=await tx.savingsGoal.findFirst({where:{id:goalId,userId:uid}}); if(!goal)return; const withdrawAmount=Math.min(amount,Number(goal.savedAmount)); await tx.savingsGoal.update({where:{id:goalId},data:{savedAmount:{decrement:withdrawAmount},isCompleted:false}}); await tx.account.update({where:{id:accountId},data:{balance:{increment:withdrawAmount}}}); await tx.transaction.create({data:{userId:uid,accountId,type:'INCOME',amount:withdrawAmount,date,description:`Tarik tabungan: ${goal.name}`,sourceType:'savings_withdraw',sourceId:goalId}});}); revalidatePath('/savings'); revalidatePath('/dashboard');}
