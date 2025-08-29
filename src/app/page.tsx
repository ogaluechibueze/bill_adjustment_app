import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
          <main className="max-w-5xl mx-auto p-6">
          <div className="card">
          <h1 className="text-2xl font-bold mb-2">Approval Workflow Starter</h1>
          <p className="mb-4 text-gray-600">CCRO → CCO → CAO → MD with Next.js + Prisma + MySQL</p>
          <Link className="btn-primary" href="/login">Go to Login</Link>
          </div>
          </main>
    
  );
}
