export type TResult = {
  date: string;
  projectName: string;
  coldStartMemory: number;
  warmStartMemory: number;
  coldEndMemory: number;
  warmEndMemory: number;
  coldStartTime: number;
  coldEndTime: number;
  warmStartTime: number;
  warmEndTime: number;
  totalTime: number;
  isTurbo: boolean;
  nextVersion: string;
  coldResults: {
    [key: string]: number;
  };
  warmResults: {
    [key: string]: number;
  };
};

export const POSSIBLE_NEXT_PROCESSES = ["next-server", "start-server.js"];
