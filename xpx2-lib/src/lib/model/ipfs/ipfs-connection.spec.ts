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
import { IpfsInfo } from '../../config/config.spec';
import { IpfsConnection } from './ipfs-connection';

describe('IpfsConnection', () => {
  it('should create new ipfs connection with host, port and protocol', () => {
    const multiAddress = IpfsInfo.multiaddress;
    const port = IpfsInfo.port;
    const options = IpfsInfo.options;

    const connection = new IpfsConnection(multiAddress, port, options);
    connection.validate();

    expect(connection.host).to.be.equal(multiAddress);
    expect(connection.port).to.be.equal(port);
    expect(connection.options).to.be.equal(options);
    expect(connection.getAPI() != null).to.be.true;
  });

  it('should create new ipfs connection with multiaddress', () => {
    const multiAddress = '/ip4/127.0.0.1/tcp/5001';

    const connection = new IpfsConnection(multiAddress);
    connection.validate();
    expect(connection.host).to.be.equal(multiAddress);
    expect(connection.getAPI() != null).to.be.true;
  });

  it('should throw error if host or multiaddress is invalid', () => {
    const multiAddress = '';
    expect(() => {
      const connection = new IpfsConnection(multiAddress);
      connection.validate();
    }).to.throw();
  });
});
