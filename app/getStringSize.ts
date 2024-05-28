export interface StringSizeResult {
  stringSize: number;
  size: number;
}

export function getStringSize(
  content: Buffer,
  offset: number
): StringSizeResult {
  let stringLength = 0;
  const currentByte = content[offset];

  switch (currentByte >> 6) {
    case 0: {
      stringLength = currentByte;

      return { stringSize: stringLength, size: 1 };
    }
    case 1: {
      // 0100000001010101 потеряем если будет больше 53х бит а у нас пока 14
      // TODO: little Endian? или не надо, т.к. два бита зануляются
      const nextByte = content[offset + 1];
      stringLength = (nextByte << 8) | (currentByte & 63);
      // stringLength = ((currentByte & 0b00111111) << 8) | nextByte;
      return { stringSize: stringLength, size: 2 };
    }
    case 2: {
      stringLength =
        (content[offset + 4] << (8 * 3)) |
        (content[offset + 3] << (8 * 2)) |
        (content[offset + 2] << 8) |
        content[offset + 1];
      return { stringSize: stringLength, size: 5 };
    }
    case 3: {
      return { stringSize: -1, size: 2 };
      // throw Error('[case 0x11]: has not been implemented yet');
    }

    default:
      throw Error('[default]: got default case - nothing happend, wrong byte?');
  }
}
