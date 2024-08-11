import * as borsh from "borsh";
import js_sha256 from "js-sha256";
import { PublicKey } from "@near-js/crypto";

import { SignedMessageNEP0413, SignMessageOptionsNEP0413 } from "./near";

export class AuthPayload implements SignMessageOptionsNEP0413 {
  readonly message: string;
  readonly recipient: string;
  readonly nonce: number[];
  readonly callbackUrl?: string | undefined;
  readonly tag: number;

  constructor({ message, nonce, recipient }: SignMessageOptionsNEP0413) {
    this.tag = 2147484061;
    this.message = message;
    this.nonce = nonce;
    this.recipient = recipient;
  }
}

export const authPayloadSchema: borsh.Schema = {
  struct: {
    tag: "u32",
    message: "string",
    nonce: { array: { type: "u8", len: 32 } },
    recipient: "string",
    callbackUrl: { option: "string" },
  },
};

export function verifySignature(request: SignMessageOptionsNEP0413, result: SignedMessageNEP0413) {
  // Reconstruct the payload that was **actually signed**
  const payload = new AuthPayload(request);
  const borsh_payload = borsh.serialize(authPayloadSchema, payload);
  const to_sign = Uint8Array.from(js_sha256.sha256.array(borsh_payload));

  // Reconstruct the signature from the parameter given in the URL
  let real_signature = new Uint8Array(Buffer.from(result.signature, "base64"));

  // Use the public Key to verify that the private-counterpart signed the message
  const myPK = PublicKey.from(result.publicKey);
  return myPK.verify(to_sign, real_signature);
}
