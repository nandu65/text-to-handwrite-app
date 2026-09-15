import { PersonalHandwritingProfile, PersonalGlyphLibrary } from '../types';

const STORAGE_KEY = 'handwrite_studio_personal_profiles';
const ACTIVE_PROFILE_KEY = 'handwrite_studio_active_profile_id';

export function getSavedProfiles(): PersonalHandwritingProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load profiles from localStorage:', err);
    return [];
  }
}

export function saveProfile(profile: PersonalHandwritingProfile): void {
  const existing = getSavedProfiles();
  const index = existing.findIndex((p) => p.id === profile.id);
  if (index >= 0) {
    existing[index] = profile;
  } else {
    existing.push(profile);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  setActiveProfileId(profile.id);
}

export function deleteProfile(profileId: string): void {
  const existing = getSavedProfiles().filter((p) => p.id !== profileId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  if (getActiveProfileId() === profileId) {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  }
}

export function getActiveProfileId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

export function setActiveProfileId(profileId: string | null): void {
  if (!profileId) {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  } else {
    localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  }
}

export function createProfileFromLibrary(
  name: string,
  library: PersonalGlyphLibrary,
  totalExtracted: number
): PersonalHandwritingProfile {
  return {
    id: `profile_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim() || 'My Personal Handwriting',
    createdDate: new Date().toLocaleDateString(),
    glyphs: library,
    totalExtracted,
    characterSpacingMultiplier: 1.0,
    wordSpacingMultiplier: 1.0,
    lineSpacingMultiplier: 1.0,
    baselineAdjustment: 0,
    previewSampleText: 'Hello world! This is my own personal handwriting.',
  };
}
