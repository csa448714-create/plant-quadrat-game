import { QuadratInspection, TeamSize } from '../types/ecology';

export interface RemoteQuadratRecord {
  quadratId: number;
  studentName: string;
  speciesCounts: Record<string, number>;
  speciesCovers: Record<string, number>;
  updatedAt: number;
}

export interface GroupSyncData {
  groupId: string;
  teamSize: TeamSize;
  quadrats: Record<number, RemoteQuadratRecord>;
}

export async function fetchGroupData(groupId: string): Promise<GroupSyncData | null> {
  if (!groupId.trim()) return null;
  try {
    const res = await fetch(`/api/groups/${encodeURIComponent(groupId.trim())}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.group || null;
  } catch (err) {
    console.warn('Network fetch error for group:', err);
    return null;
  }
}

export async function saveQuadratToGroup(
  groupId: string,
  inspection: QuadratInspection,
  studentName: string
): Promise<boolean> {
  if (!groupId.trim()) return false;
  try {
    const res = await fetch(`/api/groups/${encodeURIComponent(groupId.trim())}/quadrat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quadratId: inspection.quadratId,
        studentName: studentName.trim() || `학생 #${inspection.quadratId}`,
        speciesCounts: inspection.speciesCounts,
        speciesCovers: inspection.speciesCovers,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Network save error for quadrat:', err);
    return false;
  }
}

export async function initGroupConfig(groupId: string, teamSize: TeamSize): Promise<boolean> {
  if (!groupId.trim()) return false;
  try {
    const res = await fetch(`/api/groups/${encodeURIComponent(groupId.trim())}/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamSize }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function resetGroupData(groupId: string): Promise<boolean> {
  if (!groupId.trim()) return false;
  try {
    const res = await fetch(`/api/groups/${encodeURIComponent(groupId.trim())}/reset`, {
      method: 'POST',
    });
    return res.ok;
  } catch {
    return false;
  }
}
