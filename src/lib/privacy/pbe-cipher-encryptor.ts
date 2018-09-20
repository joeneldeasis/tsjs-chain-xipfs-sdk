import { Converter } from '../helper/converter';
/**
 * Copyright 2018 ProximaX Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export class PBECipherEncryptor {
  // random salt
  private saltLength = 32;

  // initialise vector
  private ivLength = 16;

  // The secret hash
  private secret: ArrayBuffer;

  /**
   * SecuredCipher constructor
   * @param secret the secret
   */
  constructor(secret: ArrayBuffer) {
    this.secret = secret;
  }

  /**
   * Encrypts data
   * @param data the data to be encrypted
   */
  public async encrypt(data: ArrayBuffer) {
    const salt = window.crypto.getRandomValues(new Uint8Array(this.saltLength));
    const iv = window.crypto.getRandomValues(new Uint8Array(this.ivLength));
    
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      this.secret,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // console.log('iv ' + iv);
    // console.log('salt ' + salt);
    // console.log(baseKey);

    const params = {
      hash: 'SHA-256',
      iterations: 65536,
      name: 'PBKDF2',
      salt
    };

    const key = await window.crypto.subtle.deriveKey(
      params,
      baseKey,
      { name: 'AES-GCM', length: 128 },
      false,
      ['encrypt', 'decrypt']
    );

    // console.log(key);

    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    console.log(cipherBuffer);

    const finalCipher = Converter.concatenate(
      Uint8Array,
      salt,
      iv,
      new Uint8Array(cipherBuffer)
    );
   
    return finalCipher.buffer;
  }

  /**
   * Decrypts data
   * @param data the encrypted data
   * @returns Promise<string>
   */
  public async decrypt(data: ArrayBuffer) {
    const dataArray = new Uint8Array(data);
    const salt = dataArray.slice(0, this.saltLength);
    const iv = dataArray.slice(this.saltLength, this.saltLength + this.ivLength);
    const encryptedCipher = dataArray.slice(
      this.saltLength + this.ivLength,
      data.byteLength
    );

   // console.log(salt);
   // console.log(iv);
   // console.log(encryptedCipher);

    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      this.secret,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const params = {
      hash: 'SHA-256',
      iterations: 65536,
      name: 'PBKDF2',
      salt
    };

    const key = await window.crypto.subtle.deriveKey(
      params,
      baseKey,
      { name: 'AES-GCM', length: 128 },
      false,
      ['encrypt', 'decrypt']
    );

    const decryptedCipher = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedCipher
    );

    return decryptedCipher;
  }

}