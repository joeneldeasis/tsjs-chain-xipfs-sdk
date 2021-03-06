import {
  Account,
  Address,
  EncryptedMessage,
  Message,
  NetworkType,
  PlainMessage,
  PublicAccount,
  TransferTransaction
} from 'tsjs-xpx-chain-sdk';

import { BlockchainNetworkConnection } from '../connection/blockchain-network-connection';
import { Converter } from '../helper/converter';
import { ProximaxMessagePayloadModel } from '../model/proximax/message-payload-model';
import { AccountClient } from './client/catapult/account-client';

/**
 * The service class responsible for handling tasks that work with blockchain transaction messages
 */
export class BlockchainMessageService {
  private readonly networkType: NetworkType;
  private readonly accountClient: AccountClient;

  constructor(
    public readonly blockchainNetworkConnection: BlockchainNetworkConnection
  ) {
    this.accountClient = new AccountClient(blockchainNetworkConnection);
    this.networkType = Converter.getNemNetworkType(
      this.blockchainNetworkConnection.networkType
    );
  }

  /**
   * Create a transaction message
   * @param messagePayload the message payload
   * @param senderPrivateKey the private key of sender
   * @param recipientPublicKeyRaw an optional recipient public key (if different from signer)
   * @param recipientAddress the optional address (if different from signer)
   * @param useBlockchainSecureMessage the flag to indicate if to create secure message
   * @return the created transaction message
   */
  public async createMessage(
    messagePayload: ProximaxMessagePayloadModel,
    senderPrivateKey: string,
    useBlockchainSecureMessage: boolean,
    recipientPublicKeyRaw?: string,
    recipientAddress?: string
  ): Promise<Message> {
    if (messagePayload === null) {
      throw new Error('messagePayload is required');
    }

    const jsonPayload = JSON.stringify(messagePayload);
    if (useBlockchainSecureMessage) {
      const recipientPublicKey = PublicAccount.createFromPublicKey(recipientPublicKeyRaw!, this.networkType);
      //console.log(recipientAddress);
      return EncryptedMessage.create(
        jsonPayload,
        recipientPublicKey,
        senderPrivateKey
      );
    } else {
      return PlainMessage.create(jsonPayload);
    }
  }

  /**
   * Retrieves message payload from blockchain transaction
   * @param transferTransaction the blockchain transaction
   * @param accountPrivateKey the private key of either signer or recipient to read secure message
   * @return the message payload
   */
  public async getMessagePayload(
    transferTransaction: TransferTransaction,
    accountPrivateKey?: string
  ): Promise<string> {
    if (transferTransaction === null) {
      throw new Error(
        'accountPrivateKey is required to download a secure message'
      );
    }

    if (transferTransaction.message instanceof PlainMessage) {
      return transferTransaction.message.payload!;
    }

    if (transferTransaction.message instanceof EncryptedMessage) {
      if (!accountPrivateKey) {
        throw new Error('transferTransaction is required');
      }

      const account = Account.createFromPrivateKey(
        accountPrivateKey,
        this.networkType
      );

      const secureMessage = transferTransaction.message as EncryptedMessage;

           
      const publicKey =  await this.getTransactionOtherPartyPublicKey(
        account,
        transferTransaction
      );

      const publicAccount = PublicAccount.createFromPublicKey(publicKey, this.networkType);

      return EncryptedMessage.decrypt(
        secureMessage,
        accountPrivateKey,
        publicAccount
      ).payload;
    } else {
      throw new Error(
        `Download of message type ${
          transferTransaction.message.type
        } is not supported`
      );
    }
  }
  /*
  private async getRecipientPublicKey(
    senderPrivateKey: string,
    recipientPublicKey?: string,
    recipientAddress?: string
  ): Promise<string> {
    if (recipientPublicKey) {
      // use public key if available
      return recipientPublicKey;
    } else if (recipientAddress) {
      // use public key from address

      const senderPublicKey = Account.createFromPrivateKey(
        senderPrivateKey,
        this.networkType
      ).publicKey;
      if (
        this.isSenderPrivateKeySameWithRecipientAddress(
          senderPublicKey,
          recipientAddress
        )
      ) {
        return senderPublicKey;
      } else {
        return this.accountClient.getPublicKey(recipientAddress);
      }
    } else {
      // fallback to sender private key as default
      return Account.createFromPrivateKey(senderPrivateKey, this.networkType)
        .publicKey;
    }
  }
  
  private isSenderPrivateKeySameWithRecipientAddress(
    signerPublicKey: string,
    recipientAddress: string
  ): boolean {
    const senderAddress = Address.createFromPublicKey(
      signerPublicKey,
      this.networkType
    );
    return senderAddress.plain() === recipientAddress;
  }
 */
  private async getTransactionOtherPartyPublicKey(
    retrieveAccount: Account,
    transferTransaction: TransferTransaction
  ): Promise<string> {
    if (!transferTransaction.signer) {
      throw new Error('Unexpected missing signer on transfer transaction');
    }
    const senderAccount = transferTransaction.signer as PublicAccount;
    const recipientAddress = transferTransaction.recipient as Address;
    const retrieverAddress = retrieveAccount.address;
    
    if (retrieverAddress.plain() === recipientAddress.plain()) {
      // retriever is the recipient, use sender public key
      return senderAccount.publicKey;
    } else if (retrieverAddress.plain() === senderAccount.address.plain()) {
      // retriever is the sender, use recipient public key
      return this.accountClient.getPublicKey(recipientAddress.plain());
    } else {
      throw new Error(
        'accountPrivateKey cannot be used to read secure transaction message'
      );
    }
  }
}
