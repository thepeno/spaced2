import { db } from '@/lib/db';

export async function getSeqNo() {
  const seqNo = await db.metadataKv.get('seqNo');
  if (!seqNo) {
    await db.metadataKv.put({ key: 'seqNo', value: 0 });
    return 0;
  }
  return seqNo.value as number;
}

export async function setSeqNo(seqNo: number) {
  await db.metadataKv.put({ key: 'seqNo', value: seqNo });
}   
