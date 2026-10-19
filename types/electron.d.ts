export {};

interface JudgeNameState {
  recentJudge: string;
  judgeNames: string[];
}

declare global {
  interface Window {
    electron?: {
      sync?: {
        status: () => Promise<unknown>;
        run: () => Promise<unknown>;
        migrate: () => Promise<unknown>;
        backup: () => Promise<unknown>;
        backups: () => Promise<unknown>;
        restore: (backupPath: string) => Promise<unknown>;
      };
      judgeName?: {
        getState: () => Promise<JudgeNameState>;
        save: (judgeName: string) => Promise<JudgeNameState>;
        clear: () => Promise<JudgeNameState>;
      };
    };
  }
}
