import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(__dirname, '..', 'data', 'userProfiles.json');

export interface UserProfile {
  id: string;
  name?: string;
  registeredAt: number;
  location?: string;
  timezone?: string;
  language?: string;
}


export async function loadProfiles(): Promise<Record<string, UserProfile>> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function saveProfiles(profiles: Record<string, UserProfile>) {
  await fs.writeFile(DATA_PATH, JSON.stringify(profiles, null, 2));
}

export async function upsertUserProfile(
  jid: string,
  newData: Partial<UserProfile>
): Promise<UserProfile> {
  const profiles = await loadProfiles();
  const existing = profiles[jid];

  if (!existing) {
    profiles[jid] = {
      id: jid,
      registeredAt: Date.now(),
      ...newData,
    };
  } else {
    profiles[jid] = { ...existing, ...newData };
  }

  await saveProfiles(profiles);
  return profiles[jid];
}

export async function getUserProfile(jid: string): Promise<UserProfile | null> {
  const profiles = await loadProfiles();
  return profiles[jid] || null;
}
