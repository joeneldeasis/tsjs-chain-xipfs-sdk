import { AccountHttp, Address } from 'proximax-nem2-sdk';
import { BlockchainNetworkConnection } from '../../../connection/blockchain-network-connection';

/**
 * The client class that directly interface with the blockchain's transaction APIs
 */
export class AccountClient {
  /**
   * The public key constant when it is not yet used to send transaction on catapult.
   */
  public static readonly PUBLIC_KEY_NOT_FOUND =
    '0000000000000000000000000000000000000000000000000000000000000000';

  private readonly accountHttp: AccountHttp;

  /**
   * Create instance of AccountClient
   * @param blockchainNetworkConnection the blockchain connection
   * @throws MalformedURLException exception when invalid blockchain URl
   */
  public constructor(
    public readonly blockchainNetworkConnection: BlockchainNetworkConnection
  ) {
    if (blockchainNetworkConnection === null) {
      throw new Error('blockchain network connection is required');
    }

    this.accountHttp = new AccountHttp(blockchainNetworkConnection.getApiUrl());
  }

  public async getPublicKey(address: string): Promise<string> {
    if (address === null || address.length <= 0) {
      throw new Error('address is required');
    }

    const accountInfo = await this.accountHttp
      .getAccountInfo(Address.createFromRawAddress(address))
      .toPromise();
    if (accountInfo.publicKey === AccountClient.PUBLIC_KEY_NOT_FOUND) {
      throw new Error(`Address ${address} has no public key yet on blockchain`);
    }

    return accountInfo.publicKey;
  }
}
