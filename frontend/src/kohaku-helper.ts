import { SecretManager } from "@kohaku-eth/privacy-pools";

/**
 * Generates a deterministic precommitment using the Kohaku SDK SecretManager
 * and a mock keystore derived from the wallet account.
 */
export function generatePrecommitment(
  accountIndex: number,
  depositIndex: number,
  entrypointAddress: string,
  chainId: number
): { precommitment: string; nullifier: string; salt: string } {
  // A simple deterministic keystore for local development & hackathon demo
  const mockKeystore = {
    deriveAt: (path: string) => {
      let hash = BigInt(0);
      for (let i = 0; i < path.length; i++) {
        hash = (hash * BigInt(31) + BigInt(path.charCodeAt(i))) % BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
      }
      return hash;
    }
  };

  const sm = SecretManager({
    host: {
      keystore: mockKeystore
    } as any,
    accountIndex
  });

  const secrets = sm.getDepositSecrets({
    entrypointAddress: BigInt(entrypointAddress),
    chainId: BigInt(chainId),
    depositIndex
  });

  return {
    precommitment: secrets.precommitment.toString(),
    nullifier: secrets.nullifier.toString(),
    salt: secrets.salt.toString()
  };
}
