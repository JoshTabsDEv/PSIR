// Browser-side persistence for the "recent judge" convenience feature.
// Mirrors the API of the former Electron preferences store (getState / save / clear)
// using localStorage, so the form components stay platform-agnostic.

const STORAGE_KEY = 'psir:judge-names';

export interface JudgeNameState {
  recentJudge: string;
  judgeNames: string[];
}

const EMPTY_STATE: JudgeNameState = { recentJudge: '', judgeNames: [] };

export function normalizeJudgeName(judgeName: string | null | undefined): string {
  if (typeof judgeName !== 'string') return '';
  return judgeName.trim().replace(/\s+/g, ' ');
}

export function dedupeAndSortJudgeNames(judgeNames: string[]): string[] {
  const uniqueNames = new Map<string, string>();

  for (const judgeName of judgeNames) {
    const normalizedJudgeName = normalizeJudgeName(judgeName);
    if (!normalizedJudgeName) continue;

    uniqueNames.set(normalizedJudgeName.toLowerCase(), normalizedJudgeName);
  }

  return Array.from(uniqueNames.values()).sort((left, right) =>
    left.localeCompare(right, undefined, { sensitivity: 'base' })
  );
}

function readState(): JudgeNameState {
  if (typeof window === 'undefined') return EMPTY_STATE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;

    const parsed = JSON.parse(raw) as Partial<JudgeNameState>;
    return {
      recentJudge: normalizeJudgeName(parsed.recentJudge),
      judgeNames: dedupeAndSortJudgeNames(Array.isArray(parsed.judgeNames) ? parsed.judgeNames : []),
    };
  } catch {
    return EMPTY_STATE;
  }
}

function writeState(state: JudgeNameState): JudgeNameState {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  return state;
}

export const judgeNameStore = {
  getState(): JudgeNameState {
    return readState();
  },

  save(judgeName: string): JudgeNameState {
    const normalizedJudgeName = normalizeJudgeName(judgeName);
    const current = readState();
    return writeState({
      recentJudge: normalizedJudgeName,
      judgeNames: dedupeAndSortJudgeNames([...current.judgeNames, normalizedJudgeName]),
    });
  },

  clear(): JudgeNameState {
    const current = readState();
    return writeState({ recentJudge: '', judgeNames: current.judgeNames });
  },
};
