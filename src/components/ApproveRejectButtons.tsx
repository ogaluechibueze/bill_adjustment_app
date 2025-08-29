'use client';


export default function ApproveRejectButtons({ id, role }: { id: number; role: string }) {
async function act(action: 'approve'|'reject') {
const url = action === 'approve' ? `/api/customers/${id}/approve` : `/api/customers/${id}`;
const res = await fetch(url, {
method: action === 'approve' ? 'PATCH' : 'DELETE',
});
if (res.ok) location.reload();
else alert('Action failed');
}


return (
<div className="flex gap-2">
<button className="btn-primary" onClick={() => act('approve')}>Approve</button>
<button className="btn-ghost" onClick={() => act('reject')}>Reject</button>
</div>
);
}