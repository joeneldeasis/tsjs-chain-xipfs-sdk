import { TransferTransaction } from 'nem2-sdk';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { ConnectionConfig } from '../connection/connection-config';
import { ProximaxMessagePayloadModel } from '../model/proximax/message-payload-model';
import { PrivacyStrategy } from '../privacy/privacy';
import { BlockchainTransactionService } from '../service/blockchain-transaction-service';
import { RetrieveProximaxDataService } from '../service/retrieve-proximax.data-service';
import { DownloadParameter } from './download-parameter';
import { DownloadResult } from './download-result';
import { DownloadResultData } from './download-result-data';
export class Downloader {
  private blockchainTransactionService: BlockchainTransactionService;
  private retrieveProximaxDataService: RetrieveProximaxDataService;

  constructor(connectionConfig: ConnectionConfig) {
    this.blockchainTransactionService = new BlockchainTransactionService(
      connectionConfig.blockchainNetworkConnection
    );
    this.retrieveProximaxDataService = new RetrieveProximaxDataService(
      connectionConfig
    );
  }

  public download(param: DownloadParameter): Promise<DownloadResult> {
    return this.doDownload(param).toPromise();
  }

  public doDownload(param: DownloadParameter): Observable<DownloadResult> {
    const downloadResult$ = this.blockchainTransactionService
      .getTransferTransaction(param.transactionHash)
      .pipe(
        map(transferedTransaction => {
          return this.getMessagePayload(
            transferedTransaction,
            param.accountPrivateKey!
          );
        }),
        map(messagePayload =>
          this.createCompleteDownloadResult(
            messagePayload,
            () => {
              this.getStream(
                '',
                param.privacyStrategy!,
                param.validateDigest!,
                '',
                messagePayload
              );
            },
            param.transactionHash
          )
        ),
        first()
      );

    return downloadResult$;
  }

  public createCompleteDownloadResult(
    messagePayloadModel: ProximaxMessagePayloadModel,
    stream: any,
    transactionhash: string
  ): DownloadResult {
    const data = messagePayloadModel.data;

    return new DownloadResult(
      transactionhash,
      messagePayloadModel.privacyType,
      messagePayloadModel.version,
      new DownloadResultData(
        data.dataHash,
        data.timestamp!,
        stream,
        data.digest,
        data.description,
        data.contentType,
        data.name,
        data.metadata
      )
    );
  }

  /*
    public download(param: DownloadParameter): Observable<DownloadResult> {
        return this.blockchainTransactionService
            .getTransferTransaction(param.transactionHash)
            .pipe(
                map(transferedTransaction =>
                    this.getMessagePayload(
                        transferedTransaction,
                        param.accountPrivateKey!
                    )
                ),
                switchMap(messagePayloadModel => {
                    // console.log(messagePayloadModel);
                    return this.retrieveProximaxDataService
                        .getStream(messagePayloadModel.data!)
                        .pipe(
                            map(data => {
                                // console.log(data);
                                return new DownloadResult(
                                    param.transactionHash,
                                    messagePayloadModel.privacyType,
                                    messagePayloadModel.version!,
                                    data
                                );
                            })
                        );
                })
            );
    }*/

  /**
   * Gets the proximax message payload
   * @param transferTransaction the transfer transaction
   * @param accountPrivateKey the account private key
   */
  private getMessagePayload(
    transferTransaction: TransferTransaction,
    accountPrivateKey: string
  ): ProximaxMessagePayloadModel {
    // TODO: handle secure message
    console.log(accountPrivateKey);
    const payload = transferTransaction.message.payload;
    const messagePayloadModel: ProximaxMessagePayloadModel = JSON.parse(
      payload
    );

    return messagePayloadModel;
  }

  private getStream(
    dataHash: string,
    privacyStrategy: PrivacyStrategy,
    validateDigest: boolean,
    digest: string,
    messagePayload?: ProximaxMessagePayloadModel
  ) {
    let resolvedDataHash = dataHash;
    let resolvedDigest = digest;
    let resolvedContentType;

    if (messagePayload) {
      resolvedDataHash = messagePayload.data.dataHash;
      resolvedDigest = messagePayload.data.digest!;
      resolvedContentType = messagePayload.data.contentType;
    }
    return this.retrieveProximaxDataService.getStream(
      resolvedDataHash,
      privacyStrategy,
      validateDigest,
      resolvedDigest,
      resolvedContentType
    );
  }
}