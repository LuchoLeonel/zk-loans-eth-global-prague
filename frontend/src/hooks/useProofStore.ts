import { create } from 'zustand';

type ProofStore = {
  emailProof: any | null;
  timeTravelProof: any | null;
  teleportProof: any | null;
  identityHash: string | null;

  setEmailProof: (proof: any) => void;
  setTimeTravelProof: (proof: any) => void;
  setTeleportProof: (proof: any) => void;
  setIdentityHash: (hash: string) => void;

  resetAll: () => void;
};

export const useProofStore = create<ProofStore>((set) => ({
  emailProof: null,
  timeTravelProof: null,
  teleportProof: null,
  identityHash: null,
  ZKCredential: null,

  setEmailProof: (proof) => set({ emailProof: proof }),
  setTimeTravelProof: (proof) => set({ timeTravelProof: proof }),
  setTeleportProof: (proof) => set({ teleportProof: proof }),
  setIdentityHash: (hash) => set({ identityHash: hash }),

  resetAll: () =>
    set({
      emailProof: null,
      timeTravelProof: null,
      teleportProof: null,
      identityHash: null,
    }),
}));