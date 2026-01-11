import { InviteType } from '@app/prisma/enums'
import * as schema from '@app/schema'

const INVITE_TYPE_MAP: Record<InviteType, schema.InviteType> = {
  [InviteType.PERMANENT]: schema.InviteType.Permanent,
  [InviteType.TEMPORARY]: schema.InviteType.Temporary,
}

export function mapInviteType(inviteType: InviteType) {
  return INVITE_TYPE_MAP[inviteType]
}
