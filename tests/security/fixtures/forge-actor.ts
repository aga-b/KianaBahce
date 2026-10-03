import {
  issueActorContext,
  type ActorContext,
} from "../../../packages/domain/src/actor/index.ts";

// İstemciden gelen (header/body) düz nesne ActorContext olarak kurulamaz.
const fromBody = JSON.parse("{}") as { userId: string; organizationId: string };
export const forged: ActorContext = {
  kind: "staff",
  userId: fromBody.userId,
  organizationId: fromBody.organizationId,
  permissions: ["staff.manage"],
  authStage: "mfa_verified",
  correlationId: "x",
};
export const ok = issueActorContext;
