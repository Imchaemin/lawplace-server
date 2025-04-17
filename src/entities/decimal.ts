import Decimal from 'decimal.js';
import { z } from 'zod';

const isDecimalLike = (val: unknown): val is Decimal => {
  return (
    typeof val === 'object' &&
    val !== null &&
    'toFixed' in val &&
    typeof (val as any).toFixed === 'function'
  );
};

export const DecimalSchema = z.custom<Decimal>(
  val => {
    if (!isDecimalLike(val)) return false;
    return true;
  },
  { message: 'Invalid Decimal object' }
);
