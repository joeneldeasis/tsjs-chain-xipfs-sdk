/*
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

import { expect } from 'chai';
import 'mocha';
import { RecipientAccount, SenderAccount } from '../../config/config.spec';
import { SecureMessage } from './secure-message';

describe('SecureMessage', () => {
  it('should create SecureMessage', () => {
    const message = 'Proximax P2P storage';
    const securedMessage = SecureMessage.encrypt(
      message,
      SenderAccount.privateKey,
      RecipientAccount.publicKey
    );
    expect(securedMessage.type).to.be.equal(2);
    expect(securedMessage.payload).to.be.not.equal(message);
  });

  it('should create SecureMessage and convert to Plain Message', () => {
    const message = 'Proximax P2P storage';
    const securedMessage = SecureMessage.encrypt(
      message,
      SenderAccount.privateKey,
      RecipientAccount.publicKey
    );
    expect(securedMessage.type).to.be.equal(2);
    expect(securedMessage.payload).to.be.not.equal(message);

    const plainMessage = SecureMessage.decrypt(
      securedMessage.payload,
      RecipientAccount.privateKey,
      SenderAccount.publicKey
    );
    expect(plainMessage.payload).to.be.equal(message);
  });
});