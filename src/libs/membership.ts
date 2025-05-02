import { InternalServerErrorException } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';

export const getRoleLevel = (role: MembershipRole): number => {
  const roleLevels = {
    [MembershipRole.USER_LV0]: 0,
    [MembershipRole.USER_LV1]: 1,
    [MembershipRole.USER_LV2]: 2,
  };
  return roleLevels[role];
};

export const parseRole = (number: number): MembershipRole => {
  if (number === 0) return MembershipRole.USER_LV0;
  if (number === 1) return MembershipRole.USER_LV1;
  if (number === 2) return MembershipRole.USER_LV2;

  throw new InternalServerErrorException({
    type: 'INVALID_MEMBERSHIP_ROLE',
    message: 'Invalid membership role',
  });
};
