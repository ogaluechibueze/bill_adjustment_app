import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CustomerTable from '@/components/CustomerTable';


export default async function Page() {
const session = await getServerSession(authOptions);
if (!session || (session as any).user.role !== 'MD') return <div className="card">MD Dashboard</div>;
const items = await prisma.customer.findMany({ where: { approvalStage: 'MD', status: 'Pending' }, orderBy: { createdAt: 'desc' } });
return <CustomerTable data={items} role="MD" />;
}