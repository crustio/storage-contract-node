import { CID } from 'multiformats/cid';
import { create } from 'ipfs-http-client'

export default class IpfsApi {
  private ipfsClient: any;

  async startIPFS() {
    this.ipfsClient = create();
  }

  async pinAdd(cid: string) {
    try {
      // Set timeout to 3 hours
      let options = {
        timeout: "10800s"
      }
      await this.ipfsClient.pin.add(CID.parse(cid), options);
    } catch (e: any) {
      throw new Error(`Could not add data, error info:${e.message}`);
    }
  }
}
