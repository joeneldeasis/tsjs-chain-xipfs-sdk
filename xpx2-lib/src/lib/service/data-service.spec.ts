import { expect } from 'chai';
import { IpfsConnection } from '../connection/ipfs-connection';
import { PrivacyStrategyType } from '../model/privacy/privacy-strategy-type';
import { ProximaxDataFile } from '../model/proximax/data-file';
import { DataService } from './data-service';

describe('DataService', () => {
  const ipfsConnection = new IpfsConnection('localhost', '5001');
  const dataService = new DataService(ipfsConnection);

  it('should create proximax data file when input is string or text', async () => {
    // setup
    const content = 'Proximax P2P storage ';

    const contentType = 'text/plain';
    const privacyType = PrivacyStrategyType.PLAIN;
    const expectedHash = 'QmRLSoo71sRDYoqcdpEsivXAcSvEx8n526U8rX94LhrvQX';

    // test
    await dataService
      .createProximaxDataFile(content, contentType, privacyType)
      .subscribe(
        response => {
          console.log(response);
          expect(response).to.be.exist;
          expect(response.dataHash).to.be.equal(expectedHash);
          expect(response.contentType).to.be.equal(contentType);
          expect(response.privacyType).to.be.equal(privacyType);
        },
        error => {
          console.log(error);
          expect(error).to.not.be.exist;
        }
      );
  });

  it('should create proximax data payload', async () => {
    // setup
    const name = 'Test 123 ';
    const description = 'Test 123';
    const metadata = new Map<any, any>();
    metadata.set('author', 'Proximax');

    const datalist = [];
    datalist.push(
      new ProximaxDataFile(
        'QmSV5y3v9aWhJivY6YEphkt2z69aXRem8nRmVH5s8Xuosw',
        'text/plain',
        PrivacyStrategyType.PLAIN
      )
    );

    // test
    await dataService
      .createProximaxDataPayload(
        name,
        description,
        metadata,
        datalist,
        Date.now()
      )
      .subscribe(
        response => {
          // console.log(response);
          expect(response).to.be.exist;
        },
        error => {
          // console.log(error);
          expect(error).to.not.be.exist;
        }
      );
  });
});