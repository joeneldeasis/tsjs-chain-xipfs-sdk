import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import { BlockchainNetworkConnection } from '../../src/lib/connection/blockchain-network-connection';
import { ConnectionConfig } from '../../src/lib/connection/connection-config';
import { IpfsConnection } from '../../src/lib/connection/ipfs-connection';
import { Protocol } from '../../src/lib/connection/protocol';
import { BlockchainNetworkType } from '../../src/lib/model/blockchain/blockchain-network-type';
import { UploadParameter } from '../../src/lib/upload/upload-parameter';
import { Uploader } from '../../src/lib/upload/uploader';
import {
  BlockchainInfo,
  IpfsInfo,
  SenderAccount
} from '../integrationtestconfig';
import { TestDataRepository } from '../testdatarepository';

chai.use(chaiAsPromised);

describe('Uploader integration tests for content type detection', () => {
  const connectionConfig = ConnectionConfig.createWithLocalIpfsConnection(
    new BlockchainNetworkConnection(
      BlockchainNetworkType.MIJIN_TEST,
      BlockchainInfo.apiHost,
      BlockchainInfo.apiPort,
      Protocol.HTTP
    ),
    new IpfsConnection(IpfsInfo.host, IpfsInfo.port)
  );

  const uploader = new Uploader(connectionConfig);

  // TODO implement content type detection
  // it('should upload with enabled detect content type', async () => {
  //   const param = UploadParameter.createForStringUpload(
  //     'Proximax P2P Uploader for string test',
  //     SenderAccount.privateKey
  //   )
  //     .withDetectContentType(true)
  //     .build();
  //
  //   const result = await uploader.upload(param);
  //
  //   expect(result.transactionHash.length > 0).to.be.true;
  //   expect(result.data.dataHash.length > 0).to.be.true;
  //   expect(result.data.contentType).to.be.equal('text/plain');
  //
  // TestDataRepository.logAndSaveResult(result, "shouldUploadWithEnabledDetectContentType");
  // }).timeout(10000);

  it('should upload with disabled detect content type', async () => {
    const param = UploadParameter.createForStringUpload(
      'Proximax P2P Uploader with nem keys privacy',
      SenderAccount.privateKey
    )
      .withDetectContentType(false)
      .build();

    const result = await uploader.upload(param);

    expect(result.transactionHash.length > 0).to.be.true;
    expect(result.data.dataHash.length > 0).to.be.true;
    expect(
      result.data.contentType !== undefined &&
        result.data.contentType.length > 0
    ).to.be.false;

    TestDataRepository.logAndSaveResult(
      result,
      'shouldUploadWithDisabledDetectContentType'
    );
  }).timeout(10000);
});
