import { bech32 } from 'bech32';
import BigNumber from 'bignumber.js';
import { logger } from './logger';
import { StorageEvent } from '../types/event';

const paramSpec = {
  caller: { start: 0, end: 32 },
  node: { start: 32, end: 64 },
  cid: { start: 68, end: 114 },
};

export default function parseStorageEvent(base64String: string): StorageEvent {
  const buf = Buffer.from(base64String, 'base64');
  if (buf.length < 129) {
    throw new Error(`reqiure event buffer length should >= 129, got ${buf.length}`);
  }

  let res: StorageEvent = {
    caller: "",
    node: "",
    cid: "",
    token: "",
    price: new BigNumber(0),
    size: new BigNumber(0),
  }
  res.caller = bech32AddressFromBuffer(buf.subarray(paramSpec.caller.start, paramSpec.caller.end));
  res.node = bech32AddressFromBuffer(buf.subarray(paramSpec.node.start, paramSpec.node.end));
  res.cid = stringFromBuffer(buf.subarray(paramSpec.cid.start, paramSpec.cid.end));
  const { token, pos } = findTokenIdentifier(buf, paramSpec.cid.end + 4);
  res.token = token;
  const { price, size } = findPriceAndSize(buf, pos);
  res.price = price;
  res.size = size;
  return res;
}

const findPriceAndSize = (buf: Buffer, pos: number) => {
  const sizeStartIndex = buf.length - 8;
  const priceStartIndex = pos + 4;
  const size = bigNumberFromBuffer(buf.subarray(sizeStartIndex)); 
  const price = bigNumberFromBuffer(buf.subarray(priceStartIndex, sizeStartIndex));
  return {
    price: price,
    size: size
  }
}

const findTokenIdentifier = (buf: Buffer, pos: number) => {
  let zeroNum = 0;
  let start = pos;
  let end = pos;
  for (; end < buf.length; end++) {
    if (buf[end] === 0x00) {
      if (++zeroNum === 3) {
        break;
      }
    } else {
      zeroNum = 0;
    }
  }
  if (end >= buf.length) {
    throw new Error("Find token identifier position failed!");
  }
  end = end - zeroNum + 1;
  return {
    token: stringFromBuffer(buf.subarray(start, end)),
    pos: end
  }
}

const bigNumberFromBuffer = (buf: Buffer): BigNumber => {
  try {
    const hex = buf.toString('hex').trim();
    return new BigNumber(hex, 16);
  } catch(e: any) {
    throw new Error(`parse event error: get bignumber failed, error message:${e}`);
  }
  return new BigNumber(0);
}

const stringFromBuffer = (buf: Buffer): string => {
  try {
    //const decoded = Buffer.from(String(part), 'hex').toString('utf8').trim();
    const decoded = buf.toString('utf8').trim();
    if (!isUtf8(decoded)) {
      const bn = new BigNumber(decoded, 16);
      return bn.toString(10);
    } else {
      return decoded;
    }
  } catch(e:any) {
    throw new Error(`parse event error: get cid failed, error message:${e}`);
  }
  return "";
}

const bech32AddressFromBuffer = (buf: Buffer): string => {
  try {
    const bech32Encoded = bech32Encode(buf);
    if (addressIsBech32(bech32Encoded)) {
      return bech32Encoded;
    }
  } catch(e:any) {
    throw new Error(`parse event error: get bech32 address failed, error massge:${e}`);
  }
  return "";
}

const addressIsBech32 = (destinationAddress = '') => {
  const isValidBach = !(
    !destinationAddress ||
    !destinationAddress.startsWith('erd') ||
    destinationAddress.length !== 62 ||
    /^\w+$/.test(destinationAddress) !== true
  );
  return isValidBach;
}

const bech32Encode = (buf: Buffer) => {
  //const words = bech32.toWords(Buffer.from(publicKey, 'hex'));
  const words = bech32.toWords(buf);
  return bech32.encode('erd', words);
};

const bech32Decode = (address: any) => {
  const decoded = bech32.decode(address, 256);
  return Buffer.from(bech32.fromWords(decoded.words)).toString('hex');
};

const isUtf8 = (str: string) => {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127) return false;
  }
  return true;
}
