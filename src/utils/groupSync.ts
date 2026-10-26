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

// Track whether a backend Express server is reachable
let isBackendAvailable: boolean | null = null;
let lastCheckTime = 0;

// BroadcastChannel for cross-tab local communication on static hosting (GitHub Pages)
const getChannel = (groupId: string): BroadcastChannel | null => {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      return new BroadcastChannel(`quadrat_group_${groupId.trim()}`);
    } catch {
      return null;
    }
  }
  return null;
};

// Local storage key for fallback/offline group data
const getLocalGroupKey = (groupId: string) => `quadrat_static_group_${groupId.trim()}`;

function getLocalGroupData(groupId: string): GroupSyncData {
  try {
    const raw = localStorage.getItem(getLocalGroupKey(groupId));
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    groupId,
    teamSize: 5,
    quadrats: {},
  };
}

function saveLocalGroupData(groupId: string, data: GroupSyncData) {
  try {
    localStorage.setItem(getLocalGroupKey(groupId), JSON.stringify(data));
  } catch {
    // ignore
  }
}

export async function fetchGroupData(groupId: string): Promise<GroupSyncData | null> {
  if (!groupId.trim()) return null;

  // On static hosting (GitHub Pages), if backend was confirmed unavailable within the last 60 seconds, use browser local storage
  const now = Date.now();
  if (isBackendAvailable === false && now - lastCheckTime < 60000) {
    return getLocalGroupData(groupId);
  }

  try {
    const res = await fetch(`/api/groups/${encodeURIComponent(groupId.trim())}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      isBackendAvailable = false;
      lastCheckTime = now;
      return getLocalGroupData(groupId);
    }
    const data = await res.json();
    isBackendAvailable = true;
    lastCheckTime = now;
    if (data.group) {
      // Sync to local storage as well for backup
      saveLocalGroupData(groupId, data.group);
      return data.group;
    }
    return getLocalGroupData(groupId);
  } catch {
    isBackendAvailable = false;
    lastCheckTime = now;
    return getLocalGroupData(groupId);
  }
}

export async function saveQuadratToGroup(
  groupId: string,
  inspection: QuadratInspection,
  studentName: string
): Promise<boolean> {
  if (!groupId.trim()) return false;

  const record: RemoteQuadratRecord = {
    quadratId: inspection.quadratId,
    studentName: studentName.trim() || `학생 #${inspection.quadratId}`,
    speciesCounts: inspection.speciesCounts,
    speciesCovers: inspection.speciesCovers,
    updatedAt: Date.now(),
  };

  // 1. Always update browser local state first (works 100% statically on GitHub Pages)
  const localData = getLocalGroupData(groupId);
  localData.quadrats[inspection.quadratId] = record;
  saveLocalGroupData(groupId, localData);

  // Broadcast to other open tabs in the same browser if available
  try {
    const ch = getChannel(groupId);
    ch?.postMessage({ type: 'QUADRAT_UPDATE', groupId, record });
    ch?.close();
  } catch {
    // ignore
  }

  // 2. If backend is available (or untested), sync with Express server
  if (isBackendAvailable !== false) {
    try {
      const res = await fetch(`/api/groups/${encodeURIComponent(groupId.trim())}/quadrat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quadratId: inspection.quadratId,
          studentName: record.studentName,
          speciesCounts: inspection.speciesCounts,
          speciesCovers: inspection.speciesCovers,
        }),
      });
      if (!res.ok) {
        isBackendAvailable = false;
        lastCheckTime = Date.now();
      } else {
        isBackendAvailable = true;
      }
    } catch {
      isBackendAvailable = false;
      lastCheckTime = Date.now();
    }
  }

  return true;
}

export async function initGroupConfig(groupId: string, teamSize: TeamSize): Promise<boolean> {
  if (!groupId.trim()) return false;

  const localData = getLocalGroupData(groupId);
  localData.teamSize = teamSize;
  saveLocalGroupData(groupId, localData);

  if (isBackendAvailable !== false) {
    try {
      const res = await fetch(`/api/groups/${encodeURIComponent(groupId.trim())}/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamSize }),
      });
      if (!res.ok) {
        isBackendAvailable = false;
      }
    } catch {
      isBackendAvailable = false;
    }
  }
  return true;
}

export async function resetGroupData(groupId: string): Promise<boolean> {
  if (!groupId.trim()) return false;

  const localData = getLocalGroupData(groupId);
  localData.quadrats = {};
  saveLocalGroupData(groupId, localData);

  if (isBackendAvailable !== false) {
    try {
      await fetch(`/api/groups/${encodeURIComponent(groupId.trim())}/reset`, {
        method: 'POST',
      });
    } catch {
      isBackendAvailable = false;
    }
  }
  return true;
}
