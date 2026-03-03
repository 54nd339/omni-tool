export type SshAlgorithm = 'ed25519' | 'rsa-2048' | 'rsa-4096';

interface GeneratedSshKeyPair {
  publicKey: string;
  privateKey: string;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let index = 0; index < bytes.length; index++) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function parseRsaSpki(der: Uint8Array): { n: Uint8Array; e: Uint8Array } {
  let position = 0;

  function readTag() {
    return der[position++];
  }

  function readLength(): number {
    let len = der[position++];
    if (len & 0x80) {
      const numBytes = len & 0x7f;
      len = 0;
      for (let index = 0; index < numBytes; index++) {
        len = (len << 8) | der[position++];
      }
    }
    return len;
  }

  function readSequence() {
    readTag();
    readLength();
  }

  function readBytes(): Uint8Array {
    readTag();
    const len = readLength();
    const data = der.slice(position, position + len);
    position += len;
    return data;
  }

  readSequence();
  readSequence();
  readBytes();
  if (position < der.length && der[position] === 0x05) {
    readTag();
    readLength();
  }

  readTag();
  readLength();
  position++;

  readSequence();
  const n = readBytes();
  const e = readBytes();

  return {
    n: n[0] === 0 ? n.slice(1) : n,
    e: e[0] === 0 ? e.slice(1) : e,
  };
}

function encodeSSHString(data: Uint8Array): Uint8Array {
  const buf = new Uint8Array(4 + data.length);
  new DataView(buf.buffer).setUint32(0, data.length);
  buf.set(data, 4);
  return buf;
}

function encodeSSHMpint(data: Uint8Array): Uint8Array {
  const needsPad = data[0] & 0x80;
  const len = data.length + (needsPad ? 1 : 0);
  const buf = new Uint8Array(4 + len);
  new DataView(buf.buffer).setUint32(0, len);
  buf.set(data, needsPad ? 5 : 4);
  return buf;
}

function encodeOpenSSHPublicKey(algorithm: SshAlgorithm, publicKeyDer: ArrayBuffer): string {
  const encoder = new TextEncoder();
  const publicKeyBytes = new Uint8Array(publicKeyDer);

  if (algorithm === 'ed25519') {
    const rawKey = publicKeyBytes.slice(-32);
    const keyType = encoder.encode('ssh-ed25519');
    const buf = new Uint8Array(4 + keyType.length + 4 + rawKey.length);
    const view = new DataView(buf.buffer);
    let offset = 0;

    view.setUint32(offset, keyType.length);
    offset += 4;
    buf.set(keyType, offset);
    offset += keyType.length;
    view.setUint32(offset, rawKey.length);
    offset += 4;
    buf.set(rawKey, offset);

    return `ssh-ed25519 ${arrayBufferToBase64(buf.buffer)}`;
  }

  const keyType = encoder.encode('ssh-rsa');
  const { n, e } = parseRsaSpki(publicKeyBytes);

  const parts = [encodeSSHString(keyType), encodeSSHMpint(e), encodeSSHMpint(n)];
  const totalLen = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return `ssh-rsa ${arrayBufferToBase64(result.buffer)}`;
}

function wrapPem(label: string, der: ArrayBuffer): string {
  const base64 = arrayBufferToBase64(der);
  const lines = base64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
}

export async function generateSshKeyPair(
  algorithm: SshAlgorithm,
  comment: string,
): Promise<GeneratedSshKeyPair> {
  if (algorithm === 'ed25519') {
    const keyPair = await crypto.subtle.generateKey('Ed25519', true, [
      'sign',
      'verify',
    ]);
    const pubDer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privDer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    const publicKey = `${encodeOpenSSHPublicKey('ed25519', pubDer)} ${comment}`;
    const privateKey = wrapPem('PRIVATE KEY', privDer);
    return { publicKey, privateKey };
  }

  const bits = algorithm === 'rsa-2048' ? 2048 : 4096;
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: bits,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  );
  const pubDer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privDer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const publicKey = `${encodeOpenSSHPublicKey(algorithm, pubDer)} ${comment}`;
  const privateKey = wrapPem('PRIVATE KEY', privDer);
  return { publicKey, privateKey };
}