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
import { StringParameterData } from './string-parameter-data';
import { UploadParameter } from './upload-parameter';
import { UploadParameterData } from './upload-parameter-data';

describe('UploadParameter', () => {
  it('should create upload parameter data', () => {
    const name = 'Proximax Test';
    const description = 'Proximax description';
    const contentType = 'text/plain';
    const metadata = new Map<string, string>();
    metadata.set('Author', 'Proximax');
    const uploadParameterData = StringParameterData.create(
      'Test string',
      'utf8',
      name,
      description,
      contentType,
      metadata
    );
    expect(uploadParameterData).to.be.a.instanceof(UploadParameterData);

    const uploadParameter = UploadParameter.createForStringUpload(
      uploadParameterData,
      'test'
    )
      .withRecipientPublicKey('test')
      .withRecipientAddress('test')
      .withPlainPrivacy()
      .withTransactionDeadline(1)
      .withUseBlockchainSecureMessage(false)
      .withDetectContentType(false)
      .build();

    expect(uploadParameter).to.be.a.instanceof(UploadParameter);
  });
});
