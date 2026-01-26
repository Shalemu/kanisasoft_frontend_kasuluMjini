// edit-member.tsx
'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import EditMemberModal from '@/pages/admin/washirika/components/RekebishaWashirika';
import { apiFetch } from '@/lib/api';

export default function EditMemberPage() {
  const router = useRouter();
  const { id } = router.query;

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    apiFetch(`/members/${id}`)
      .then(res => setMember(res.data))
      .catch(err => {
        alert('⛔ Imeshindikana kupakua mshirika');
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Inapakia taarifa...</p>;
  if (!member) return <p>Mshirika hakupatikani.</p>;

  return (
    <EditMemberModal
      member={member}
      isOpen={true}
      onClose={() => router.back()}
      onUpdate={() => router.back()}
    />
  );
}
